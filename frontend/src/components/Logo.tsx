import React from 'react';

// Stylized "eye over ocean" mark: an eye formed from a wave/horizon line
// with a satellite-orbit ring standing in for the pupil. No literal eye
// photography, no ship silhouette, no AI-brain iconography.
export const Logo: React.FC<{ size?: number }> = ({ size = 26 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="header-brand-mark"
  >
    <path
      d="M2 16C6.5 8 12 5 16 5C20 5 25.5 8 30 16C25.5 24 20 27 16 27C12 27 6.5 24 2 16Z"
      stroke="#37d4ff"
      strokeWidth="1.6"
      strokeLinejoin="round"
    />
    <circle cx="16" cy="16" r="5.2" stroke="#37d4ff" strokeWidth="1.6" />
    <circle cx="16" cy="16" r="1.6" fill="#37d4ff" />
    <ellipse
      cx="16"
      cy="16"
      rx="10.5"
      ry="3.4"
      stroke="#1c8fb8"
      strokeWidth="1"
      strokeDasharray="1.4 2.2"
      transform="rotate(-18 16 16)"
    />
  </svg>
);
