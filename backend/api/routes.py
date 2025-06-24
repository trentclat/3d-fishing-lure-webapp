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
