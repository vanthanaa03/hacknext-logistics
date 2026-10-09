from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import Vehicle, Driver, User
from ..schemas import GPSLocationPayload
from ..services.gps_service import process_gps_update

router = APIRouter(prefix="/api/vehicles", tags=["Vehicles"])

def _get_driver_name(v: Vehicle, db: Session) -> str:
    """Fetch driver name via separate query since ORM relationship was removed to avoid circular FK"""
    if v.current_driver_id:
        driver = db.query(Driver).filter(Driver.id == v.current_driver_id).first()
        if driver:
            user = db.query(User).filter(User.id == driver.user_id).first()
            if user:
                return user.full_name
    return "Unassigned"

def _vehicle_to_dict(v: Vehicle, db: Session) -> dict:
    return {
        "id": v.id,
        "code": v.code,
        "plate_number": v.plate_number,
        "vehicle_type": v.vehicle_type,
        "max_capacity_kg": v.max_capacity_kg,
        "status": v.status,
        "current_lat": v.current_lat,
        "current_lng": v.current_lng,
        "current_speed_kmh": v.current_speed_kmh,
        "stationary_duration_secs": v.stationary_duration_secs,
        "driver_name": _get_driver_name(v, db),
        "route_code": v.route.code if v.route else "None",
        "last_gps_update": v.last_gps_update.isoformat() if v.last_gps_update else None
    }

@router.get("")
def get_vehicles(db: Session = Depends(get_db)):
    vehicles = db.query(Vehicle).all()
    return [_vehicle_to_dict(v, db) for v in vehicles]

@router.get("/{vehicle_code}")
def get_vehicle_by_code(vehicle_code: str, db: Session = Depends(get_db)):
    v = db.query(Vehicle).filter(Vehicle.code == vehicle_code).first()
    if not v:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    return _vehicle_to_dict(v, db)

@router.post("/{vehicle_code}/location")
async def post_vehicle_location(vehicle_code: str, payload: GPSLocationPayload, db: Session = Depends(get_db)):
    updated = await process_gps_update(
        db=db,
        vehicle_code=vehicle_code,
        lat=payload.latitude,
        lng=payload.longitude,
        speed=payload.speed_kmh or 0.0
    )
    if not updated:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    return {"status": "success", "vehicle_code": updated.code, "vehicle_status": updated.status}
