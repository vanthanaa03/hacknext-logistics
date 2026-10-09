from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import Delivery

router = APIRouter(prefix="/api/deliveries", tags=["Deliveries"])

@router.get("")
def get_deliveries(db: Session = Depends(get_db)):
    deliveries = db.query(Delivery).all()
    res = []
    for d in deliveries:
        res.append({
            "id": d.id,
            "tracking_number": d.tracking_number,
            "customer_name": d.customer_name,
            "customer_phone": d.customer_phone,
            "delivery_address": d.delivery_address,
            "lat": d.lat,
            "lng": d.lng,
            "items_description": d.items_description,
            "priority": d.priority,
            "status": d.status,
            "original_eta": d.original_eta,
            "estimated_eta": d.estimated_eta,
            "delay_minutes": d.delay_minutes,
            "delay_reason": d.delay_reason,
            "vehicle_code": d.vehicle.code if d.vehicle else "Unassigned",
            "route_code": d.route.code if d.route else "Unassigned"
        })
    return res
