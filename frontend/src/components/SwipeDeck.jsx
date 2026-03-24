import { useState, useEffect } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { Heart, ChevronLeft, ChevronRight } from 'lucide-react';
import { getReasons } from '../utils/storage';

export const SwipeDeck = () => {
  const [reasons, setReasons] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    setReasons(getReasons());
  }, []);

  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-15, 15]);
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0, 1, 1, 1, 0]);

  const handleDragEnd = (event, info) => {
    if (Math.abs(info.offset.x) > 100) {
      if (info.offset.x > 0 && currentIndex > 0) {
        setCurrentIndex(currentIndex - 1);
      } else if (info.offset.x < 0 && currentIndex < reasons.length - 1) {
        setCurrentIndex(currentIndex + 1);
      }
    }
  };

  const goNext = () => {
    if (currentIndex < reasons.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const goPrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  if (reasons.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-8" data-testid="reasons-empty">
        <div className="w-20 h-20 rounded-full bg-alive-surface border border-alive-border flex items-center justify-center mb-6">
          <Heart className="w-8 h-8 text-alive-accent" />
        </div>
        <h2 className="font-serif text-2xl text-alive-text-primary mb-3">No reasons yet</h2>
        <p className="font-sans text-sm text-alive-text-muted text-center leading-relaxed">
          The editor hasn't added any reasons why yet.
          <br />
          Check back soon.
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 pb-8" data-testid="swipe-deck">
      {/* Progress indicator */}
      <div className="flex gap-1.5 mb-8">
        {reasons.map((_, i) => (
          <div
            key={i}
            className={`h-1 rounded-full transition-all duration-300 ${
              i === currentIndex ? 'w-6 bg-alive-accent' : 'w-1.5 bg-alive-border'
            }`}
          />
        ))}
      </div>

      {/* Card container */}
      <div className="relative w-full max-w-sm h-80">
        <AnimatePresence mode="popLayout">
          <motion.div
            key={currentIndex}
            data-testid={`reason-card-${currentIndex}`}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.7}
            onDragEnd={handleDragEnd}
            style={{ x, rotate, opacity }}
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="absolute inset-0 bg-white rounded-2xl shadow-[0_20px_40px_-15px_rgba(220,38,38,0.1)] border border-alive-border p-8 flex flex-col items-center justify-center cursor-grab active:cursor-grabbing"
          >
            <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mb-6">
              <Heart className="w-6 h-6 text-alive-accent" fill="#DC2626" />
            </div>
            <p className="font-serif text-xl text-alive-text-primary text-center leading-relaxed" style={{ fontFamily: "'Cairo', 'Cormorant Garamond', serif" }}>
              {reasons[currentIndex]?.text}
            </p>
            <span className="font-sans text-xs text-alive-text-muted mt-6">
              {currentIndex + 1} of {reasons.length}
            </span>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation arrows */}
      <div className="flex items-center gap-8 mt-8">
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={goPrev}
          disabled={currentIndex === 0}
          data-testid="prev-reason"
          className={`w-12 h-12 rounded-full border border-alive-border flex items-center justify-center transition-opacity ${
            currentIndex === 0 ? 'opacity-30 cursor-not-allowed' : 'hover:bg-alive-surface'
          }`}
        >
          <ChevronLeft className="w-5 h-5 text-alive-text-muted" />
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={goNext}
          disabled={currentIndex === reasons.length - 1}
          data-testid="next-reason"
          className={`w-12 h-12 rounded-full border border-alive-border flex items-center justify-center transition-opacity ${
            currentIndex === reasons.length - 1 ? 'opacity-30 cursor-not-allowed' : 'hover:bg-alive-surface'
          }`}
        >
          <ChevronRight className="w-5 h-5 text-alive-text-muted" />
        </motion.button>
      </div>
    </div>
  );
};
