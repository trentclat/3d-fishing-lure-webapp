# AI-Driven Fishing Lure Designer

A proof-of-concept web application to streamline the design of fishing lures by leveraging Blender’s Python API (MCP), Three.js previews, and custom AI pipelines. This tool replaces traditional hand-painting with automated texture application, multi-view rendering, and advanced scene simulations.

---

## 1. Framework Overview

### Frontend / UI

* **Next.js**: React-based server-rendered framework for rapid page routing and API integrations.
* **Tailwind CSS**: Utility-first styling for responsive, consistent UI components.
* **Three.js**: WebGL library for real-time 3D model viewing (OBJ/MTL) directly in the browser.
* **V0.dev**: AI-powered chat/interaction layer for natural-language control and rapid prototyping of UI elements.

### Data & Authentication

* **Supabase**: Open-source Firebase alternative providing:

  * PostgreSQL database for storing metadata (shapes, patterns, user sessions).
  * Storage buckets for OBJ files, PNG patterns, and rendered outputs.
  * Auth and Realtime for user management and job notifications.

### Compute & Rendering

* **Python**: Orchestration layer and REST API via FastAPI or Flask for job scheduling and asset management.
* **Blender MCP**: Blender’s programmable Python API used to import OBJ models, apply texture maps, configure scene lighting, and render multi-view outputs.
* **Stable Diffusion XL (SDXL)**: Fine-tuned image generation model for placing the textured lure into photographic contexts (e.g., hand-held shots, fish-mouth scenes).

---

## 2. Core Features

### a) Importing

* **Shape Selection**: Upload or choose from a library of CAD OBJ files representing blank fishing lure shapes (e.g., flicker shad, minnow, crankbait).
* **Pattern Selection**: Choose from a curated database of 2D PNG color/pattern maps to wrap onto the 3D lure.

### b) Exporting

* **3D Preview**: Export a textured OBJ/MTL bundle for real-time orbit/pan/zoom viewing in-app via Three.js.
* **2D Static Views**: Generate and download PNG renders from top, side, and bottom camera angles.

### c) Advanced Preview & Experimentation

* **Scene Control**: Toggle lighting presets (sunlight, studio, deep water) and underwater filters (clear, murky, muddy) for visibility studies.
* **AI Contextualization**: Feed the custom 3D texture + model into a fine-tuned SDXL pipeline to generate realistic photographic contexts, such as:

  * Handheld product shots
  * Underwater fish-attraction scenes
  * In-situ bait-in-mouth imagery

---

## 3. Getting Started

1. **Clone the repo** and open in your IDE of choice (Cursor)
2. **Reopen in Dev Container** to spin up Supabase emulators, FastAPI server, and headless Blender.
3. **Front-End**: Scaffold Next.js + Tailwind + Three.js via V0.dev or manually.
4. **Run**: Navigate to `http://localhost:3000` for the UI and `http://localhost:8000/docs` for API docs.
5. **Import → Render → Preview**: Select shape & pattern, click “Render,” and watch the magic happen.

---

## 4. Roadmap & Next Steps

* Pool Blender worker instances for sub-second cold-start renders.
* Add animated water box simulation with noise-driven waves.
* Integrate job-queue and real-time status updates via Supabase Realtime.
* Expand SDXL pipelines for batch context generation and style transfer.

---

**Designed to empower non-technical product teams** with instant visual feedback, this AI-driven lure designer aims to revolutionize the way fishing baits are conceptualized and tested before committing to physical prototypes.
