from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
import time
from src.db.init_db import init_db
from src.api.v1.routes.ticket import router as ticket_router
from src.api.v1.routes.tag import router as tag_router
from src.api.v1.routes.category import router as category_router
from src.api.v1.routes.subcategory import router as subcategory_router
from src.api.v1.routes.comment import router as comment_router
from src.api.v1.routes.user import router as user_router
from src.api.v1.routes.article import router as article_router
from src.api.v1.routes.ai import router as ai_router
from src.api.v1.routes.file import router as file_router
from src.api.v1.routes.kb_chat import router as kb_chat_router

import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), "src"))

@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    yield
    pass

app = FastAPI(
    title="Ticketing System",
    description="API for Ticketing System",
    version="1.0.0",
    lifespan=lifespan
)

# Add request logging middleware
@app.middleware("http")
async def log_requests(request: Request, call_next):
    start_time = time.time()
    print(f"📥 {request.method} {request.url} - Headers: {dict(request.headers)}")
    
    response = await call_next(request)
    
    process_time = time.time() - start_time
    print(f"📤 {request.method} {request.url} - Status: {response.status_code} - Time: {process_time:.4f}s")
    
    return response

# Add CORS middleware - must be added before routes
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allow_headers=["*"],
)

# Health check endpoint
@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "ticketing-system", "version": "1.0.0"}

# Root endpoint
@app.get("/")
async def root():
    return {"message": "Ticketing System API", "version": "1.0.0", "docs": "/docs"}

# Include all routers with consistent API versioning
app.include_router(ticket_router, prefix="/api/v1")
app.include_router(tag_router, prefix="/api/v1")
app.include_router(category_router, prefix="/api/v1")
app.include_router(subcategory_router, prefix="/api/v1")
app.include_router(comment_router, prefix="/api/v1")
app.include_router(user_router, prefix="/api/v1")
app.include_router(article_router, prefix="/api/v1")
app.include_router(ai_router, prefix="/api/v1")
app.include_router(file_router, prefix="/api/v1")
app.include_router(kb_chat_router, prefix="/api/v1")