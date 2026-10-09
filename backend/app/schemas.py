from pydantic import BaseModel, Field
from typing import List, Optional, Any, Dict
from datetime import datetime

class LoginRequest(BaseModel):
    email: str
    password: str
    role: str # 'MANAGER', 'DRIVER', 'CUSTOMER'

class UserResponse(BaseModel):
    id: int
    email: str
    full_name: str
    role: str
    phone: Optional[str] = None

    class Config:
        from_attributes = True

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

class GPSLocationPayload(BaseModel):
    vehicle_id: str # vehicle code e.g. "T-07" or integer id
    driver_id: Optional[str] = None
    latitude: float
    longitude: float
    speed_kmh: Optional[float] = 0.0
    timestamp: Optional[str] = None

class DriverReportCreate(BaseModel):
    vehicle_code: str # e.g. "T-07"
    category: str # "TRAFFIC", "VEHICLE_PROBLEM", "ROAD_BLOCKED", "CUSTOMER_ISSUE", "WAREHOUSE_DELAY", "OTHER"
    raw_message: str

class AIAnalyzeRequest(BaseModel):
    vehicle_code: str
    raw_message: str
    category: Optional[str] = "OTHER"

class ManagerDecisionCreate(BaseModel):
    disruption_id: int
    selected_option_code: str # "OPTION_A", "OPTION_B", "OPTION_C"
    decision_notes: Optional[str] = ""

class InactivityThresholdUpdate(BaseModel):
    threshold_seconds: int = 60

class GPSSimulationStart(BaseModel):
    vehicle_code: str = "T-07"
    speed_multiplier: float = 1.0

class GPSSimulationDisrupt(BaseModel):
    vehicle_code: str = "T-07"
    disruption_type: str = "VEHICLE_BREAKDOWN"
