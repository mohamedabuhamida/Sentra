from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .core.config import settings
from .api.v1.endpoints.gateway import api_router as gateway_router
from .api.v1.endpoints.providers import router as providers_router
from .api.v1.endpoints.settings import router as settings_router
from .api.v1.endpoints.analytics import router as analytics_router
from .api.v1.endpoints.routing import router as routing_router
from .api.v1.endpoints.api_keys import router as api_keys_router
from .api.v1.endpoints.profile import router as profile_router
from .database.session import init_db

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize database tables on startup
    await init_db()
    yield

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Sentra Intelligent GenAI Gateway & Model Routing Platform API",
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url=f"{settings.API_V1_STR}/docs",
    lifespan=lifespan,
)

# Set up CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API Routers
app.include_router(gateway_router, prefix=settings.API_V1_STR, tags=["Gateway"])
app.include_router(providers_router, prefix=f"{settings.API_V1_STR}/providers", tags=["Providers"])
app.include_router(settings_router, prefix=f"{settings.API_V1_STR}/settings", tags=["Settings"])
app.include_router(analytics_router, prefix=f"{settings.API_V1_STR}/analytics", tags=["Analytics"])
app.include_router(routing_router, prefix=f"{settings.API_V1_STR}/routing", tags=["Routing"])
app.include_router(api_keys_router, prefix=f"{settings.API_V1_STR}/api-keys", tags=["API Keys"])
app.include_router(profile_router, prefix=f"{settings.API_V1_STR}/profile", tags=["Profile"])

@app.get("/health", tags=["Health"])
async def health_check():
    return {
        "status": "healthy",
        "service": "Sentra AI Gateway",
        "version": settings.VERSION,
        "environment": settings.ENVIRONMENT,
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
