"use client";

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import dynamic from 'next/dynamic';
import ClaudeChat from '@/components/ClaudeChat';

interface ModelViewerProps {
  file: File;
  onClose: () => void;
}

// Dynamic component that contains all Three.js logic
const ThreeDViewer = dynamic(
  () => import('@/components/ThreeDViewer'),
  { 
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-white">Loading 3D Engine...</div>
      </div>
    )
  }
);

// Color/Pattern scheme definitions
const colorSchemes = [
  {
    id: 'fire-tiger',
    name: 'BERKLEY Fire Tiger',
    description: 'Green to bright yellow to orange gradient, irregular tiger stripe pattern',
    colors: ['#228B22', '#FFFF00', '#FF8C00']
  },
  {
    id: 'black-silver',
    name: 'BERKLEY Black Silver',
    description: 'silver , black and pink with scale texture',
    colors: ['#C0C0C0', '#000000', '#FFC0CB']
  },
  {
    id: 'chartreuse-pearl',
    name: 'BERKLEY Chartreuse Pearl',
    description: 'Bright yellow-green with pearl iridescent finish',
    colors: ['#7FFF00', '#F0F8FF', '#E6E6FA']
  },
  {
    id: 'emerald-shiner',
    name: 'BERKLEY Emerald Shiner',
    description: 'brown to green to blue gradient, realistic fish scale texture',
    colors: ['#8B4513', '#228B22', '#4169E1']
  }
];

// Lighting presets definitions
const lightingPresets = [
  {
    id: 'sunny-skies',
    name: 'Sunny Skies',
    description: 'Bright, direct sunlight with high contrast shadows',
    emoji: '☀️'
  },
  {
    id: 'cloudy',
    name: 'Cloudy',
    description: 'Diffused, soft lighting with muted colors',
    emoji: '☁️'
  },
  {
    id: 'dawn-dusk',
    name: 'Dawn / Dusk',
    description: 'Warm, golden hour lighting with long shadows',
    emoji: '🌅'
  },
  {
    id: 'heavy-rain-storm',
    name: 'Heavy Rain Storm',
    description: 'Dark, dramatic lighting with high contrast',
    emoji: '⛈️'
  }
];

export default function ModelViewer({ file, onClose }: ModelViewerProps) {
  const [webglSupported, setWebglSupported] = useState(true);
  const [selectedScheme, setSelectedScheme] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting2D, setIsExporting2D] = useState(false);
  const [activeMenu, setActiveMenu] = useState<'color-schemes' | 'laboratory' | 'new-object'>('color-schemes');
  const [expandedLureAttributes, setExpandedLureAttributes] = useState(false);
  const [expandedLightingSimulation, setExpandedLightingSimulation] = useState(false);
  const [expandedPhysicsSimulation, setExpandedPhysicsSimulation] = useState(false);
  const [lightingIntensity, setLightingIntensity] = useState(50);
  const [selectedLightingPreset, setSelectedLightingPreset] = useState<string | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  
  // Add state for tracking current file and 2D preview popup
  const [currentFileName, setCurrentFileName] = useState<string>('');
  const [show2DPreview, setShow2DPreview] = useState(false);
  const [previewImageSrc, setPreviewImageSrc] = useState<string>('');
  
  // Physics simulation states
  const [selectedWaterClarity, setSelectedWaterClarity] = useState<string | null>(null);
  const [selectedWaterTemperature, setSelectedWaterTemperature] = useState<string | null>(null);
  const [selectedDepth, setSelectedDepth] = useState<string | null>(null);
  const [selectedCurrent, setSelectedCurrent] = useState<string | null>(null);
  const [selectedBottomType, setSelectedBottomType] = useState<string | null>(null);
  const [selectedLightPenetration, setSelectedLightPenetration] = useState<string | null>(null);

  useEffect(() => {
    // Check for WebGL support
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (!gl) {
      setWebglSupported(false);
    }
    
    // Set the current file name when component mounts
    setCurrentFileName(file.name);
  }, [file.name]);

  const handleSchemeClick = (schemeId: string, schemeName: string) => {
    setSelectedScheme(schemeId);
    setIsLoading(true);
    
    // Simulate loading process
    setTimeout(() => {
      setIsLoading(false);
      // Here you would implement the actual color application logic
      console.log(`Applied color scheme: ${schemeName}`);
    }, 2000);
  };

  const handleExport2D = () => {
    // Only handle Fire Tiger and Black Silver schemes for now
    if (selectedScheme !== 'fire-tiger' && selectedScheme !== 'black-silver') {
      console.log('2-D export only available for Fire Tiger and Black Silver schemes');
      return;
    }

    setIsExporting2D(true);
    
    // Determine which image to show based on the current file and selected scheme
    let imageSrc = '';
    
    if (selectedScheme === 'fire-tiger') {
      if (currentFileName.includes('flickershad')) {
        imageSrc = '/images/image_db/image_output/flickershad_firetiger_comfy_output.png';
      } else if (currentFileName.includes('hit_stick')) {
        imageSrc = '/images/image_db/image_output/hitstick_firetiger_comfy_output.png';
      }
    } else if (selectedScheme === 'black-silver') {
      if (currentFileName.includes('flickershad')) {
        imageSrc = '/images/image_db/image_output/flickershad_blacksilver.png';
      } else if (currentFileName.includes('hit_stick')) {
        imageSrc = '/images/image_db/image_output/hitstick_blacksilver.png';
      }
    }
    
    if (!imageSrc) {
      console.log('No matching 2D preview found for this file and scheme combination');
      setIsExporting2D(false);
      return;
    }
    
    // Simulate export process
    setTimeout(() => {
      setIsExporting2D(false);
      setPreviewImageSrc(imageSrc);
      setShow2DPreview(true);
    }, 1500);
  };

  const close2DPreview = () => {
    setShow2DPreview(false);
    setPreviewImageSrc('');
  };

  // Generate color map distribution based on selected scheme
  const getColorMapDistribution = () => {
    if (!selectedScheme) {
      // Default distribution for uncolored model
      return [
        { color: '#808080', percentage: 45, name: 'Base Gray' },
        { color: '#A0A0A0', percentage: 30, name: 'Light Gray' },
        { color: '#606060', percentage: 25, name: 'Dark Gray' }
      ];
    }
    
    const scheme = colorSchemes.find(s => s.id === selectedScheme);
    if (!scheme) return [];
    
    // Simulate color distribution based on the selected scheme
    switch (scheme.id) {
      case 'fire-tiger':
        return [
          { color: '#228B22', percentage: 40, name: 'Forest Green' },
          { color: '#FFFF00', percentage: 35, name: 'Bright Yellow' },
          { color: '#FF8C00', percentage: 25, name: 'Dark Orange' }
        ];
      case 'black-silver':
        return [
          { color: '#C0C0C0', percentage: 50, name: 'Silver Base' },
          { color: '#000000', percentage: 30, name: 'Black' },
          { color: '#FFC0CB', percentage: 20, name: 'Pink' }
        ];
      case 'chartreuse-pearl':
        return [
          { color: '#7FFF00', percentage: 60, name: 'Chartreuse' },
          { color: '#F0F8FF', percentage: 25, name: 'Pearl White' },
          { color: '#E6E6FA', percentage: 15, name: 'Lavender Tint' }
        ];
      case 'emerald-shiner':
        return [
          { color: '#228B22', percentage: 40, name: 'Emerald Green' },
          { color: '#8B4513', percentage: 35, name: 'Brown Base' },
          { color: '#4169E1', percentage: 25, name: 'Royal Blue' }
        ];
      default:
        return [];
    }
  };

  if (!webglSupported) {
    return (
      <div className="fixed inset-0 z-50 bg-gray-900 flex items-center justify-center">
        <div className="text-white text-center p-8">
          <h2 className="text-2xl mb-4">WebGL Not Supported</h2>
          <p className="mb-4">Your browser doesn't support WebGL, which is required for 3D viewing.</p>
          <button
            onClick={onClose}
            className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded text-white"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="fixed inset-0 z-50 bg-gray-900 flex"
      >
        {/* Header with file name and close button */}
        <motion.div 
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="absolute top-0 left-0 right-0 z-20 bg-black/80 backdrop-blur-sm p-4 flex justify-between items-center"
        >
          <h2 className="text-white text-lg font-semibold">
            Viewing: {file.name}
          </h2>
          <button
            onClick={onClose}
            className="text-white hover:text-red-400 transition-colors text-2xl font-bold"
          >
            ✕
          </button>
        </motion.div>

        {/* Top Menu Bar */}
        <motion.div
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="absolute top-20 left-0 right-0 z-20 bg-gray-800/90 backdrop-blur-sm border-b border-gray-700"
        >
          <div className="flex">
            {/* Color Schemes Button */}
            <button
              onClick={() => setActiveMenu('color-schemes')}
              className={`flex-1 px-6 py-4 text-white font-medium transition-all duration-300 relative ${
                activeMenu === 'color-schemes' 
                  ? 'bg-blue-600/30 border-b-2 border-blue-400' 
                  : 'hover:bg-gray-700/50'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <span className="text-xl">🎨</span>
                <span>Color Schemes</span>
              </div>
            </button>

            {/* Laboratory Button */}
            <button
              onClick={() => setActiveMenu('laboratory')}
              className={`flex-1 px-6 py-4 text-white font-medium transition-all duration-300 relative ${
                activeMenu === 'laboratory' 
                  ? 'bg-blue-600/30 border-b-2 border-blue-400' 
                  : 'hover:bg-gray-700/50'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <span className="text-xl">🧪</span>
                <span>Laboratory</span>
              </div>
            </button>

            {/* New Object Button */}
            <button
              onClick={() => setActiveMenu('new-object')}
              className={`flex-1 px-6 py-4 text-white font-medium transition-all duration-300 relative ${
                activeMenu === 'new-object' 
                  ? 'bg-blue-600/30 border-b-2 border-blue-400' 
                  : 'hover:bg-gray-700/50'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <span className="text-xl">📦</span>
                <span>New Object</span>
              </div>
            </button>
          </div>
        </motion.div>

        {/* Main Content Area */}
        <div className="flex w-full h-full pt-32">
          {/* 3D Viewer - Reduced width to accommodate sidebar */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="flex-1 relative"
          >
            <ThreeDViewer file={file} />
            
            {/* Controls info - bottom left */}
            <motion.div 
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.7, duration: 0.5 }}
              className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-sm text-white p-3 rounded-lg text-sm"
            >
              <div>🖱️ Drag to rotate</div>
              <div>🔍 Scroll to zoom</div>
              <div>⚪ Right-click to pan</div>
            </motion.div>

            {/* Claude Chat Interface */}
            <ClaudeChat 
              isOpen={isChatOpen} 
              onClose={() => setIsChatOpen(false)} 
            />

            {/* Robot button - bottom right */}
            <motion.button
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.7, duration: 0.5 }}
              onClick={() => setIsChatOpen(!isChatOpen)}
              className="absolute bottom-4 right-4 bg-blue-600/90 hover:bg-blue-700/90 backdrop-blur-sm text-white p-3 rounded-full text-2xl transition-all duration-300 hover:scale-110"
            >
              🤖
            </motion.button>

            {/* Loading overlay when applying color scheme */}
            <AnimatePresence>
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-30"
                >
                  <div className="text-white text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                    <p className="text-lg">
                      Applying {colorSchemes.find(s => s.id === selectedScheme)?.name} now...
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Loading overlay when exporting 2-D */}
            <AnimatePresence>
              {isExporting2D && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-30"
                >
                  <div className="text-white text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-400 mx-auto mb-4"></div>
                    <p className="text-lg">
                      Generating 2-D render...
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Dynamic Sidebar Content */}
          <motion.div
            initial={{ x: 320, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="w-80 bg-gray-800 border-l border-gray-700 flex flex-col"
          >
            {/* Dynamic Sidebar Header */}
            <div className="p-6 border-b border-gray-700">
              {activeMenu === 'color-schemes' && (
                <>
                  <h3 className="text-white text-xl font-bold mb-2">Color Schemes</h3>
                  <p className="text-gray-400 text-sm">
                    Choose a color/pattern preset for your lure
                  </p>
                </>
              )}
              {activeMenu === 'laboratory' && (
                <>
                  <h3 className="text-white text-xl font-bold mb-2">Laboratory</h3>
                  <p className="text-gray-400 text-sm">
                    Advanced tools and experimental features
                  </p>
                </>
              )}
              {activeMenu === 'new-object' && (
                <>
                  <h3 className="text-white text-xl font-bold mb-2">New Object</h3>
                  <p className="text-gray-400 text-sm">
                    Load a different .obj file or create new objects
                  </p>
                </>
              )}
            </div>

            {/* Dynamic Sidebar Content */}
            <div className="flex-1 p-6 space-y-4 overflow-y-auto">
              {/* Color Schemes Content */}
              {activeMenu === 'color-schemes' && (
                <>
                  {colorSchemes.map((scheme, index) => (
                    <motion.button
                      key={scheme.id}
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.6 + index * 0.1, duration: 0.3 }}
                      onClick={() => handleSchemeClick(scheme.id, scheme.name)}
                      disabled={isLoading}
                      className={`w-full p-4 rounded-lg border transition-all duration-300 text-left hover:scale-105 ${
                        selectedScheme === scheme.id
                          ? 'border-blue-500 bg-blue-500/20'
                          : 'border-gray-600 bg-gray-700/50 hover:border-gray-500 hover:bg-gray-700'
                      } ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                    >
                      {/* Color preview swatches */}
                      <div className="flex gap-2 mb-3">
                        {scheme.colors.map((color, colorIndex) => (
                          <div
                            key={colorIndex}
                            className="w-6 h-6 rounded-full border-2 border-white/30"
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                      
                      <h4 className="text-white font-semibold mb-1">{scheme.name}</h4>
                      <p className="text-gray-400 text-sm">{scheme.description}</p>
                      
                      {selectedScheme === scheme.id && (
                        <div className="mt-2 text-blue-400 text-sm font-medium">
                          ✓ Currently Selected
                        </div>
                      )}
                    </motion.button>
                  ))}
                </>
              )}

              {/* Laboratory Content */}
              {activeMenu === 'laboratory' && (
                <div className="space-y-4">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gray-700/50 p-4 rounded-lg border border-gray-600"
                  >
                    <h4 className="text-white font-semibold mb-2 flex items-center gap-2">
                      📊 Lure Attributes
                    </h4>
                    <p className="text-gray-400 text-sm mb-3">View and modify lure properties and specifications</p>
                    <button 
                      onClick={() => setExpandedLureAttributes(!expandedLureAttributes)}
                      className="w-full py-2 px-4 bg-purple-600 hover:bg-purple-700 text-white rounded transition-colors flex items-center justify-center gap-2"
                    >
                      {expandedLureAttributes ? 'Hide Details' : 'View Details'}
                      <span className={`transform transition-transform ${expandedLureAttributes ? 'rotate-180' : ''}`}>▼</span>
                    </button>
                    
                    <AnimatePresence>
                      {expandedLureAttributes && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3 }}
                          className="mt-4 space-y-4 overflow-hidden"
                        >
                          {/* Color Map Distribution */}
                          <div className="bg-gray-800/50 p-3 rounded border border-gray-600">
                            <h5 className="text-white font-medium mb-2 text-sm">2D Color Map Distribution</h5>
                            <div className="space-y-2">
                              {getColorMapDistribution().map((colorData, index) => (
                                <div key={index} className="flex items-center gap-2 text-xs">
                                  <div 
                                    className="w-4 h-4 rounded border border-white/30"
                                    style={{ backgroundColor: colorData.color }}
                                  />
                                  <div className="flex-1">
                                    <div className="flex justify-between text-white">
                                      <span>{colorData.name}</span>
                                      <span>{colorData.percentage}%</span>
                                    </div>
                                    <div className="w-full bg-gray-700 rounded-full h-1 mt-1">
                                      <div 
                                        className="h-1 rounded-full"
                                        style={{ 
                                          width: `${colorData.percentage}%`,
                                          backgroundColor: colorData.color 
                                        }}
                                      />
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Lure Attributes */}
                          <div className="space-y-3 text-xs">
                            {/* Pattern Type */}
                            <div className="bg-gray-800/50 p-3 rounded border border-gray-600">
                              <h6 className="text-white font-medium mb-2">Pattern Type</h6>
                              <div className="text-gray-300 space-y-1">
                                <div>• <span className="text-blue-400">Striping:</span> Linear bands (zebra, tiger)</div>
                                <div>• <span className="text-blue-400">Spots/Dots:</span> Polka-dot, scale-print markings</div>
                                <div>• <span className="text-blue-400">Gradient/Blending:</span> Smooth color transitions</div>
                              </div>
                            </div>

                            {/* Surface Finish */}
                            <div className="bg-gray-800/50 p-3 rounded border border-gray-600">
                              <h6 className="text-white font-medium mb-2">Surface Finish (Texture)</h6>
                              <div className="text-gray-300 space-y-1">
                                <div>• <span className="text-green-400">Matte vs. Glossy:</span> Non-reflective vs. high-sheen coating</div>
                                <div>• <span className="text-green-400">Pearlescent/Holographic:</span> Multi-angle light refraction</div>
                                <div>• <span className="text-green-400">Scale Embossing:</span> 3D molded scale textures</div>
                              </div>
                            </div>

                            {/* Body Shape & Profile */}
                            <div className="bg-gray-800/50 p-3 rounded border border-gray-600">
                              <h6 className="text-white font-medium mb-2">Body Shape & Profile</h6>
                              <div className="text-gray-300 space-y-1">
                                <div>• <span className="text-yellow-400">Silhouette:</span> Minnow, crankbait, topwater, spinnerbait</div>
                                <div>• <span className="text-yellow-400">Cross-Section:</span> Round, flat-sided, bladed</div>
                                <div>• <span className="text-yellow-400">Keel/Ribbing:</span> Raised centerline or angular ribs</div>
                              </div>
                            </div>

                            {/* Size & Weight */}
                            <div className="bg-gray-800/50 p-3 rounded border border-gray-600">
                              <h6 className="text-white font-medium mb-2">Size & Weight</h6>
                              <div className="text-gray-300 space-y-1">
                                <div>• <span className="text-orange-400">Length:</span> 3″ (inches/millimeters)</div>
                                <div>• <span className="text-orange-400">Mass:</span> ⅜ oz (ounces/grams)</div>
                              </div>
                            </div>

                            {/* Bait Category */}
                            <div className="bg-gray-800/50 p-3 rounded border border-gray-600">
                              <h6 className="text-white font-medium mb-2">Bait Category (Lure Class)</h6>
                              <div className="text-gray-300 space-y-1">
                                <div>• <span className="text-red-400">Hard Bait:</span> Crankbaits, jerkbaits, topwaters</div>
                                <div>• <span className="text-red-400">Soft Plastic:</span> Worms, grubs, swimbaits</div>
                                <div>• <span className="text-red-400">Jig:</span> Bucktail, skirted, finesse</div>
                                <div>• <span className="text-red-400">Blade/Metal:</span> Spoons, vibration blades</div>
                              </div>
                            </div>

                            {/* Action & Performance */}
                            <div className="bg-gray-800/50 p-3 rounded border border-gray-600">
                              <h6 className="text-white font-medium mb-2">Action & Performance</h6>
                              <div className="text-gray-300 space-y-1">
                                <div>• <span className="text-purple-400">Diving Depth:</span> Floating, shallow (0–3 ft), deep (10+ ft)</div>
                                <div>• <span className="text-purple-400">Swimming Action:</span> Tight wiggle, wide wobble, shimmy</div>
                                <div>• <span className="text-purple-400">Retrieval Sensitivity:</span> Slow-roll vs. fast twitch</div>
                              </div>
                            </div>

                            {/* Buoyancy Class */}
                            <div className="bg-gray-800/50 p-3 rounded border border-gray-600">
                              <h6 className="text-white font-medium mb-2">Buoyancy Class</h6>
                              <div className="text-gray-300 space-y-1">
                                <div>• <span className="text-cyan-400">Floating:</span> Rises on pause</div>
                                <div>• <span className="text-cyan-400">Suspending:</span> Holds depth when paused</div>
                                <div>• <span className="text-cyan-400">Sinking:</span> Slowly or quickly sinks</div>
                              </div>
                            </div>

                            {/* Hardware & Rigging */}
                            <div className="bg-gray-800/50 p-3 rounded border border-gray-600">
                              <h6 className="text-white font-medium mb-2">Hardware & Rigging</h6>
                              <div className="text-gray-300 space-y-1">
                                <div>• <span className="text-pink-400">Hook Configuration:</span> Single vs. treble, hook size</div>
                                <div>• <span className="text-pink-400">Split Rings & Eyelets:</span> Gauge and placement</div>
                                <div>• <span className="text-pink-400">Trailer Hook or Skirt:</span> Additional hookup ratio</div>
                              </div>
                            </div>

                            {/* Special Features */}
                            <div className="bg-gray-800/50 p-3 rounded border border-gray-600">
                              <h6 className="text-white font-medium mb-2">Special Features</h6>
                              <div className="text-gray-300 space-y-1">
                                <div>• <span className="text-indigo-400">Rattles & Chambers:</span> Built-in sound attractors</div>
                                <div>• <span className="text-indigo-400">Glow/UV Paint:</span> Phosphorescent or UV-reactive</div>
                                <div>• <span className="text-indigo-400">Scent Infusion:</span> Canister or porous material</div>
                              </div>
                            </div>

                            {/* Material Composition */}
                            <div className="bg-gray-800/50 p-3 rounded border border-gray-600">
                              <h6 className="text-white font-medium mb-2">Material Composition</h6>
                              <div className="text-gray-300 space-y-1">
                                <div>• <span className="text-teal-400">Plastic/Resin:</span> ABS, PVC, soft elastomer</div>
                                <div>• <span className="text-teal-400">Metal:</span> Stainless steel, brass, zinc alloy</div>
                                <div>• <span className="text-teal-400">Composite:</span> Wood cores with outer shell</div>
                              </div>
                            </div>

                            {/* Intended Target & Application */}
                            <div className="bg-gray-800/50 p-3 rounded border border-gray-600">
                              <h6 className="text-white font-medium mb-2">Intended Target & Application</h6>
                              <div className="text-gray-300 space-y-1">
                                <div>• <span className="text-emerald-400">Species Focus:</span> Bass, trout, pike, saltwater predators</div>
                                <div>• <span className="text-emerald-400">Habitat Use:</span> Open water, structure, weeds, rocky cover</div>
                              </div>
                            </div>

                            {/* Model Identifier & Branding */}
                            <div className="bg-gray-800/50 p-3 rounded border border-gray-600">
                              <h6 className="text-white font-medium mb-2">Model Identifier & Branding</h6>
                              <div className="text-gray-300 space-y-1">
                                <div>• <span className="text-amber-400">Series Name & SKU:</span> Manufacturer's product code</div>
                                <div>• <span className="text-amber-400">Edition/Variation:</span> Standard, pro series, signature edition</div>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                  
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-gray-700/50 p-4 rounded-lg border border-gray-600"
                  >
                    <h4 className="text-white font-semibold mb-2 flex items-center gap-2">
                      🔬 Lighting Simulation
                    </h4>
                    <p className="text-gray-400 text-sm mb-3">Adjust lighting intensity, color, and position</p>
                    <button 
                      onClick={() => setExpandedLightingSimulation(!expandedLightingSimulation)}
                      className="w-full py-2 px-4 bg-purple-600 hover:bg-purple-700 text-white rounded transition-colors flex items-center justify-center gap-2"
                    >
                      {expandedLightingSimulation ? 'Hide Controls' : 'Show Controls'}
                      <span className={`transform transition-transform ${expandedLightingSimulation ? 'rotate-180' : ''}`}>▼</span>
                    </button>
                    
                    <AnimatePresence>
                      {expandedLightingSimulation && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3 }}
                          className="mt-4 space-y-4 overflow-hidden"
                        >
                          {/* Lighting Intensity Slider */}
                          <div className="bg-gray-800/50 p-3 rounded border border-gray-600">
                            <h5 className="text-white font-medium mb-3 text-sm flex items-center gap-2">
                              💡 Lighting Intensity
                            </h5>
                            <div className="space-y-2">
                              <div className="flex justify-between text-xs text-gray-300">
                                <span>Dark</span>
                                <span>{lightingIntensity}%</span>
                                <span>Bright</span>
                              </div>
                              <input
                                type="range"
                                min="0"
                                max="100"
                                value={lightingIntensity}
                                onChange={(e) => setLightingIntensity(Number(e.target.value))}
                                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                                style={{
                                  background: `linear-gradient(to right, #4F46E5 0%, #4F46E5 ${lightingIntensity}%, #374151 ${lightingIntensity}%, #374151 100%)`
                                }}
                              />
                            </div>
                          </div>

                          {/* Lighting Presets */}
                          <div className="bg-gray-800/50 p-3 rounded border border-gray-600">
                            <h5 className="text-white font-medium mb-3 text-sm flex items-center gap-2">
                              🌤️ Lighting Scenarios
                            </h5>
                            <div className="grid grid-cols-2 gap-2">
                              {lightingPresets.map((preset) => (
                                <button
                                  key={preset.id}
                                  onClick={() => setSelectedLightingPreset(preset.id)}
                                  className={`p-2 rounded-lg text-xs transition-all duration-200 ${
                                    selectedLightingPreset === preset.id
                                      ? 'bg-purple-600 text-white border border-purple-400'
                                      : 'bg-gray-700 text-gray-300 border border-gray-600 hover:bg-gray-600'
                                  }`}
                                >
                                  <div className="flex flex-col items-center gap-1">
                                    <span className="text-lg">{preset.emoji}</span>
                                    <span className="font-medium">{preset.name}</span>
                                  </div>
                                </button>
                              ))}
                            </div>
                            {selectedLightingPreset && (
                              <div className="mt-3 p-2 bg-gray-900/50 rounded text-xs text-gray-300">
                                {lightingPresets.find(p => p.id === selectedLightingPreset)?.description}
                              </div>
                            )}
                          </div>

                          {/* Apply Lighting Button */}
                          <button
                            onClick={() => {
                              console.log(`Applying lighting: ${selectedLightingPreset} with intensity ${lightingIntensity}%`);
                              // Here you would implement the actual lighting application logic
                            }}
                            disabled={!selectedLightingPreset}
                            className={`w-full py-2 px-4 rounded transition-colors text-sm font-medium ${
                              selectedLightingPreset
                                ? 'bg-purple-600 hover:bg-purple-700 text-white'
                                : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                            }`}
                          >
                            Apply Lighting Settings
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                  
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-gray-700/50 p-4 rounded-lg border border-gray-600"
                  >
                    <h4 className="text-white font-semibold mb-2 flex items-center gap-2">
                      🌊 Physics Simulation
                    </h4>
                    <p className="text-gray-400 text-sm mb-3">Test lure behavior in water</p>
                    <button 
                      onClick={() => setExpandedPhysicsSimulation(!expandedPhysicsSimulation)}
                      className="w-full py-2 px-4 bg-purple-600 hover:bg-purple-700 text-white rounded transition-colors flex items-center justify-center gap-2"
                    >
                      {expandedPhysicsSimulation ? 'Hide Controls' : 'Show Controls'}
                      <span className={`transform transition-transform ${expandedPhysicsSimulation ? 'rotate-180' : ''}`}>▼</span>
                    </button>
                    
                    <AnimatePresence>
                      {expandedPhysicsSimulation && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3 }}
                          className="mt-4 space-y-4 overflow-hidden"
                        >
                          {/* Water Clarity */}
                          <div className="bg-gray-800/50 p-3 rounded border border-gray-600">
                            <h5 className="text-white font-medium mb-3 text-sm flex items-center gap-2">
                              💧 Water Clarity
                            </h5>
                            <div className="grid grid-cols-2 gap-2">
                              {[
                                { id: 'clear', name: 'Clear' },
                                { id: 'murky', name: 'Murky' },
                                { id: 'moderately-stained', name: 'Moderately Stained' },
                                { id: 'muddy', name: 'Muddy' }
                              ].map((option) => (
                                <button
                                  key={option.id}
                                  onClick={() => setSelectedWaterClarity(option.id)}
                                  className={`p-2 rounded-lg text-xs transition-all duration-200 ${
                                    selectedWaterClarity === option.id
                                      ? 'bg-blue-600 text-white border border-blue-400'
                                      : 'bg-gray-700 text-gray-300 border border-gray-600 hover:bg-gray-600'
                                  }`}
                                >
                                  {option.name}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Water Temperature */}
                          <div className="bg-gray-800/50 p-3 rounded border border-gray-600">
                            <h5 className="text-white font-medium mb-3 text-sm flex items-center gap-2">
                              🌡️ Water Temperature
                            </h5>
                            <div className="grid grid-cols-1 gap-2">
                              {[
                                { id: 'cold', name: 'Cold Water (<55°F)' },
                                { id: 'warm', name: 'Warm Water (>70°F)' }
                              ].map((option) => (
                                <button
                                  key={option.id}
                                  onClick={() => setSelectedWaterTemperature(option.id)}
                                  className={`p-2 rounded-lg text-xs transition-all duration-200 ${
                                    selectedWaterTemperature === option.id
                                      ? 'bg-red-600 text-white border border-red-400'
                                      : 'bg-gray-700 text-gray-300 border border-gray-600 hover:bg-gray-600'
                                  }`}
                                >
                                  {option.name}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Depth & Thermocline */}
                          <div className="bg-gray-800/50 p-3 rounded border border-gray-600">
                            <h5 className="text-white font-medium mb-3 text-sm flex items-center gap-2">
                              📏 Depth & Thermocline
                            </h5>
                            <div className="grid grid-cols-1 gap-2">
                              {[
                                { id: 'shallow', name: 'Shallow (0-5 ft)' },
                                { id: 'mid-depth', name: 'Mid-depth (6-15 ft)' },
                                { id: 'deep', name: 'Deep (>15 ft)' }
                              ].map((option) => (
                                <button
                                  key={option.id}
                                  onClick={() => setSelectedDepth(option.id)}
                                  className={`p-2 rounded-lg text-xs transition-all duration-200 ${
                                    selectedDepth === option.id
                                      ? 'bg-green-600 text-white border border-green-400'
                                      : 'bg-gray-700 text-gray-300 border border-gray-600 hover:bg-gray-600'
                                  }`}
                                >
                                  {option.name}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Current and Flow */}
                          <div className="bg-gray-800/50 p-3 rounded border border-gray-600">
                            <h5 className="text-white font-medium mb-3 text-sm flex items-center gap-2">
                              🌊 Current and Flow
                            </h5>
                            <div className="grid grid-cols-1 gap-2">
                              {[
                                { id: 'still-slow', name: 'Still or Slow' },
                                { id: 'moderate-fast', name: 'Moderate to Fast Flow' },
                                { id: 'tidal', name: 'Tidal Pull' }
                              ].map((option) => (
                                <button
                                  key={option.id}
                                  onClick={() => setSelectedCurrent(option.id)}
                                  className={`p-2 rounded-lg text-xs transition-all duration-200 ${
                                    selectedCurrent === option.id
                                      ? 'bg-cyan-600 text-white border border-cyan-400'
                                      : 'bg-gray-700 text-gray-300 border border-gray-600 hover:bg-gray-600'
                                  }`}
                                >
                                  {option.name}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Bottom Floor Type */}
                          <div className="bg-gray-800/50 p-3 rounded border border-gray-600">
                            <h5 className="text-white font-medium mb-3 text-sm flex items-center gap-2">
                              🪨 Bottom Floor Type
                            </h5>
                            <div className="grid grid-cols-2 gap-2">
                              {[
                                { id: 'rocky-gravel', name: 'Rocky/Gravel Bottom' },
                                { id: 'wood-brush', name: 'Wood/Brush Piles' },
                                { id: 'vegetation', name: 'Vegetation' },
                                { id: 'sand', name: 'Open Flat Sand' }
                              ].map((option) => (
                                <button
                                  key={option.id}
                                  onClick={() => setSelectedBottomType(option.id)}
                                  className={`p-2 rounded-lg text-xs transition-all duration-200 ${
                                    selectedBottomType === option.id
                                      ? 'bg-yellow-600 text-white border border-yellow-400'
                                      : 'bg-gray-700 text-gray-300 border border-gray-600 hover:bg-gray-600'
                                  }`}
                                >
                                  {option.name}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Light Penetration & Shade */}
                          <div className="bg-gray-800/50 p-3 rounded border border-gray-600">
                            <h5 className="text-white font-medium mb-3 text-sm flex items-center gap-2">
                              ☀️ Light Penetration & Shade
                            </h5>
                            <div className="grid grid-cols-1 gap-2">
                              {[
                                { id: 'high-light', name: 'High Light' },
                                { id: 'low-light', name: 'Low Light' },
                                { id: 'import-preset', name: 'Import Previous Lighting Preset' }
                              ].map((option) => (
                                <button
                                  key={option.id}
                                  onClick={() => setSelectedLightPenetration(option.id)}
                                  className={`p-2 rounded-lg text-xs transition-all duration-200 ${
                                    selectedLightPenetration === option.id
                                      ? 'bg-orange-600 text-white border border-orange-400'
                                      : 'bg-gray-700 text-gray-300 border border-gray-600 hover:bg-gray-600'
                                  }`}
                                >
                                  {option.name}
                                </button>
                              ))}
                            </div>
                            {selectedLightPenetration === 'import-preset' && selectedLightingPreset && (
                              <div className="mt-2 p-2 bg-gray-900/50 rounded text-xs text-gray-300">
                                Using preset: {lightingPresets.find(p => p.id === selectedLightingPreset)?.name}
                              </div>
                            )}
                          </div>

                          {/* Apply Physics Simulation Button */}
                          <button
                            onClick={() => {
                              console.log('Physics simulation settings:', {
                                waterClarity: selectedWaterClarity,
                                waterTemperature: selectedWaterTemperature,
                                depth: selectedDepth,
                                current: selectedCurrent,
                                bottomType: selectedBottomType,
                                lightPenetration: selectedLightPenetration
                              });
                              // Here you would implement the actual physics simulation logic
                            }}
                            disabled={!selectedWaterClarity || !selectedWaterTemperature || !selectedDepth || !selectedCurrent || !selectedBottomType || !selectedLightPenetration}
                            className={`w-full py-2 px-4 rounded transition-colors text-sm font-medium ${
                              selectedWaterClarity && selectedWaterTemperature && selectedDepth && selectedCurrent && selectedBottomType && selectedLightPenetration
                                ? 'bg-purple-600 hover:bg-purple-700 text-white'
                                : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                            }`}
                          >
                            Run Physics Simulation
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                  
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-gray-700/50 p-4 rounded-lg border border-gray-600"
                  >
                    <h4 className="text-white font-semibold mb-2 flex items-center gap-2">
                      ⚗️ Natural Language Editor
                    </h4>
                    <p className="text-gray-400 text-sm mb-3">Simply type in what you want to change and it will be applied via SDXL model</p>
                    <button className="w-full py-2 px-4 bg-purple-600 hover:bg-purple-700 text-white rounded transition-colors">
                      Coming Soon
                    </button>
                  </motion.div>
                </div>
              )}

              {/* New Object Content */}
              {activeMenu === 'new-object' && (
                <div className="space-y-4">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gray-700/50 p-4 rounded-lg border border-gray-600"
                  >
                    <h4 className="text-white font-semibold mb-2 flex items-center gap-2">
                      📁 Load New File
                    </h4>
                    <p className="text-gray-400 text-sm mb-3">Upload a different .obj file</p>
                    <button className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors">
                      Browse Files
                    </button>
                  </motion.div>
                  
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-gray-700/50 p-4 rounded-lg border border-gray-600"
                  >
                    <h4 className="text-white font-semibold mb-2 flex items-center gap-2">
                      🏗️ 3D Builder
                    </h4>
                    <p className="text-gray-400 text-sm mb-3">Create lures from scratch via Blender-MCP with python automation</p>
                    <button className="w-full py-2 px-4 bg-orange-600 hover:bg-orange-700 text-white rounded transition-colors">
                      Coming Soon
                    </button>
                  </motion.div>
                  
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-gray-700/50 p-4 rounded-lg border border-gray-600"
                  >
                    <h4 className="text-white font-semibold mb-2 flex items-center gap-2">
                      📚 Template Library
                    </h4>
                    <p className="text-gray-400 text-sm mb-3">Choose from pre-made lure templates</p>
                    <button className="w-full py-2 px-4 bg-green-600 hover:bg-green-700 text-white rounded transition-colors">
                      Browse Templates
                    </button>
                  </motion.div>
                </div>
              )}
            </div>

            {/* Dynamic Footer Content */}
            {activeMenu === 'color-schemes' && (
              <>
                {/* Current Selection Display */}
                <div className="px-6 pb-4">
                  <p className="text-gray-300 text-sm mb-2">
                    Current color selected: {selectedScheme ? colorSchemes.find(s => s.id === selectedScheme)?.name || 'None' : 'None'}
                  </p>
                  {selectedScheme !== 'fire-tiger' && selectedScheme !== 'black-silver' && (
                    <p className="text-yellow-400 text-xs">
                      💡 2D Export is currently only available for BERKLEY Fire Tiger and Black Silver color schemes
                    </p>
                  )}
                </div>

                {/* Export 2-D Button */}
                <div className="px-6 pb-4">
                  <button
                    onClick={handleExport2D}
                    disabled={isLoading || isExporting2D || (selectedScheme !== 'fire-tiger' && selectedScheme !== 'black-silver')}
                    className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-300 ${
                      selectedScheme !== 'fire-tiger' && selectedScheme !== 'black-silver'
                        ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                        : isExporting2D
                        ? 'bg-green-600 text-white cursor-not-allowed'
                        : 'bg-green-600 hover:bg-green-700 text-white hover:scale-105'
                    }`}
                  >
                    {isExporting2D ? 'Generating 2-D Render...' : 'Export 2-D'}
                  </button>
                </div>
              </>
            )}

            {/* Sidebar Footer */}
            <div className="p-6 border-t border-gray-700">
              {activeMenu === 'color-schemes' && (
                <p className="text-gray-400 text-xs text-center">
                  More color schemes coming soon
                </p>
              )}
              {activeMenu === 'laboratory' && (
                <p className="text-gray-400 text-xs text-center">
                  Advanced features in development
                </p>
              )}
              {activeMenu === 'new-object' && (
                <p className="text-gray-400 text-xs text-center">
                  More object tools coming soon
                </p>
              )}
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* 2D Preview Popup Overlay */}
      <AnimatePresence>
        {show2DPreview && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/80 flex items-center justify-center p-4"
            onClick={close2DPreview}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="relative bg-gray-800 rounded-lg p-6 max-w-4xl max-h-[90vh] overflow-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close button */}
              <button
                onClick={close2DPreview}
                className="absolute top-4 right-4 w-8 h-8 bg-red-600 hover:bg-red-700 text-white rounded-full flex items-center justify-center text-lg font-bold transition-colors z-10"
              >
                ×
              </button>
              
              {/* Title */}
              <div className="mb-4">
                <h3 className="text-white text-xl font-semibold">
                  2D Preview - {colorSchemes.find(s => s.id === selectedScheme)?.name || 'Unknown Scheme'}
                </h3>
                <p className="text-gray-400 text-sm">
                  {currentFileName.includes('flickershad') ? 'Flickershad' : 'Hit Stick'} with {colorSchemes.find(s => s.id === selectedScheme)?.name || 'Unknown Scheme'}
                </p>
              </div>
              
              {/* Image */}
              <div className="flex justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={previewImageSrc}
                  alt="2D Fire Tiger Preview"
                  className="max-w-full max-h-[70vh] object-contain rounded-lg border border-gray-600"
                  onError={(e) => {
                    console.error('Failed to load preview image:', previewImageSrc);
                    (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iIzMzMzMzMyIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmaWxsPSIjY2NjY2NjIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+SW1hZ2UgTm90IEZvdW5kPC90ZXh0Pjwvc3ZnPg==';
                  }}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </AnimatePresence>
  );
} 