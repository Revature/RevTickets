@echo off
REM Start All Services Script for Windows (Batch File)
REM Starts MongoDB, Backend, and Frontend services using Docker Compose

echo ==========================================
echo Starting RevTickets Application
echo ==========================================
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

REM Check if docker-compose.yml exists
if not exist "docker-compose.yml" (
    echo docker-compose.yml not found!
    pause
    exit /b 1
)

REM Clear caches
echo Clearing caches...
cd backend
for /d /r %%d in (__pycache__) do @if exist "%%d" rd /s /q "%%d" 2>nul
for /r %%f in (*.pyc) do @if exist "%%f" del /q "%%f" 2>nul
cd ..
cd frontend
if exist ".next" rd /s /q ".next" 2>nul
if exist "node_modules\.cache" rd /s /q "node_modules\.cache" 2>nul
cd ..
echo   Caches cleared
echo.

echo Starting all services (MongoDB, Backend, Frontend)...
echo.

docker-compose up -d

if errorlevel 1 (
    echo.
    echo Failed to start services
    echo.
    echo Troubleshooting:
    echo   1. Ensure Docker Desktop is running
    echo   2. Check if ports 3000, 8000, 27017 are available
    echo   3. Check logs: docker-compose logs
    pause
    exit /b 1
)

echo.
echo All services started
echo.
timeout /t 5 /nobreak >nul

echo ==========================================
echo Application Status
echo ==========================================
echo.
echo MongoDB:  Running on port 27017
echo Backend:  Running on http://localhost:8000
echo Frontend: Running on http://localhost:3000
echo.
echo ==========================================
echo Useful Commands
echo ==========================================
echo.
echo View logs:    docker-compose logs -f
echo Stop:         docker-compose stop
echo Restart:      docker-compose restart
echo.
echo ==========================================
echo Start Complete
echo ==========================================
pause

