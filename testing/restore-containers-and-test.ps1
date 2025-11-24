# Restore container names and test all fixes
Write-Host "=== Restoring Container Names and Testing ===" -ForegroundColor Cyan

# Step 1: Stop and remove all containers
Write-Host "`n1. Stopping and removing all containers..." -ForegroundColor Yellow
docker-compose down -v

# Step 2: Remove any containers with wrong names
Write-Host "`n2. Removing incorrectly named containers..." -ForegroundColor Yellow
$wrongContainers = docker ps -a --format "{{.Names}}" | Select-String -Pattern "revtickets-"
foreach ($container in $wrongContainers) {
    if ($container) {
        Write-Host "   Removing: $container" -ForegroundColor Yellow
        docker rm -f $container 2>&1 | Out-Null
    }
}

# Step 3: Start containers with correct names
Write-Host "`n3. Starting containers with correct names..." -ForegroundColor Yellow
docker-compose up -d --build

# Step 4: Wait for services
Write-Host "`n4. Waiting for services to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 30

# Step 5: Verify container names
Write-Host "`n5. Verifying container names..." -ForegroundColor Yellow
$containers = docker ps --format "{{.Names}}"
$expectedNames = @("fastapi-backend", "nextjs-frontend", "mongodb", "redis-broker", "chroma-vectordb", "celery-worker-task", "celery-beat-task")
foreach ($name in $expectedNames) {
    if ($containers -match $name) {
        Write-Host "   ✓ $name is running" -ForegroundColor Green
    } else {
        Write-Host "   ✗ $name is NOT running" -ForegroundColor Red
    }
}

# Step 6: Apply CORS fix
Write-Host "`n6. Applying CORS fix..." -ForegroundColor Yellow
docker cp backend/main.py fastapi-backend:/app/main.py 2>&1 | Out-Null
docker restart fastapi-backend
Start-Sleep -Seconds 15

# Step 7: Check backend status
Write-Host "`n7. Checking backend status..." -ForegroundColor Yellow
$backendLogs = docker logs fastapi-backend --tail 5 2>&1
if ($backendLogs -match "Uvicorn running") {
    Write-Host "   ✓ Backend is running" -ForegroundColor Green
} else {
    Write-Host "   ⚠ Backend may still be starting" -ForegroundColor Yellow
    Write-Host $backendLogs
}

Write-Host "`n=== Ready for Testing ===" -ForegroundColor Cyan
Write-Host "Container names restored. Please test:" -ForegroundColor Yellow
Write-Host "1. Navigate to http://localhost:3000/knowledge-base/chat" -ForegroundColor White
Write-Host "2. Test all 3 fixes" -ForegroundColor White

