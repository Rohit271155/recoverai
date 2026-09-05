import React from 'react';

export const RecoverAILogo = ({ size = 'md', className = '' }) => {
  const sizeMap = {
    sm: { width: 22, height: 22, strokeWidth: 2.2 },
    md: { width: 30, height: 30, strokeWidth: 2 },
    lg: { width: 40, height: 40, strokeWidth: 1.8 },
    xl: { width: 52, height: 52, strokeWidth: 1.5 },
  };

  const { width, height, strokeWidth } = sizeMap[size] || sizeMap.md;

  return (
    <div className={`inline-flex items-center justify-center shrink-0 ${className}`}>
      <svg
        width={width}
        height={height}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="text-emerald-400 overflow-visible"
      >
        <defs>
          <linearGradient id="rGradient" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#059669" />
            <stop offset="50%" stopColor="#10B981" />
            <stop offset="100%" stopColor="#34D399" />
          </linearGradient>

          <linearGradient id="ringGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#10B981" stopOpacity="0.3" />
          </linearGradient>

          <filter id="logoGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="1.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Continuous Rotating Outer Orbital Arc (Upper Risk Arc to Lower Recovered Arc) */}
        <ellipse
          cx="24"
          cy="24"
          rx="22"
          ry="10"
          transform="rotate(-28 24 24)"
          stroke="url(#ringGradient)"
          strokeWidth={strokeWidth * 0.9}
          strokeDasharray="8 6 16 6"
          className="origin-center animate-[spin_12s_linear_infinite]"
        />

        {/* Geometric R Vertical Stem */}
        <path
          d="M 14 9 L 14 39"
          stroke="url(#rGradient)"
          strokeWidth={strokeWidth * 1.5}
          strokeLinecap="round"
        />

        {/* Geometric R Upper Loop (Revenue at Risk Arc) */}
        <path
          d="M 14 9 L 26 9 C 33 9, 33 21, 26 21 L 14 21"
          stroke="url(#rGradient)"
          strokeWidth={strokeWidth * 1.4}
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Returning Upward Arrow Vector (Revenue Recovered Arc) */}
        <path
          d="M 21 21 L 34 35 M 34 35 L 26 35 M 34 35 L 34 27"
          stroke="#10B981"
          strokeWidth={strokeWidth * 1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          filter="url(#logoGlow)"
        />

        {/* Core Focal Signal Point */}
        <circle cx="34" cy="35" r="2.5" fill="#34D399" className="animate-pulse" />
      </svg>
    </div>
  );
};

export default RecoverAILogo;
