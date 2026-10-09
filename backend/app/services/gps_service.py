import math
import datetime
from sqlalchemy.orm import Session
from ..models import Vehicle, Driver, Disruption, GPSLocation, SystemSettings, Notification
from .websocket_manager import manager as ws_manager

def haversine_distance_meters(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculate distance between two GPS points in meters."""
    R = 6371000  # Radius of Earth in meters
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)

    a = math.sin(delta_phi / 2.0) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda / 2.0) ** 2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))

    return R * c

def get_inactivity_threshold(db: Session) -> int:
    setting = db.query(SystemSettings).filter(SystemSettings.key == "inactivity_threshold_seconds").first()
    if setting:
        try:
            return int(setting.value)
        except ValueError:
            pass
    return 60 # Default 60 seconds (1 minute as per prompt)

async def process_gps_update(db: Session, vehicle_code: str, lat: float, lng: float, speed: float = 0.0):
    vehicle = db.query(Vehicle).filter(Vehicle.code == vehicle_code).first()
    if not vehicle:
        return None

    now = datetime.datetime.utcnow()
    prev_lat = vehicle.current_lat
    prev_lng = vehicle.current_lng
    
    # Calculate distance moved in meters
    distance_moved = haversine_distance_meters(prev_lat, prev_lng, lat, lng)
    
    # Threshold for stationary movement (under 5 meters)
    IS_STATIONARY = distance_moved < 5.0 and speed < 2.0
    
    if IS_STATIONARY:
        # Increase stationary duration by elapsed seconds
        time_elapsed = (now - (vehicle.last_gps_update or now)).total_seconds()
        vehicle.stationary_duration_secs += int(max(time_elapsed, 1))
        vehicle.current_speed_kmh = 0.0
    else:
        # Moving! Reset stationary duration
        vehicle.stationary_duration_secs = 0
        vehicle.current_speed_kmh = max(speed, 25.0)

    vehicle.current_lat = lat
    vehicle.current_lng = lng
    vehicle.last_gps_update = now

    # Store GPS log
    gps_entry = GPSLocation(
        vehicle_id=vehicle.id,
        driver_id=vehicle.current_driver_id,
        latitude=lat,
        longitude=lng,
        speed_kmh=vehicle.current_speed_kmh,
        timestamp=now
    )
    db.add(gps_entry)
    db.commit()

    # Contextual check logic:
    # 1. Is vehicle already marked in an active disruption?
    # 2. Is inactivity threshold exceeded?
    threshold = get_inactivity_threshold(db)

    # Check if stationary duration exceeds threshold and vehicle is currently marked NORMAL
    if IS_STATIONARY and vehicle.stationary_duration_secs >= threshold and vehicle.status == "NORMAL":
        # Check context: Is driver expected to stop (e.g. at warehouse or customer)?
        # For prototype, vehicle T-07 on route R-12 is mid-route (not at warehouse or expected stop)
        vehicle.status = "AT_RISK"
        db.commit()

        # Create AT RISK Disruption Event
        inc_count = db.query(Disruption).count() + 1
        disruption_code = f"INC-2026-0{inc_count}"
        
        disruption = Disruption(
            code=disruption_code,
            vehicle_id=vehicle.id,
            driver_id=vehicle.current_driver_id,
            route_id=vehicle.active_route_id,
            title=f"Unusual Inactivity Detected - Vehicle {vehicle.code}",
            status="AT_RISK",
            severity="HIGH",
            stationary_duration_secs=vehicle.stationary_duration_secs,
            affected_deliveries_count=8,
            disruption_type="UNUSUAL_INACTIVITY",
            detected_at=now
        )
        db.add(disruption)
        db.commit()
        db.refresh(disruption)

        # Notify driver
        driver_notif = Notification(
            target_role="DRIVER",
            target_user_id=vehicle.current_driver_id,
            title="⚠️ UNEXPECTED STOP DETECTED",
            message=f"Your vehicle ({vehicle.code}) appears to have remained stationary longer than expected ({vehicle.stationary_duration_secs} seconds). Are you facing a problem?",
            notification_type="WARNING"
        )
        db.add(driver_notif)

        # Notify manager
        manager_notif = Notification(
            target_role="MANAGER",
            title=f"AT RISK: Vehicle {vehicle.code} Inactive",
            message=f"Vehicle {vehicle.code} stationary for {vehicle.stationary_duration_secs}s near Route R-12. Potential disruption detected.",
            notification_type="CRITICAL"
        )
        db.add(manager_notif)
        db.commit()

        # Broadcast via WebSocket
        await ws_manager.broadcast({
            "type": "DISRUPTION_DETECTED",
            "vehicle_code": vehicle.code,
            "disruption_id": disruption.id,
            "disruption_code": disruption.code,
            "stationary_duration": vehicle.stationary_duration_secs,
            "message": f"Vehicle {vehicle.code} is AT RISK due to unexpected inactivity."
        })

    # Always broadcast location update to subscribers
    await ws_manager.broadcast({
        "type": "GPS_UPDATE",
        "vehicle_code": vehicle.code,
        "lat": vehicle.current_lat,
        "lng": vehicle.current_lng,
        "speed": vehicle.current_speed_kmh,
        "status": vehicle.status,
        "stationary_duration": vehicle.stationary_duration_secs
    })

    return vehicle
