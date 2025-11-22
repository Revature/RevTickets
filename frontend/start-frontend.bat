@echo off
REM Frontend Start Script for Windows (Batch File)
REM Starts the Next.js frontend service using Docker Compose

echo ==========================================
echo Starting RevTickets Frontend
echo ==========================================
echo.

REM Get the project root directory (parent of frontend folder)
cd /d "%~dp0\.."

echo Project Root: %CD%
echo.

REM Clear frontend caches
echo Clearing frontend caches...
cd frontend

REM Clear Next.js .next cache
if exist ".next" (
    rd /s /q ".next" 2>nul
    if errorlevel 0 (
        echo   Cleared Next.js .next cache
    )
)

REM Clear node_modules/.cache
if exist "node_modules\.cache" (
    rd /s /q "node_modules\.cache" 2>nul
    if errorlevel 0 (
        echo   Cleared node_modules cache
    )
)

REM Clear .turbo cache
if exist ".turbo" (
    rd /s /q ".turbo" 2>nul
    if errorlevel 0 (
        echo   Cleared .turbo cache
    )
)

cd ..
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
    echo docker-compose.yml not found in project root!
    pause
    exit /b 1
)

echo Clearing Docker build cache for frontend...
docker-compose build --no-cache frontend >nul 2>&1
if errorlevel 0 (
    echo   Docker build cache cleared
)
echo.

echo Starting frontend service...
echo.

REM Start frontend service
docker-compose up -d --build frontend

if errorlevel 1 (
    echo.
    echo Failed to start frontend service
    echo.
    echo Troubleshooting:
    echo   1. Ensure Docker Desktop is running
    echo   2. Check if port 3000 is available
    echo   3. Ensure backend is running first
    echo   4. Check frontend logs: docker logs nextjs-frontend
    pause
    exit /b 1
)

echo.
echo Frontend service started
echo.
timeout /t 3 /nobreak >nul

echo Frontend is running on: http://localhost:3000
echo.
echo To view logs, run: docker logs -f nextjs-frontend
echo To stop, run: docker-compose stop frontend
echo.
echo ==========================================
echo Frontend Start Complete
echo ==========================================
pause

