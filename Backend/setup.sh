#!/bin/bash

# Quick Start Script for Physical Attendance Automation Backend
# Run this script from the Backend directory using: bash setup.sh

echo "================================================"
echo "Physical Attendance Automation - Backend Setup"
echo "================================================"
echo ""

# Check if virtual environment exists
if [ -d "venv" ]; then
    echo "✓ Virtual environment found"
else
    echo "Creating virtual environment..."
    python3 -m venv venv
    echo "✓ Virtual environment created"
fi

# Activate virtual environment
# Note: The script will run the following commands in a subshell,
# but you will need to run 'source venv/bin/activate' in your own shell
# to work inside the virtual environment after this script completes.
source venv/bin/activate

# Install dependencies
echo "Installing dependencies..."
pip install -r requirements.txt

# Check if .env exists
if [ -f ".env" ]; then
    echo "✓ .env file found"
else
    echo "⚠ .env file not found. Checking for .env.example..."
    if [ -f ".env.example" ]; then
        cp .env.example .env
        echo "✓ Created .env file from .env.example - Please update it with your database credentials!"
    else
        # Creating a blank .env file if .env.example is not found
        touch .env
        echo "✓ Created a blank .env file - Please update it with your database credentials!"
    fi
fi

echo ""
echo "================================================"
echo "Next Steps:"
echo "================================================"
echo "1. Activate the virtual environment in your terminal: source venv/bin/activate"
echo "2. Update .env file with your PostgreSQL credentials"
echo "3. Create PostgreSQL database: attendance_db"
echo "4. Run: python manage.py migrate"
echo "5. Run: python manage.py createsuperuser"
echo "6. Run: python manage.py seed_data (optional - creates test users)"
echo "7. Run: python manage.py runserver"
echo ""
echo "API will be available at: http://localhost:8000/api/"
echo ""
