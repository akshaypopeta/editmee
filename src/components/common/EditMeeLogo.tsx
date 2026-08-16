import React from 'react';

interface EditMeeLogoProps {
  className?: string;
  variant?: 'full' | 'icon' | 'mascot' | 'compact';
  height?: number | string;
  showText?: boolean;
  dark?: boolean;
  textClassName?: string;
}

export const EditMeeLogo: React.FC<EditMeeLogoProps> = ({
  className = '',
  variant = 'full',
  height = 36,
  showText = true,
  dark = false,
  textClassName = '',
}) => {
  // Pure Mascot Character Graphic
  const Mascot = (
    <svg
      viewBox="0 0 200 210"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="h-full w-auto select-none"
      style={{ display: 'inline-block', verticalAlign: 'middle' }}
    >
      {/* Soft Ground Shadow */}
      <ellipse cx="105" cy="198" rx="72" ry="7" fill="#E2E8F0" opacity="0.85" />

      {/* Mascot Paper Body */}
      <g>
        {/* Main Document Path with folded top-right corner */}
        <path
          d="M 52 46 
             C 52 32, 60 24, 74 24 
             L 132 24 
             L 168 60 
             L 168 172 
             C 168 186, 158 194, 144 194 
             L 74 194 
             C 60 194, 52 186, 52 172 
             Z"
          fill="#FFFFFF"
          stroke="#1E293B"
          strokeWidth="6"
          strokeLinejoin="round"
        />

        {/* Folded Top-Right Corner */}
        <path
          d="M 132 24 
             L 132 54 
             C 132 59, 135 62, 140 62 
             L 168 60 
             Z"
          fill="#EF4444"
          stroke="#1E293B"
          strokeWidth="5"
          strokeLinejoin="round"
        />

        {/* Red PDF Badge on Top-Left */}
        <rect
          x="38"
          y="38"
          width="48"
          height="28"
          rx="6"
          fill="#EF4444"
          stroke="#1E293B"
          strokeWidth="4.5"
        />
        <text
          x="62"
          y="58"
          fill="#FFFFFF"
          fontFamily="system-ui, -apple-system, sans-serif"
          fontWeight="900"
          fontSize="14"
          textAnchor="middle"
          letterSpacing="0.5"
        >
          PDF
        </text>

        {/* Eyebrows */}
        <path
          d="M 82 85 C 86 82, 92 82, 96 85"
          stroke="#1E293B"
          strokeWidth="3.5"
          strokeLinecap="round"
        />
        <path
          d="M 122 85 C 126 82, 132 82, 136 85"
          stroke="#1E293B"
          strokeWidth="3.5"
          strokeLinecap="round"
        />

        {/* Cute Eyes with Glint */}
        <ellipse cx="89" cy="98" rx="6.5" ry="9" fill="#1E293B" />
        <circle cx="87" cy="94" r="2.8" fill="#FFFFFF" />
        <ellipse cx="129" cy="98" rx="6.5" ry="9" fill="#1E293B" />
        <circle cx="127" cy="94" r="2.8" fill="#FFFFFF" />

        {/* Happy Open Smile */}
        <path
          d="M 98 110 C 98 123, 120 123, 120 110 Z"
          fill="#EF4444"
          stroke="#1E293B"
          strokeWidth="3.5"
          strokeLinejoin="round"
        />
        <path
          d="M 103 118 C 105 113, 113 113, 115 118"
          fill="#FDA4AF"
        />

        {/* "EDIT ME!" Speech Bubble */}
        <path
          d="M 80 132 
             C 74 132, 70 136, 70 142 
             L 70 166 
             C 70 172, 74 176, 80 176 
             L 128 176 
             C 134 176, 138 172, 138 166 
             L 138 158 
             L 148 152 
             L 138 148 
             L 138 142 
             C 138 136, 134 132, 128 132 
             Z"
          fill="#FFFFFF"
          stroke="#1E293B"
          strokeWidth="4"
          strokeLinejoin="round"
        />
        <text
          x="104"
          y="151"
          fill="#1E293B"
          fontFamily="system-ui, -apple-system, sans-serif"
          fontWeight="900"
          fontSize="13"
          textAnchor="middle"
          letterSpacing="0.2"
        >
          EDIT
        </text>
        <text
          x="104"
          y="169"
          fill="#EF4444"
          fontFamily="system-ui, -apple-system, sans-serif"
          fontWeight="900"
          fontSize="15"
          textAnchor="middle"
          letterSpacing="0.5"
        >
          ME!
        </text>

        {/* Left Hand Pointing to Speech Bubble */}
        <path
          d="M 52 118 C 36 122, 28 135, 34 146 C 36 150, 42 150, 48 144"
          stroke="#1E293B"
          strokeWidth="5"
          fill="none"
          strokeLinecap="round"
        />
        <circle cx="48" cy="148" r="8" fill="#FFFFFF" stroke="#1E293B" strokeWidth="4" />
        <path
          d="M 54 148 L 70 149"
          stroke="#1E293B"
          strokeWidth="5.5"
          strokeLinecap="round"
        />

        {/* Right Hand Holding Big Red Pencil */}
        {/* Pencil */}
        <g transform="rotate(18 170 120)">
          {/* Eraser */}
          <rect x="162" y="52" width="16" height="12" rx="3" fill="#FDA4AF" stroke="#1E293B" strokeWidth="3.5" />
          {/* Metal Band */}
          <rect x="162" y="64" width="16" height="6" fill="#94A3B8" stroke="#1E293B" strokeWidth="3" />
          {/* Pencil Body */}
          <rect x="162" y="70" width="16" height="62" fill="#EF4444" stroke="#1E293B" strokeWidth="4" />
          <line x1="170" y1="70" x2="170" y2="132" stroke="#B91C1C" strokeWidth="2.5" />
          {/* Wood Tip */}
          <polygon points="162,132 178,132 170,148" fill="#FED7AA" stroke="#1E293B" strokeWidth="3.5" />
          {/* Graphite Lead */}
          <polygon points="167,142 173,142 170,148" fill="#1E293B" />
        </g>
        {/* Mascot Right Hand Fist holding pencil */}
        <circle cx="160" cy="132" r="9" fill="#FFFFFF" stroke="#1E293B" strokeWidth="4" />
      </g>
    </svg>
  );

  if (variant === 'icon' || variant === 'mascot' || !showText) {
    return (
      <div
        className={`inline-flex items-center justify-center shrink-0 ${className}`}
        style={{ height }}
      >
        {Mascot}
      </div>
    );
  }

  return (
    <div
      className={`inline-flex items-center gap-2.5 shrink-0 select-none ${className}`}
      style={{ height }}
    >
      <div className="h-full flex items-center justify-center">
        {Mascot}
      </div>
      <div className="flex items-baseline tracking-tight font-black leading-none text-2xl sm:text-3xl">
        <span className={textClassName || (dark ? 'text-white' : 'text-[#182230]')}>edit</span>
        <span className="text-[#EF4444]">mee</span>
      </div>
    </div>
  );
};
