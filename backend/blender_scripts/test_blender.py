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
