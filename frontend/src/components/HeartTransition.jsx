import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useHeartAudio } from '../hooks/useHeartAudio';
import { CobwebSVG } from './CobwebSVG';

export const HeartTransition = ({ onComplete, accentColor = '#9333EA' }) => {
  const [isAlive, setIsAlive] = useState(false);
  const [showCaption, setShowCaption] = useState(false);
  const { playFlatline, stopFlatline, playHeartbeat, cleanup } = useHeartAudio();

  useEffect(() => {
    // Start flatline sound
    const timer = setTimeout(() => {
      playFlatline();
    }, 500);

    return () => {
      clearTimeout(timer);
      cleanup();
    };
  }, [playFlatline, cleanup]);

  const handleHeartClick = useCallback(() => {
    if (isAlive) return;
    
    stopFlatline();
    setIsAlive(true);
    playHeartbeat();
    
    setTimeout(() => {
      setShowCaption(true);
    }, 800);

    setTimeout(() => {
      onComplete();
    }, 4000);
  }, [isAlive, stopFlatline, playHeartbeat, onComplete]);

  return (
    <motion.div
      className="fixed inset-0 overflow-hidden flex items-center justify-center"
      animate={{
        backgroundColor: isAlive ? '#FCFBF9' : '#050505'
      }}
      transition={{ duration: 0.3 }}
    >
      {/* Cobwebs - only show in void state */}
      <AnimatePresence>
        {!isAlive && (
          <>
            <motion.div
              exit={{ opacity: 0 }}
              className="absolute top-0 left-0 w-48 h-48 opacity-15"
            >
              <CobwebSVG position="top-left" />
            </motion.div>
            <motion.div
              exit={{ opacity: 0 }}
              className="absolute top-0 right-0 w-48 h-48 opacity-15"
            >
              <CobwebSVG position="top-right" />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Noise texture */}
      {!isAlive && (
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          }}
        />
      )}

      <div className="relative z-10 flex flex-col items-center">
        {/* Heart SVG */}
        <motion.div
          data-testid="heart-trigger"
          onClick={handleHeartClick}
          className="cursor-pointer select-none"
          whileTap={{ scale: 0.95 }}
        >
          <svg
            width="200"
            height="200"
            viewBox="0 0 100 100"
            className="overflow-visible"
          >
            {/* Broken heart - left half */}
            <motion.path
              d="M50 88 C50 88 10 55 10 35 C10 20 22 10 35 10 C42 10 48 14 50 20"
              fill="none"
              strokeWidth="2"
              animate={{
                stroke: isAlive ? accentColor : '#4A0000',
                x: isAlive ? 0 : -3,
                rotate: isAlive ? 0 : -5,
                fill: isAlive ? accentColor : 'none'
              }}
              transition={{ duration: 0.5, type: 'spring' }}
              style={{ transformOrigin: '50px 50px' }}
            />
            {/* Broken heart - right half */}
            <motion.path
              d="M50 88 C50 88 90 55 90 35 C90 20 78 10 65 10 C58 10 52 14 50 20"
              fill="none"
              strokeWidth="2"
              animate={{
                stroke: isAlive ? accentColor : '#4A0000',
                x: isAlive ? 0 : 3,
                rotate: isAlive ? 0 : 5,
                fill: isAlive ? accentColor : 'none'
              }}
              transition={{ duration: 0.5, type: 'spring' }}
              style={{ transformOrigin: '50px 50px' }}
            />
            {/* Crack line */}
            <motion.path
              d="M50 20 L48 35 L52 50 L48 65 L50 88"
              fill="none"
              strokeWidth="1.5"
              animate={{
                stroke: isAlive ? 'transparent' : '#4A0000',
                opacity: isAlive ? 0 : 1
              }}
              transition={{ duration: 0.3 }}
            />
          </svg>
        </motion.div>

        {/* Flatline / Heartbeat line */}
        <div className="w-64 h-16 mt-8 overflow-hidden">
          <svg
            width="256"
            height="64"
            viewBox="0 0 256 64"
            className="overflow-visible"
          >
            <motion.path
              d={isAlive
                ? "M0 32 L40 32 L50 32 L55 10 L60 54 L65 20 L70 44 L75 32 L85 32 L90 32 L95 10 L100 54 L105 20 L110 44 L115 32 L125 32 L130 32 L135 10 L140 54 L145 20 L150 44 L155 32 L170 32 L180 32 L185 10 L190 54 L195 20 L200 44 L205 32 L216 32 L256 32"
                : "M0 32 L256 32"
              }
              fill="none"
              strokeWidth="2"
              animate={{
                stroke: isAlive ? accentColor : '#4A0000'
              }}
              transition={{ duration: 0.3 }}
            />
          </svg>
        </div>

        {/* Caption */}
        <AnimatePresence>
          {showCaption && (
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8 }}
              className="font-cursive text-2xl sm:text-3xl text-alive-text-primary mt-12 px-8 text-center leading-relaxed"
              data-testid="heart-caption"
            >
              You are the reason my heart beats this way.
            </motion.p>
          )}
        </AnimatePresence>

        {/* Tap instruction */}
        {!isAlive && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            transition={{ delay: 1, duration: 1 }}
            className="font-sans text-xs text-void-text-muted mt-12"
          >
            tap the heart
          </motion.p>
        )}
      </div>
    </motion.div>
  );
};
