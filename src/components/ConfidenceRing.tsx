import React, { useEffect, useState } from 'react';

interface ConfidenceRingProps {
  confidence: number; // Value from 0.0 to 1.0
  size?: number;
}

export default function ConfidenceRing({ confidence, size = 140 }: ConfidenceRingProps) {
  const [offset, setOffset] = useState(0);
  const normalizedConfidence = Math.min(Math.max(confidence, 0.0), 1.0);
  const percentage = Math.round(normalizedConfidence * 100);

  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;

  useEffect(() => {
    // Smoothly animate the stroke progress on load/update
    const progressOffset = circumference - normalizedConfidence * circumference;
    const timer = setTimeout(() => {
      setOffset(progressOffset);
    }, 100);
    return () => clearTimeout(timer);
  }, [confidence, circumference, normalizedConfidence]);

  // Color bands based on confidence levels
  const getTextColor = () => {
    if (normalizedConfidence >= 0.8) return 'text-[#10B981]'; // Emerald Success
    if (normalizedConfidence >= 0.5) return 'text-[#22D3EE]'; // Cyan Highlight
    return 'text-[#EF4444]'; // Red Warning
  };

  const getTrackColor = () => {
    if (normalizedConfidence >= 0.8) return '#10B981';
    if (normalizedConfidence >= 0.5) return '#06B6D4';
    return '#EF4444';
  };

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <defs>
          <linearGradient id="confidenceGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#22D3EE" /> {/* Cyan */}
            <stop offset="100%" stopColor="#4F46E5" /> {/* Indigo */}
          </linearGradient>
        </defs>
        
        {/* Background Track Circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke="#1E293B" // Slate-800
          strokeWidth={strokeWidth}
        />
        
        {/* Animated Progress Ring */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke="url(#confidenceGradient)"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{
            transition: 'stroke-dashoffset 1s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        />
      </svg>
      
      {/* Percentage Center Text */}
      <div className="absolute flex flex-col items-center justify-center">
        <span className="text-2xl font-bold font-display tracking-tighter text-[#F0F4FF]">
          {percentage}%
        </span>
        <span className="text-[8px] uppercase tracking-widest text-slate-500 font-bold leading-none mt-0.5">
          Confidence
        </span>
      </div>
    </div>
  );
}
