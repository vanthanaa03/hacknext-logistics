from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import datetime
from ..database import get_db
from ..models import (
    Disruption, Recommendation, ManagerDecision, Vehicle, Delivery,
    DriverInstruction, Notification, SystemSettings, Driver
)
from ..schemas import ManagerDecisionCreate, InactivityThresholdUpdate
from ..services.websocket_manager import manager as ws_manager

router = APIRouter(prefix="/api/manager", tags=["Manager Operations"])

@router.post("/decision")
async def execute_manager_decision(payload: ManagerDecisionCreate, db: Session = Depends(get_db)):
    disruption = db.query(Disruption).filter(Disruption.id == payload.disruption_id).first()
    if not disruption:
        disruption = db.query(Disruption).filter(
            Disruption.status.in_(["AT_RISK", "ACTIVE", "SIMULATING"])
        ).order_by(Disruption.detected_at.desc()).first() or db.query(Disruption).order_by(Disruption.detected_at.desc()).first()

    now = datetime.datetime.utcnow()

    if not disruption:
        vehicle_t07 = db.query(Vehicle).filter(Vehicle.code == "T-07").first()
        disruption = Disruption(
            code="INC-2026-08",
            vehicle_id=vehicle_t07.id if vehicle_t07 else 1,
            driver_id=vehicle_t07.current_driver_id if (vehicle_t07 and vehicle_t07.current_driver_id) else 1,
            route_id=vehicle_t07.active_route_id if (vehicle_t07 and vehicle_t07.active_route_id) else 1,
            title="Vehicle T-07 Breakdown / Inactivity",
            status="ACTIVE",
            severity="CRITICAL",
            stationary_duration_secs=65,
            affected_deliveries_count=8,
            disruption_type="VEHICLE_BREAKDOWN",
            detected_at=now
        )
        db.add(disruption)
        db.commit()
        db.refresh(disruption)

    rec = db.query(Recommendation).filter(
        Recommendation.disruption_id == disruption.id,
        Recommendation.option_code == payload.selected_option_code
    ).first()

    # Create Manager Decision record
    decision = ManagerDecision(
        disruption_id=disruption.id,
        recommendation_id=rec.id if rec else None,
        selected_option_code=payload.selected_option_code,
        decision_notes=payload.decision_notes or f"Manager approved option {payload.selected_option_code}",
        decided_at=now
    )
    db.add(decision)

    # 1. Update Disruption & Vehicle Status
    disruption.status = "RESOLVED"
    disruption.resolved_at = now
    
    vehicle_t07 = disruption.vehicle
    if vehicle_t07:
        vehicle_t07.status = "RESOLVED"
        vehicle_t07.stationary_duration_secs = 0

    # Option B logic (Transfer packages to T-09) or Option A / C logic
    target_vehicle_code = "T-09" if payload.selected_option_code == "OPTION_B" else ("V-02" if payload.selected_option_code == "OPTION_A" else "T-07")
    target_vehicle = db.query(Vehicle).filter(Vehicle.code == target_vehicle_code).first()

    # 2. Update Deliveries status & customer ETAs
    deliveries = db.query(Delivery).filter(Delivery.vehicle_id == vehicle_t07.id if vehicle_t07 else 1).all()
    
    new_eta_str = "04:35 PM" if payload.selected_option_code in ["OPTION_A", "OPTION_B"] else "05:50 PM"
    delay_added = rec.delay_mins if rec else 15

    for deliv in deliveries:
        deliv.estimated_eta = new_eta_str
        deliv.delay_minutes = delay_added
        deliv.delay_reason = f"Route rerouted via {target_vehicle_code} due to {disruption.title}"
        if target_vehicle:
            deliv.vehicle_id = target_vehicle.id
        deliv.status = "OUT_FOR_DELIVERY"

    # 3. Create Operational Driver Instruction for T-07 driver
    driver_t07_id = vehicle_t07.current_driver_id if (vehicle_t07 and vehicle_t07.current_driver_id) else (disruption.driver_id or 1)
    if driver_t07_id:
        inst_t07 = DriverInstruction(
            driver_id=driver_t07_id,
            vehicle_id=vehicle_t07.id if vehicle_t07 else 1,
            disruption_id=disruption.id,
            title="⚠️ NEW OPERATIONAL INSTRUCTION",
            instruction_type="PACKAGE_TRANSFER",
            body=f"Transfer 8 packages to Vehicle {target_vehicle_code} at Location Sector 4 Flyover. Operations plan confirmed by Manager.",
            avoid_route="Route R-12",
            take_route="Route R-15",
            priority_order="Delivery #1045",
            new_eta=new_eta_str,
            created_at=now
        )
        db.add(inst_t07)

    # 4. Create Driver Instruction for T-09 driver if Option B selected
    target_driver_id = target_vehicle.current_driver_id if (target_vehicle and target_vehicle.current_driver_id) else None
    if target_vehicle and target_driver_id:
        inst_t09 = DriverInstruction(
            driver_id=target_driver_id,
            vehicle_id=target_vehicle.id,
            disruption_id=disruption.id,
            title="📦 NEW ASSIGNMENT — PACKAGE PICKUP",
            instruction_type="ROUTE_UPDATE",
            body=f"Receive 8 packages from Vehicle T-07 at Sector 4 Flyover. Merge onto Route R-15 for priority deliveries.",
            avoid_route=None,
            take_route="Route R-15",
            priority_order="Delivery #1045",
            new_eta=new_eta_str,
            created_at=now
        )
        db.add(inst_t09)

    # 5. Create Customer Notifications for affected order (#1045 etc)
    cust_notif = Notification(
        target_role="CUSTOMER",
        target_order_id="#1045",
        title="🚚 DELIVERY UPDATE",
        message=f"Your delivery route has been optimized by Operations. Updated arrival estimated at {new_eta_str}.",
        notification_type="INFO",
        created_at=now
    )
    db.add(cust_notif)

    db.commit()

    # 6. Real-time WebSocket sync to all connected roles!
    await ws_manager.broadcast({
        "type": "MANAGER_DECISION_CONFIRMED",
        "disruption_id": disruption.id,
        "selected_option": payload.selected_option_code,
        "plan_title": rec.title if rec else "Plan Confirmed",
        "target_vehicle": target_vehicle_code,
        "new_eta": new_eta_str,
        "status": "RESOLVED"
    })

    return {
        "status": "success",
        "message": "Plan updated. Operations have been updated successfully.",
        "decision_id": decision.id,
        "disruption_status": "RESOLVED",
        "new_eta": new_eta_str,
        "transferred_to": target_vehicle_code
    }

@router.get("/settings")
def get_settings(db: Session = Depends(get_db)):
    setting = db.query(SystemSettings).filter(SystemSettings.key == "inactivity_threshold_seconds").first()
    threshold = int(setting.value) if setting else 60
    return {
        "inactivity_threshold_seconds": threshold,
        "gps_simulation_enabled": True,
        "auto_ai_triaging": True
    }

@router.post("/settings/inactivity-threshold")
def update_inactivity_threshold(payload: InactivityThresholdUpdate, db: Session = Depends(get_db)):
    setting = db.query(SystemSettings).filter(SystemSettings.key == "inactivity_threshold_seconds").first()
    if not setting:
        setting = SystemSettings(key="inactivity_threshold_seconds", value=str(payload.threshold_seconds))
        db.add(setting)
    else:
        setting.value = str(payload.threshold_seconds)
    db.commit()
    return {"status": "success", "inactivity_threshold_seconds": payload.threshold_seconds}
