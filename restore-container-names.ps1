# Restore container names to match docker-compose.yml
Write-Host "=== Restoring Container Names ===" -ForegroundColor Cyan

# Step 1: Stop all containers using docker-compose
Write-Host "`n1. Stopping all containers..." -ForegroundColor Yellow
docker-compose down 2>&1 | Out-Null

# Step 2: Remove any incorrectly named containers
Write-Host "`n2. Removing incorrectly named containers..." -ForegroundColor Yellow
$allContainers = docker ps -a --format "{{.Names}}"
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
} else {
    Write-Host "   No incorrectly named containers found" -ForegroundColor Green
}

# Step 3: Remove all containers to ensure clean slate
Write-Host "`n3. Ensuring clean state..." -ForegroundColor Yellow
docker-compose down -v 2>&1 | Out-Null

# Step 4: Start containers with correct names from docker-compose.yml
Write-Host "`n4. Starting containers with correct names from docker-compose.yml..." -ForegroundColor Yellow
docker-compose up -d --build --force-recreate

# Step 5: Wait for services
Write-Host "`n5. Waiting for services to start (40 seconds)..." -ForegroundColor Yellow
Start-Sleep -Seconds 40

# Step 6: Verify container names match docker-compose.yml
Write-Host "`n6. Verifying container names..." -ForegroundColor Yellow
$runningContainers = docker ps --format "{{.Names}}"
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

# Step 7: Show any unexpected containers
Write-Host "`n7. Checking for unexpected containers..." -ForegroundColor Yellow
$unexpected = docker ps --format "{{.Names}}" | Where-Object { 
    $_ -notin $expectedNames -and 
    $_ -notlike "*revtickets*"
}
if ($unexpected) {
    Write-Host "   Unexpected containers found:" -ForegroundColor Yellow
    foreach ($container in $unexpected) {
        Write-Host "   - $container" -ForegroundColor Yellow
    }
}

if ($allCorrect) {
    Write-Host "`n=== SUCCESS ===" -ForegroundColor Green
    Write-Host "All container names match docker-compose.yml!" -ForegroundColor Green
} else {
    Write-Host "`n=== WARNING ===" -ForegroundColor Yellow
    Write-Host "Some containers are missing. Check docker-compose logs." -ForegroundColor Yellow
}

Write-Host "`nContainer Status:" -ForegroundColor Cyan
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

