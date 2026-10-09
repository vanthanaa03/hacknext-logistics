@echo off
echo ===================================================
echo     STARTING DROVA LOGISTICS PLATFORM
echo     Tagline: Understand. Decide. Adapt.
echo ===================================================

echo [1/2] Launching Python FastAPI Backend on http://localhost:8000 ...
start "DROVA FastAPI Backend" cmd /k "cd backend && venv\Scripts\python.exe -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload"

timeout /t 3 /nobreak >nul

echo [2/2] Launching React Vite Frontend on http://localhost:3000 ...
start "DROVA React Frontend" cmd /k "cd frontend && npm run dev"

echo ===================================================
echo   DROVA Platform launched successfully!
echo   - Frontend: http://localhost:3000
echo   - Backend API Docs: http://localhost:8000/docs
echo ===================================================
