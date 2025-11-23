# Restart Frontend Script for Windows
# Clears all frontend caches and restarts the Next.js frontend service

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "Restarting RevTickets Frontend" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Get the project root directory (parent of frontend folder)
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

# Step 1: Stop frontend service
Write-Host "==========================================" -ForegroundColor Yellow
Write-Host "Step 1: Stopping frontend service" -ForegroundColor Yellow
Write-Host "==========================================" -ForegroundColor Yellow
Write-Host ""

try {
    docker-compose stop frontend
    Write-Host "✓ Frontend service stopped" -ForegroundColor Green
} catch {
    Write-Host "⚠ Could not stop frontend service (may not be running)" -ForegroundColor Yellow
}

Write-Host ""

# Step 2: Clear frontend caches
Write-Host "==========================================" -ForegroundColor Yellow
Write-Host "Step 2: Clearing frontend caches" -ForegroundColor Yellow
Write-Host "==========================================" -ForegroundColor Yellow
Write-Host ""

$frontendPath = Join-Path $projectRoot "frontend"

# Clear Next.js .next cache
Write-Host "Clearing Next.js cache..." -ForegroundColor Cyan
$nextCache = Join-Path $frontendPath ".next"
if (Test-Path $nextCache) {
    Remove-Item -Path $nextCache -Recurse -Force -ErrorAction SilentlyContinue
    Write-Host "  ✓ Cleared Next.js .next cache" -ForegroundColor Green
} else {
    Write-Host "  ℹ No .next cache found" -ForegroundColor Gray
}

# Clear node_modules/.cache
Write-Host "Clearing node_modules cache..." -ForegroundColor Cyan
$nodeCache = Join-Path $frontendPath "node_modules\.cache"
if (Test-Path $nodeCache) {
    Remove-Item -Path $nodeCache -Recurse -Force -ErrorAction SilentlyContinue
    Write-Host "  ✓ Cleared node_modules cache" -ForegroundColor Green
} else {
    Write-Host "  ℹ No node_modules cache found" -ForegroundColor Gray
}

# Clear .turbo cache
Write-Host "Clearing Turbopack cache..." -ForegroundColor Cyan
$turboCache = Join-Path $frontendPath ".turbo"
if (Test-Path $turboCache) {
    Remove-Item -Path $turboCache -Recurse -Force -ErrorAction SilentlyContinue
    Write-Host "  ✓ Cleared .turbo cache" -ForegroundColor Green
} else {
    Write-Host "  ℹ No .turbo cache found" -ForegroundColor Gray
}

Write-Host ""

# Step 3: Clear Docker build cache
Write-Host "==========================================" -ForegroundColor Yellow
Write-Host "Step 3: Clearing Docker build cache" -ForegroundColor Yellow
Write-Host "==========================================" -ForegroundColor Yellow
Write-Host ""

Write-Host "Clearing Docker build cache for frontend..." -ForegroundColor Cyan
try {
    docker-compose build --no-cache frontend 2>&1 | Out-Null
    Write-Host "  ✓ Docker build cache cleared" -ForegroundColor Green
} catch {
    Write-Host "  ⚠ Could not clear Docker cache (will continue anyway)" -ForegroundColor Yellow
}

Write-Host ""

# Step 4: Start frontend service
Write-Host "==========================================" -ForegroundColor Yellow
Write-Host "Step 4: Starting frontend service" -ForegroundColor Yellow
Write-Host "==========================================" -ForegroundColor Yellow
Write-Host ""

try {
    docker-compose up -d --build frontend
    
    Write-Host ""
    Write-Host "✓ Frontend service started" -ForegroundColor Green
    Write-Host ""
    
    # Wait a moment for container to start
    Start-Sleep -Seconds 5
    
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
    Write-Host "  3. Check frontend logs: docker logs nextjs-frontend" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "Frontend Restart Complete" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""





