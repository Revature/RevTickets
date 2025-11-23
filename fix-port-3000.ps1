# Fix Port 3000 Script
# Stops frontend, kills process on port 3000, and restarts frontend on port 3000

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "Fixing Port 3000 for Frontend" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Stop frontend container
Write-Host "Step 1: Stopping frontend container..." -ForegroundColor Yellow
docker-compose stop frontend
Write-Host "✓ Frontend container stopped" -ForegroundColor Green
Write-Host ""

# Step 2: Kill any process on port 3000
Write-Host "Step 2: Checking for processes on port 3000..." -ForegroundColor Yellow
try {
    $port3000 = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue
    if ($port3000) {
        $pid = $port3000.OwningProcess
        $process = Get-Process -Id $pid -ErrorAction SilentlyContinue
        Write-Host "Found process on port 3000:" -ForegroundColor Yellow
        Write-Host "  PID: $pid" -ForegroundColor Gray
        Write-Host "  Name: $($process.Name)" -ForegroundColor Gray
        Write-Host "  Path: $($process.Path)" -ForegroundColor Gray
        Write-Host ""
        Write-Host "Killing process $pid..." -ForegroundColor Yellow
        Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
        Start-Sleep -Seconds 2
        Write-Host "✓ Process killed" -ForegroundColor Green
    } else {
        Write-Host "✓ No process found on port 3000" -ForegroundColor Green
    }
} catch {
    Write-Host "⚠ Could not check port 3000: $($_.Exception.Message)" -ForegroundColor Yellow
    Write-Host "Attempting alternative method..." -ForegroundColor Yellow
    # Alternative: Use netstat
    $netstat = netstat -ano | Select-String ":3000"
    if ($netstat) {
        $pids = $netstat | ForEach-Object { ($_ -split '\s+')[-1] } | Select-Object -Unique
        foreach ($pid in $pids) {
            if ($pid -match '^\d+$') {
                Write-Host "Killing process $pid..." -ForegroundColor Yellow
                Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
            }
        }
        Write-Host "✓ Processes killed" -ForegroundColor Green
    }
}
Write-Host ""

# Step 3: Verify port 3000 is free
Write-Host "Step 3: Verifying port 3000 is free..." -ForegroundColor Yellow
Start-Sleep -Seconds 2
$checkPort = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue
if ($checkPort) {
    Write-Host "⚠ Port 3000 is still in use. Please manually kill the process." -ForegroundColor Yellow
} else {
    Write-Host "✓ Port 3000 is free" -ForegroundColor Green
}
Write-Host ""

# Step 4: Restart frontend on port 3000
Write-Host "Step 4: Starting frontend on port 3000..." -ForegroundColor Yellow
docker-compose up -d --build frontend

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✓ Frontend started successfully" -ForegroundColor Green
    Write-Host ""
    Start-Sleep -Seconds 5
    
    # Check container status
    $containerStatus = docker ps --filter "name=nextjs-frontend" --format "{{.Status}}"
    if ($containerStatus) {
        Write-Host "Container Status: $containerStatus" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "Frontend is now running on: http://localhost:3000" -ForegroundColor Green
    } else {
        Write-Host "⚠ Container may not be running. Check logs:" -ForegroundColor Yellow
        Write-Host "  docker logs nextjs-frontend" -ForegroundColor Gray
    }
} else {
    Write-Host ""
    Write-Host "✗ Failed to start frontend" -ForegroundColor Red
    Write-Host "Check logs: docker logs nextjs-frontend" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "Port 3000 Fix Complete" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""





