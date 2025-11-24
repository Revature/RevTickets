# Fix container names to match docker-compose.yml exactly
Write-Host "=== Fixing Container Names ===" -ForegroundColor Cyan

# Step 1: Stop all containers
Write-Host "`n1. Stopping all containers..." -ForegroundColor Yellow
docker-compose down 2>&1 | Out-Null

# Step 2: Remove all containers with revtickets prefix
Write-Host "`n2. Removing incorrectly named containers..." -ForegroundColor Yellow
$allContainers = docker ps -a --format "{{.Names}}" 2>&1
$incorrectContainers = $allContainers | Where-Object { 
    $_ -like "revtickets-*"
}

if ($incorrectContainers) {
    foreach ($container in $incorrectContainers) {
        Write-Host "   Removing: $container" -ForegroundColor Yellow
        docker rm -f $container 2>&1 | Out-Null
    }
    Write-Host "   ✓ Removed incorrectly named containers" -ForegroundColor Green
} else {
    Write-Host "   ✓ No incorrectly named containers found" -ForegroundColor Green
}

# Step 3: Remove volumes to ensure clean state (optional, commented out to preserve data)
# docker-compose down -v

# Step 4: Set COMPOSE_PROJECT_NAME to empty and start containers
Write-Host "`n3. Starting containers with correct names..." -ForegroundColor Yellow
$env:COMPOSE_PROJECT_NAME = ""
docker-compose up -d --build --force-recreate 2>&1 | Out-Null

# Step 5: Wait for services to start
Write-Host "`n4. Waiting for services to start (40 seconds)..." -ForegroundColor Yellow
Start-Sleep -Seconds 40

# Step 6: Verify container names match docker-compose.yml
Write-Host "`n5. Verifying container names..." -ForegroundColor Yellow
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
$foundContainers = @()

foreach ($name in $expectedNames) {
    $found = $runningContainers | Where-Object { $_ -eq $name }
    if ($found) {
        Write-Host "   ✓ $name" -ForegroundColor Green
        $foundContainers += $name
    } else {
        Write-Host "   ✗ $name MISSING" -ForegroundColor Red
        $allCorrect = $false
    }
}

# Check for any unexpected containers
Write-Host "`n6. Checking for unexpected containers..." -ForegroundColor Yellow
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

# Final status
Write-Host "`n=== Container Status ===" -ForegroundColor Cyan
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

if ($allCorrect -and $foundContainers.Count -eq $expectedNames.Count) {
    Write-Host "`n=== SUCCESS ===" -ForegroundColor Green
    Write-Host "All containers have correct names matching docker-compose.yml!" -ForegroundColor Green
} else {
    Write-Host "`n=== WARNING ===" -ForegroundColor Yellow
    Write-Host "Some containers may be missing or incorrectly named." -ForegroundColor Yellow
    Write-Host "Expected: $($expectedNames.Count) containers" -ForegroundColor Yellow
    Write-Host "Found: $($foundContainers.Count) containers" -ForegroundColor Yellow
}

