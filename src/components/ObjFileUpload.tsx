"use client";

import React, { useRef } from "react";
import { Button } from "@/components/UI/button";

interface ObjFileUploadProps {
  onFileChange: (file: File | null) => void;
}

export default function ObjFileUpload({ onFileChange }: ObjFileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileChange(file);
    }
  };

  return (
    <>
      <Button
        variant="outline"
        size="lg"
        className="bg-white text-black hover:bg-gray-200 border-2 border-white px-8 py-3 text-base font-semibold"
        onClick={handleButtonClick}
      >
        UPLOAD .OBJ FILE
      </Button>
      <input
        type="file"
        accept=".obj"
        onChange={handleFileChange}
        className="hidden"
        ref={fileInputRef}
      />
    </>
  );
} 