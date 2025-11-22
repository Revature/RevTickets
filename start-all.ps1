# Start All Services Script for Windows
# Starts MongoDB, Backend, and Frontend services using Docker Compose

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "Starting RevTickets Application" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
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
    Write-Host "✗ docker-compose.yml not found!" -ForegroundColor Red
    exit 1
}

# Clear caches before starting
Write-Host "Clearing caches..." -ForegroundColor Yellow

# Clear backend caches
$backendPath = Join-Path $PSScriptRoot "backend"
if (Test-Path $backendPath) {
    $pycacheDirs = Get-ChildItem -Path $backendPath -Recurse -Directory -Filter "__pycache__" -ErrorAction SilentlyContinue
    if ($pycacheDirs) { $pycacheDirs | Remove-Item -Recurse -Force -ErrorAction SilentlyContinue }
    $pycFiles = Get-ChildItem -Path $backendPath -Recurse -Filter "*.pyc" -ErrorAction SilentlyContinue
    if ($pycFiles) { $pycFiles | Remove-Item -Force -ErrorAction SilentlyContinue }
    Write-Host "  ✓ Cleared backend Python caches" -ForegroundColor Green
}

# Clear frontend caches
$frontendPath = Join-Path $PSScriptRoot "frontend"
if (Test-Path $frontendPath) {
    $nextCache = Join-Path $frontendPath ".next"
    if (Test-Path $nextCache) { Remove-Item -Path $nextCache -Recurse -Force -ErrorAction SilentlyContinue }
    $nodeCache = Join-Path $frontendPath "node_modules\.cache"
    if (Test-Path $nodeCache) { Remove-Item -Path $nodeCache -Recurse -Force -ErrorAction SilentlyContinue }
    Write-Host "  ✓ Cleared frontend Next.js caches" -ForegroundColor Green
}

Write-Host ""

Write-Host "Starting all services (MongoDB, Backend, Frontend)..." -ForegroundColor Yellow
Write-Host ""

# Start all services
try {
    docker-compose up -d
    
    Write-Host ""
    Write-Host "✓ All services started" -ForegroundColor Green
    Write-Host ""
    
    # Wait for services to initialize
    Write-Host "Waiting for services to initialize..." -ForegroundColor Yellow
    Start-Sleep -Seconds 5
    
    Write-Host ""
    Write-Host "==========================================" -ForegroundColor Green
    Write-Host "Application Status" -ForegroundColor Green
    Write-Host "==========================================" -ForegroundColor Green
    Write-Host ""
    
    # Check MongoDB
    $mongoStatus = docker ps --filter "name=mongodb" --format "{{.Status}}"
    if ($mongoStatus) {
        Write-Host "✓ MongoDB:     Running - $mongoStatus" -ForegroundColor Green
        Write-Host "  Port: 27017" -ForegroundColor Gray
    } else {
        Write-Host "✗ MongoDB:     Not running" -ForegroundColor Red
    }
    
    # Check Backend
    $backendStatus = docker ps --filter "name=fastapi-backend" --format "{{.Status}}"
    if ($backendStatus) {
        Write-Host "✓ Backend:     Running - $backendStatus" -ForegroundColor Green
        Write-Host "  URL: http://localhost:8000" -ForegroundColor Gray
        Write-Host "  Docs: http://localhost:8000/docs" -ForegroundColor Gray
    } else {
        Write-Host "✗ Backend:     Not running" -ForegroundColor Red
    }
    
    # Check Frontend
    $frontendStatus = docker ps --filter "name=nextjs-frontend" --format "{{.Status}}"
    if ($frontendStatus) {
        Write-Host "✓ Frontend:    Running - $frontendStatus" -ForegroundColor Green
        Write-Host "  URL: http://localhost:3000" -ForegroundColor Gray
    } else {
        Write-Host "✗ Frontend:    Not running" -ForegroundColor Red
    }
    
    Write-Host ""
    Write-Host "==========================================" -ForegroundColor Cyan
    Write-Host "Useful Commands" -ForegroundColor Cyan
    Write-Host "==========================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "View logs:" -ForegroundColor Yellow
    Write-Host "  docker-compose logs -f" -ForegroundColor Gray
    Write-Host "  docker logs -f fastapi-backend" -ForegroundColor Gray
    Write-Host "  docker logs -f nextjs-frontend" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Stop services:" -ForegroundColor Yellow
    Write-Host "  docker-compose stop" -ForegroundColor Gray
    Write-Host "  docker-compose down" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Restart services:" -ForegroundColor Yellow
    Write-Host "  docker-compose restart" -ForegroundColor Gray
    Write-Host ""
    
} catch {
    Write-Host ""
    Write-Host "✗ Failed to start services" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    Write-Host "Troubleshooting:" -ForegroundColor Yellow
    Write-Host "  1. Ensure Docker Desktop is running" -ForegroundColor Yellow
    Write-Host "  2. Check if ports 3000, 8000, 27017 are available" -ForegroundColor Yellow
    Write-Host "  3. Check logs: docker-compose logs" -ForegroundColor Yellow
    exit 1
}

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "Start Complete" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan

