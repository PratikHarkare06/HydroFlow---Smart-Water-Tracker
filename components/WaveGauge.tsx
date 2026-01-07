import React, { useMemo, useEffect, useState, useRef } from 'react';
import { Heart, Droplet, Sparkles } from 'lucide-react';

interface WaveGaugeProps {
  percentage: number;
  current: number;
  target: number;
  isDarkMode?: boolean;
}

const WaveGauge: React.FC<WaveGaugeProps> = ({ percentage, current, target, isDarkMode }) => {
  const [isSplashing, setIsSplashing] = useState(false);
  const [isFilling, setIsFilling] = useState(false);
  const prevCurrent = useRef(current);
  const safePercentage = Math.min(100, Math.max(0, percentage));
  const isGoalReached = current >= target && target > 0;
  
  // Detection of water added to trigger filling and splashing sequence
  useEffect(() => {
    if (current > prevCurrent.current) {
      // Trigger filling animation (pouring stream)
      setIsFilling(true);
      
      // After pouring duration, trigger the splash and reset filling
      const splashTimer = setTimeout(() => {
        setIsFilling(false);
        setIsSplashing(true);
      }, 800);

      // Reset splash after it settles
      const resetTimer = setTimeout(() => {
        setIsSplashing(false);
      }, 2500);

      prevCurrent.current = current;
      return () => {
        clearTimeout(splashTimer);
        clearTimeout(resetTimer);
      };
    }
    prevCurrent.current = current;
  }, [current]);

  // Calculate wave vertical position (0 is bottom, 100 is top)
  const waveHeight = 100 - (safePercentage * 0.95);

  return (
    <div className="relative w-72 h-72 sm:w-80 sm:h-80 mx-auto flex items-center justify-center select-none">
      {/* Continuous Rotating Outer Ambient Glow */}
      <div className={`absolute inset-0 rounded-full blur-[60px] opacity-30 animate-spin-slow transition-all duration-1000 ${
        isSplashing || isFilling || isGoalReached ? 'bg-purple-400 scale-125 opacity-50' : 'bg-purple-500/20 scale-100'
      }`}></div>

      {/* Main Circular Container */}
      <div className={`relative w-full h-full rounded-full border-[12px] p-1 overflow-hidden shadow-2xl transition-all duration-700 ${
        isSplashing || isFilling ? 'border-purple-300 scale-[1.03]' : (isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-purple-50')
      }`}>
        
        {/* Inner Content Area */}
        <div className="relative w-full h-full rounded-full overflow-hidden bg-gradient-to-b from-white to-purple-50/30">
          
          {/* Pouring Stream Animation - Triggers on Add */}
          {isFilling && (
            <div className="absolute top-0 left-1/2 -translate-x-1/2 z-40 w-4 h-full pointer-events-none">
               <div className="w-full h-[60%] bg-gradient-to-b from-blue-300/20 via-blue-400/80 to-blue-600 rounded-full animate-pour shadow-[0_0_20px_rgba(59,130,246,0.6)]"></div>
               {/* Satellite droplets */}
               <div className="absolute top-10 -left-6 text-blue-400 animate-fall-in-fast opacity-70"><Droplet size={14} fill="currentColor"/></div>
               <div className="absolute top-24 -right-6 text-blue-300 animate-fall-in-slow opacity-70"><Droplet size={12} fill="currentColor"/></div>
            </div>
          )}

          {/* Continuous Animated SVG Waves */}
          <div 
            className={`absolute left-0 right-0 w-full h-full transition-all duration-[2000ms] ease-in-out`}
            style={{ top: `${waveHeight}%` }}
          >
            {/* Surface Highlight */}
            <div className={`absolute top-0 left-0 w-full h-6 bg-gradient-to-b from-white/40 to-transparent blur-md transition-opacity duration-500 ${isFilling ? 'opacity-100' : 'opacity-40'}`}></div>

            {/* Layer 1: Primary deep wave */}
            <svg viewBox="0 0 1000 1000" xmlns="http://www.w3.org/2000/svg" className={`absolute top-0 left-0 w-[200%] h-full opacity-95 fill-[#7C6AF7] ${isFilling ? 'animate-wave-fast-extreme' : 'animate-wave-slow'}`}>
              <path d="M0,1000 C300,800 400,1100 700,900 C1000,700 1300,1000 1600,800 L1600,1000 L0,1000 Z" />
            </svg>
            
            {/* Layer 2: Mid wave */}
            <svg viewBox="0 0 1000 1000" xmlns="http://www.w3.org/2000/svg" className={`absolute top-2 left-[-50%] w-[200%] h-full opacity-70 fill-[#A394FF] ${isFilling ? 'animate-wave-fast' : 'animate-wave-medium'}`}>
              <path d="M0,1000 C200,900 300,1000 500,900 C700,800 900,1000 1200,900 L1200,1000 L0,1000 Z" />
            </svg>
            
            {/* Layer 3: Surface translucent wave */}
            <svg viewBox="0 0 1000 1000" xmlns="http://www.w3.org/2000/svg" className={`absolute top-4 left-[-25%] w-[200%] h-full opacity-50 fill-[#C7BEFF] ${isFilling ? 'animate-wave-medium' : 'animate-wave-fast'}`}>
              <path d="M0,1000 C150,950 250,1050 400,950 C600,850 800,1050 1100,950 L1100,1000 L0,1000 Z" />
            </svg>
          </div>

          {/* Continuous Rising Bubbles */}
          <div className="absolute inset-0 z-10 pointer-events-none">
            {[...Array(isSplashing || isFilling ? 20 : 6)].map((_, i) => (
              <div 
                key={i}
                className="absolute bg-white/50 rounded-full animate-bubble"
                style={{
                  left: `${5 + Math.random() * 90}%`,
                  bottom: '0%',
                  width: `${2 + Math.random() * 10}px`,
                  height: `${2 + Math.random() * 10}px`,
                  animationDelay: `${Math.random() * 3}s`,
                  animationDuration: `${2 + Math.random() * 3}s`
                }}
              />
            ))}
          </div>

          {/* Frosted Glass Data Display */}
          <div className="absolute inset-0 z-20 flex items-center justify-center">
            <div className={`relative px-10 py-8 rounded-[45px] bg-white/25 backdrop-blur-2xl border border-white/40 shadow-[0_15px_45px_rgba(31,38,135,0.2)] flex items-baseline transition-all duration-700 overflow-hidden ${isSplashing || isFilling ? 'scale-115 shadow-purple-500/40 ring-4 ring-white/30' : 'scale-100'}`}>
              {/* Shimmering highlight */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full animate-shimmer"></div>
              
              <span className={`relative text-5xl sm:text-6xl font-black text-purple-900 tracking-tighter transition-all duration-700 ${isSplashing || isFilling ? 'text-purple-700' : ''}`}>
                {current}
              </span>
              <span className="relative text-xl sm:text-2xl font-bold text-purple-400/90 ml-2">
                /{target}ml
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Progressive Hydration Path - Connecting Droplet to Heart */}
      <div className="absolute bottom-4 left-8 right-8 h-20 pointer-events-none z-30">
        <svg width="100%" height="100%" viewBox="0 0 320 100" preserveAspectRatio="none">
          {/* Base Track (Dashed) */}
          <path 
            d="M280,40 Q160,110 40,40" 
            fill="none" 
            stroke={isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'} 
            strokeWidth="4" 
            strokeDasharray="8 6"
            strokeLinecap="round"
          />
          {/* Active Progress Path */}
          <path 
            id="progressPath"
            d="M280,40 Q160,110 40,40" 
            fill="none" 
            stroke="url(#pathGradient)" 
            strokeWidth="5" 
            strokeLinecap="round"
            strokeDasharray="400"
            strokeDashoffset={400 - (400 * (safePercentage / 100))}
            className={`transition-all duration-1000 ease-in-out ${isGoalReached ? 'animate-pulse' : ''}`}
            style={{ filter: isGoalReached ? 'drop-shadow(0 0 8px rgba(239, 68, 68, 0.7))' : 'none' }}
          />
          <defs>
            <linearGradient id="pathGradient" x1="100%" y1="0%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="#7C6AF7" />
              <stop offset="50%" stopColor="#A855F7" />
              <stop offset="100%" stopColor="#EF4444" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Heart Icon - Transitions to Red & Pulses on Fill */}
      <div className={`absolute bottom-6 left-6 z-30 transition-all duration-700 animate-float-icon ${isSplashing || isFilling || isGoalReached ? 'scale-150 -translate-y-8' : 'scale-100'}`}>
        <div className={`p-3.5 rounded-full shadow-2xl border-2 border-white transition-all duration-700 ${isSplashing || isFilling || isGoalReached ? 'bg-red-500 text-white animate-heartbeat shadow-red-500/60 ring-4 ring-red-100/50' : 'bg-white text-gray-300'}`}>
          <Heart size={26} className="fill-current" />
        </div>
      </div>
      
      {/* Droplet Icon - Continuous Bobbing */}
      <div className={`absolute bottom-6 right-6 z-30 transition-all duration-700 animate-float-icon-delayed ${isSplashing || isFilling ? 'scale-125 -translate-y-4' : 'scale-100'}`}>
        <div className={`p-3.5 rounded-full shadow-2xl border-2 border-white transition-all duration-700 ${isSplashing || isFilling ? 'bg-[#7C6AF7] text-white shadow-purple-500/60 ring-4 ring-purple-100/50' : 'bg-white text-blue-500'}`}>
          <Droplet size={26} className="fill-current" />
        </div>
      </div>

      {/* Victory Sparkles */}
      {(isSplashing || isFilling || isGoalReached) && (
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-visible">
            <Sparkles className="absolute top-10 left-10 text-yellow-400 animate-ping opacity-70" size={32} />
            <Sparkles className="absolute bottom-10 right-10 text-purple-400 animate-pulse opacity-70" size={28} />
            <Sparkles className="absolute top-1/2 left-0 text-white animate-bounce opacity-50" size={24} />
        </div>
      )}

      <style>{`
        @keyframes waveMove {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        @keyframes bubbleUp {
          0% { transform: translateY(0) scale(0.4); opacity: 0; }
          20% { opacity: 0.7; }
          100% { transform: translateY(-450px) scale(1.6); opacity: 0; }
        }
        @keyframes pour {
          0% { height: 0; transform: translateY(-150px); opacity: 0; }
          25% { opacity: 1; height: 100%; }
          75% { opacity: 1; height: 100%; }
          100% { height: 50%; transform: translateY(350px); opacity: 0; }
        }
        @keyframes fallFast {
          0% { transform: translateY(-150px) scale(0.5); opacity: 0; }
          30% { opacity: 1; }
          100% { transform: translateY(450px) scale(1.5); opacity: 0; }
        }
        @keyframes floatIcon {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-12px) rotate(5deg); }
        }
        @keyframes shimmer {
          0% { transform: translateX(-150%) skewX(-30deg); }
          100% { transform: translateX(150%) skewX(-30deg); }
        }
        @keyframes spinSlow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes heartbeat {
          0%, 100% { transform: scale(1); filter: brightness(1); }
          20% { transform: scale(1.15); filter: brightness(1.2); }
          40% { transform: scale(1.05); }
          60% { transform: scale(1.25); filter: brightness(1.3); }
        }
        
        .animate-pour { animation: pour 1s ease-in-out forwards; }
        .animate-fall-in-fast { animation: fallFast 0.6s linear infinite; }
        .animate-fall-in-slow { animation: fallFast 0.9s linear infinite; }
        .animate-wave-slow { animation: waveMove 18s linear infinite; }
        .animate-wave-medium { animation: waveMove 12s linear infinite; }
        .animate-wave-fast { animation: waveMove 8s linear infinite; }
        .animate-wave-fast-extreme { animation: waveMove 4.5s linear infinite; }
        .animate-bubble { animation: bubbleUp linear infinite; }
        .animate-float-icon { animation: floatIcon 4s ease-in-out infinite; }
        .animate-float-icon-delayed { animation: floatIcon 4s ease-in-out infinite; animation-delay: 2s; }
        .animate-shimmer { animation: shimmer 4s infinite ease-out; }
        .animate-spin-slow { animation: spinSlow 25s linear infinite; }
        .animate-heartbeat { animation: heartbeat 0.85s ease-in-out infinite; }
      `}</style>
    </div>
  );
};

export default WaveGauge;