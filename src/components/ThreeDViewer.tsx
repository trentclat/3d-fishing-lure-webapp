"use client";

import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';

interface ThreeDViewerProps {
  file: File;
}

export default function ThreeDViewer({ file }: ThreeDViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);

  // Store references for cleanup
  const sceneRef = useRef<{
    renderer?: THREE.WebGLRenderer;
    scene?: THREE.Scene;
    camera?: THREE.PerspectiveCamera;
    controls?: any;
    currentModel?: THREE.Group;
    currentURL?: string;
    animationId?: number;
  }>({});

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient || !canvasRef.current) return;

    const canvas = canvasRef.current;
    
    // ---------- Core Three.js setup ----------
    const renderer = new THREE.WebGLRenderer({ 
      canvas, 
      antialias: true,
      alpha: false 
    });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setClearColor(0x222831);
    
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x222831);

    const camera = new THREE.PerspectiveCamera(
      45, 
      canvas.clientWidth / canvas.clientHeight, 
      0.1, 
      1000
    );
    camera.position.set(0, 1.2, 3);

    // ---------- Lighting ----------
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 0.8);
    scene.add(hemiLight);
    
    const dirLight = new THREE.DirectionalLight(0xffffff, 1.0);
    dirLight.position.set(5, 10, 7);
    scene.add(dirLight);

    // ---------- Controls setup ----------
    let controls: any = null;
    
    const initControls = async () => {
      try {
        const { OrbitControls } = await import('three/examples/jsm/controls/OrbitControls.js');
        controls = new OrbitControls(camera, canvas);
        controls.enableDamping = true;
        controls.dampingFactor = 0.1;
        controls.screenSpacePanning = false;
        controls.minDistance = 0.5;
        controls.maxDistance = 20;
        controls.target.set(0, 0, 0);
        controls.update();
        
        sceneRef.current.controls = controls;
      } catch (error) {
        console.error('Failed to load OrbitControls:', error);
      }
    };

    // ---------- Resize handler ----------
    const onWindowResize = () => {
      const { clientWidth: w, clientHeight: h } = canvas;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h, false);
    };

    // ---------- Animation loop ----------
    const animate = () => {
      if (controls) {
        controls.update();
      }
      renderer.render(scene, camera);
      sceneRef.current.animationId = requestAnimationFrame(animate);
    };

    // ---------- File loading ----------
    const disposeCurrent = () => {
      if (sceneRef.current.currentModel) {
        scene.remove(sceneRef.current.currentModel);
        sceneRef.current.currentModel.traverse((obj: any) => {
          if (obj.geometry) obj.geometry.dispose();
          if (obj.material) {
            const materials = Array.isArray(obj.material) ? obj.material : [obj.material];
            materials.forEach((mat: any) => {
              if (mat.map) mat.map.dispose();
              mat.dispose();
            });
          }
        });
      }
      if (sceneRef.current.currentURL) {
        URL.revokeObjectURL(sceneRef.current.currentURL);
        sceneRef.current.currentURL = undefined;
      }
      sceneRef.current.currentModel = undefined;
    };

    const guessType = (file: File) => {
      const name = file.name.toLowerCase();
      if (name.endsWith('.obj')) return 'obj';
      if (name.endsWith('.gltf')) return 'gltf';
      if (name.endsWith('.glb')) return 'glb';
      throw new Error('Unsupported file format');
    };

    const loadUserModel = async (file: File) => {
      const type = guessType(file);
      
      sceneRef.current.currentURL = URL.createObjectURL(file);
      let loader: any;

      if (type === 'obj') {
        const { OBJLoader } = await import('three/examples/jsm/loaders/OBJLoader.js');
        loader = new OBJLoader();
      } else {
        const { GLTFLoader } = await import('three/examples/jsm/loaders/GLTFLoader.js');
        loader = new GLTFLoader();
      }

      return new Promise<void>((resolve, reject) => {
        loader.load(
          sceneRef.current.currentURL,
          (obj: any) => {
            sceneRef.current.currentModel = (type === 'obj') ? obj : obj.scene;
            
            // Apply basic materials if needed
            sceneRef.current.currentModel?.traverse((child: any) => {
              if (child instanceof THREE.Mesh) {
                if (!child.material) {
                  child.material = new THREE.MeshLambertMaterial({
                    color: 0x888888,
                    side: THREE.DoubleSide
                  });
                }
              }
            });
            
            scene.add(sceneRef.current.currentModel!);
            centerView();
            resolve();
          },
          (progress: any) => {
            console.log((progress.loaded / progress.total * 100).toFixed(0) + '% loaded');
          },
          (err: any) => reject(err)
        );
      });
    };

    const centerView = () => {
      if (!sceneRef.current.currentModel) return;
      
      const box = new THREE.Box3().setFromObject(sceneRef.current.currentModel);
      const size = box.getSize(new THREE.Vector3()).length();
      const center = box.getCenter(new THREE.Vector3());
      
      if (controls) {
        controls.target.copy(center);
        controls.update();
      }

      // Position camera to frame the object
      const fitOffset = 1.2;
      const fov = THREE.MathUtils.degToRad(camera.fov);
      const dist = size / (2 * Math.tan(fov / 2));
      const dir = new THREE.Vector3()
        .subVectors(camera.position, center)
        .normalize()
        .multiplyScalar(dist * fitOffset);
      
      camera.position.copy(center).add(dir);
      camera.near = size / 100;
      camera.far = size * 100;
      camera.updateProjectionMatrix();
    };

    // Store references
    sceneRef.current = {
      renderer,
      scene,
      camera,
      controls: null,
      currentModel: undefined,
      currentURL: undefined,
      animationId: undefined
    };

    // Initialize
    const init = async () => {
      try {
        onWindowResize();
        window.addEventListener('resize', onWindowResize);
        
        await initControls();
        animate();
        
        disposeCurrent();
        await loadUserModel(file);
        setLoading(false);
        setError(null);
      } catch (err: any) {
        console.error('Failed to load model:', err);
        setError(`Failed to load model: ${err.message || 'Unknown error'}`);
        setLoading(false);
      }
    };

    init();

    // Cleanup function
    return () => {
      if (sceneRef.current.animationId) {
        cancelAnimationFrame(sceneRef.current.animationId);
      }
      window.removeEventListener('resize', onWindowResize);
      disposeCurrent();
      if (sceneRef.current.controls) {
        sceneRef.current.controls.dispose();
      }
      if (sceneRef.current.renderer) {
        sceneRef.current.renderer.dispose();
      }
    };
  }, [file, isClient]);

  if (!isClient) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-900">
        <div className="text-white text-xl">Initializing 3D Engine...</div>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative">
      {/* Loading overlay */}
      {loading && (
        <div className="absolute inset-0 z-10 bg-gray-900/80 flex items-center justify-center">
          <div className="text-white text-xl">Loading {file.name}...</div>
        </div>
      )}
      
      {/* Error overlay */}
      {error && (
        <div className="absolute inset-0 z-10 bg-gray-900/80 flex items-center justify-center">
          <div className="text-center text-white">
            <div className="text-red-400 text-xl mb-4">Error Loading Model</div>
            <div className="text-sm">{error}</div>
          </div>
        </div>
      )}
      


      {/* Three.js Canvas */}
      <canvas
        ref={canvasRef}
        style={{
          width: '100%',
          height: '100%',
          display: 'block'
        }}
      />
    </div>
  );
} 