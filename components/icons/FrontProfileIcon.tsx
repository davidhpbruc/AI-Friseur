import React from 'react';

const FrontProfileIcon = () => (
  <svg viewBox="0 0 500 700" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
    <defs>
      <mask id="ovalMask">
        <rect width="100%" height="100%" fill="white" />
        <ellipse cx="250" cy="350" rx="150" ry="200" fill="black" />
      </mask>
    </defs>
    <rect width="100%" height="100%" fill="rgba(0,0,0,0.6)" mask="url(#ovalMask)" />
    <ellipse cx="250" cy="350" rx="150" ry="200" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="4" strokeDasharray="15 5" />
  </svg>
);

export default FrontProfileIcon;
