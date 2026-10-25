@echo off
title Royal Rasoi Launcher
cls
echo ==========================================================
echo          ROYAL RASOI - FINE INDIAN DINING (BOISAR)        
echo               Starting Full-Stack Platform...            
echo ==========================================================
echo.

set ROOT=%~dp0

echo [1/2] Starting FastAPI Backend on port 8000...
start "Royal Rasoi - Backend API (FastAPI)" cmd /k "cd /d %ROOT%backend && pip install -r requirements.txt && python -m uvicorn main:app --reload --port 8000"

echo [2/2] Starting Next.js Frontend on port 3000...
start "Royal Rasoi - Frontend UI (Next.js)" cmd /k "cd /d %ROOT%frontend && npm install && npm run dev"

echo.
echo ==========================================================
echo Both servers have been launched!
echo - Frontend: http://localhost:3000
echo - Backend:  http://localhost:8000
echo - Swagger:  http://localhost:8000/docs
echo ==========================================================
echo.
pause
