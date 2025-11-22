# Restart Application Script for Windows
# Stops all services, clears caches, and restarts frontend and backend

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

# Step 2: Clear all caches
Write-Host "==========================================" -ForegroundColor Yellow
Write-Host "Step 2: Clearing all caches" -ForegroundColor Yellow
Write-Host "==========================================" -ForegroundColor Yellow
Write-Host ""

# Clear backend caches
Write-Host "Clearing backend caches..." -ForegroundColor Cyan
$backendPath = Join-Path $projectRoot "backend"
if (Test-Path $backendPath) {
    # Clear Python cache
    $pycacheDirs = Get-ChildItem -Path $backendPath -Recurse -Directory -Filter "__pycache__" -ErrorAction SilentlyContinue
    if ($pycacheDirs) {
        $pycacheDirs | Remove-Item -Recurse -Force -ErrorAction SilentlyContinue
        Write-Host "  ✓ Cleared Python __pycache__ directories" -ForegroundColor Green
    }
    
    $pycFiles = Get-ChildItem -Path $backendPath -Recurse -Filter "*.pyc" -ErrorAction SilentlyContinue
    if ($pycFiles) {
        $pycFiles | Remove-Item -Force -ErrorAction SilentlyContinue
        Write-Host "  ✓ Cleared .pyc files" -ForegroundColor Green
    }
    
    $pyoFiles = Get-ChildItem -Path $backendPath -Recurse -Filter "*.pyo" -ErrorAction SilentlyContinue
    if ($pyoFiles) {
        $pyoFiles | Remove-Item -Force -ErrorAction SilentlyContinue
        Write-Host "  ✓ Cleared .pyo files" -ForegroundColor Green
    }
}

# Clear frontend caches
Write-Host "Clearing frontend caches..." -ForegroundColor Cyan
$frontendPath = Join-Path $projectRoot "frontend"
if (Test-Path $frontendPath) {
    # Clear Next.js cache
    $nextCache = Join-Path $frontendPath ".next"
    if (Test-Path $nextCache) {
        Remove-Item -Path $nextCache -Recurse -Force -ErrorAction SilentlyContinue
        Write-Host "  ✓ Cleared Next.js .next cache" -ForegroundColor Green
    }
    
    # Clear node_modules cache
    $nodeCache = Join-Path $frontendPath "node_modules\.cache"
    if (Test-Path $nodeCache) {
        Remove-Item -Path $nodeCache -Recurse -Force -ErrorAction SilentlyContinue
        Write-Host "  ✓ Cleared node_modules cache" -ForegroundColor Green
    }
    
    # Clear .turbo cache
    $turboCache = Join-Path $frontendPath ".turbo"
    if (Test-Path $turboCache) {
        Remove-Item -Path $turboCache -Recurse -Force -ErrorAction SilentlyContinue
        Write-Host "  ✓ Cleared .turbo cache" -ForegroundColor Green
    }
}

Write-Host ""

# Step 3: Clear Docker caches (optional but thorough)
Write-Host "Clearing Docker build caches..." -ForegroundColor Cyan
try {
    docker-compose build --no-cache backend 2>&1 | Out-Null
    Write-Host "  ✓ Cleared Docker cache for backend" -ForegroundColor Green
} catch {
    Write-Host "  ⚠ Could not clear Docker cache for backend" -ForegroundColor Yellow
}

try {
    docker-compose build --no-cache frontend 2>&1 | Out-Null
    Write-Host "  ✓ Cleared Docker cache for frontend" -ForegroundColor Green
} catch {
    Write-Host "  ⚠ Could not clear Docker cache for frontend" -ForegroundColor Yellow
}

Write-Host ""

# Step 4: Start backend
Write-Host "==========================================" -ForegroundColor Yellow
Write-Host "Step 3: Starting Backend" -ForegroundColor Yellow
Write-Host "==========================================" -ForegroundColor Yellow
Write-Host ""

$backendScript = Join-Path $projectRoot "backend\start-backend.ps1"
if (Test-Path $backendScript) {
    try {
        & $backendScript
        Write-Host ""
        Write-Host "✓ Backend restart initiated" -ForegroundColor Green
    } catch {
        Write-Host "✗ Failed to start backend via script" -ForegroundColor Red
        Write-Host "Starting backend directly..." -ForegroundColor Yellow
        docker-compose up -d --build backend
    }
} else {
    Write-Host "Backend script not found, starting directly..." -ForegroundColor Yellow
    docker-compose up -d --build backend
}

Write-Host ""

# Wait for backend to be ready
Write-Host "Waiting for backend to initialize..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Step 5: Start frontend
Write-Host "==========================================" -ForegroundColor Yellow
Write-Host "Step 4: Starting Frontend" -ForegroundColor Yellow
Write-Host "==========================================" -ForegroundColor Yellow
Write-Host ""

$frontendScript = Join-Path $projectRoot "frontend\start-frontend.ps1"
if (Test-Path $frontendScript) {
    try {
        & $frontendScript
        Write-Host ""
        Write-Host "✓ Frontend restart initiated" -ForegroundColor Green
    } catch {
        Write-Host "✗ Failed to start frontend via script" -ForegroundColor Red
        Write-Host "Starting frontend directly..." -ForegroundColor Yellow
        docker-compose up -d --build frontend
    }
} else {
    Write-Host "Frontend script not found, starting directly..." -ForegroundColor Yellow
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

if ($mongoStatus) {
    Write-Host "✓ MongoDB:     $mongoStatus" -ForegroundColor Green
} else {
    Write-Host "✗ MongoDB:     Not running" -ForegroundColor Red
}

if ($backendStatus) {
    Write-Host "✓ Backend:     $backendStatus" -ForegroundColor Green
    Write-Host "  URL: http://localhost:8000" -ForegroundColor Gray
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
Write-Host "Restart Complete" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "All caches cleared and services restarted!" -ForegroundColor Green
Write-Host ""

