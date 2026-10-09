# DROVA — Disruption-Aware Logistics Platform

> **Tagline:** Understand. Decide. Adapt.

DROVA is a commercial-grade, disruption-aware logistics decision platform designed to connect operations managers, delivery executives (drivers), and end customers. When unexpected vehicle stops, traffic congestion, or breakdowns occur, DROVA continuous GPS monitoring automatically detects inactivity, understands driver field reports via AI NLP, quantifies ripple-effect operational impact, evaluates What-If response options, and coordinates real-time recovery instructions.

---

## 1. Project Overview & Architecture

DROVA connects three distinct operational roles with role-tailored user interfaces powered by a unified real-time engine:

```
+-------------------------------------------------------------------------------+
|                             DROVA ENGINE                                      |
|                                                                               |
|  TRACK (GPS) -> DETECT (Context) -> UNDERSTAND (AI) -> DECIDE -> ACT -> INFORM |
+-----------------------+-----------------------+-------------------------------+
                        |                       |
            +-----------+-----------+   +-------+-------+
            | Operations Command    |   | Driver App    |
            | Center (Manager)      |   | (Executive)   |
            +-----------------------+   +---------------+
                        |
            +-----------+-----------+
            | Customer Tracking     |
            | Portal (Transparency) |
            +-----------------------+
```

### Core Innovation: Context-Aware Disruption Detection
DROVA monitors vehicle GPS positions continuously. Instead of blindly assuming a stationary vehicle is in distress, it validates context:
* Is the driver currently traveling?
* Is the driver expected to stop at a delivery location or customer gate?
* Is the vehicle at a warehouse hub?
* Is the driver already marked as delivering?
* Has stationary duration exceeded the configured threshold (default: 60s)?

Only when unexpected inactivity occurs mid-route does DROVA flag an **"AT RISK"** disruption event.

---

## 2. Fixed Technology Stack

* **Frontend:** React 18, TypeScript, Tailwind CSS v4, React Router, Leaflet & React-Leaflet GIS, Lucide Icons, Axios.
* **Backend:** Python 3.14+, FastAPI, REST APIs, WebSockets (`/ws`) for real-time streaming updates.
* **Database:** SQLAlchemy ORM with PostgreSQL (`postgresql://postgres:postgres@localhost:5432/drova_db`) and automatic zero-friction SQLite fallback for local demonstration.
* **Authentication:** JWT-based token authentication (`python-jose`, `passlib`, `bcrypt`).
* **Map:** Leaflet & OpenStreetMap GIS layer.
* **AI Service Layer:** Python NLP triaging & What-If recommendation engine for impact evaluation and plan generation.
* **GPS Engine:** Built-in GPS simulation engine supporting real mobile GPS integration.

---

## 3. Demo Credentials

For hackathon evaluation, click any role on the landing page or use the demo credentials below:

| Role | Email | Password | Platform View |
|---|---|---|---|
| **Logistics Manager** | `manager@drova.logistics` | `manager123` | Operations Command Center (Dense desktop dashboard) |
| **Delivery Executive** | `arun@drova.logistics` | `driver123` | Field Executive App (Mobile-first, Vehicle T-07) |
| **Customer** | `customer@drova.logistics` | `customer123` | Transparent Delivery Tracking (Order #1045) |

---

## 4. End-to-End Hackathon Demonstration Scenario (31-Step Workflow)

1. **Start:** Launch app, open Manager Command Center and Driver App side-by-side or use the top navbar role switcher.
2. **GPS Simulation:** Click **[START GPS SIMULATION]**. Vehicle `T-07` moves normally along Route `R-12` on the Leaflet map.
3. **Simulate Disruption:** Click **[SIMULATE DISRUPTION (T-07 STOP)]**. Vehicle `T-07` stops moving instantly.
4. **Detection:** Stationary timer ticks. Once threshold (60s) is exceeded, backend flags `T-07` as **AT RISK**.
5. **Driver Alert:** Driver Arun receives an alert: *"⚠️ UNEXPECTED STOP DETECTED. Are you facing a problem?"*
6. **Driver Report:** Driver selects *"Vehicle Problem"* and enters: *"Truck has broken down near Route 12. I cannot continue."*
7. **AI NLP Understanding:** AI extracts:
   * **Problem:** Vehicle Mechanical Breakdown
   * **Urgency:** CRITICAL
   * **Delay:** 60 Mins
   * **Affected:** 8 Deliveries, 3 Priority VIP Clients
8. **Manager Command Center Alert:** Manager receives critical incident card with Visual Ripple Effect Graph (Disruption -> Vehicle T-07 -> Route R-12 -> 8 Deliveries -> 3 Customers).
9. **What-If Simulation:** Manager clicks **[SIMULATE & COMPARE RESPONSE PLANS]**.
10. **Plan Comparison:** Manager compares 3 response options:
    * **Option A:** Assign Backup Vehicle (Cost ₹500, Delay 15m, Saved 7)
    * **Option B (AI Recommended):** Transfer Packages to Vehicle T-09 (Cost ₹300, Delay 25m, Saved 6)
    * **Option C:** Wait for Repair (Cost ₹0, Delay 90m, Saved 2)
11. **Manager Decision:** Manager selects **Option B** and clicks **[CONFIRM & EXECUTE PLAN]**.
12. **Execution:** Backend updates database, reassigns packages to `T-09`, dispatches operational instruction to Driver Arun and Driver Meera, and updates customer ETA.
13. **Driver Instruction:** Driver Arun receives real-time operational instruction: *"Transfer 8 packages to Vehicle T-09 at Sector 4 Flyover."* Driver acknowledges.
14. **Customer Transparency:** Customer tracking portal for Order `#1045` displays updated ETA `04:35 PM` with reassuring delay explanation (*"Why is my delivery delayed?"* accordion).
15. **Resolution:** Manager dashboard shows **DISRUPTION STATUS: RESOLVED**.

---

## 5. Installation & Setup

### Requirements
* Python 3.10+
* Node.js v18+ & npm

### Backend Setup
```bash
cd backend
python -m venv venv
venv\Scripts\activate       # On Windows
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Open browser at `http://localhost:3000`.

---

## 6. One-Click Hackathon Launcher

Run `start.bat` from the project root directory on Windows:

```cmd
start.bat
```

This will automatically launch the FastAPI backend server on port `8000` and the React Vite frontend server on port `3000`.

---

## 7. Key REST & WebSocket API Documentation

* `POST /api/auth/login` — Role-based JWT login
* `GET /api/vehicles` — Live vehicle statuses and GPS coordinates
* `POST /api/vehicles/:code/location` — Ingest GPS coordinate update
* `GET /api/disruptions` — Fetch active disruption incidents
* `GET /api/disruptions/:id` — Detailed disruption view with AI NLP analysis and What-If recommendations
* `POST /api/driver/report` — Submit natural-language field report & trigger AI triaging
* `GET /api/driver/instructions` — Driver operational instructions
* `POST /api/driver/instructions/:id/acknowledge` — Acknowledge operational instruction
* `POST /api/manager/decision` — Confirm & execute Manager response plan
* `POST /api/settings/inactivity-threshold` — Update inactivity threshold (default: 60s)
* `POST /api/gps/simulate/start` — Start simulated GPS movement
* `POST /api/gps/simulate/disrupt` — Trigger artificial vehicle breakdown
* `GET /api/customer/orders/:tracking_number` — Customer delivery tracking & transparent delay status
* `WS /ws` — Real-time WebSockets event stream
