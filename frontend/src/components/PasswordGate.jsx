import { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, Eye, EyeOff } from 'lucide-react';
import { USER_PASSWORD, EDITOR_PASSWORD } from '../utils/storage';
import { CobwebSVG } from './CobwebSVG';

export const PasswordGate = ({ onAuthenticate }) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [shake, setShake] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (password === EDITOR_PASSWORD) {
      onAuthenticate('editor');
    } else if (password === USER_PASSWORD) {
      onAuthenticate('user');
    } else {
      setError('Invalid password');
      setShake(true);
      setTimeout(() => setShake(false), 500);
    }
  };

  return (
    <div className="fixed inset-0 bg-void-bg overflow-hidden flex items-center justify-center">
      {/* Cobwebs */}
      <div className="absolute top-0 left-0 w-48 h-48 opacity-15">
        <CobwebSVG position="top-left" />
      </div>
      <div className="absolute top-0 right-0 w-48 h-48 opacity-15">
        <CobwebSVG position="top-right" />
      </div>
      <div className="absolute bottom-0 left-0 w-48 h-48 opacity-10">
        <CobwebSVG position="bottom-left" />
      </div>
      <div className="absolute bottom-0 right-0 w-48 h-48 opacity-10">
        <CobwebSVG position="bottom-right" />
      </div>

      {/* Noise texture overlay */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="relative z-10 w-full max-w-sm px-8"
      >
        <motion.div
          animate={shake ? { x: [-10, 10, -10, 10, 0] } : {}}
          transition={{ duration: 0.5 }}
          className="space-y-8"
        >
          {/* Lock icon */}
          <div className="flex justify-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
              className="w-16 h-16 rounded-full bg-void-surface border border-void-border flex items-center justify-center"
            >
              <Lock className="w-7 h-7 text-void-text-muted" />
            </motion.div>
          </div>

          {/* Title */}
          <div className="text-center space-y-2">
            <h1 className="font-serif text-3xl tracking-tight text-void-text-primary">
              Enter the void
            </h1>
            <p className="font-sans text-sm text-void-text-muted">
              Only those who know may enter
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError('');
                }}
                placeholder="Password"
                data-testid="password-input"
                className="w-full bg-void-surface border border-void-border rounded-none px-4 py-4 pr-12 text-void-text-primary placeholder-void-text-muted font-sans text-base focus:outline-none focus:border-void-text-muted transition-colors duration-200"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                data-testid="toggle-password-visibility"
                className="absolute right-4 top-1/2 -translate-y-1/2 text-void-text-muted hover:text-void-text-primary transition-colors duration-200"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            {error && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-red-900 text-sm font-sans text-center"
                data-testid="password-error"
              >
                {error}
              </motion.p>
            )}

            <motion.button
              type="submit"
              data-testid="submit-password"
              whileTap={{ scale: 0.98 }}
              className="w-full bg-void-surface border border-void-border py-4 text-void-text-primary font-serif text-lg tracking-wide hover:bg-void-border transition-colors duration-200"
            >
              Enter
            </motion.button>
          </form>
        </motion.div>
      </motion.div>
    </div>
  );
};
