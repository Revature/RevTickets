# Restart Application Script for Windows
# Clears all caches and restarts both frontend and backend services

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "Restarting RevTickets Application" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Get the project root directory
$projectRoot = $PSScriptRoot
if (-not $projectRoot) {
    $projectRoot = Get-Location
}

Set-Location $projectRoot

Write-Host "Project Root: $projectRoot" -ForegroundColor Gray
Write-Host ""

# Check if Docker is running
try {
    docker ps | Out-Null
    Write-Host "✓ Docker is running" -ForegroundColor Green
} catch {
    Write-Host "✗ Docker is not running. Please start Docker Desktop." -ForegroundColor Red
    exit 1
}

Write-Host ""

# Step 1: Stop all services
Write-Host "==========================================" -ForegroundColor Yellow
Write-Host "Step 1: Stopping all services" -ForegroundColor Yellow
Write-Host "==========================================" -ForegroundColor Yellow
Write-Host ""

try {
    docker-compose stop
    Write-Host "✓ All services stopped" -ForegroundColor Green
} catch {
    Write-Host "⚠ Could not stop services (may not be running)" -ForegroundColor Yellow
}

Write-Host ""

# Step 2: Restart Backend
Write-Host "==========================================" -ForegroundColor Yellow
Write-Host "Step 2: Restarting Backend" -ForegroundColor Yellow
Write-Host "==========================================" -ForegroundColor Yellow
Write-Host ""

$backendScript = Join-Path $projectRoot "backend\restart-backend.ps1"
if (Test-Path $backendScript) {
    try {
        & $backendScript
        Write-Host ""
        Write-Host "✓ Backend restart completed" -ForegroundColor Green
    } catch {
        Write-Host "✗ Failed to restart backend via script" -ForegroundColor Red
        Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host "Attempting direct restart..." -ForegroundColor Yellow
        
        # Fallback: direct restart
        docker-compose up -d --build backend
    }
} else {
    Write-Host "Backend restart script not found, restarting directly..." -ForegroundColor Yellow
    docker-compose up -d --build backend
}

Write-Host ""

# Wait for backend to be ready
Write-Host "Waiting for backend to initialize..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Step 3: Restart Frontend
Write-Host "==========================================" -ForegroundColor Yellow
Write-Host "Step 3: Restarting Frontend" -ForegroundColor Yellow
Write-Host "==========================================" -ForegroundColor Yellow
Write-Host ""

$frontendScript = Join-Path $projectRoot "frontend\restart-frontend.ps1"
if (Test-Path $frontendScript) {
    try {
        & $frontendScript
        Write-Host ""
        Write-Host "✓ Frontend restart completed" -ForegroundColor Green
    } catch {
        Write-Host "✗ Failed to restart frontend via script" -ForegroundColor Red
        Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host "Attempting direct restart..." -ForegroundColor Yellow
        
        # Fallback: direct restart
        docker-compose up -d --build frontend
    }
} else {
    Write-Host "Frontend restart script not found, restarting directly..." -ForegroundColor Yellow
    docker-compose up -d --build frontend
}

Write-Host ""

# Final status check
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "Final Status Check" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

Start-Sleep -Seconds 5

$mongoStatus = docker ps --filter "name=mongodb" --format "{{.Status}}"
$backendStatus = docker ps --filter "name=fastapi-backend" --format "{{.Status}}"
$frontendStatus = docker ps --filter "name=nextjs-frontend" --format "{{.Status}}"

Write-Host "Service Status:" -ForegroundColor Yellow
Write-Host ""

if ($mongoStatus) {
    Write-Host "✓ MongoDB:     $mongoStatus" -ForegroundColor Green
} else {
    Write-Host "✗ MongoDB:     Not running" -ForegroundColor Red
}

if ($backendStatus) {
    Write-Host "✓ Backend:     $backendStatus" -ForegroundColor Green
    Write-Host "  URL: http://localhost:8000" -ForegroundColor Gray
    Write-Host "  Docs: http://localhost:8000/docs" -ForegroundColor Gray
} else {
    Write-Host "✗ Backend:     Not running" -ForegroundColor Red
}

if ($frontendStatus) {
    Write-Host "✓ Frontend:    $frontendStatus" -ForegroundColor Green
    Write-Host "  URL: http://localhost:3000" -ForegroundColor Gray
} else {
    Write-Host "✗ Frontend:    Not running" -ForegroundColor Red
}

Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "Application Restart Complete" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "All caches cleared and services restarted!" -ForegroundColor Green
Write-Host ""
Write-Host "Useful Commands:" -ForegroundColor Yellow
Write-Host "  View backend logs:  docker logs -f fastapi-backend" -ForegroundColor Gray
Write-Host "  View frontend logs: docker logs -f nextjs-frontend" -ForegroundColor Gray
Write-Host "  Stop all services:  docker-compose stop" -ForegroundColor Gray
Write-Host ""
