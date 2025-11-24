# Frontend Start Script for Windows
# Starts the Next.js frontend service using Docker Compose

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "Starting RevTickets Frontend" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Get the project root directory (parent of frontend folder)
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$projectRoot = Split-Path -Parent $scriptPath

# Change to project root directory
Set-Location $projectRoot

Write-Host "Project Root: $projectRoot" -ForegroundColor Gray
Write-Host ""

# Clear frontend caches
Write-Host "Clearing frontend caches..." -ForegroundColor Yellow

# Clear Next.js .next cache
$frontendPath = Join-Path $projectRoot "frontend"
$nextCache = Join-Path $frontendPath ".next"
if (Test-Path $nextCache) {
    Remove-Item -Path $nextCache -Recurse -Force -ErrorAction SilentlyContinue
    Write-Host "  ✓ Cleared Next.js .next cache" -ForegroundColor Green
}

# Clear node_modules/.cache
$nodeCache = Join-Path $frontendPath "node_modules\.cache"
if (Test-Path $nodeCache) {
    Remove-Item -Path $nodeCache -Recurse -Force -ErrorAction SilentlyContinue
    Write-Host "  ✓ Cleared node_modules cache" -ForegroundColor Green
}

# Clear .turbo cache (if using Turbopack)
$turboCache = Join-Path $frontendPath ".turbo"
if (Test-Path $turboCache) {
    Remove-Item -Path $turboCache -Recurse -Force -ErrorAction SilentlyContinue
    Write-Host "  ✓ Cleared .turbo cache" -ForegroundColor Green
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

Write-Host "Clearing Docker build cache for frontend..." -ForegroundColor Yellow
try {
    docker-compose build --no-cache frontend 2>&1 | Out-Null
    Write-Host "  ✓ Docker build cache cleared" -ForegroundColor Green
} catch {
    Write-Host "  ⚠ Could not clear Docker cache (will continue anyway)" -ForegroundColor Yellow
}
Write-Host ""

Write-Host "Starting frontend service..." -ForegroundColor Yellow
Write-Host ""

# Start frontend service
try {
    docker-compose up -d --build frontend
    
    Write-Host ""
    Write-Host "✓ Frontend service started" -ForegroundColor Green
    Write-Host ""
    
    # Wait a moment for container to start
    Start-Sleep -Seconds 3
    
    # Check container status
    $containerStatus = docker ps --filter "name=nextjs-frontend" --format "{{.Status}}"
    
    if ($containerStatus) {
        Write-Host "Container Status: $containerStatus" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "Frontend is running on: http://localhost:3000" -ForegroundColor Green
        Write-Host ""
        Write-Host "To view logs, run: docker logs -f nextjs-frontend" -ForegroundColor Gray
        Write-Host "To stop, run: docker-compose stop frontend" -ForegroundColor Gray
    } else {
        Write-Host "⚠ Container may not be running. Check logs:" -ForegroundColor Yellow
        Write-Host "  docker logs nextjs-frontend" -ForegroundColor Gray
    }
    
} catch {
    Write-Host ""
    Write-Host "✗ Failed to start frontend service" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    Write-Host "Troubleshooting:" -ForegroundColor Yellow
    Write-Host "  1. Ensure Docker Desktop is running" -ForegroundColor Yellow
    Write-Host "  2. Check if port 3000 is available" -ForegroundColor Yellow
    Write-Host "  3. Ensure backend is running first" -ForegroundColor Yellow
    Write-Host "  4. Check frontend logs: docker logs nextjs-frontend" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "Frontend Start Complete" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan

