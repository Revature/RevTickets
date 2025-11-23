@echo off
REM Restart Backend Script for Windows (Batch File)
REM Clears all backend caches and restarts the FastAPI backend service

echo ==========================================
echo Restarting RevTickets Backend
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

REM Step 1: Stop backend service
echo ==========================================
echo Step 1: Stopping backend service
echo ==========================================
echo.

docker-compose stop backend
if errorlevel 0 (
    echo Backend service stopped
) else (
    echo Could not stop backend service (may not be running)
)
echo.

REM Step 2: Clear backend caches
echo ==========================================
echo Step 2: Clearing backend caches
echo ==========================================
echo.

cd backend

REM Clear Python cache directories
echo Clearing Python cache...
for /d /r %%d in (__pycache__) do @if exist "%%d" rd /s /q "%%d" 2>nul
if errorlevel 0 (
    echo   Cleared Python __pycache__ directories
) else (
    echo   No __pycache__ directories found
)

REM Clear .pyc files
echo Clearing .pyc files...
for /r %%f in (*.pyc) do @if exist "%%f" del /q "%%f" 2>nul
if errorlevel 0 (
    echo   Cleared .pyc files
) else (
    echo   No .pyc files found
)

REM Clear .pyo files
echo Clearing .pyo files...
for /r %%f in (*.pyo) do @if exist "%%f" del /q "%%f" 2>nul
if errorlevel 0 (
    echo   Cleared .pyo files
) else (
    echo   No .pyo files found
)

cd ..
echo.

REM Step 3: Clear Docker build cache
echo ==========================================
echo Step 3: Clearing Docker build cache
echo ==========================================
echo.

echo Clearing Docker build cache for backend...
docker-compose build --no-cache backend >nul 2>&1
if errorlevel 0 (
    echo   Docker build cache cleared
)
echo.

REM Step 4: Start backend service
echo ==========================================
echo Step 4: Starting backend service
echo ==========================================
echo.

docker-compose up -d --build backend
if errorlevel 0 (
    echo.
    echo Backend service started
    echo.
    timeout /t 5 /nobreak >nul
    echo Backend is running on: http://localhost:8000
    echo API Documentation: http://localhost:8000/docs
    echo.
    echo To view logs, run: docker logs -f fastapi-backend
    echo To stop, run: docker-compose stop backend
) else (
    echo.
    echo Failed to start backend service
    echo Check logs: docker logs fastapi-backend
    pause
    exit /b 1
)

echo.
echo ==========================================
echo Backend Restart Complete
echo ==========================================
echo.
pause





