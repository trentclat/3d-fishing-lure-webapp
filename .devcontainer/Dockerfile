# Use Ubuntu 22.04 as base image for compatibility with Blender and Supabase
FROM ubuntu:22.04

# Prevent interactive prompts during package installation
ENV DEBIAN_FRONTEND=noninteractive
ENV TZ=UTC

# Install system dependencies
RUN apt-get update && apt-get install -y \
    # Basic utilities
    curl \
    wget \
    git \
    unzip \
    software-properties-common \
    apt-transport-https \
    ca-certificates \
    gnupg \
    lsb-release \
    # Build tools
    build-essential \
    cmake \
    pkg-config \
    # Python dependencies
    python3 \
    python3-pip \
    python3-dev \
    python3-venv \
    # PostgreSQL client
    postgresql-client \
    # Graphics and X11 dependencies for headless Blender
    libx11-6 \
    libxi6 \
    libxrender1 \
    libgl1-mesa-glx \
    libglu1-mesa \
    libxrandr2 \
    libxss1 \
    libxcursor1 \
    libxcomposite1 \
    libxdamage1 \
    libxfixes3 \
    libxinerama1 \
    libxi6 \
    libxrandr2 \
    libxss1 \
    libgconf-2-4 \
    # FFmpeg for video processing (useful for lure animations)
    ffmpeg \
    && rm -rf /var/lib/apt/lists/*

# Install Node.js 18.x (required for Supabase CLI)
RUN curl -fsSL https://deb.nodesource.com/setup_18.x | bash - \
    && apt-get install -y nodejs

# Install Docker CLI (for Supabase local development)
RUN curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg \
    && echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null \
    && apt-get update \
    && apt-get install -y docker-ce-cli

# Create global workspace for supabase CLI
WORKDIR /usr/local/lib
RUN npm init -y \
    && npm install supabase \
    && ln -s /usr/local/lib/node_modules/.bin/supabase /usr/local/bin/supabase

# Create a non-root user
RUN groupadd --gid 1000 developer \
    && useradd --uid 1000 --gid developer --shell /bin/bash --create-home developer

# Install Python packages
RUN pip3 install --no-cache-dir \
    fastapi[all] \
    uvicorn[standard] \
    sqlalchemy \
    asyncpg \
    psycopg2-binary \
    python-multipart \
    python-dotenv \
    requests \
    pillow \
    numpy \
    scipy

# Download and install Blender 4.0 LTS (headless)
WORKDIR /opt
RUN wget -q https://download.blender.org/release/Blender4.0/blender-4.0.2-linux-x64.tar.xz \
    && tar -xf blender-4.0.2-linux-x64.tar.xz \
    && rm blender-4.0.2-linux-x64.tar.xz \
    && ln -s /opt/blender-4.0.2-linux-x64/blender /usr/local/bin/blender

# Install Blender Python packages (bpy standalone for development)
RUN pip3 install --no-cache-dir bpy

# Set up workspace directory
WORKDIR /workspace

# Change ownership of workspace to developer user
RUN chown -R developer:developer /workspace

# Switch to non-root user
USER developer

# Set environment variables
ENV PATH="/home/developer/.local/bin:$PATH"
ENV PYTHONPATH="/workspace"

# Expose ports
# 3000 - Next.js frontend
# 8000 - FastAPI backend  
# 54321 - Supabase local API
# 54322 - Supabase local DB
# 54323 - Supabase local Auth
# 54324 - Supabase local Storage
# 54325 - Supabase local Edge Functions
EXPOSE 3000 8000 54321 54322 54323 54324 54325

# Default command
CMD ["/bin/bash"] 