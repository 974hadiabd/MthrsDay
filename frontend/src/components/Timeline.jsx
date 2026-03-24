import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Camera, Heart, Play } from 'lucide-react';
import { getTimeline } from '../utils/storage';
import { FullScreenImage } from './FullScreenImage';
import { PresentMode } from './PresentMode';

export const Timeline = () => {
  const [items, setItems] = useState([]);
  const [fullScreenImage, setFullScreenImage] = useState(null);
  const [showPresentMode, setShowPresentMode] = useState(false);

  useEffect(() => {
    setItems(getTimeline());
  }, []);

  const hasPhotos = items.some(item => item.image);

  return (
    <div className="flex-1 overflow-y-auto px-6 py-8" data-testid="timeline-view">
      <div className="flex items-center justify-between mb-8">
        <h2 className="font-serif text-2xl text-alive-text-primary pl-8">You</h2>
        {hasPhotos && (
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowPresentMode(true)}
            data-testid="present-mode-btn"
            className="flex items-center gap-2 px-4 py-2 bg-alive-accent text-white rounded-full font-sans text-sm"
          >
            <Play className="w-4 h-4" fill="white" />
            Present
          </motion.button>
        )}
      </div>
      
      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-alive-accent/20" />

        <div className="space-y-12">
          {items.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ delay: index * 0.1 }}
              className="relative pl-10"
              data-testid={`timeline-item-${index}`}
            >
              {/* Dot on the line */}
              <div className="absolute left-0 top-0 w-6 h-6 rounded-full bg-alive-surface border-2 border-alive-accent flex items-center justify-center">
                <Heart className="w-3 h-3 text-alive-accent" fill="#DC2626" />
              </div>

              {/* Content card */}
              <div className="bg-white rounded-xl border border-alive-border overflow-hidden shadow-[0_10px_30px_-10px_rgba(220,38,38,0.08)]">
                {/* Image area */}
                <div 
                  className="aspect-video bg-alive-surface flex items-center justify-center cursor-pointer"
                  onClick={() => item.image && setFullScreenImage(item)}
                >
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.caption}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex flex-col items-center text-alive-text-muted">
                      <Camera className="w-10 h-10 mb-2 opacity-30" />
                      <span className="font-sans text-xs opacity-50">No image</span>
                    </div>
                  )}
                </div>

                {/* Caption */}
                <div className="p-5">
                  <p className="font-serif text-lg text-alive-text-primary leading-relaxed">
                    {item.caption}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {items.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center" data-testid="timeline-empty">
          <Heart className="w-12 h-12 text-alive-text-muted opacity-30 mb-4" />
          <p className="font-sans text-sm text-alive-text-muted">
            No timeline items yet
          </p>
        </div>
      )}

      {/* Full screen image modal */}
      {fullScreenImage && (
        <FullScreenImage
          imageData={fullScreenImage.image}
          caption={fullScreenImage.caption}
          onClose={() => setFullScreenImage(null)}
        />
      )}

      {/* Present mode */}
      {showPresentMode && (
        <PresentMode onClose={() => setShowPresentMode(false)} />
      )}
    </div>
  );
};
