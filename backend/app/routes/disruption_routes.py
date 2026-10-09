from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import Disruption, Recommendation, DriverReport, AIAnalysis
from ..schemas import AIAnalyzeRequest

router = APIRouter(prefix="/api/disruptions", tags=["Disruptions"])

@router.get("")
def get_disruptions(db: Session = Depends(get_db)):
    disruptions = db.query(Disruption).order_by(Disruption.detected_at.desc()).all()
    res = []
    for d in disruptions:
        vehicle_code = d.vehicle.code if d.vehicle else "N/A"
        driver_name = d.driver.user.full_name if (d.driver and d.driver.user) else "Unassigned"
        route_code = d.route.code if d.route else "N/A"
        res.append({
            "id": d.id,
            "code": d.code,
            "title": d.title,
            "status": d.status,
            "severity": d.severity,
            "disruption_type": d.disruption_type,
            "vehicle_code": vehicle_code,
            "driver_name": driver_name,
            "route_code": route_code,
            "stationary_duration_secs": d.stationary_duration_secs,
            "affected_deliveries_count": d.affected_deliveries_count,
            "detected_at": d.detected_at.isoformat() if d.detected_at else None,
            "resolved_at": d.resolved_at.isoformat() if d.resolved_at else None
        })
    return res

@router.get("/{disruption_id}")
def get_disruption_detail(disruption_id: int, db: Session = Depends(get_db)):
    d = db.query(Disruption).filter(Disruption.id == disruption_id).first()
    if not d:
        raise HTTPException(status_code=404, detail="Disruption not found")

    vehicle_code = d.vehicle.code if d.vehicle else "N/A"
    driver_name = d.driver.user.full_name if (d.driver and d.driver.user) else "Unassigned"
    route_code = d.route.code if d.route else "N/A"

    # Latest report
    report = db.query(DriverReport).filter(DriverReport.disruption_id == d.id).order_by(DriverReport.timestamp.desc()).first()

    # Latest AI analysis
    ai_analysis = db.query(AIAnalysis).filter(AIAnalysis.disruption_id == d.id).order_by(AIAnalysis.created_at.desc()).first()

    # Recommendations
    recs = db.query(Recommendation).filter(Recommendation.disruption_id == d.id).all()

    return {
        "id": d.id,
        "code": d.code,
        "title": d.title,
        "status": d.status,
        "severity": d.severity,
        "disruption_type": d.disruption_type,
        "vehicle_code": vehicle_code,
        "driver_name": driver_name,
        "route_code": route_code,
        "stationary_duration_secs": d.stationary_duration_secs,
        "affected_deliveries_count": d.affected_deliveries_count,
        "detected_at": d.detected_at.isoformat() if d.detected_at else None,
        "driver_report": {
            "category": report.category if report else "NONE",
            "message": report.raw_message if report else "No driver message submitted yet.",
            "timestamp": report.timestamp.isoformat() if report else None
        } if report else None,
        "ai_analysis": {
            "problem_type": ai_analysis.problem_type if ai_analysis else "Pending Analysis",
            "urgency": ai_analysis.urgency if ai_analysis else "WARNING",
            "estimated_delay_mins": ai_analysis.estimated_delay_mins if ai_analysis else 30,
            "confidence": ai_analysis.confidence if ai_analysis else "Medium (85%)",
            "affected_deliveries_count": ai_analysis.affected_deliveries_count if ai_analysis else 8,
            "suggested_action": ai_analysis.suggested_action if ai_analysis else "Inspect vehicle status",
            "full_analysis_json": ai_analysis.full_analysis_json if ai_analysis else None
        } if ai_analysis else None,
        "recommendations": [
            {
                "id": r.id,
                "option_code": r.option_code,
                "title": r.title,
                "description": r.description,
                "cost_inr": r.cost_inr,
                "delay_mins": r.delay_mins,
                "deliveries_saved": r.deliveries_saved,
                "customer_impact_level": r.customer_impact_level,
                "operational_risk_level": r.operational_risk_level,
                "is_ai_recommended": r.is_ai_recommended
            } for r in recs
        ]
    }
