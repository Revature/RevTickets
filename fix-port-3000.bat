@echo off
REM Fix Port 3000 Script (Batch File)
REM Stops frontend, kills process on port 3000, and restarts frontend on port 3000

echo ==========================================
echo Fixing Port 3000 for Frontend
echo ==========================================
echo.

REM Step 1: Stop frontend container
echo Step 1: Stopping frontend container...
docker-compose stop frontend
echo Frontend container stopped
echo.

REM Step 2: Kill any process on port 3000
echo Step 2: Checking for processes on port 3000...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":3000"') do (
    echo Found process on port 3000: PID %%a
    taskkill /F /PID %%a >nul 2>&1
    if errorlevel 0 (
        echo   Killed process %%a
    )
)
echo.

REM Step 3: Wait a moment
echo Step 3: Verifying port 3000 is free...
timeout /t 2 /nobreak >nul
echo Port 3000 should be free now
echo.

REM Step 4: Restart frontend on port 3000
echo Step 4: Starting frontend on port 3000...
docker-compose up -d --build frontend

if errorlevel 0 (
    echo.
    echo Frontend started successfully
    echo.
    timeout /t 5 /nobreak >nul
    echo Frontend is now running on: http://localhost:3000
) else (
    echo.
    echo Failed to start frontend
    echo Check logs: docker logs nextjs-frontend
)

echo.
echo ==========================================
echo Port 3000 Fix Complete
echo ==========================================
echo.
pause





