# Restore Container Names and Test All Fixes

## Issue
Container names changed from `fastapi-backend` to `revtickets-backend`, etc.

## Solution
The `docker-compose.yml` file already has the correct container names defined. We need to recreate containers with these names.

## Steps to Fix

### 1. Stop and Remove All Containers
```powershell
docker-compose down
```

### 2. Remove Any Incorrectly Named Containers
```powershell
# Remove containers with revtickets- prefix
docker ps -a --format "{{.Names}}" | Where-Object { $_ -like "revtickets-*" } | ForEach-Object { docker rm -f $_ }
```

### 3. Start Containers with Correct Names
```powershell
docker-compose up -d --build --force-recreate
```

### 4. Wait for Services (30-40 seconds)
```powershell
Start-Sleep -Seconds 35
```

### 5. Verify Container Names
```powershell
docker ps --format "table {{.Names}}\t{{.Status}}"
```

Expected container names:
- `fastapi-backend`
- `nextjs-frontend`
- `mongodb`
- `redis-broker`
- `chroma-vectordb`
- `celery-worker-task`
- `celery-beat-task`

### 6. Apply CORS Fix
```powershell
docker cp backend/main.py fastapi-backend:/app/main.py
docker restart fastapi-backend
Start-Sleep -Seconds 15
```

### 7. Verify Backend is Running
```powershell
docker logs fastapi-backend --tail 5
```

Should see: "Uvicorn running on http://0.0.0.0:8000"

## Test All 3 Fixes

### Test 1: Duplicate Sources
1. Navigate to: http://localhost:3000/knowledge-base/chat
2. Login: john.doe@company.com / password123
3. Click "Start New Chat"
4. Ask: "How do I reset my password?"
5. **Verify:** Each source appears only once

### Test 2: Source Modal
1. Click on any source link/button in chat response
2. **Verify:** Modal opens with article content (not redirect)

### Test 3: Pre-filled Ticket Modal
1. Have 2-3 message conversation
2. Click "Create Ticket"
3. **Verify:** All fields pre-filled:
   - Title from first message
   - Description from conversation
   - Priority auto-detected
   - Category/subcategory auto-selected

## Quick Script

Run `fix-container-names.ps1` which does all of the above automatically.

