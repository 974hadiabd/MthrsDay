import { useState, useEffect } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { getTimeline } from '../utils/storage';

export const PresentMode = ({ onClose }) => {
  const [items, setItems] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [expandedCaption, setExpandedCaption] = useState(false);

  useEffect(() => {
    // Filter items that have images
    const timeline = getTimeline().filter(item => item.image);
    setItems(timeline);
  }, []);

  const x = useMotionValue(0);
  const opacity = useTransform(x, [-200, 0, 200], [0.5, 1, 0.5]);

  const handleDragEnd = (event, info) => {
    if (Math.abs(info.offset.x) > 80) {
      if (info.offset.x > 0 && currentIndex > 0) {
        setCurrentIndex(currentIndex - 1);
        setExpandedCaption(false);
      } else if (info.offset.x < 0 && currentIndex < items.length - 1) {
        setCurrentIndex(currentIndex + 1);
        setExpandedCaption(false);
      }
    }
  };

  const goNext = () => {
    if (currentIndex < items.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setExpandedCaption(false);
    }
  };

  const goPrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setExpandedCaption(false);
    }
  };

  const currentItem = items[currentIndex];
  const captionLength = currentItem?.caption?.length || 0;
  const isLongCaption = captionLength > 80;
  const truncatedCaption = isLongCaption && !expandedCaption
    ? currentItem.caption.substring(0, 80) + '...'
    : currentItem?.caption;

  if (items.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center"
        data-testid="present-mode-empty"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-12 h-12 bg-white/10 rounded-full flex items-center justify-center text-white"
          style={{ top: 'calc(env(safe-area-inset-top, 16px) + 16px)' }}
        >
          <X className="w-6 h-6" />
        </button>
        <p className="text-white/60 font-sans text-sm">No photos to present</p>
        <p className="text-white/40 font-sans text-xs mt-2">Add photos in editor mode first</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black flex flex-col"
      data-testid="present-mode"
    >
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-10 w-12 h-12 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-colors"
        data-testid="present-close"
        style={{ top: 'calc(env(safe-area-inset-top, 16px) + 16px)' }}
      >
        <X className="w-6 h-6" />
      </button>

      {/* Progress dots */}
      <div 
        className="absolute top-4 left-1/2 -translate-x-1/2 z-10 flex gap-1.5"
        style={{ top: 'calc(env(safe-area-inset-top, 16px) + 16px)' }}
      >
        {items.map((_, i) => (
          <div
            key={i}
            className={`h-1 rounded-full transition-all duration-300 ${
              i === currentIndex ? 'w-6 bg-white' : 'w-1.5 bg-white/40'
            }`}
          />
        ))}
      </div>

      {/* Main image area */}
      <div className="flex-1 relative overflow-hidden">
        <AnimatePresence mode="popLayout">
          <motion.div
            key={currentIndex}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.3}
            onDragEnd={handleDragEnd}
            style={{ x, opacity }}
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="absolute inset-0 flex items-center justify-center cursor-grab active:cursor-grabbing"
            data-testid={`present-slide-${currentIndex}`}
          >
            <img
              src={currentItem.image}
              alt={currentItem.caption}
              className="max-w-full max-h-full object-contain"
              draggable={false}
            />
          </motion.div>
        </AnimatePresence>

        {/* Navigation arrows */}
        <button
          onClick={goPrev}
          disabled={currentIndex === 0}
          data-testid="present-prev"
          className={`absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center text-white transition-opacity ${
            currentIndex === 0 ? 'opacity-30 cursor-not-allowed' : 'hover:bg-white/20'
          }`}
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button
          onClick={goNext}
          disabled={currentIndex === items.length - 1}
          data-testid="present-next"
          className={`absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center text-white transition-opacity ${
            currentIndex === items.length - 1 ? 'opacity-30 cursor-not-allowed' : 'hover:bg-white/20'
          }`}
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>

      {/* Caption area */}
      <motion.div
        className="bg-gradient-to-t from-black via-black/90 to-transparent px-6 pt-8 pb-6"
        style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 24px)' }}
        layout
      >
        <p className="font-serif text-white text-lg text-center leading-relaxed" style={{ fontFamily: "'Cairo', 'Cormorant Garamond', serif" }}>
          {truncatedCaption}
        </p>
        {isLongCaption && (
          <button
            onClick={() => setExpandedCaption(!expandedCaption)}
            className="block mx-auto mt-3 text-white/60 font-sans text-sm underline"
            data-testid="read-more-caption"
          >
            {expandedCaption ? 'Show less' : 'Read more'}
          </button>
        )}
        <p className="text-white/40 font-sans text-xs text-center mt-4">
          {currentIndex + 1} of {items.length}
        </p>
      </motion.div>
    </motion.div>
  );
};
