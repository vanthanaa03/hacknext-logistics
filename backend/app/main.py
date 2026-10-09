import os
import json
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from .database import engine, Base, SessionLocal
from .seed_data import seed_initial_data
from .services.websocket_manager import manager as ws_manager

# Import API routers
from .routes.auth_routes import router as auth_router
from .routes.vehicle_routes import router as vehicle_router
from .routes.delivery_routes import router as delivery_router
from .routes.disruption_routes import router as disruption_router
from .routes.driver_routes import router as driver_router
from .routes.ai_routes import router as ai_router
from .routes.manager_routes import router as manager_router
from .routes.customer_routes import router as customer_router
from .routes.notification_routes import router as notification_router
from .routes.gps_simulation_routes import router as gps_simulation_router

# Create DB tables
try:
    Base.metadata.create_all(bind=engine)
except Exception as e:
    print(f"Database table creation notice: {e}")

app = FastAPI(
    title="DROVA - Disruption-Aware Logistics Platform API",
    description="Backend API supporting GPS tracking, automated disruption detection, driver AI message understanding, What-If decision simulation, manager decisioning, and customer transparency.",
    version="1.0.0"
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Startup event for seed data
@app.on_event("startup")
def startup_event():
    db = SessionLocal()
    try:
        seed_initial_data(db)
    except Exception as e:
        print(f"Seed data error: {e}")
    finally:
        db.close()

# Include API Routers
app.include_router(auth_router)
app.include_router(vehicle_router)
app.include_router(delivery_router)
app.include_router(disruption_router)
app.include_router(driver_router)
app.include_router(ai_router)
app.include_router(manager_router)
app.include_router(customer_router)
app.include_router(notification_router)
app.include_router(gps_simulation_router)

# Root Healthcheck
@app.get("/")
def read_root():
    return {
        "status": "online",
        "platform": "DROVA Disruption-Aware Logistics Engine",
        "tagline": "Understand. Decide. Adapt.",
        "version": "1.0.0"
    }

# Real-Time WebSocket Endpoint
@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await ws_manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            # Echo ping or handle client heartbeats if needed
            try:
                payload = json.loads(data)
                if payload.get("type") == "PING":
                    await websocket.send_text(json.dumps({"type": "PONG"}))
            except Exception:
                pass
    except WebSocketDisconnect:
        ws_manager.disconnect(websocket)
    except Exception as e:
        ws_manager.disconnect(websocket)
