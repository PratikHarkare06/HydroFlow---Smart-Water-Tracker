
import React from 'react';
import { Droplet } from 'lucide-react';

const SplashScreen: React.FC = () => {
  return (
    <div className="h-full w-full bg-gradient-to-br from-purple-200 via-blue-100 to-white flex flex-col items-center justify-center animate-fade-in">
      <div className="bg-white p-6 rounded-[30px] shadow-xl mb-6 animate-bounce-slow">
        <Droplet size={64} className="text-blue-500 fill-blue-500" />
      </div>
      <h1 className="text-3xl font-bold text-gray-800 tracking-tight mb-2">HydroTrack</h1>
      <p className="text-gray-500 text-sm tracking-wider uppercase">Smart Hydration</p>
    </div>
  );
};

export default SplashScreen;
