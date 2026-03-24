export const CobwebSVG = ({ position = 'top-left' }) => {
  const getTransform = () => {
    switch (position) {
      case 'top-right':
        return 'scaleX(-1)';
      case 'bottom-left':
        return 'scaleY(-1)';
      case 'bottom-right':
        return 'scale(-1, -1)';
      default:
        return 'none';
    }
  };

  return (
    <svg
      viewBox="0 0 200 200"
      className="w-full h-full"
      style={{ transform: getTransform() }}
    >
      <defs>
        <linearGradient id="cobwebGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#404040" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#404040" stopOpacity="0" />
        </linearGradient>
      </defs>
      <g stroke="url(#cobwebGradient)" fill="none" strokeWidth="0.5">
        {/* Main radial lines */}
        <line x1="0" y1="0" x2="200" y2="200" />
        <line x1="0" y1="0" x2="200" y2="100" />
        <line x1="0" y1="0" x2="100" y2="200" />
        <line x1="0" y1="0" x2="200" y2="50" />
        <line x1="0" y1="0" x2="50" y2="200" />
        <line x1="0" y1="0" x2="200" y2="150" />
        <line x1="0" y1="0" x2="150" y2="200" />
        
        {/* Concentric arcs */}
        <path d="M 30 0 Q 30 30, 0 30" />
        <path d="M 60 0 Q 60 60, 0 60" />
        <path d="M 90 0 Q 90 90, 0 90" />
        <path d="M 120 0 Q 120 120, 0 120" />
        <path d="M 150 0 Q 150 150, 0 150" />
        <path d="M 180 0 Q 180 180, 0 180" />
        
        {/* Additional web detail */}
        <path d="M 45 0 Q 45 30, 22 45" />
        <path d="M 75 0 Q 75 50, 37 75" />
        <path d="M 105 0 Q 105 70, 52 105" />
        <path d="M 135 0 Q 135 90, 67 135" />
        <path d="M 165 0 Q 165 110, 82 165" />
      </g>
    </svg>
  );
};
