import React from 'react';

const SideProfileIcon = () => (
  <svg viewBox="0 0 500 700" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
    <defs>
      <mask id="sideProfileMask">
        <rect width="100%" height="100%" fill="white" />
        {/* A path for a 3/4 view silhouette */}
        <path d="M330 200 C360 250, 365 380, 330 480 L250 510 C180 500, 160 400, 170 300 C175 250, 200 200, 250 180 Z" fill="black" />
      </mask>
    </defs>
    <rect width="100%" height="100%" fill="rgba(0,0,0,0.6)" mask="url(#sideProfileMask)" />
    <path d="M330 200 C360 250, 365 380, 330 480 L250 510 C180 500, 160 400, 170 300 C175 250, 200 200, 250 180 Z" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="4" strokeDasharray="15 5" />
  </svg>
);

export default SideProfileIcon;
