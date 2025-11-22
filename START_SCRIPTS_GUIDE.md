# Windows Start Scripts Guide

## Overview
Windows start scripts have been created to easily start the RevTickets application services. Each service has both PowerShell (`.ps1`) and Batch (`.bat`) scripts for flexibility.

---

## 📁 Script Locations

### Backend Scripts
- **Location**: `backend/`
- **Files**:
  - `start-backend.ps1` - PowerShell script
  - `start-backend.bat` - Batch file (double-click friendly)

### Frontend Scripts
- **Location**: `frontend/`
- **Files**:
  - `start-frontend.ps1` - PowerShell script
  - `start-frontend.bat` - Batch file (double-click friendly)

### All Services Scripts
- **Location**: Root directory (`/`)
- **Files**:
  - `start-all.ps1` - PowerShell script (starts all services)
  - `start-all.bat` - Batch file (starts all services)

---

## 🚀 Usage

### Option 1: Double-Click (Easiest)
Simply double-click any `.bat` file:
- `backend/start-backend.bat` - Start backend only
- `frontend/start-frontend.bat` - Start frontend only
- `start-all.bat` - Start all services (MongoDB, Backend, Frontend)

### Option 2: PowerShell
Right-click on `.ps1` file → "Run with PowerShell", or run from terminal:
```powershell
.\backend\start-backend.ps1
.\frontend\start-frontend.ps1
.\start-all.ps1
```

### Option 3: Command Line
```cmd
cd backend
start-backend.bat

cd frontend
start-frontend.bat

cd ..
start-all.bat
```

---

## 📋 What Each Script Does

### Backend Start Script (`backend/start-backend.ps1` or `.bat`)
1. Checks if Docker is running
2. Navigates to project root
3. Starts backend container using `docker-compose up -d backend`
4. Displays status and URLs:
   - Backend API: http://localhost:8000
   - API Docs: http://localhost:8000/docs

### Frontend Start Script (`frontend/start-frontend.ps1` or `.bat`)
1. Checks if Docker is running
2. Navigates to project root
3. Starts frontend container using `docker-compose up -d frontend`
4. Displays status and URL:
   - Frontend: http://localhost:3000

### Start All Script (`start-all.ps1` or `.bat`)
1. Checks if Docker is running
2. Starts all services (MongoDB, Backend, Frontend)
3. Displays status for all services
4. Shows useful commands

---

## 🔧 Prerequisites

Before running any script:
1. **Docker Desktop must be running**
2. **Ports must be available**:
   - 3000 (Frontend)
   - 8000 (Backend)
   - 27017 (MongoDB)

---

## 📊 Expected Output

### Successful Start
```
==========================================
Starting RevTickets Backend
==========================================

✓ Docker is running

Starting backend service...

✓ Backend service started

Container Status: Up X seconds

Backend is running on: http://localhost:8000
API Documentation: http://localhost:8000/docs

To view logs, run: docker logs -f fastapi-backend
To stop, run: docker-compose stop backend
```

---

## 🛠️ Troubleshooting

### Script Won't Run (PowerShell)
If you get an execution policy error:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

Or run with bypass:
```powershell
powershell -ExecutionPolicy Bypass -File .\backend\start-backend.ps1
```

### Docker Not Running
**Error**: "Docker is not running"
**Solution**: Start Docker Desktop and wait for it to fully start

### Port Already in Use
**Error**: Container fails to start
**Solution**: 
- Check what's using the port: `netstat -ano | findstr :8000`
- Stop the conflicting service or change port in `docker-compose.yml`

### Container Not Starting
**Check logs**:
```powershell
docker logs fastapi-backend
docker logs nextjs-frontend
```

---

## 📝 Additional Commands

### View Logs
```powershell
# All services
docker-compose logs -f

# Specific service
docker logs -f fastapi-backend
docker logs -f nextjs-frontend
docker logs -f mongodb
```

### Stop Services
```powershell
# Stop all
docker-compose stop

# Stop specific service
docker-compose stop backend
docker-compose stop frontend
```

### Restart Services
```powershell
docker-compose restart
```

### Check Status
```powershell
docker ps
docker-compose ps
```

---

## 🎯 Quick Start Workflow

### First Time Setup
1. Ensure Docker Desktop is running
2. Double-click `start-all.bat` in root directory
3. Wait for all services to start (~30 seconds)
4. Access:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000/docs

### Daily Development
1. Start Docker Desktop
2. Double-click `start-all.bat`
3. Start coding!

### Start Individual Services
- Need only backend? → `backend/start-backend.bat`
- Need only frontend? → `frontend/start-frontend.bat`

---

## 📌 Notes

- Scripts automatically navigate to project root (where `docker-compose.yml` is)
- Scripts check Docker status before attempting to start
- Scripts provide helpful error messages and troubleshooting tips
- `.bat` files pause at the end so you can see the output
- `.ps1` files provide colored output for better readability

---

## 🔗 Related Files

- `docker-compose.yml` - Service configuration
- `.env` - Environment variables (including GOOGLE_API_KEY)
- `backend/start.sh` - Linux/Mac start script (inside container)
- `frontend/Dockerfile` - Frontend container configuration
- `backend/Dockerfile` - Backend container configuration

