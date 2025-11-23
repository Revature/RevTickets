# Comprehensive fix and test script
Write-Host "=== Fixing CORS and Testing All Fixes ===" -ForegroundColor Cyan

# Step 1: Copy updated main.py to container
Write-Host "`n1. Copying updated CORS configuration..." -ForegroundColor Yellow
docker cp backend/main.py fastapi-backend:/app/main.py 2>&1 | Out-Null

# Step 2: Restart backend
Write-Host "`n2. Restarting backend..." -ForegroundColor Yellow
docker-compose restart backend

# Step 3: Wait for backend to be ready
Write-Host "`n3. Waiting for backend to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 15

# Step 4: Check backend status
Write-Host "`n4. Checking backend status..." -ForegroundColor Yellow
$backendStatus = docker logs fastapi-backend --tail 5 2>&1 | Select-String -Pattern "Uvicorn running"
if ($backendStatus) {
    Write-Host "   ✓ Backend is running" -ForegroundColor Green
} else {
    Write-Host "   ✗ Backend may not be running properly" -ForegroundColor Red
    docker logs fastapi-backend --tail 20
}

# Step 5: Test CORS with curl
Write-Host "`n5. Testing CORS configuration..." -ForegroundColor Yellow
$corsTest = curl -I -X OPTIONS http://localhost:8000/api/v1/kb-chat/sessions -H "Origin: http://localhost:3000" -H "Access-Control-Request-Method: POST" 2>&1
if ($corsTest -match "Access-Control-Allow-Origin") {
    Write-Host "   ✓ CORS is configured correctly" -ForegroundColor Green
} else {
    Write-Host "   ✗ CORS test failed" -ForegroundColor Red
    Write-Host $corsTest
}

Write-Host "`n=== Ready for browser testing ===" -ForegroundColor Cyan
Write-Host "Please test the following in browser:" -ForegroundColor Yellow
Write-Host "1. Navigate to http://localhost:3000/knowledge-base/chat" -ForegroundColor White
Write-Host "2. Click 'Start New Chat'" -ForegroundColor White
Write-Host "3. Ask a question and verify:" -ForegroundColor White
Write-Host "   - No duplicate sources appear" -ForegroundColor White
Write-Host "   - Clicking source links opens a modal (not redirect)" -ForegroundColor White
Write-Host "   - Ticket conversion modal is pre-filled from chat history" -ForegroundColor White

