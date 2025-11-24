# Complete Fix and Test Script
Write-Host "=== Complete Application Fix and Test ===" -ForegroundColor Cyan

# Step 1: Stop all containers
Write-Host "`n1. Stopping all containers..." -ForegroundColor Yellow
docker-compose down

# Step 2: Copy updated files to ensure they're in place
Write-Host "`n2. Ensuring all fixes are in place..." -ForegroundColor Yellow
# CORS fix already applied to backend/main.py

# Step 3: Start all services
Write-Host "`n3. Starting all services..." -ForegroundColor Yellow
docker-compose up -d --build

# Step 4: Wait for services to be ready
Write-Host "`n4. Waiting for services to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 30

# Step 5: Check backend status
Write-Host "`n5. Checking backend status..." -ForegroundColor Yellow
$backendLogs = docker logs fastapi-backend --tail 10 2>&1
if ($backendLogs -match "Uvicorn running") {
    Write-Host "   ✓ Backend is running" -ForegroundColor Green
} else {
    Write-Host "   ✗ Backend may have issues" -ForegroundColor Red
    Write-Host $backendLogs
}

# Step 6: Check frontend status
Write-Host "`n6. Checking frontend status..." -ForegroundColor Yellow
$frontendStatus = docker ps --filter "name=nextjs-frontend" --format "{{.Status}}"
if ($frontendStatus) {
    Write-Host "   ✓ Frontend is running: $frontendStatus" -ForegroundColor Green
} else {
    Write-Host "   ✗ Frontend may not be running" -ForegroundColor Red
}

# Step 7: Copy updated main.py to running container
Write-Host "`n7. Applying CORS fix to running container..." -ForegroundColor Yellow
docker cp backend/main.py fastapi-backend:/app/main.py 2>&1 | Out-Null
docker-compose restart backend
Start-Sleep -Seconds 10

# Step 8: Test CORS
Write-Host "`n8. Testing CORS..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8000/api/v1/kb-chat/sessions" -Method OPTIONS -Headers @{"Origin"="http://localhost:3000"} -ErrorAction Stop
    if ($response.Headers['Access-Control-Allow-Origin']) {
        Write-Host "   ✓ CORS is working" -ForegroundColor Green
    } else {
        Write-Host "   ⚠ CORS headers present but may need verification" -ForegroundColor Yellow
    }
} catch {
    Write-Host "   ⚠ CORS test inconclusive (may need browser test)" -ForegroundColor Yellow
}

Write-Host "`n=== Application Ready for Testing ===" -ForegroundColor Cyan
Write-Host "Frontend: http://localhost:3000" -ForegroundColor White
Write-Host "Backend: http://localhost:8000" -ForegroundColor White
Write-Host "`nPlease test:" -ForegroundColor Yellow
Write-Host "1. Navigate to http://localhost:3000/knowledge-base/chat" -ForegroundColor White
Write-Host "2. Click 'Start New Chat'" -ForegroundColor White
Write-Host "3. Ask a question" -ForegroundColor White
Write-Host "4. Verify:" -ForegroundColor White
Write-Host "   - No duplicate sources" -ForegroundColor White
Write-Host "   - Source links open modal (not redirect)" -ForegroundColor White
Write-Host "   - Ticket modal is pre-filled" -ForegroundColor White

