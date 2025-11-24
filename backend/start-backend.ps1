# Backend Start Script for Windows
# Starts the FastAPI backend service using Docker Compose

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "Starting RevTickets Backend" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Get the project root directory (parent of backend folder)
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$projectRoot = Split-Path -Parent $scriptPath

# Change to project root directory
Set-Location $projectRoot

Write-Host "Project Root: $projectRoot" -ForegroundColor Gray
Write-Host ""

# Clear backend caches
Write-Host "Clearing backend caches..." -ForegroundColor Yellow

# Clear Python cache files
$backendPath = Join-Path $projectRoot "backend"
$pycacheDirs = Get-ChildItem -Path $backendPath -Recurse -Directory -Filter "__pycache__" -ErrorAction SilentlyContinue
if ($pycacheDirs) {
    $pycacheDirs | Remove-Item -Recurse -Force -ErrorAction SilentlyContinue
    Write-Host "  ✓ Cleared Python __pycache__ directories" -ForegroundColor Green
}

# Clear .pyc files
$pycFiles = Get-ChildItem -Path $backendPath -Recurse -Filter "*.pyc" -ErrorAction SilentlyContinue
if ($pycFiles) {
    $pycFiles | Remove-Item -Force -ErrorAction SilentlyContinue
    Write-Host "  ✓ Cleared .pyc files" -ForegroundColor Green
}

# Clear .pyo files
$pyoFiles = Get-ChildItem -Path $backendPath -Recurse -Filter "*.pyo" -ErrorAction SilentlyContinue
if ($pyoFiles) {
    $pyoFiles | Remove-Item -Force -ErrorAction SilentlyContinue
    Write-Host "  ✓ Cleared .pyo files" -ForegroundColor Green
}

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

# Check if docker-compose.yml exists
if (-not (Test-Path "docker-compose.yml")) {
    Write-Host "✗ docker-compose.yml not found in project root!" -ForegroundColor Red
    exit 1
}

Write-Host "Clearing Docker build cache for backend..." -ForegroundColor Yellow
try {
    docker-compose build --no-cache backend 2>&1 | Out-Null
    Write-Host "  ✓ Docker build cache cleared" -ForegroundColor Green
} catch {
    Write-Host "  ⚠ Could not clear Docker cache (will continue anyway)" -ForegroundColor Yellow
}
Write-Host ""

Write-Host "Starting backend service..." -ForegroundColor Yellow
Write-Host ""

# Start backend service
try {
    docker-compose up -d --build backend
    
    Write-Host ""
    Write-Host "✓ Backend service started" -ForegroundColor Green
    Write-Host ""
    
    # Wait a moment for container to start
    Start-Sleep -Seconds 3
    
    # Check container status
    $containerStatus = docker ps --filter "name=fastapi-backend" --format "{{.Status}}"
    
    if ($containerStatus) {
        Write-Host "Container Status: $containerStatus" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "Backend is running on: http://localhost:8000" -ForegroundColor Green
        Write-Host "API Documentation: http://localhost:8000/docs" -ForegroundColor Green
        Write-Host ""
        Write-Host "To view logs, run: docker logs -f fastapi-backend" -ForegroundColor Gray
        Write-Host "To stop, run: docker-compose stop backend" -ForegroundColor Gray
    } else {
        Write-Host "⚠ Container may not be running. Check logs:" -ForegroundColor Yellow
        Write-Host "  docker logs fastapi-backend" -ForegroundColor Gray
    }
    
} catch {
    Write-Host ""
    Write-Host "✗ Failed to start backend service" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    Write-Host "Troubleshooting:" -ForegroundColor Yellow
    Write-Host "  1. Ensure Docker Desktop is running" -ForegroundColor Yellow
    Write-Host "  2. Check if port 8000 is available" -ForegroundColor Yellow
    Write-Host "  3. Check backend logs: docker logs fastapi-backend" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "Backend Start Complete" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan

