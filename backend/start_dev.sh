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
