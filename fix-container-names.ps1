# Fix container names and restart application
Write-Host "=== Fixing Container Names ===" -ForegroundColor Cyan

# Stop all containers
Write-Host "`n1. Stopping all containers..." -ForegroundColor Yellow
docker-compose down

# Remove any incorrectly named containers
Write-Host "`n2. Removing incorrectly named containers..." -ForegroundColor Yellow
docker ps -a --format "{{.Names}}" | Where-Object { $_ -like "revtickets-*" } | ForEach-Object {
    Write-Host "   Removing: $_" -ForegroundColor Yellow
    docker rm -f $_ 2>&1 | Out-Null
}

# Start with correct names
Write-Host "`n3. Starting containers with correct names..." -ForegroundColor Yellow
docker-compose up -d --build --force-recreate

# Wait for startup
Write-Host "`n4. Waiting for services to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 35

# Verify container names
Write-Host "`n5. Verifying container names..." -ForegroundColor Yellow
$containers = docker ps --format "{{.Names}}"
$expected = @("fastapi-backend", "nextjs-frontend", "mongodb", "redis-broker", "chroma-vectordb", "celery-worker-task", "celery-beat-task")
foreach ($name in $expected) {
    if ($containers -match $name) {
        Write-Host "   ✓ $name" -ForegroundColor Green
    } else {
        Write-Host "   ✗ $name MISSING" -ForegroundColor Red
    }
}

# Apply CORS fix
Write-Host "`n6. Applying CORS fix..." -ForegroundColor Yellow
docker cp backend/main.py fastapi-backend:/app/main.py 2>&1 | Out-Null
docker restart fastapi-backend
Start-Sleep -Seconds 15

# Check backend
Write-Host "`n7. Checking backend..." -ForegroundColor Yellow
$logs = docker logs fastapi-backend --tail 3 2>&1
if ($logs -match "Uvicorn running") {
    Write-Host "   ✓ Backend running" -ForegroundColor Green
} else {
    Write-Host "   ⚠ Check logs:" -ForegroundColor Yellow
    Write-Host $logs
}

Write-Host "`n=== Ready for Testing ===" -ForegroundColor Cyan
Write-Host "Test at: http://localhost:3000/knowledge-base/chat" -ForegroundColor White

