@echo off
REM Backend Start Script for Windows (Batch File)
REM Starts the FastAPI backend service using Docker Compose

echo ==========================================
echo Starting RevTickets Backend
echo ==========================================
echo.

REM Get the project root directory (parent of backend folder)
cd /d "%~dp0\.."

echo Project Root: %CD%
echo.

REM Clear backend caches
echo Clearing backend caches...
cd backend

REM Clear Python cache directories
for /d /r %%d in (__pycache__) do @if exist "%%d" rd /s /q "%%d" 2>nul
if errorlevel 0 (
    echo   Cleared Python __pycache__ directories
)

REM Clear .pyc files
for /r %%f in (*.pyc) do @if exist "%%f" del /q "%%f" 2>nul
if errorlevel 0 (
    echo   Cleared .pyc files
)

REM Clear .pyo files
for /r %%f in (*.pyo) do @if exist "%%f" del /q "%%f" 2>nul
if errorlevel 0 (
    echo   Cleared .pyo files
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

echo Clearing Docker build cache for backend...
docker-compose build --no-cache backend >nul 2>&1
if errorlevel 0 (
    echo   Docker build cache cleared
)
echo.

echo Starting backend service...
echo.

REM Start backend service
docker-compose up -d --build backend

if errorlevel 1 (
    echo.
    echo Failed to start backend service
    echo.
    echo Troubleshooting:
    echo   1. Ensure Docker Desktop is running
    echo   2. Check if port 8000 is available
    echo   3. Check backend logs: docker logs fastapi-backend
    pause
    exit /b 1
)

echo.
echo Backend service started
echo.
timeout /t 3 /nobreak >nul

echo Backend is running on: http://localhost:8000
echo API Documentation: http://localhost:8000/docs
echo.
echo To view logs, run: docker logs -f fastapi-backend
echo To stop, run: docker-compose stop backend
echo.
echo ==========================================
echo Backend Start Complete
echo ==========================================
pause

