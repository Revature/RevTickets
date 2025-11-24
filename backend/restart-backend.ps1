# Restart Backend Script for Windows
# Clears all backend caches and restarts the FastAPI backend service

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "Restarting RevTickets Backend" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Get the project root directory (parent of backend folder)
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$projectRoot = Split-Path -Parent $scriptPath

# Change to project root directory
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

# Step 1: Stop backend service
Write-Host "==========================================" -ForegroundColor Yellow
Write-Host "Step 1: Stopping backend service" -ForegroundColor Yellow
Write-Host "==========================================" -ForegroundColor Yellow
Write-Host ""

try {
    docker-compose stop backend
    Write-Host "✓ Backend service stopped" -ForegroundColor Green
} catch {
    Write-Host "⚠ Could not stop backend service (may not be running)" -ForegroundColor Yellow
}

Write-Host ""

# Step 2: Clear backend caches
Write-Host "==========================================" -ForegroundColor Yellow
Write-Host "Step 2: Clearing backend caches" -ForegroundColor Yellow
Write-Host "==========================================" -ForegroundColor Yellow
Write-Host ""

$backendPath = Join-Path $projectRoot "backend"

# Clear Python cache directories
Write-Host "Clearing Python cache..." -ForegroundColor Cyan
$pycacheDirs = Get-ChildItem -Path $backendPath -Recurse -Directory -Filter "__pycache__" -ErrorAction SilentlyContinue
if ($pycacheDirs) {
    $pycacheDirs | Remove-Item -Recurse -Force -ErrorAction SilentlyContinue
    Write-Host "  ✓ Cleared Python __pycache__ directories ($($pycacheDirs.Count) found)" -ForegroundColor Green
} else {
    Write-Host "  ℹ No __pycache__ directories found" -ForegroundColor Gray
}

# Clear .pyc files
Write-Host "Clearing .pyc files..." -ForegroundColor Cyan
$pycFiles = Get-ChildItem -Path $backendPath -Recurse -Filter "*.pyc" -ErrorAction SilentlyContinue
if ($pycFiles) {
    $pycFiles | Remove-Item -Force -ErrorAction SilentlyContinue
    Write-Host "  ✓ Cleared .pyc files ($($pycFiles.Count) found)" -ForegroundColor Green
} else {
    Write-Host "  ℹ No .pyc files found" -ForegroundColor Gray
}

# Clear .pyo files
Write-Host "Clearing .pyo files..." -ForegroundColor Cyan
$pyoFiles = Get-ChildItem -Path $backendPath -Recurse -Filter "*.pyo" -ErrorAction SilentlyContinue
if ($pyoFiles) {
    $pyoFiles | Remove-Item -Force -ErrorAction SilentlyContinue
    Write-Host "  ✓ Cleared .pyo files ($($pyoFiles.Count) found)" -ForegroundColor Green
} else {
    Write-Host "  ℹ No .pyo files found" -ForegroundColor Gray
}

# Clear .pyc files in __pycache__ (if any remain)
Write-Host "Clearing remaining cache files..." -ForegroundColor Cyan
$remainingCache = Get-ChildItem -Path $backendPath -Recurse -Filter "__pycache__" -ErrorAction SilentlyContinue
if ($remainingCache) {
    $remainingCache | Remove-Item -Recurse -Force -ErrorAction SilentlyContinue
    Write-Host "  ✓ Cleared remaining cache files" -ForegroundColor Green
}

Write-Host ""

# Step 3: Clear Docker build cache
Write-Host "==========================================" -ForegroundColor Yellow
Write-Host "Step 3: Clearing Docker build cache" -ForegroundColor Yellow
Write-Host "==========================================" -ForegroundColor Yellow
Write-Host ""

Write-Host "Clearing Docker build cache for backend..." -ForegroundColor Cyan
try {
    docker-compose build --no-cache backend 2>&1 | Out-Null
    Write-Host "  ✓ Docker build cache cleared" -ForegroundColor Green
} catch {
    Write-Host "  ⚠ Could not clear Docker cache (will continue anyway)" -ForegroundColor Yellow
}

Write-Host ""

# Step 4: Start backend service
Write-Host "==========================================" -ForegroundColor Yellow
Write-Host "Step 4: Starting backend service" -ForegroundColor Yellow
Write-Host "==========================================" -ForegroundColor Yellow
Write-Host ""

try {
    docker-compose up -d --build backend
    
    Write-Host ""
    Write-Host "✓ Backend service started" -ForegroundColor Green
    Write-Host ""
    
    # Wait a moment for container to start
    Start-Sleep -Seconds 5
    
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
Write-Host "Backend Restart Complete" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""





