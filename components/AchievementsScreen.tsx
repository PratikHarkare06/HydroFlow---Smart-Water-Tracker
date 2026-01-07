import React from 'react';
import { ChevronLeft, Trophy, Lock, CheckCircle } from 'lucide-react';
import { Achievement } from '../types';

interface AchievementsScreenProps {
  achievements: Achievement[];
  onBack: () => void;
  isDarkMode: boolean;
}

const AchievementsScreen: React.FC<AchievementsScreenProps> = ({ achievements, onBack, isDarkMode }) => {
  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const progress = (unlockedCount / achievements.length) * 100;

  return (
    <div className={`flex flex-col h-full p-6 transition-colors duration-300 ${isDarkMode ? 'bg-black' : 'bg-purple-50 md:bg-transparent'}`}>
      {/* Header */}
      <div className="flex items-center mb-8">
        <button 
          onClick={onBack} 
          className={`md:hidden p-2 rounded-full shadow-sm transition-colors mr-4 ${isDarkMode ? 'bg-white/5 text-gray-300 border border-white/10' : 'bg-white text-gray-600'}`}
        >
          <ChevronLeft size={24} />
        </button>
        <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Achievements</h2>
      </div>

      {/* Hero Progress Card */}
      <div className={`p-6 rounded-3xl shadow-lg mb-8 relative overflow-hidden ${isDarkMode ? 'bg-black border border-white/20' : 'bg-gradient-to-br from-purple-500 to-indigo-600'}`}>
        <div className="absolute -right-10 -top-10 w-40 h-40 bg-white opacity-10 rounded-full blur-2xl"></div>
        <div className="absolute -left-10 -bottom-10 w-32 h-32 bg-yellow-400 opacity-10 rounded-full blur-2xl"></div>
        
        <div className="flex flex-col items-center relative z-10 text-center">
            <div className={`p-4 rounded-full mb-3 backdrop-blur-md border ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white/20 border-white/30'}`}>
                <Trophy size={40} className="text-yellow-300 drop-shadow-md" />
            </div>
            <h3 className="text-white font-black text-2xl mb-1">{unlockedCount}/{achievements.length} Unlocked</h3>
            <p className="text-purple-100 text-sm mb-4">Keep drinking water to collect them all!</p>
            
            <div className="w-full max-w-md bg-black/20 h-3 rounded-full overflow-hidden backdrop-blur-sm">
                <div 
                    className="h-full bg-yellow-400 rounded-full transition-all duration-1000 ease-out" 
                    style={{ width: `${progress}%` }}
                ></div>
            </div>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {achievements.map((ach) => (
            <div 
                key={ach.id}
                className={`p-4 rounded-2xl flex flex-col items-center text-center relative transition-all duration-300 border ${
                    ach.unlocked 
                        ? (isDarkMode ? 'bg-black border-yellow-500/30' : 'bg-white border-yellow-100 shadow-lg shadow-yellow-100/50') 
                        : (isDarkMode ? 'bg-black border-white/5 opacity-50' : 'bg-gray-100 border-transparent')
                }`}
            >
                <div className="absolute top-3 right-3">
                    {ach.unlocked ? (
                        <CheckCircle size={16} className="text-green-500" />
                    ) : (
                        <Lock size={16} className="text-gray-400" />
                    )}
                </div>

                <div className={`w-16 h-16 rounded-full flex items-center justify-center text-3xl mb-3 ${
                    ach.unlocked 
                        ? 'bg-gradient-to-br from-yellow-50 to-orange-50/10 scale-110 shadow-sm' 
                        : 'bg-gray-700/20 grayscale'
                }`}>
                    {ach.icon}
                </div>

                <h4 className={`font-bold text-sm mb-1 ${
                    ach.unlocked ? (isDarkMode ? 'text-white' : 'text-gray-800') : 'text-gray-500'
                }`}>
                    {ach.title}
                </h4>
                
                <p className="text-[10px] text-gray-400 leading-tight px-2">
                    {ach.description}
                </p>
            </div>
        ))}
      </div>
    </div>
  );
};

export default AchievementsScreen;