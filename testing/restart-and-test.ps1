# Clear caches and restart application
Write-Host "=== Clearing Caches and Restarting Application ===" -ForegroundColor Cyan

# Stop containers
Write-Host "`n1. Stopping containers..." -ForegroundColor Yellow
docker-compose down

# Clear Docker cache
Write-Host "`n2. Clearing Docker cache..." -ForegroundColor Yellow
docker system prune -f

# Clear frontend cache
Write-Host "`n3. Clearing frontend cache..." -ForegroundColor Yellow
if (Test-Path "frontend\.next") { 
    Remove-Item -Recurse -Force "frontend\.next" 
    Write-Host "   - Removed .next directory" -ForegroundColor Green
}
if (Test-Path "frontend\node_modules\.cache") { 
    Remove-Item -Recurse -Force "frontend\node_modules\.cache"
    Write-Host "   - Removed node_modules cache" -ForegroundColor Green
}

# Clear backend Python cache
Write-Host "`n4. Clearing backend Python cache..." -ForegroundColor Yellow
Get-ChildItem -Path "backend" -Recurse -Filter "__pycache__" -ErrorAction SilentlyContinue | Remove-Item -Recurse -Force -ErrorAction SilentlyContinue
Get-ChildItem -Path "backend" -Recurse -Filter "*.pyc" -ErrorAction SilentlyContinue | Remove-Item -Force -ErrorAction SilentlyContinue
Write-Host "   - Removed Python cache files" -ForegroundColor Green

# Copy backend file to ensure it's updated
Write-Host "`n5. Ensuring backend files are updated..." -ForegroundColor Yellow
if (Test-Path "backend\src\langchain_app\chains\kb_chat.py") {
    Write-Host "   - Backend kb_chat.py exists" -ForegroundColor Green
}

# Rebuild and start
Write-Host "`n6. Rebuilding and starting containers..." -ForegroundColor Yellow
docker-compose build --no-cache backend frontend
docker-compose up -d

Write-Host "`n=== Application Restarted ===" -ForegroundColor Green
Write-Host "`nPlease wait for containers to start, then test:" -ForegroundColor Cyan
Write-Host "1. Chat with the bot and check for duplicate sources" -ForegroundColor White
Write-Host "2. Click on a source link - should open modal, not redirect" -ForegroundColor White
Write-Host "3. Click 'Create Ticket' - modal should be pre-filled" -ForegroundColor White

