import { motion } from 'framer-motion';
import { X } from 'lucide-react';

export const FullScreenImage = ({ imageData, caption, onClose }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black flex items-center justify-center"
      data-testid="fullscreen-image"
      onClick={onClose}
    >
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-10 w-12 h-12 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-colors"
        data-testid="fullscreen-close"
        style={{ top: 'calc(env(safe-area-inset-top, 16px) + 16px)' }}
      >
        <X className="w-6 h-6" />
      </button>

      {/* Image */}
      <img
        src={imageData}
        alt={caption || 'Full screen'}
        className="max-w-full max-h-full object-contain"
        onClick={(e) => e.stopPropagation()}
      />

      {/* Caption overlay */}
      {caption && (
        <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
          <p className="text-white font-serif text-lg text-center" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
            {caption}
          </p>
        </div>
      )}
    </motion.div>
  );
};
