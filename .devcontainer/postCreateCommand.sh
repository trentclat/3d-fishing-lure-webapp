#!/bin/bash

echo "🎣 Setting up AI Lure Designer Development Environment..."

# Make sure we're in the workspace directory
cd /workspace

# Create necessary directories if they don't exist
mkdir -p backend/{app,models,api,core,utils,blender_scripts}
mkdir -p frontend/public/models
mkdir -p assets/{shapes,patterns,renders}

# Initialize Supabase project if not already initialized
if [ ! -f "supabase/config.toml" ]; then
    echo "📦 Initializing Supabase project..."
    supabase init
fi

# Create a basic FastAPI application structure
if [ ! -f "backend/main.py" ]; then
    echo "🚀 Creating FastAPI application structure..."
    
    # Create main FastAPI app
    cat > backend/main.py << 'EOF'
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
EOF

    # Create API routes
    mkdir -p backend/api
    cat > backend/api/__init__.py << 'EOF'
# API package
EOF

    cat > backend/api/routes.py << 'EOF'
from fastapi import APIRouter

router = APIRouter()

@router.get("/lures")
async def get_lures():
    """Get available lure shapes"""
    return {"lures": []}

@router.get("/patterns")
async def get_patterns():
    """Get available texture patterns"""
    return {"patterns": []}

@router.post("/render")
async def render_lure():
    """Render a lure with applied texture"""
    return {"message": "Rendering not implemented yet"}
EOF

    # Create requirements.txt
    cat > backend/requirements.txt << 'EOF'
fastapi[all]==0.104.1
uvicorn[standard]==0.24.0
sqlalchemy==2.0.23
asyncpg==0.29.0
psycopg2-binary==2.9.9
python-multipart==0.0.6
python-dotenv==1.0.0
requests==2.31.0
pillow==10.1.0
numpy==1.25.2
scipy==1.11.4
bpy==4.0.0
EOF

    echo "📄 Created basic FastAPI structure"
fi

# Install Python dependencies
if [ -f "backend/requirements.txt" ]; then
    echo "📦 Installing Python dependencies..."
    pip3 install -r backend/requirements.txt
fi

# Create a simple Blender test script
if [ ! -f "backend/blender_scripts/test_blender.py" ]; then
    cat > backend/blender_scripts/test_blender.py << 'EOF'
#!/usr/bin/env python3
"""
Test script to verify Blender headless functionality
"""
import bpy
import sys

def test_blender_headless():
    """Test basic Blender operations"""
    print("🔧 Testing Blender headless mode...")
    
    # Clear default scene
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.delete(use_global=False)
    
    # Add a simple cube
    bpy.ops.mesh.primitive_cube_add(location=(0, 0, 0))
    
    # Get the cube object
    cube = bpy.context.active_object
    cube.name = "TestLure"
    
    print(f"✅ Created object: {cube.name}")
    print(f"✅ Blender version: {bpy.app.version_string}")
    print("✅ Blender headless test completed successfully!")
    
    return True

if __name__ == "__main__":
    test_blender_headless()
EOF
fi

# Create a startup script for development
cat > backend/start_dev.sh << 'EOF'
#!/bin/bash
echo "🚀 Starting AI Lure Designer Backend Development Server..."

# Start Supabase local development
echo "📦 Starting Supabase local services..."
supabase start &

# Wait a moment for Supabase to initialize
sleep 5

# Start FastAPI development server
echo "🚀 Starting FastAPI server..."
cd /workspace/backend
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
EOF

chmod +x backend/start_dev.sh

# Test Blender installation
echo "🔧 Testing Blender installation..."
blender --version

# Test Blender Python script
echo "🔧 Testing Blender headless functionality..."
blender --background --python backend/blender_scripts/test_blender.py

echo "✅ AI Lure Designer Development Environment Setup Complete!"
echo ""
echo "🎣 Next steps:"
echo "   1. Run 'bash backend/start_dev.sh' to start all services"
echo "   2. Visit http://localhost:8000/docs for API documentation"
echo "   3. Visit http://localhost:54321 for Supabase dashboard"
echo ""
echo "Happy coding! 🚀" 