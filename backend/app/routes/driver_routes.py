from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import datetime
from ..database import get_db
from ..models import Vehicle, Driver, Disruption, DriverReport, DriverInstruction, Notification
from ..schemas import DriverReportCreate
from ..services.ai_service import analyze_driver_report
from ..services.websocket_manager import manager as ws_manager

router = APIRouter(prefix="/api/driver", tags=["Driver"])

@router.post("/report")
async def post_driver_report(payload: DriverReportCreate, db: Session = Depends(get_db)):
    vehicle = db.query(Vehicle).filter(Vehicle.code == payload.vehicle_code).first()
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")

    driver = db.query(Driver).filter(Driver.id == vehicle.current_driver_id).first()
    driver_id = driver.id if driver else 1

    # Find active disruption for this vehicle or create one
    disruption = db.query(Disruption).filter(
        Disruption.vehicle_id == vehicle.id,
        Disruption.status.in_(["AT_RISK", "ACTIVE", "SIMULATING"])
    ).order_by(Disruption.detected_at.desc()).first()

    now = datetime.datetime.utcnow()

    if not disruption:
        inc_count = db.query(Disruption).count() + 1
        disruption = Disruption(
            code=f"INC-2026-0{inc_count}",
            vehicle_id=vehicle.id,
            driver_id=driver_id,
            route_id=vehicle.active_route_id,
            title=f"Driver Reported Issue - {vehicle.code}",
            status="ACTIVE",
            severity="HIGH",
            stationary_duration_secs=vehicle.stationary_duration_secs,
            affected_deliveries_count=8,
            disruption_type=payload.category,
            detected_at=now
        )
        db.add(disruption)
        db.commit()
        db.refresh(disruption)

    # Save driver report
    report = DriverReport(
        disruption_id=disruption.id,
        vehicle_id=vehicle.id,
        driver_id=driver_id,
        category=payload.category,
        raw_message=payload.raw_message,
        timestamp=now
    )
    db.add(report)
    db.commit()
    db.refresh(report)

    # Trigger AI analysis automatically!
    ai_res = await analyze_driver_report(
        db=db,
        disruption_id=disruption.id,
        driver_report_id=report.id,
        message=payload.raw_message,
        category=payload.category
    )

    # Broadcast real-time update to manager Command Center
    await ws_manager.broadcast({
        "type": "DRIVER_REPORT_SUBMITTED",
        "disruption_id": disruption.id,
        "vehicle_code": vehicle.code,
        "category": payload.category,
        "message": payload.raw_message,
        "ai_analysis": {
            "problem_type": ai_res.problem_type if ai_res else payload.category,
            "urgency": ai_res.urgency if ai_res else "HIGH",
            "est_delay": ai_res.estimated_delay_mins if ai_res else 30
        }
    })

    return {
        "status": "success",
        "disruption_id": disruption.id,
        "report_id": report.id,
        "ai_analysis": {
            "problem_type": ai_res.problem_type if ai_res else payload.category,
            "urgency": ai_res.urgency if ai_res else "HIGH",
            "estimated_delay_mins": ai_res.estimated_delay_mins if ai_res else 30,
            "suggested_action": ai_res.suggested_action if ai_res else "Awaiting manager review"
        }
    }

@router.get("/instructions")
def get_driver_instructions(vehicle_code: str = "T-07", db: Session = Depends(get_db)):
    vehicle = db.query(Vehicle).filter(Vehicle.code == vehicle_code).first()
    if not vehicle:
        return []
    driver_id = vehicle.current_driver_id or 1
    instructions = db.query(DriverInstruction).filter(
        DriverInstruction.driver_id == driver_id
    ).order_by(DriverInstruction.created_at.desc()).all()

    res = []
    for inst in instructions:
        res.append({
            "id": inst.id,
            "title": inst.title,
            "instruction_type": inst.instruction_type,
            "body": inst.body,
            "avoid_route": inst.avoid_route,
            "take_route": inst.take_route,
            "priority_order": inst.priority_order,
            "new_eta": inst.new_eta,
            "is_acknowledged": inst.is_acknowledged,
            "created_at": inst.created_at.isoformat() if inst.created_at else None
        })
    return res

@router.post("/instructions/{instruction_id}/acknowledge")
async def acknowledge_instruction(instruction_id: int, db: Session = Depends(get_db)):
    inst = db.query(DriverInstruction).filter(DriverInstruction.id == instruction_id).first()
    if not inst:
        raise HTTPException(status_code=404, detail="Instruction not found")
    inst.is_acknowledged = True
    db.commit()

    await ws_manager.broadcast({
        "type": "DRIVER_INSTRUCTION_ACKNOWLEDGED",
        "instruction_id": inst.id,
        "driver_id": inst.driver_id
    })

    return {"status": "success", "message": "Instruction acknowledged"}
