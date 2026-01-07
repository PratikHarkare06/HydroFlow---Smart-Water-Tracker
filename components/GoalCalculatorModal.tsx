import React, { useState } from 'react';
import { X, Weight, Activity, User as UserIcon, Check } from 'lucide-react';

interface GoalCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSetGoal: (goal: number) => void;
  isDarkMode: boolean;
}

const GoalCalculatorModal: React.FC<GoalCalculatorModalProps> = ({ isOpen, onClose, onSetGoal, isDarkMode }) => {
  const [weight, setWeight] = useState(70);
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [activity, setActivity] = useState<'low' | 'medium' | 'high'>('medium');

  if (!isOpen) return null;

  const calculateGoal = () => {
    // Basic formula: 35ml per kg
    let goal = weight * 35;
    
    // Activity adjustment
    if (activity === 'medium') goal += 400;
    if (activity === 'high') goal += 800;
    
    // Gender adjustment (general heuristic)
    if (gender === 'male') goal += 300;
    
    // Round to nearest 100
    return Math.round(goal / 100) * 100;
  };

  const finalGoal = calculateGoal();

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center sm:p-4 animate-fade-in">
      <div className={`w-full max-w-md rounded-t-[32px] sm:rounded-[32px] p-8 shadow-2xl border-t border-l border-r sm:border ${isDarkMode ? 'bg-black border-white/10' : 'bg-white border-purple-50'}`}>
        <div className="flex justify-between items-center mb-8">
          <div>
            <h3 className={`text-2xl font-black ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Smart Calculator</h3>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">Determine your ideal goal</p>
          </div>
          <button onClick={onClose} className={`p-2 rounded-2xl transition-all ${isDarkMode ? 'bg-white/5 hover:bg-white/10 text-white' : 'bg-gray-100 text-gray-600'}`}>
            <X size={20} />
          </button>
        </div>

        <div className="space-y-8">
          {/* Weight */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <Weight size={18} className="text-purple-500" />
                <span className={`text-sm font-black uppercase tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Body Weight</span>
              </div>
              <span className="text-2xl font-black text-purple-600">{weight} <span className="text-xs text-gray-400">kg</span></span>
            </div>
            <input 
              type="range" min="30" max="150" value={weight} 
              onChange={(e) => setWeight(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 dark:bg-white/10 rounded-lg appearance-none cursor-pointer accent-purple-600"
            />
          </div>

          {/* Gender */}
          <div className="grid grid-cols-2 gap-4">
            <button 
              onClick={() => setGender('male')}
              className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${gender === 'male' ? 'border-purple-600 bg-purple-600/10' : (isDarkMode ? 'border-white/5 bg-white/5' : 'border-gray-100 bg-gray-50')}`}
            >
              <UserIcon size={24} className={gender === 'male' ? 'text-purple-500' : 'text-gray-400'} />
              <span className={`text-xs font-black uppercase tracking-widest ${gender === 'male' ? (isDarkMode ? 'text-white' : 'text-purple-900') : 'text-gray-400'}`}>Male</span>
            </button>
            <button 
              onClick={() => setGender('female')}
              className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${gender === 'female' ? 'border-purple-600 bg-purple-600/10' : (isDarkMode ? 'border-white/5 bg-white/5' : 'border-gray-100 bg-gray-50')}`}
            >
              <UserIcon size={24} className={gender === 'female' ? 'text-purple-500' : 'text-gray-400'} />
              <span className={`text-xs font-black uppercase tracking-widest ${gender === 'female' ? (isDarkMode ? 'text-white' : 'text-purple-900') : 'text-gray-400'}`}>Female</span>
            </button>
          </div>

          {/* Activity */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Activity size={18} className="text-purple-500" />
              <span className={`text-sm font-black uppercase tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Activity Level</span>
            </div>
            <div className={`flex p-1 rounded-2xl ${isDarkMode ? 'bg-white/5' : 'bg-gray-100'}`}>
              {(['low', 'medium', 'high'] as const).map((level) => (
                <button
                  key={level}
                  onClick={() => setActivity(level)}
                  className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activity === level ? 'bg-purple-600 text-white shadow-lg' : (isDarkMode ? 'text-gray-500 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600')}`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          {/* Result Card */}
          <div className={`p-6 rounded-[2rem] text-center border-2 border-dashed ${isDarkMode ? 'bg-purple-950/10 border-purple-500/20' : 'bg-purple-50 border-purple-100'}`}>
            <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">Suggested Daily Goal</p>
            <h4 className="text-4xl font-black text-purple-600">{finalGoal}ml</h4>
          </div>

          <button
            onClick={() => onSetGoal(finalGoal)}
            className="w-full bg-purple-600 text-white py-5 rounded-3xl font-black text-lg shadow-xl shadow-purple-500/30 active:scale-95 transition-all flex items-center justify-center gap-3"
          >
            <Check size={24} strokeWidth={3} />
            Set This Goal
          </button>
        </div>
      </div>
    </div>
  );
};

export default GoalCalculatorModal;