@echo off
echo ========================================
echo Scholarship Management Portal Setup
echo ========================================

echo.
echo Step 1: Setting up Database...
echo.

REM Create database and user
psql -U postgres -c "CREATE DATABASE scholarship_management;" 2>nul
psql -U postgres -c "CREATE USER scholarship_user WITH PASSWORD 'scholarship_pass';" 2>nul
psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE scholarship_management TO scholarship_user;" 2>nul

REM Load database schema
psql -U scholarship_user -d scholarship_management -h localhost -f setup-database.sql

if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Database setup failed. Please check PostgreSQL installation.
    pause
    exit /b 1
)

echo Database setup completed successfully!
echo.

echo Step 2: Setting up Backend...
echo.
cd backend
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Backend npm install failed.
    pause
    exit /b 1
)

REM Create directories
if not exist "uploads\documents" mkdir uploads\documents
if not exist "logs" mkdir logs

echo Backend setup completed!
echo.

echo Step 3: Setting up Frontend...
echo.
cd ..
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Frontend npm install failed.
    pause
    exit /b 1
)

echo Frontend setup completed!
echo.

echo ========================================
echo Setup Complete!
echo ========================================
echo.
echo To start the application:
echo 1. Open terminal 1: cd backend && npm run dev
echo 2. Open terminal 2: npm start
echo.
echo Login credentials:
echo Admin: admin@university.edu / admin123
echo Student: john.doe@student.edu / password123
echo.
echo Frontend: http://localhost:3000
echo Backend: http://localhost:3001/api/v1/health
echo.
pause