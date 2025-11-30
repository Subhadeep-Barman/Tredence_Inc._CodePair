from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import logging
import os

from app.database import init_db
from app.routers import rooms, autocomplete, websocket, execute
from app.middleware.rate_limiter import RateLimitMiddleware, rate_limiter


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize database on startup
    await init_db()
    yield


app = FastAPI(
    title="Real-time Pair Programming API",
    description="A collaborative code editor with real-time synchronization and AI autocomplete",
    version="1.0.0",
    lifespan=lifespan
)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Add rate limiting middleware
app.add_middleware(RateLimitMiddleware, rate_limiter=rate_limiter)

# Configure CORS
frontend_url = os.getenv("FRONTEND_URL", "http://localhost:3000")
allowed_origins = [
    "http://localhost:3000",
    "http://localhost:8000",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:8000",
    frontend_url,
]

# Add production origins if they exist
if os.getenv("PRODUCTION_FRONTEND_URL"):
    allowed_origins.append(os.getenv("PRODUCTION_FRONTEND_URL"))

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Add security headers middleware
@app.middleware("http")
async def add_security_headers(request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    return response

# Global exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    logger.error(f"Global exception: {exc}")
    return {"error": "Internal server error"}

# Include routers
app.include_router(rooms.router, prefix="/api", tags=["rooms"])
app.include_router(autocomplete.router, prefix="/api", tags=["autocomplete"])
app.include_router(execute.router, prefix="/api", tags=["execute"])
app.include_router(websocket.router, tags=["websocket"])


@app.get("/")
async def root():
    return {"message": "Real-time Pair Programming API is running!"}


@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "active_rooms": len(websocket.websocket_manager.active_connections),
        "total_connections": sum(len(conns) for conns in websocket.websocket_manager.active_connections.values())
    }


if __name__ == "__main__":
    import uvicorn
    host = os.getenv("HOST", "0.0.0.0")
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host=host, port=port)