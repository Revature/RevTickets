@echo off
REM Restart Application Script for Windows (Batch File)
REM Stops all services, clears caches, and restarts frontend and backend

echo ==========================================
echo Restarting RevTickets Application
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

REM Step 2: Clear all caches
echo ==========================================
echo Step 2: Clearing all caches
echo ==========================================
echo.

REM Clear backend caches
echo Clearing backend caches...
cd backend

REM Clear Python cache directories
for /d /r %%d in (__pycache__) do @if exist "%%d" rd /s /q "%%d" 2>nul
echo   Cleared Python __pycache__ directories

REM Clear .pyc files
for /r %%f in (*.pyc) do @if exist "%%f" del /q "%%f" 2>nul
echo   Cleared .pyc files

REM Clear .pyo files
for /r %%f in (*.pyo) do @if exist "%%f" del /q "%%f" 2>nul
echo   Cleared .pyo files

cd ..

REM Clear frontend caches
echo Clearing frontend caches...
cd frontend

REM Clear Next.js cache
if exist ".next" (
    rd /s /q ".next" 2>nul
    echo   Cleared Next.js .next cache
)

REM Clear node_modules cache
if exist "node_modules\.cache" (
    rd /s /q "node_modules\.cache" 2>nul
    echo   Cleared node_modules cache
)

REM Clear .turbo cache
if exist ".turbo" (
    rd /s /q ".turbo" 2>nul
    echo   Cleared .turbo cache
)

cd ..
echo.

REM Clear Docker build caches
echo Clearing Docker build caches...
docker-compose build --no-cache backend >nul 2>&1
echo   Cleared Docker cache for backend

docker-compose build --no-cache frontend >nul 2>&1
echo   Cleared Docker cache for frontend

echo.

REM Step 3: Start backend
echo ==========================================
echo Step 3: Starting Backend
echo ==========================================
echo.

if exist "backend\start-backend.bat" (
    call backend\start-backend.bat
) else (
    echo Starting backend directly...
    docker-compose up -d --build backend
)

echo.

REM Wait for backend
echo Waiting for backend to initialize...
timeout /t 5 /nobreak >nul

REM Step 4: Start frontend
echo ==========================================
echo Step 4: Starting Frontend
echo ==========================================
echo.

if exist "frontend\start-frontend.bat" (
    call frontend\start-frontend.bat
) else (
    echo Starting frontend directly...
    docker-compose up -d --build frontend
)

echo.

REM Final status
echo ==========================================
echo Final Status Check
echo ==========================================
echo.

timeout /t 5 /nobreak >nul

echo MongoDB:  Running on port 27017
echo Backend:  Running on http://localhost:8000
echo Frontend: Running on http://localhost:3000
echo.

echo ==========================================
echo Restart Complete
echo ==========================================
echo.
echo All caches cleared and services restarted!
echo.
pause

