import { motion } from 'framer-motion';
import { Heart, Clock, Square } from 'lucide-react';

export const BottomNav = ({ activeTab, onTabChange, isEditor }) => {
  const tabs = [
    { icon: Heart, label: 'Reasons', id: 0 },
    { icon: Clock, label: 'You', id: 1 },
    ...(isEditor ? [{ icon: Square, label: '', id: 2 }] : [])
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 safe-area-bottom" data-testid="bottom-nav">
      <div className="mx-4 mb-4 rounded-2xl bg-white/70 backdrop-blur-xl border border-white/40 shadow-[0_-4px_30px_rgba(0,0,0,0.05)]">
        <div className="flex items-center justify-around py-3">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <motion.button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                whileTap={{ scale: 0.9 }}
                data-testid={`nav-tab-${tab.id}`}
                className={`flex flex-col items-center min-w-[64px] py-2 px-4 rounded-xl transition-colors ${
                  isActive ? 'bg-alive-accent/10' : ''
                }`}
              >
                <Icon
                  className={`w-6 h-6 transition-colors ${
                    isActive ? 'text-alive-accent' : 'text-alive-text-muted'
                  }`}
                  fill={isActive && tab.id !== 2 ? 'var(--alive-accent)' : 'none'}
                />
                {tab.label && (
                  <span
                    className={`font-sans text-xs mt-1 transition-colors ${
                      isActive ? 'text-alive-accent' : 'text-alive-text-muted'
                    }`}
                  >
                    {tab.label}
                  </span>
                )}
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
