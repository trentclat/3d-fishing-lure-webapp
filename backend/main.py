from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.routes import router

app = FastAPI(
    title="AI Lure Designer API",
    description="Backend API for AI-powered fishing lure design and rendering",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(router, prefix="/api")

@app.get("/")
async def root():
    return {"message": "AI Lure Designer API is running! 🎣"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "ai-lure-designer"}
