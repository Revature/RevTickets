@echo off
REM Restart Frontend Script for Windows (Batch File)
REM Clears all frontend caches and restarts the Next.js frontend service

echo ==========================================
echo Restarting RevTickets Frontend
echo ==========================================
echo.

REM Get the project root directory
cd /d "%~dp0\.."

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

REM Step 1: Stop frontend service
echo ==========================================
echo Step 1: Stopping frontend service
echo ==========================================
echo.

docker-compose stop frontend
if errorlevel 0 (
    echo Frontend service stopped
) else (
    echo Could not stop frontend service (may not be running)
)
echo.

REM Step 2: Clear frontend caches
echo ==========================================
echo Step 2: Clearing frontend caches
echo ==========================================
echo.

cd frontend

REM Clear Next.js .next cache
echo Clearing Next.js cache...
if exist ".next" (
    rd /s /q ".next" 2>nul
    if errorlevel 0 (
        echo   Cleared Next.js .next cache
    )
) else (
    echo   No .next cache found
)

REM Clear node_modules/.cache
echo Clearing node_modules cache...
if exist "node_modules\.cache" (
    rd /s /q "node_modules\.cache" 2>nul
    if errorlevel 0 (
        echo   Cleared node_modules cache
    )
) else (
    echo   No node_modules cache found
)

REM Clear .turbo cache
echo Clearing Turbopack cache...
if exist ".turbo" (
    rd /s /q ".turbo" 2>nul
    if errorlevel 0 (
        echo   Cleared .turbo cache
    )
) else (
    echo   No .turbo cache found
)

cd ..
echo.

REM Step 3: Clear Docker build cache
echo ==========================================
echo Step 3: Clearing Docker build cache
echo ==========================================
echo.

echo Clearing Docker build cache for frontend...
docker-compose build --no-cache frontend >nul 2>&1
if errorlevel 0 (
    echo   Docker build cache cleared
)
echo.

REM Step 4: Start frontend service
echo ==========================================
echo Step 4: Starting frontend service
echo ==========================================
echo.

docker-compose up -d --build frontend
if errorlevel 0 (
    echo.
    echo Frontend service started
    echo.
    timeout /t 5 /nobreak >nul
    echo Frontend is running on: http://localhost:3000
    echo.
    echo To view logs, run: docker logs -f nextjs-frontend
    echo To stop, run: docker-compose stop frontend
) else (
    echo.
    echo Failed to start frontend service
    echo Check logs: docker logs nextjs-frontend
    pause
    exit /b 1
)

echo.
echo ==========================================
echo Frontend Restart Complete
echo ==========================================
echo.
pause





