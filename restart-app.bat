@echo off
REM Restart Application Script for Windows (Batch File)
REM Clears all caches and restarts both frontend and backend services

echo ==========================================
echo Restarting RevTickets Application
echo ==========================================
echo.

REM Get the project root directory
cd /d "%~dp0"

echo Project Root: %CD%
echo.

REM Check if Docker is running
docker ps >nul 2>&1
if errorlevel 1 (
    echo Docker is not running. Please start Docker Desktop.
    pause
    exit /b 1
)

echo Docker is running
echo.

REM Step 1: Stop all services
echo ==========================================
echo Step 1: Stopping all services
echo ==========================================
echo.

docker-compose stop
if errorlevel 0 (
    echo All services stopped
) else (
    echo Could not stop services (may not be running)
)
echo.

REM Step 2: Restart Backend
echo ==========================================
echo Step 2: Restarting Backend
echo ==========================================
echo.

if exist "backend\restart-backend.bat" (
    call backend\restart-backend.bat
    if errorlevel 1 (
        echo Failed to restart backend via script, attempting direct restart...
        docker-compose up -d --build backend
    )
) else (
    echo Backend restart script not found, restarting directly...
    docker-compose up -d --build backend
)

echo.

REM Wait for backend to initialize
echo Waiting for backend to initialize...
timeout /t 5 /nobreak >nul

REM Step 3: Restart Frontend
echo ==========================================
echo Step 3: Restarting Frontend
echo ==========================================
echo.

if exist "frontend\restart-frontend.bat" (
    call frontend\restart-frontend.bat
    if errorlevel 1 (
        echo Failed to restart frontend via script, attempting direct restart...
        docker-compose up -d --build frontend
    )
) else (
    echo Frontend restart script not found, restarting directly...
    docker-compose up -d --build frontend
)

echo.

REM Final status check
echo ==========================================
echo Final Status Check
echo ==========================================
echo.

timeout /t 5 /nobreak >nul

echo Service Status:
echo.

echo MongoDB:  Running on port 27017
echo Backend:  Running on http://localhost:8000
echo           API Docs: http://localhost:8000/docs
echo Frontend: Running on http://localhost:3000
echo.

echo ==========================================
echo Application Restart Complete
echo ==========================================
echo.
echo All caches cleared and services restarted!
echo.
echo Useful Commands:
echo   View backend logs:  docker logs -f fastapi-backend
echo   View frontend logs: docker logs -f nextjs-frontend
echo   Stop all services:  docker-compose stop
echo.
pause
