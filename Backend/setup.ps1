# Quick Start Script for Physical Attendance Automation Backend
# Run this script from the Backend directory in PowerShell

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "Physical Attendance Automation - Backend Setup" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Check if virtual environment exists
if (Test-Path "venv") {
    Write-Host "✓ Virtual environment found" -ForegroundColor Green
} else {
    Write-Host "Creating virtual environment..." -ForegroundColor Yellow
    python -m venv venv
    Write-Host "✓ Virtual environment created" -ForegroundColor Green
}

# Activate virtual environment
Write-Host "Activating virtual environment..." -ForegroundColor Yellow
.\venv\Scripts\Activate.ps1

# Install dependencies
Write-Host "Installing dependencies..." -ForegroundColor Yellow
pip install -r requirements.txt

# Check if .env exists
if (Test-Path ".env") {
    Write-Host "✓ .env file found" -ForegroundColor Green
} else {
    Write-Host "⚠ .env file not found. Copying from .env.example..." -ForegroundColor Yellow
    Copy-Item .env.example .env
    Write-Host "✓ Created .env file - Please update with your database credentials!" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "Next Steps:" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "1. Update .env file with your PostgreSQL credentials"
Write-Host "2. Create PostgreSQL database: attendance_db"
Write-Host "3. Run: python manage.py migrate"
Write-Host "4. Run: python manage.py createsuperuser"
Write-Host "5. Run: python manage.py seed_data (optional - creates test users)"
Write-Host "6. Run: python manage.py runserver"
Write-Host ""
Write-Host "API will be available at: http://localhost:8000/api/" -ForegroundColor Green
Write-Host ""
