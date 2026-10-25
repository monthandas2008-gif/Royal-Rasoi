<#
.SYNOPSIS
    Royal Rasoi - One-Click Launcher for Frontend and Backend
.DESCRIPTION
    Runs FastAPI backend on port 8000 and Next.js frontend on port 3000 simultaneously.
#>

$root = $PSScriptRoot

Write-Host "==========================================================" -ForegroundColor DarkYellow
Write-Host "          ROYAL RASOI - FINE INDIAN DINING (BOISAR)        " -ForegroundColor Yellow
Write-Host "               Starting Full-Stack Platform...            " -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor DarkYellow

# Check if Python is available
if (-not (Get-Command python -ErrorAction SilentlyContinue)) {
    Write-Host "[Error] Python is not found in PATH! Please install Python 3.10+." -ForegroundColor Red
    exit 1
}

# Check if Node / npm is available
if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
    Write-Host "[Error] Node.js / npm is not found in PATH! Please install Node.js 18+." -ForegroundColor Red
    exit 1
}

Write-Host "`n[1/3] Preparing Backend (FastAPI)..." -ForegroundColor Cyan
$backendDir = Join-Path $root "backend"

Write-Host "[2/3] Preparing Frontend (Next.js 14)..." -ForegroundColor Cyan
$frontendDir = Join-Path $root "frontend"

Write-Host "`n[3/3] Launching both servers simultaneously in independent processes..." -ForegroundColor Green

# Start Backend in a separate visible console window
$backendCmd = "Set-Location '$backendDir'; Write-Host '--- Starting Royal Rasoi FastAPI Backend on http://localhost:8000 ---' -ForegroundColor Green; if (Test-Path requirements.txt) { pip install -r requirements.txt -q }; python -m uvicorn main:app --reload --port 8000"
Start-Process powershell -ArgumentList "-NoExit", "-Command", $backendCmd

# Start Frontend in a separate visible console window
$frontendCmd = "Set-Location '$frontendDir'; Write-Host '--- Starting Royal Rasoi Next.js Frontend on http://localhost:3000 ---' -ForegroundColor Yellow; if (-not (Test-Path node_modules)) { npm install }; npm run dev"
Start-Process powershell -ArgumentList "-NoExit", "-Command", $frontendCmd

Write-Host "`nServers are spinning up!" -ForegroundColor Green
Write-Host "----------------------------------------------------------"
Write-Host "• Frontend UI   : " -NoNewline; Write-Host "http://localhost:3000" -ForegroundColor Cyan
Write-Host "• Backend API  : " -NoNewline; Write-Host "http://localhost:8000" -ForegroundColor Cyan
Write-Host "• API Swagger   : " -NoNewline; Write-Host "http://localhost:8000/docs" -ForegroundColor Cyan
Write-Host "----------------------------------------------------------"
Write-Host "Do not close the opened PowerShell windows while testing.`n" -ForegroundColor DarkGray
