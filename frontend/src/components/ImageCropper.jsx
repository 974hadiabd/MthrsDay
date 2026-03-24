import { useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { X, ZoomIn, ZoomOut, Move } from 'lucide-react';

export const ImageCropper = ({ imageData, onSave, onCancel }) => {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef(null);
  const startPosRef = useRef({ x: 0, y: 0 });

  const handleMouseDown = (e) => {
    setIsDragging(true);
    startPosRef.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y
    };
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - startPosRef.current.x,
      y: e.clientY - startPosRef.current.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e) => {
    const touch = e.touches[0];
    setIsDragging(true);
    startPosRef.current = {
      x: touch.clientX - position.x,
      y: touch.clientY - position.y
    };
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;
    const touch = e.touches[0];
    setPosition({
      x: touch.clientX - startPosRef.current.x,
      y: touch.clientY - startPosRef.current.y
    });
  };

  const handleSave = () => {
    // Create a canvas to crop the image
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      // Output size (aspect ratio 16:9)
      const outputWidth = 800;
      const outputHeight = 450;
      canvas.width = outputWidth;
      canvas.height = outputHeight;

      // Calculate the visible portion
      const containerWidth = 300;
      const containerHeight = 169; // 16:9 aspect
      
      const scaleRatio = outputWidth / containerWidth;
      
      // Draw the image with the current transform
      const imgWidth = img.width * scale * (containerWidth / Math.max(img.width, img.height));
      const imgHeight = img.height * scale * (containerWidth / Math.max(img.width, img.height));
      
      const drawX = position.x * scaleRatio;
      const drawY = position.y * scaleRatio;
      const drawWidth = imgWidth * scaleRatio;
      const drawHeight = imgHeight * scaleRatio;

      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, outputWidth, outputHeight);
      ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);

      // Convert to compressed JPEG
      const croppedData = canvas.toDataURL('image/jpeg', 0.7);
      onSave(croppedData, { scale, position });
    };
    
    img.src = imageData;
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/90 flex flex-col items-center justify-center p-4"
      data-testid="image-cropper"
    >
      <div className="text-white text-center mb-4">
        <p className="font-sans text-sm flex items-center justify-center gap-2">
          <Move className="w-4 h-4" /> Drag to position
        </p>
      </div>

      {/* Crop area */}
      <div
        ref={containerRef}
        className="relative w-[300px] h-[169px] overflow-hidden bg-black border-2 border-white/30 rounded-lg"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleMouseUp}
        style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
      >
        <img
          src={imageData}
          alt="Crop preview"
          className="absolute max-w-none pointer-events-none"
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
            transformOrigin: 'top left',
            width: '300px',
            height: 'auto'
          }}
          draggable={false}
        />
        
        {/* Grid overlay */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 border border-white/20" />
          <div className="absolute left-1/3 top-0 bottom-0 w-px bg-white/20" />
          <div className="absolute left-2/3 top-0 bottom-0 w-px bg-white/20" />
          <div className="absolute top-1/3 left-0 right-0 h-px bg-white/20" />
          <div className="absolute top-2/3 left-0 right-0 h-px bg-white/20" />
        </div>
      </div>

      {/* Zoom controls */}
      <div className="flex items-center gap-4 mt-6">
        <button
          onClick={() => setScale(Math.max(0.5, scale - 0.1))}
          className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center text-white"
          data-testid="zoom-out"
        >
          <ZoomOut className="w-5 h-5" />
        </button>
        <span className="text-white font-sans text-sm w-16 text-center">
          {Math.round(scale * 100)}%
        </span>
        <button
          onClick={() => setScale(Math.min(3, scale + 0.1))}
          className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center text-white"
          data-testid="zoom-in"
        >
          <ZoomIn className="w-5 h-5" />
        </button>
      </div>

      {/* Action buttons */}
      <div className="flex gap-4 mt-8">
        <button
          onClick={onCancel}
          className="px-6 py-3 bg-white/10 text-white rounded-full font-sans text-sm"
          data-testid="crop-cancel"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          className="px-6 py-3 bg-alive-accent text-white rounded-full font-sans text-sm"
          data-testid="crop-save"
        >
          Save
        </button>
      </div>
    </motion.div>
  );
};
