# Complete restore of container names and test all fixes
Write-Host "=== Restoring Container Names and Testing All Fixes ===" -ForegroundColor Cyan

# Step 1: Stop all containers
Write-Host "`n1. Stopping all containers..." -ForegroundColor Yellow
docker-compose down 2>&1 | Out-Null

# Step 2: Remove incorrectly named containers
Write-Host "`n2. Removing incorrectly named containers..." -ForegroundColor Yellow
$wrongContainers = docker ps -a --format "{{.Names}}" | Where-Object { $_ -like "revtickets-*" }
if ($wrongContainers) {
    foreach ($container in $wrongContainers) {
        Write-Host "   Removing: $container" -ForegroundColor Yellow
        docker rm -f $container 2>&1 | Out-Null
    }
} else {
    Write-Host "   No incorrectly named containers found" -ForegroundColor Green
}

# Step 3: Start containers with correct names from docker-compose.yml
Write-Host "`n3. Starting containers with correct names..." -ForegroundColor Yellow
docker-compose up -d --build --force-recreate

# Step 4: Wait for services to start
Write-Host "`n4. Waiting for services to start (40 seconds)..." -ForegroundColor Yellow
Start-Sleep -Seconds 40

# Step 5: Verify container names
Write-Host "`n5. Verifying container names..." -ForegroundColor Yellow
$runningContainers = docker ps --format "{{.Names}}"
$expectedNames = @("fastapi-backend", "nextjs-frontend", "mongodb", "redis-broker", "chroma-vectordb", "celery-worker-task", "celery-beat-task")
$allCorrect = $true

foreach ($name in $expectedNames) {
    if ($runningContainers -match $name) {
        Write-Host "   ✓ $name" -ForegroundColor Green
    } else {
        Write-Host "   ✗ $name MISSING" -ForegroundColor Red
        $allCorrect = $false
    }
}

if (-not $allCorrect) {
    Write-Host "`n⚠ Some containers are missing. Checking status..." -ForegroundColor Yellow
    docker ps -a --format "table {{.Names}}\t{{.Status}}"
}

# Step 6: Apply CORS fix
Write-Host "`n6. Applying CORS fix to backend..." -ForegroundColor Yellow
docker cp backend/main.py fastapi-backend:/app/main.py 2>&1 | Out-Null
if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✓ CORS config copied" -ForegroundColor Green
    docker restart fastapi-backend 2>&1 | Out-Null
    Write-Host "   ✓ Backend restarted" -ForegroundColor Green
    Start-Sleep -Seconds 15
} else {
    Write-Host "   ✗ Failed to copy CORS config" -ForegroundColor Red
}

# Step 7: Check backend status
Write-Host "`n7. Checking backend status..." -ForegroundColor Yellow
$backendLogs = docker logs fastapi-backend --tail 5 2>&1
if ($backendLogs -match "Uvicorn running") {
    Write-Host "   ✓ Backend is running" -ForegroundColor Green
} else {
    Write-Host "   ⚠ Backend may still be starting. Logs:" -ForegroundColor Yellow
    Write-Host $backendLogs
}

# Step 8: Check frontend status
Write-Host "`n8. Checking frontend status..." -ForegroundColor Yellow
$frontendStatus = docker ps --filter "name=nextjs-frontend" --format "{{.Status}}"
if ($frontendStatus) {
    Write-Host "   ✓ Frontend: $frontendStatus" -ForegroundColor Green
} else {
    Write-Host "   ✗ Frontend not running" -ForegroundColor Red
}

Write-Host "`n=== Application Ready ===" -ForegroundColor Cyan
Write-Host "Frontend: http://localhost:3000" -ForegroundColor White
Write-Host "Backend: http://localhost:8000" -ForegroundColor White
Write-Host "`nPlease test all 3 fixes:" -ForegroundColor Yellow
Write-Host "1. Navigate to http://localhost:3000/knowledge-base/chat" -ForegroundColor White
Write-Host "2. Login: john.doe@company.com / password123" -ForegroundColor White
Write-Host "3. Click 'Start New Chat'" -ForegroundColor White
Write-Host "4. Test:" -ForegroundColor White
Write-Host "   - No duplicate sources" -ForegroundColor White
Write-Host "   - Source links open modal (not redirect)" -ForegroundColor White
Write-Host "   - Ticket modal is pre-filled" -ForegroundColor White

