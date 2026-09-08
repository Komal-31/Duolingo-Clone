from app.database import engine
from app.database import Base
import os
import logging
from fastapi import FastAPI, Request, status
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.routers import courses, lessons, users, leaderboard, achievements


# Import all models so SQLAlchemy knows about every table
from app.models.user import User
from app.models.course import Course, Unit, Skill
from app.models.lesson import Lesson, Exercise
from app.models.progress import UserProgress
from app.models.stats import UserStats, DailyActivity
from app.models.gamification import LeaderboardEntry, Achievement, UserAchievement


logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("duolingo-backend")

app = FastAPI(
    title="Duolingo Clone API",
    description="Full-stack Duolingo language learning platform API with normalized SQLite backend and comprehensive gamification engine.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

@app.on_event("startup")
def create_database_tables():
    logger.info("Creating database tables if they do not exist...")
    Base.metadata.create_all(bind=engine)
    logger.info("Database tables are ready.")

# Configure CORS via environment variable (default: http://localhost:3000, 127.0.0.1, [::1])
cors_origins_env = os.getenv(
    "CORS_ORIGINS",
    "http://localhost:3000,http://127.0.0.1:3000,http://[::1]:3000,http://localhost:3001,http://127.0.0.1:3001"
)
origins = [origin.strip() for origin in cors_origins_env.split(",") if origin.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_origin_regex=r"^https?://(localhost|127\.0\.0\.1|\[::1\])(:\d+)?$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def route_fallback_and_log_middleware(request: Request, call_next):
    path = request.url.path
    # Transparently route requests made without /api prefix to matching /api routes
    if (
        not path.startswith("/api")
        and not path.startswith("/docs")
        and not path.startswith("/redoc")
        and not path.startswith("/openapi.json")
        and path != "/"
    ):
        api_path = f"/api{path}"
        for route in app.routes:
            if hasattr(route, "path_regex") and route.path_regex.match(api_path):
                request.scope["path"] = api_path
                break

    logger.info(f"Incoming request: {request.method} {request.url.path}")
    response = await call_next(request)
    logger.info(f"Response status: {response.status_code} for {request.method} {request.url.path}")
    return response


# --- Clean JSON Error Handlers (no stack traces leaked) ---

@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(request: Request, exc: StarletteHTTPException):
    detail = exc.detail
    if exc.status_code == 404 and detail == "Not Found":
        detail = f"Endpoint '{request.method} {request.url.path}' was not found. Refer to /docs for all available API routes."
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "detail": detail,
            "status_code": exc.status_code
        }
    )


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    error_messages = []
    for err in exc.errors():
        loc = " -> ".join([str(l) for l in err.get("loc", []) if l != "body"])
        msg = err.get("msg", "Invalid value")
        error_messages.append(f"{loc}: {msg}" if loc else msg)

    return JSONResponse(
        status_code=status.HTTP_400_BAD_REQUEST,
        content={
            "detail": "; ".join(error_messages) if error_messages else "Request validation failed",
            "status_code": status.HTTP_400_BAD_REQUEST,
            "errors": exc.errors()
        }
    )


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    # Log the full exception internally, but never leak stack traces to client
    logger.error(f"Internal server error on {request.method} {request.url.path}: {str(exc)}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "detail": "An unexpected internal server error occurred. Please try again later.",
            "status_code": status.HTTP_500_INTERNAL_SERVER_ERROR
        }
    )


# Root endpoint
@app.get("/", tags=["Root"])
def root():
    return {
        "message": "Duolingo Clone API is running",
        "docs": "http://localhost:8000/docs",
        "frontend": "http://localhost:3000",
        "health": "http://localhost:8000/api/health"
    }


# Health check
@app.get("/health", tags=["Health"])
@app.get("/api/health", tags=["Health"])
def health_check():
    return {
        "status": "healthy",
        "service": "duolingo-backend",
        "database": "sqlite"
    }


# Include all routers
app.include_router(courses.router)
app.include_router(lessons.router)
app.include_router(users.router)
app.include_router(leaderboard.router)
app.include_router(achievements.router)
