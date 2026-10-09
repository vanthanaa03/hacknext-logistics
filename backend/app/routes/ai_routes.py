from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import Disruption, AIAnalysis, Recommendation
from ..schemas import AIAnalyzeRequest
from ..services.ai_service import analyze_driver_report

router = APIRouter(prefix="/api", tags=["AI Engine"])

@router.post("/ai/analyze-report")
async def trigger_ai_analysis(req: AIAnalyzeRequest, db: Session = Depends(get_db)):
    disruption = db.query(Disruption).filter(
        Disruption.status.in_(["AT_RISK", "ACTIVE", "SIMULATING"])
    ).order_by(Disruption.detected_at.desc()).first()

    if not disruption:
        raise HTTPException(status_code=404, detail="No active disruption to analyze")

    res = await analyze_driver_report(
        db=db,
        disruption_id=disruption.id,
        driver_report_id=None,
        message=req.raw_message,
        category=req.category or "OTHER"
    )

    return {
        "status": "success",
        "analysis_id": res.id,
        "problem_type": res.problem_type,
        "urgency": res.urgency,
        "estimated_delay_mins": res.estimated_delay_mins,
        "confidence": res.confidence,
        "suggested_action": res.suggested_action
    }

@router.get("/recommendations/{disruption_id}")
def get_recommendations(disruption_id: int, db: Session = Depends(get_db)):
    recs = db.query(Recommendation).filter(Recommendation.disruption_id == disruption_id).all()
    return [
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
