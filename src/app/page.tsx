"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ObjFileUpload from "@/components/ObjFileUpload";
import dynamic from 'next/dynamic';

const ModelViewer = dynamic(() => import('@/components/ModelViewer'), {
  ssr: false,
  loading: () => (
    <div className="fixed inset-0 z-50 bg-gray-900 flex items-center justify-center">
      <div className="text-white text-xl">Loading 3D Viewer...</div>
    </div>
  ),
});

export default function WelcomePage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showViewer, setShowViewer] = useState(false);

  const handleFileChange = (file: File | null) => {
    setSelectedFile(file);
    if (file) {
      console.log("Selected file:", file.name);
      // Delay showing the viewer to allow for the "Selected file" message to appear
      setTimeout(() => {
        setShowViewer(true);
      }, 1000);
    }
  };

  const handleCloseViewer = () => {
    setShowViewer(false);
    setSelectedFile(null);
  };

  return (
    <>
      <AnimatePresence mode="wait">
        {!showViewer ? (
          <motion.div
            key="homepage"
            initial={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="relative min-h-screen w-full flex flex-col items-center justify-center overflow-hidden"
          >
            {/* Background Image */}
            <div className="absolute inset-0 -z-10 bg-cover bg-center bg-no-repeat" style={{backgroundImage: "url('/images/image_db/assets/dynamic_lure_welcome.png')"}}>
              <div className="absolute inset-0 bg-black/20"></div>
            </div>

            {/* Centered Content Box */}
            <main className="flex flex-col items-center justify-center p-4">
              <motion.div 
                initial={{ y: 0 }}
                animate={{ 
                  y: selectedFile ? -20 : 0,
                  scale: selectedFile ? 0.98 : 1 
                }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="bg-black/70 backdrop-blur-md text-white p-6 md:p-10 rounded-lg shadow-2xl max-w-xl md:max-w-2xl lg:max-w-3xl text-center"
              >
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold uppercase tracking-wider mb-6">
                  DYNAMIC IMAGE SYNTHESIS
                </h1>
                <p className="text-sm sm:text-base md:text-lg mb-8 leading-relaxed">
                  Welcome to Pure Fishing AI Lure Designer — simply click &quot;Upload .obj file&quot; and pick your fishing lure prototype to generate a photo realistic, custom-colored lure ... 
                  no design software required.
                </p>
                <div className="flex justify-center items-center">
                  <ObjFileUpload onFileChange={handleFileChange} />
                </div>
                <AnimatePresence>
                  {selectedFile && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.3 }}
                      className="mt-4 text-sm text-gray-300"
                    >
                      Selected file: {selectedFile.name}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </main>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {/* 3D Model Viewer */}
      {showViewer && selectedFile && (
        <ModelViewer file={selectedFile} onClose={handleCloseViewer} />
      )}
    </>
  )
}
