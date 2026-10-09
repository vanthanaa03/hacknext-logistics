import datetime
from sqlalchemy.orm import Session
from ..models import Disruption, DriverReport, AIAnalysis, Recommendation, Vehicle, Route, Delivery

async def analyze_driver_report(db: Session, disruption_id: int, driver_report_id: int, message: str, category: str):
    disruption = db.query(Disruption).filter(Disruption.id == disruption_id).first()
    if not disruption:
        return None

    # NLP Analysis simulation & structured extraction
    msg_lower = message.lower()
    
    # Extract problem type
    if "breakdown" in msg_lower or "engine" in msg_lower or "smoke" in msg_lower or category == "VEHICLE_PROBLEM":
        problem_type = "Vehicle Mechanical Breakdown"
        urgency = "CRITICAL"
        est_delay = 60
        suggested_action = "Transfer packages to nearest vehicle (T-09) or dispatch backup fleet."
    elif "jam" in msg_lower or "traffic" in msg_lower or "accident" in msg_lower or category == "TRAFFIC":
        problem_type = "Severe Traffic Gridlock"
        urgency = "WARNING"
        est_delay = 35
        suggested_action = "Reroute via Ring Road Bypass (Route R-15)."
    elif "block" in msg_lower or "construction" in msg_lower or category == "ROAD_BLOCKED":
        problem_type = "Road Blockage / Construction"
        urgency = "WARNING"
        est_delay = 30
        suggested_action = "Reroute through Sector 4 Inner Collector Road."
    else:
        problem_type = f"Operational Delay ({category.replace('_', ' ').title()})"
        urgency = "WARNING"
        est_delay = 45
        suggested_action = "Evaluate driver status and reassess route schedule."

    # Update disruption severity & title
    disruption.title = f"{problem_type} - Vehicle {disruption.vehicle.code if disruption.vehicle else 'T-07'}"
    disruption.status = "ACTIVE"
    disruption.severity = "CRITICAL" if urgency == "CRITICAL" else "HIGH"

    # Create AI Analysis record
    analysis = AIAnalysis(
        disruption_id=disruption.id,
        report_id=driver_report_id,
        problem_type=problem_type,
        urgency=urgency,
        estimated_delay_mins=est_delay,
        confidence="High (94%)",
        affected_deliveries_count=8,
        affected_route="Route R-12",
        suggested_action=suggested_action,
        full_analysis_json={
            "input_text": message,
            "entities_extracted": {
                "location": "Route 12 near Flyover",
                "issue": problem_type,
                "urgency_score": 0.94
            },
            "ripple_effect": {
                "affected_vehicle": "Vehicle T-07",
                "affected_route": "Route R-12",
                "total_deliveries_affected": 8,
                "priority_customers_affected": 3
            }
        }
    )
    db.add(analysis)
    db.commit()

    # Generate 3 What-If Recommendations
    # Delete existing recommendations for this disruption if re-analyzing
    db.query(Recommendation).filter(Recommendation.disruption_id == disruption.id).delete()

    rec_a = Recommendation(
        disruption_id=disruption.id,
        option_code="OPTION_A",
        title="Assign Backup Vehicle",
        description="Dispatch dedicated emergency relief van (V-02) from central hub to handle remaining 8 deliveries.",
        cost_inr=500,
        delay_mins=15,
        deliveries_saved=7,
        customer_impact_level="Low",
        operational_risk_level="Low",
        is_ai_recommended=False
    )

    rec_b = Recommendation(
        disruption_id=disruption.id,
        option_code="OPTION_B",
        title="Transfer Packages to Vehicle T-09",
        description="Reroute nearby active vehicle T-09 (currently 1.2 km away) to take 8 packages and merge route R-15.",
        cost_inr=300,
        delay_mins=25,
        deliveries_saved=6,
        customer_impact_level="Medium",
        operational_risk_level="Low",
        is_ai_recommended=True  # Recommended plan as per prompt!
    )

    rec_c = Recommendation(
        disruption_id=disruption.id,
        option_code="OPTION_C",
        title="Wait for Roadside Repair",
        description="Wait for roadside assistance crew to repair vehicle T-07 on site. High vulnerability to cumulative SLA breach.",
        cost_inr=0,
        delay_mins=90,
        deliveries_saved=2,
        customer_impact_level="High",
        operational_risk_level="High",
        is_ai_recommended=False
    )

    db.add_all([rec_a, rec_b, rec_c])
    db.commit()

    return analysis
