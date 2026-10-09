from sqlalchemy.orm import Session
from .models import (
    User, Driver, Vehicle, Route, Delivery, Disruption,
    DriverReport, AIAnalysis, Recommendation, SystemSettings
)
from .auth import get_password_hash

def seed_initial_data(db: Session):
    # Check if database already seeded
    if db.query(User).count() > 0:
        return

    print("Seeding initial DROVA logistics demonstration data...")

    # 1. System Settings
    db.add(SystemSettings(key="inactivity_threshold_seconds", value="60"))

    # 2. Users
    mgr_user = User(
        email="manager@drova.logistics",
        password_hash=get_password_hash("manager123"),
        full_name="Rajesh V (Operations Controller)",
        role="MANAGER",
        phone="+91 98400 12345"
    )
    d1_user = User(
        email="arun@drova.logistics",
        password_hash=get_password_hash("driver123"),
        full_name="Arun Kumar",
        role="DRIVER",
        phone="+91 97890 54321"
    )
    d2_user = User(
        email="meera@drova.logistics",
        password_hash=get_password_hash("driver123"),
        full_name="Meera Nair",
        role="DRIVER",
        phone="+91 98940 98765"
    )
    d3_user = User(
        email="rahul@drova.logistics",
        password_hash=get_password_hash("driver123"),
        full_name="Rahul Menon",
        role="DRIVER",
        phone="+91 97910 11223"
    )
    cust_user = User(
        email="customer@drova.logistics",
        password_hash=get_password_hash("customer123"),
        full_name="Priya Sharma",
        role="CUSTOMER",
        phone="+91 96000 88776"
    )

    db.add_all([mgr_user, d1_user, d2_user, d3_user, cust_user])
    db.commit()

    # 3. Drivers
    driver1 = Driver(user_id=d1_user.id, code="D-04", license_number="TN-38-2022-9481", rating=4.9, status="ON_DUTY")
    driver2 = Driver(user_id=d2_user.id, code="D-09", license_number="TN-37-2021-3810", rating=4.85, status="ON_DUTY")
    driver3 = Driver(user_id=d3_user.id, code="D-12", license_number="TN-39-2020-1192", rating=4.92, status="ON_DUTY")

    db.add_all([driver1, driver2, driver3])
    db.commit()

    # 4. Routes
    r12 = Route(
        code="R-12",
        name="Depot -> Industrial Park -> Bypass Ring -> Tech Hub",
        distance_km=18.5,
        estimated_duration_mins=45,
        waypoints_json=[
            [11.0168, 76.9558],
            [11.0195, 76.9582],
            [11.0220, 76.9615],
            [11.0255, 76.9650],
            [11.0290, 76.9690]
        ]
    )
    r15 = Route(
        code="R-15",
        name="Bypass Ring Road -> West Collector -> Sector 8",
        distance_km=22.0,
        estimated_duration_mins=50,
        waypoints_json=[
            [11.0280, 76.9710],
            [11.0310, 76.9740],
            [11.0350, 76.9780]
        ]
    )
    r21 = Route(
        code="R-21",
        name="Depot -> South Commercial Hub -> Tech Park",
        distance_km=15.0,
        estimated_duration_mins=40,
        waypoints_json=[
            [11.0050, 76.9420],
            [11.0100, 76.9480]
        ]
    )
    db.add_all([r12, r15, r21])
    db.commit()

    # 5. Vehicles
    v_t07 = Vehicle(
        code="T-07",
        plate_number="TN-38-A-7421",
        vehicle_type="Medium Freight Truck",
        max_capacity_kg=1800.0,
        current_driver_id=driver1.id,
        active_route_id=r12.id,
        status="NORMAL",
        current_lat=11.0168,
        current_lng=76.9558,
        current_speed_kmh=32.0,
        stationary_duration_secs=0
    )
    v_t09 = Vehicle(
        code="T-09",
        plate_number="TN-37-B-2914",
        vehicle_type="Standard Cargo Van",
        max_capacity_kg=1200.0,
        current_driver_id=driver2.id,
        active_route_id=r15.id,
        status="NORMAL",
        current_lat=11.0280,
        current_lng=76.9710,
        current_speed_kmh=28.0,
        stationary_duration_secs=0
    )
    v_t12 = Vehicle(
        code="T-12",
        plate_number="TN-39-C-8456",
        vehicle_type="Express Delivery Van",
        max_capacity_kg=1000.0,
        current_driver_id=driver3.id,
        active_route_id=r21.id,
        status="NORMAL",
        current_lat=11.0050,
        current_lng=76.9420,
        current_speed_kmh=35.0,
        stationary_duration_secs=0
    )

    db.add_all([v_t07, v_t09, v_t12])
    db.commit()

    # Link current vehicle back to drivers
    driver1.current_vehicle_id = v_t07.id
    driver2.current_vehicle_id = v_t09.id
    driver3.current_vehicle_id = v_t12.id
    db.commit()

    # 6. Deliveries (Orders)
    deliveries = [
        Delivery(
            tracking_number="#1045",
            customer_name="Priya Sharma",
            customer_phone="+91 96000 88776",
            customer_email="customer@drova.logistics",
            delivery_address="Flat 402, HighTech Tech Park, Sector 4",
            lat=11.0290,
            lng=76.9690,
            items_description="High-Precision Sensor Array & Microcontrollers",
            priority="HIGH",
            status="OUT_FOR_DELIVERY",
            route_id=r12.id,
            vehicle_id=v_t07.id,
            original_eta="04:20 PM",
            estimated_eta="04:20 PM",
            delay_minutes=0
        ),
        Delivery(
            tracking_number="#1046",
            customer_name="Apex Medical Clinic",
            customer_phone="+91 98400 99887",
            delivery_address="Gate 2, Apex Hospital Road, Sector 4",
            lat=11.0255,
            lng=76.9650,
            items_description="Critical Diagnostic Reagents (Cold Chain)",
            priority="CRITICAL",
            status="OUT_FOR_DELIVERY",
            route_id=r12.id,
            vehicle_id=v_t07.id,
            original_eta="04:30 PM",
            estimated_eta="04:30 PM",
            delay_minutes=0
        ),
        Delivery(
            tracking_number="#1047",
            customer_name="Bosch Tech Solutions",
            customer_phone="+91 97100 22334",
            delivery_address="Unit 12, Industrial Corridor North",
            lat=11.0220,
            lng=76.9615,
            items_description="Automotive Micro-actuators Batch",
            priority="MEDIUM",
            status="OUT_FOR_DELIVERY",
            route_id=r12.id,
            vehicle_id=v_t07.id,
            original_eta="04:45 PM",
            estimated_eta="04:45 PM",
            delay_minutes=0
        ),
        Delivery(
            tracking_number="#1048",
            customer_name="Metro Retail Mart",
            customer_phone="+91 94440 55667",
            delivery_address="Shop 5, Retail Avenue Junction",
            lat=11.0195,
            lng=76.9582,
            items_description="POS Hardware Spares & Cable Bundles",
            priority="LOW",
            status="OUT_FOR_DELIVERY",
            route_id=r12.id,
            vehicle_id=v_t07.id,
            original_eta="05:00 PM",
            estimated_eta="05:00 PM",
            delay_minutes=0
        ),
        Delivery(
            tracking_number="#1049",
            customer_name="Cloud Operations Lab",
            customer_phone="+91 98840 77112",
            delivery_address="Building B, Cyber Hub Bypass Road",
            lat=11.0310,
            lng=76.9740,
            items_description="NVMe Server Storage Array",
            priority="HIGH",
            status="OUT_FOR_DELIVERY",
            route_id=r15.id,
            vehicle_id=v_t09.id,
            original_eta="04:15 PM",
            estimated_eta="04:15 PM",
            delay_minutes=0
        ),
        Delivery(
            tracking_number="#1050",
            customer_name="MicroTech Systems",
            customer_phone="+91 99400 33221",
            delivery_address="Plot 88, Sector 8 West Corridor",
            lat=11.0350,
            lng=76.9780,
            items_description="Optical Calibration Sensors",
            priority="MEDIUM",
            status="OUT_FOR_DELIVERY",
            route_id=r15.id,
            vehicle_id=v_t09.id,
            original_eta="04:40 PM",
            estimated_eta="04:40 PM",
            delay_minutes=0
        )
    ]
    db.add_all(deliveries)
    db.commit()

    import datetime
    now = datetime.datetime.utcnow()

    # 7. Initial Disruption Incident (INC-2026-08)
    disruption = Disruption(
        code="INC-2026-08",
        vehicle_id=v_t07.id,
        driver_id=driver1.id,
        route_id=r12.id,
        title="Vehicle T-07 Breakdown / Inactivity",
        status="AT_RISK",
        severity="CRITICAL",
        stationary_duration_secs=65,
        affected_deliveries_count=8,
        disruption_type="VEHICLE_BREAKDOWN",
        detected_at=now
    )
    db.add(disruption)
    db.commit()
    db.refresh(disruption)

    # 8. Driver Report
    report = DriverReport(
        disruption_id=disruption.id,
        vehicle_id=v_t07.id,
        driver_id=driver1.id,
        category="VEHICLE_PROBLEM",
        raw_message="Truck has broken down near Route 12. Engine overheating, cannot continue.",
        timestamp=now
    )
    db.add(report)

    # 9. AI Analysis
    ai_ana = AIAnalysis(
        disruption_id=disruption.id,
        driver_report_id=report.id,
        problem_type="Vehicle Mechanical Breakdown",
        urgency="CRITICAL",
        estimated_delay_mins=60,
        confidence="High (94%)",
        affected_deliveries_count=8,
        suggested_action="Transfer packages to Vehicle T-09 or assign backup vehicle.",
        created_at=now
    )
    db.add(ai_ana)

    # 10. Recommendation Options
    recs = [
        Recommendation(
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
        ),
        Recommendation(
            disruption_id=disruption.id,
            option_code="OPTION_B",
            title="Transfer Packages to Vehicle T-09",
            description="Reroute nearby active vehicle T-09 (currently 1.2 km away) to take 8 packages and merge route R-15.",
            cost_inr=300,
            delay_mins=25,
            deliveries_saved=6,
            customer_impact_level="Medium",
            operational_risk_level="Low",
            is_ai_recommended=True
        ),
        Recommendation(
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
    ]
    db.add_all(recs)
    db.commit()

    print("DROVA demonstration seed data successfully initialized!")
