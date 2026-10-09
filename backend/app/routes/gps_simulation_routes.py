from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import asyncio
import datetime
from ..database import get_db
from ..models import Vehicle, Disruption, Notification
from ..schemas import GPSSimulationStart, GPSSimulationDisrupt
from ..services.gps_service import process_gps_update
from ..services.websocket_manager import manager as ws_manager

router = APIRouter(prefix="/api/gps/simulate", tags=["GPS Simulation"])

# Predefined realistic GPS route coordinates for T-07 in Coimbatore area (Route R-12)
WAYPOINTS_T07 = [
    {"lat": 11.0168, "lng": 76.9558, "name": "Logistics Central Depot"},
    {"lat": 11.0195, "lng": 76.9582, "name": "North Flyover Junction"},
    {"lat": 11.0220, "lng": 76.9615, "name": "Sector 4 Industrial Park"},
    {"lat": 11.0255, "lng": 76.9650, "name": "Bypass Ring Road"},
    {"lat": 11.0290, "lng": 76.9690, "name": "Delivery Stop #1045 - Tech Park"}
]

simulation_state = {
    "is_running": False,
    "vehicle_code": "T-07",
    "current_step": 0,
    "is_disrupted": False
}

@router.post("/start")
async def start_gps_simulation(payload: GPSSimulationStart, db: Session = Depends(get_db)):
    vehicle = db.query(Vehicle).filter(Vehicle.code == payload.vehicle_code).first()
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")

    simulation_state["is_running"] = True
    simulation_state["vehicle_code"] = payload.vehicle_code
    simulation_state["current_step"] = 0
    simulation_state["is_disrupted"] = False

    vehicle.status = "NORMAL"
    vehicle.stationary_duration_secs = 0
    vehicle.current_speed_kmh = 32.0
    db.commit()

    # Move vehicle to first waypoint
    wp = WAYPOINTS_T07[0]
    await process_gps_update(db, payload.vehicle_code, wp["lat"], wp["lng"], speed=32.0)

    await ws_manager.broadcast({
        "type": "SIMULATION_STARTED",
        "vehicle_code": payload.vehicle_code,
        "message": "GPS Simulation mode active. Vehicle T-07 is moving along Route R-12."
    })

    return {
        "status": "success",
        "message": "GPS simulation started",
        "vehicle_code": payload.vehicle_code,
        "current_location": wp
    }

@router.post("/step")
async def step_gps_simulation(db: Session = Depends(get_db)):
    vehicle_code = simulation_state["vehicle_code"]
    vehicle = db.query(Vehicle).filter(Vehicle.code == vehicle_code).first()
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")

    if simulation_state["is_disrupted"]:
        # Disrupted state: Vehicle stationary! Increment stationary timer by 15 seconds
        vehicle.stationary_duration_secs += 15
        vehicle.current_speed_kmh = 0.0
        db.commit()

        res = await process_gps_update(db, vehicle_code, vehicle.current_lat, vehicle.current_lng, speed=0.0)
        return {
            "status": "disrupted",
            "vehicle_code": vehicle_code,
            "stationary_duration_secs": vehicle.stationary_duration_secs,
            "current_speed_kmh": 0.0,
            "lat": vehicle.current_lat,
            "lng": vehicle.current_lng
        }
    else:
        # Normal moving state: Advance along waypoints
        simulation_state["current_step"] = (simulation_state["current_step"] + 1) % len(WAYPOINTS_T07)
        wp = WAYPOINTS_T07[simulation_state["current_step"]]

        res = await process_gps_update(db, vehicle_code, wp["lat"], wp["lng"], speed=38.0)
        return {
            "status": "moving",
            "vehicle_code": vehicle_code,
            "current_step": simulation_state["current_step"],
            "lat": wp["lat"],
            "lng": wp["lng"],
            "current_speed_kmh": 38.0
        }

@router.post("/disrupt")
async def disrupt_gps_simulation(payload: GPSSimulationDisrupt, db: Session = Depends(get_db)):
    vehicle_code = payload.vehicle_code
    vehicle = db.query(Vehicle).filter(Vehicle.code == vehicle_code).first()
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")

    simulation_state["is_disrupted"] = True
    vehicle.current_speed_kmh = 0.0
    vehicle.stationary_duration_secs = 65 # Instantly cross inactivity threshold (60s) for prompt hackathon demo!
    vehicle.status = "AT_RISK"
    db.commit()

    now = datetime.datetime.utcnow()

    # Create AT RISK disruption event
    disruption = db.query(Disruption).filter(
        Disruption.vehicle_id == vehicle.id,
        Disruption.status.in_(["AT_RISK", "ACTIVE"])
    ).first()

    if not disruption:
        inc_count = db.query(Disruption).count() + 1
        disruption = Disruption(
            code=f"INC-2026-0{inc_count}",
            vehicle_id=vehicle.id,
            driver_id=vehicle.current_driver_id,
            route_id=vehicle.active_route_id,
            title=f"Unusual Inactivity Detected - Vehicle {vehicle.code}",
            status="AT_RISK",
            severity="CRITICAL",
            stationary_duration_secs=65,
            affected_deliveries_count=8,
            disruption_type="UNUSUAL_INACTIVITY",
            detected_at=now
        )
        db.add(disruption)
        db.commit()
        db.refresh(disruption)

    # Notify driver prompt
    driver_notif = Notification(
        target_role="DRIVER",
        target_user_id=vehicle.current_driver_id,
        title="⚠️ UNEXPECTED STOP DETECTED",
        message="Your vehicle appears to have remained stationary longer than expected (01:05 min). Are you facing a problem?",
        notification_type="WARNING",
        created_at=now
    )
    db.add(driver_notif)
    db.commit()

    # Broadcast via WebSockets
    await ws_manager.broadcast({
        "type": "SIMULATION_DISRUPTED",
        "vehicle_code": vehicle_code,
        "disruption_id": disruption.id,
        "disruption_code": disruption.code,
        "stationary_duration": 65,
        "message": f"SIMULATION ALERT: Vehicle {vehicle_code} stopped unexpectedly. Stationary timer = 65s."
    })

    return {
        "status": "success",
        "message": f"Disruption simulated on vehicle {vehicle_code}",
        "disruption_id": disruption.id,
        "stationary_duration_secs": 65,
        "vehicle_status": "AT_RISK"
    }

@router.post("/stop")
async def stop_gps_simulation(db: Session = Depends(get_db)):
    simulation_state["is_running"] = False
    simulation_state["is_disrupted"] = False
    vehicle = db.query(Vehicle).filter(Vehicle.code == simulation_state["vehicle_code"]).first()
    if vehicle:
        vehicle.status = "NORMAL"
        vehicle.stationary_duration_secs = 0
        db.commit()

    await ws_manager.broadcast({
        "type": "SIMULATION_STOPPED",
        "message": "GPS simulation ended."
    })

    return {"status": "success", "message": "Simulation stopped"}
