import React from 'react';

const BackProfileIcon = () => (
  <svg viewBox="0 0 500 700" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
    <defs>
      <mask id="backProfileMask">
        <rect width="100%" height="100%" fill="white" />
        {/* A path for a back view silhouette */}
        <path d="M180 180 Q250 150 320 180 C340 250 340 380 320 480 Q250 510 180 480 C160 380 160 250 180 180 Z" fill="black" />
      </mask>
    </defs>
    <rect width="100%" height="100%" fill="rgba(0,0,0,0.6)" mask="url(#backProfileMask)" />
    <path d="M180 180 Q250 150 320 180 C340 250 340 380 320 480 Q250 510 180 480 C160 380 160 250 180 180 Z" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="4" strokeDasharray="15 5" />
  </svg>
);

export default BackProfileIcon;
