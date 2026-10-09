import datetime
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from .database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    role = Column(String(50), nullable=False) # 'MANAGER', 'DRIVER', 'CUSTOMER'
    phone = Column(String(50), nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    driver_profile = relationship("Driver", back_populates="user", uselist=False)

class Driver(Base):
    __tablename__ = "drivers"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    code = Column(String(50), unique=True, index=True, nullable=False) # e.g. 'D-04'
    license_number = Column(String(100), nullable=False)
    status = Column(String(50), default="ON_DUTY") # 'ON_DUTY', 'OFF_DUTY', 'IN_BREAK', 'DISRUPTED'
    phone = Column(String(50), nullable=True)
    rating = Column(Float, default=4.9)
    current_vehicle_id = Column(Integer, ForeignKey("vehicles.id"), nullable=True)

    user = relationship("User", back_populates="driver_profile")
    reports = relationship("DriverReport", back_populates="driver")

class Vehicle(Base):
    __tablename__ = "vehicles"

    id = Column(Integer, primary_key=True, index=True)
    code = Column(String(50), unique=True, index=True, nullable=False) # e.g. 'T-07', 'T-09'
    plate_number = Column(String(100), nullable=False) # e.g. 'TN-38-A-7421'
    vehicle_type = Column(String(50), default="Medium Delivery Truck")
    max_capacity_kg = Column(Float, default=1500.0)
    current_driver_id = Column(Integer, ForeignKey("drivers.id"), nullable=True)
    status = Column(String(50), default="NORMAL") # 'NORMAL', 'AT_RISK', 'DISRUPTED', 'MAINTENANCE'
    current_lat = Column(Float, default=11.0168)
    current_lng = Column(Float, default=76.9558)
    current_speed_kmh = Column(Float, default=0.0)
    stationary_duration_secs = Column(Integer, default=0)
    last_gps_update = Column(DateTime, default=datetime.datetime.utcnow)
    active_route_id = Column(Integer, ForeignKey("routes.id"), nullable=True)
    
    route = relationship("Route", back_populates="vehicles")
    deliveries = relationship("Delivery", back_populates="vehicle")
    gps_logs = relationship("GPSLocation", back_populates="vehicle")

class Route(Base):
    __tablename__ = "routes"

    id = Column(Integer, primary_key=True, index=True)
    code = Column(String(50), unique=True, index=True, nullable=False) # e.g. 'R-12'
    name = Column(String(255), nullable=False)
    waypoints_json = Column(JSON, nullable=False) # List of [lat, lng]
    estimated_duration_mins = Column(Integer, default=45)
    distance_km = Column(Float, default=18.5)

    vehicles = relationship("Vehicle", back_populates="route")
    deliveries = relationship("Delivery", back_populates="route")

class Delivery(Base):
    __tablename__ = "deliveries"

    id = Column(Integer, primary_key=True, index=True)
    tracking_number = Column(String(100), unique=True, index=True, nullable=False) # e.g. '#1045'
    customer_name = Column(String(255), nullable=False)
    customer_phone = Column(String(50), nullable=False)
    customer_email = Column(String(255), nullable=True)
    delivery_address = Column(String(500), nullable=False)
    lat = Column(Float, nullable=False)
    lng = Column(Float, nullable=False)
    items_description = Column(String(255), default="Electronics & Hardware")
    priority = Column(String(50), default="MEDIUM") # 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'
    status = Column(String(50), default="OUT_FOR_DELIVERY") # 'PENDING', 'OUT_FOR_DELIVERY', 'AT_RISK', 'DELAYED', 'DELIVERED'
    route_id = Column(Integer, ForeignKey("routes.id"), nullable=True)
    vehicle_id = Column(Integer, ForeignKey("vehicles.id"), nullable=True)
    original_eta = Column(String(50), default="04:20 PM")
    estimated_eta = Column(String(50), default="04:20 PM")
    delay_minutes = Column(Integer, default=0)
    delay_reason = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    route = relationship("Route", back_populates="deliveries")
    vehicle = relationship("Vehicle", back_populates="deliveries")

class GPSLocation(Base):
    __tablename__ = "gps_locations"

    id = Column(Integer, primary_key=True, index=True)
    vehicle_id = Column(Integer, ForeignKey("vehicles.id"), nullable=False)
    driver_id = Column(Integer, ForeignKey("drivers.id"), nullable=True)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    speed_kmh = Column(Float, default=0.0)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)

    vehicle = relationship("Vehicle", back_populates="gps_logs")

class Disruption(Base):
    __tablename__ = "disruptions"

    id = Column(Integer, primary_key=True, index=True)
    code = Column(String(50), unique=True, index=True, nullable=False) # e.g. 'INC-2026-08'
    vehicle_id = Column(Integer, ForeignKey("vehicles.id"), nullable=False)
    driver_id = Column(Integer, ForeignKey("drivers.id"), nullable=True)
    route_id = Column(Integer, ForeignKey("routes.id"), nullable=True)
    title = Column(String(255), nullable=False)
    status = Column(String(50), default="ACTIVE") # 'AT_RISK', 'ACTIVE', 'SIMULATING', 'RESOLVED'
    severity = Column(String(50), default="HIGH") # 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'
    detected_at = Column(DateTime, default=datetime.datetime.utcnow)
    stationary_duration_secs = Column(Integer, default=0)
    affected_deliveries_count = Column(Integer, default=0)
    disruption_type = Column(String(100), default="UNUSUAL_INACTIVITY")
    ai_summary_json = Column(JSON, nullable=True)
    resolved_at = Column(DateTime, nullable=True)

    vehicle = relationship("Vehicle")
    driver = relationship("Driver")
    route = relationship("Route")
    reports = relationship("DriverReport", back_populates="disruption")
    analyses = relationship("AIAnalysis", back_populates="disruption")
    recommendations = relationship("Recommendation", back_populates="disruption")
    decisions = relationship("ManagerDecision", back_populates="disruption")

class DriverReport(Base):
    __tablename__ = "driver_reports"

    id = Column(Integer, primary_key=True, index=True)
    disruption_id = Column(Integer, ForeignKey("disruptions.id"), nullable=True)
    vehicle_id = Column(Integer, ForeignKey("vehicles.id"), nullable=False)
    driver_id = Column(Integer, ForeignKey("drivers.id"), nullable=False)
    category = Column(String(50), nullable=False) # 'TRAFFIC', 'VEHICLE_PROBLEM', 'ROAD_BLOCKED', 'CUSTOMER_ISSUE', 'WAREHOUSE_DELAY', 'OTHER'
    raw_message = Column(Text, nullable=False)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)

    disruption = relationship("Disruption", back_populates="reports")
    driver = relationship("Driver", back_populates="reports")

class AIAnalysis(Base):
    __tablename__ = "ai_analyses"

    id = Column(Integer, primary_key=True, index=True)
    disruption_id = Column(Integer, ForeignKey("disruptions.id"), nullable=False)
    report_id = Column(Integer, ForeignKey("driver_reports.id"), nullable=True)
    problem_type = Column(String(100), nullable=False)
    urgency = Column(String(50), nullable=False) # 'WARNING', 'CRITICAL', 'INFO'
    estimated_delay_mins = Column(Integer, default=30)
    confidence = Column(String(50), default="High (94%)")
    affected_deliveries_count = Column(Integer, default=0)
    affected_route = Column(String(100), nullable=True)
    suggested_action = Column(String(255), nullable=False)
    full_analysis_json = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    disruption = relationship("Disruption", back_populates="analyses")

class Recommendation(Base):
    __tablename__ = "recommendations"

    id = Column(Integer, primary_key=True, index=True)
    disruption_id = Column(Integer, ForeignKey("disruptions.id"), nullable=False)
    option_code = Column(String(50), nullable=False) # 'OPTION_A', 'OPTION_B', 'OPTION_C'
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    cost_inr = Column(Integer, default=0)
    delay_mins = Column(Integer, default=0)
    deliveries_saved = Column(Integer, default=0)
    customer_impact_level = Column(String(50), default="Low") # 'Low', 'Medium', 'High'
    operational_risk_level = Column(String(50), default="Low") # 'Low', 'Medium', 'High'
    is_ai_recommended = Column(Boolean, default=False)

    disruption = relationship("Disruption", back_populates="recommendations")

class ManagerDecision(Base):
    __tablename__ = "manager_decisions"

    id = Column(Integer, primary_key=True, index=True)
    disruption_id = Column(Integer, ForeignKey("disruptions.id"), nullable=False)
    recommendation_id = Column(Integer, ForeignKey("recommendations.id"), nullable=True)
    selected_option_code = Column(String(50), nullable=False)
    decision_notes = Column(Text, nullable=True)
    decided_at = Column(DateTime, default=datetime.datetime.utcnow)

    disruption = relationship("Disruption", back_populates="decisions")

class DriverInstruction(Base):
    __tablename__ = "driver_instructions"

    id = Column(Integer, primary_key=True, index=True)
    driver_id = Column(Integer, ForeignKey("drivers.id"), nullable=False)
    vehicle_id = Column(Integer, ForeignKey("vehicles.id"), nullable=False)
    disruption_id = Column(Integer, ForeignKey("disruptions.id"), nullable=True)
    title = Column(String(255), nullable=False)
    instruction_type = Column(String(100), default="ROUTE_UPDATE") # 'ROUTE_UPDATE', 'PACKAGE_TRANSFER', 'STANDBY'
    body = Column(Text, nullable=False)
    avoid_route = Column(String(100), nullable=True)
    take_route = Column(String(100), nullable=True)
    priority_order = Column(String(100), nullable=True)
    new_eta = Column(String(50), nullable=True)
    is_acknowledged = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    target_role = Column(String(50), nullable=False) # 'MANAGER', 'DRIVER', 'CUSTOMER'
    target_user_id = Column(Integer, nullable=True)
    target_order_id = Column(String(100), nullable=True)
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    notification_type = Column(String(50), default="INFO") # 'CRITICAL', 'WARNING', 'SUCCESS', 'INFO'
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class SystemSettings(Base):
    __tablename__ = "system_settings"

    id = Column(Integer, primary_key=True, index=True)
    key = Column(String(100), unique=True, nullable=False) # e.g. 'inactivity_threshold_seconds'
    value = Column(String(255), nullable=False) # e.g. '60'
