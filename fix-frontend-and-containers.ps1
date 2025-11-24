# Fix frontend build and restore container names
Write-Host "=== Fixing Frontend Build and Restoring Containers ===" -ForegroundColor Cyan

# Step 1: Stop all containers
Write-Host "`n1. Stopping all containers..." -ForegroundColor Yellow
docker-compose down 2>&1 | Out-Null

# Step 2: Remove incorrectly named containers
Write-Host "`n2. Removing incorrectly named containers..." -ForegroundColor Yellow
$allContainers = docker ps -a --format "{{.Names}}" 2>&1
$incorrectContainers = $allContainers | Where-Object { 
    $_ -like "*revtickets*" -or 
    ($_ -like "*backend*" -and $_ -ne "fastapi-backend") -or
    ($_ -like "*frontend*" -and $_ -ne "nextjs-frontend")
}

if ($incorrectContainers) {
    foreach ($container in $incorrectContainers) {
        Write-Host "   Removing: $container" -ForegroundColor Yellow
        docker rm -f $container 2>&1 | Out-Null
    }
}

# Step 3: Clean build cache for frontend
Write-Host "`n3. Cleaning frontend build cache..." -ForegroundColor Yellow
if (Test-Path "frontend\.next") {
    Remove-Item -Recurse -Force "frontend\.next" 2>&1 | Out-Null
    Write-Host "   ✓ Removed .next directory" -ForegroundColor Green
}

# Step 4: Rebuild and start containers with correct names
Write-Host "`n4. Rebuilding and starting containers..." -ForegroundColor Yellow
docker-compose build --no-cache frontend 2>&1 | Out-Null
if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✓ Frontend build successful" -ForegroundColor Green
} else {
    Write-Host "   ✗ Frontend build failed. Check logs above." -ForegroundColor Red
    exit 1
}

docker-compose up -d --build --force-recreate 2>&1 | Out-Null

# Step 5: Wait for services
Write-Host "`n5. Waiting for services to start (40 seconds)..." -ForegroundColor Yellow
Start-Sleep -Seconds 40

# Step 6: Verify container names
Write-Host "`n6. Verifying container names..." -ForegroundColor Yellow
$runningContainers = docker ps --format "{{.Names}}" 2>&1
$expectedNames = @(
    "fastapi-backend",
    "nextjs-frontend", 
    "mongodb",
    "redis-broker",
    "chroma-vectordb",
    "celery-worker-task",
    "celery-beat-task"
)

$allCorrect = $true
foreach ($name in $expectedNames) {
    if ($runningContainers -match [regex]::Escape($name)) {
        Write-Host "   ✓ $name" -ForegroundColor Green
    } else {
        Write-Host "   ✗ $name MISSING" -ForegroundColor Red
        $allCorrect = $false
    }
}

if ($allCorrect) {
    Write-Host "`n=== SUCCESS ===" -ForegroundColor Green
    Write-Host "All containers restored with correct names!" -ForegroundColor Green
} else {
    Write-Host "`n=== WARNING ===" -ForegroundColor Yellow
    Write-Host "Some containers are missing." -ForegroundColor Yellow
}

Write-Host "`nContainer Status:" -ForegroundColor Cyan
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

