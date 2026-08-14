import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { Heart, ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';
import { getReasons } from '../utils/storage';

export const SwipeDeck = () => {
  const [reasons, setReasons] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchReasons = useCallback(async () => {
    setLoading(true);
    const data = await getReasons();
    setReasons(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchReasons();
  }, [fetchReasons]);

  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-15, 15]);
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0, 1, 1, 1, 0]);

  // The drag position (x) is shared across card mounts. Without resetting it
  // whenever the visible card changes, it keeps whatever offset was left over
  // from the previous drag - which is why back/forward could stop responding
  // after a swipe (the new card would render already partially off-screen).
  useEffect(() => {
    x.set(0);
  }, [currentIndex, x]);

  const handleDragEnd = (event, info) => {
    if (Math.abs(info.offset.x) > 100) {
      if (info.offset.x > 0 && currentIndex > 0) {
        setCurrentIndex(currentIndex - 1);
      } else if (info.offset.x < 0 && currentIndex < reasons.length - 1) {
        setCurrentIndex(currentIndex + 1);
      }
    }
    // Always snap back to center, whether or not the index changed.
    x.set(0);
  };

  const goNext = () => {
    if (currentIndex < reasons.length - 1) {
      x.set(0);
      setCurrentIndex(currentIndex + 1);
    }
  };

  const goPrev = () => {
    if (currentIndex > 0) {
      x.set(0);
      setCurrentIndex(currentIndex - 1);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-8" data-testid="reasons-loading">
        <RefreshCw className="w-8 h-8 text-alive-accent animate-spin mb-4" />
        <p className="font-sans text-sm text-alive-text-muted">Loading...</p>
      </div>
    );
  }

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
        <button
          onClick={fetchReasons}
          className="mt-6 flex items-center gap-2 text-alive-accent font-sans text-sm"
          data-testid="refresh-reasons"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 pb-8" data-testid="swipe-deck">
      {/* Refresh button */}
      <button
        onClick={fetchReasons}
        className="absolute top-4 right-4 w-10 h-10 rounded-full bg-alive-surface flex items-center justify-center text-alive-text-muted hover:text-alive-accent transition-colors"
        data-testid="refresh-reasons-btn"
      >
        <RefreshCw className="w-4 h-4" />
      </button>

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
            className="absolute inset-0 bg-white rounded-2xl shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] border border-alive-border p-8 flex flex-col items-center justify-center cursor-grab active:cursor-grabbing"
          >
            <div className="w-12 h-12 rounded-full bg-alive-accent-soft flex items-center justify-center mb-6">
              <Heart className="w-6 h-6 text-alive-accent" fill="var(--alive-accent)" />
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
