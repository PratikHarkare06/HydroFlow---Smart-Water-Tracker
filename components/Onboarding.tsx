
import React, { useState } from 'react';
import { ChevronRight } from 'lucide-react';
import { UserSettings } from '../types';

interface OnboardingProps {
  onComplete: (profile: Partial<UserSettings>) => void;
}

const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [step, setStep] = useState(0);
  const [weightKg, setWeightKg] = useState<number>(70);
  const [wakeUpTime, setWakeUpTime] = useState('07:00');
  const [bedTime, setBedTime] = useState('23:00');
  const [activityLevel, setActivityLevel] = useState<'low' | 'medium' | 'high'>('medium');
  const [climate, setClimate] = useState<'cool' | 'temperate' | 'hot'>('temperate');
  const [goalFocus, setGoalFocus] = useState<'consistency' | 'performance' | 'wellness'>('wellness');

  const steps = [
    {
      title: "Let's personalize your hydration",
      desc: "Set your profile once. HydroFlow adapts goals and reminders for your daily routine.",
      image: "💧"
    },
    {
      title: "Quick body profile",
      desc: "Weight and activity help set an accurate daily hydration baseline.",
      image: "🏃"
    },
    {
      title: "Lifestyle and coaching focus",
      desc: "Choose climate and focus area so reminders and weekly plans fit you.",
      image: "🧠"
    }
  ];

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      onComplete({
        weightKg,
        wakeUpTime,
        bedTime,
        activityLevel,
        climate,
        goalFocus,
        adaptiveGoalEnabled: true,
        smartRemindersEnabled: true
      });
    }
  };

  return (
    <div className="h-full w-full bg-white flex flex-col p-8 relative">
      <div className="flex-1 flex flex-col items-center justify-center text-center">
        <div className="text-9xl mb-10 animate-pulse-slow transform transition-all duration-500">
          {steps[step].image}
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-4 transition-all">{steps[step].title}</h2>
        <p className="text-gray-500 leading-relaxed transition-all">{steps[step].desc}</p>
        {step === 1 && (
          <div className="w-full mt-8 space-y-4 text-left">
            <label className="block">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Weight (kg)</span>
              <input
                type="number"
                min={35}
                max={180}
                value={weightKg}
                onChange={(e) => setWeightKg(parseInt(e.target.value || '70', 10))}
                className="mt-2 w-full p-4 rounded-2xl bg-gray-50 border border-gray-100 outline-none font-semibold"
              />
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label>
                <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Wake up</span>
                <input type="time" value={wakeUpTime} onChange={(e) => setWakeUpTime(e.target.value)} className="mt-2 w-full p-3 rounded-2xl bg-gray-50 border border-gray-100 outline-none font-semibold" />
              </label>
              <label>
                <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Sleep</span>
                <input type="time" value={bedTime} onChange={(e) => setBedTime(e.target.value)} className="mt-2 w-full p-3 rounded-2xl bg-gray-50 border border-gray-100 outline-none font-semibold" />
              </label>
            </div>
            <label className="block">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Activity level</span>
              <select value={activityLevel} onChange={(e) => setActivityLevel(e.target.value as 'low' | 'medium' | 'high')} className="mt-2 w-full p-4 rounded-2xl bg-gray-50 border border-gray-100 outline-none font-semibold">
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </label>
          </div>
        )}
        {step === 2 && (
          <div className="w-full mt-8 space-y-4 text-left">
            <label className="block">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Climate</span>
              <select value={climate} onChange={(e) => setClimate(e.target.value as 'cool' | 'temperate' | 'hot')} className="mt-2 w-full p-4 rounded-2xl bg-gray-50 border border-gray-100 outline-none font-semibold">
                <option value="cool">Cool</option>
                <option value="temperate">Temperate</option>
                <option value="hot">Hot</option>
              </select>
            </label>
            <label className="block">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Primary focus</span>
              <select value={goalFocus} onChange={(e) => setGoalFocus(e.target.value as 'consistency' | 'performance' | 'wellness')} className="mt-2 w-full p-4 rounded-2xl bg-gray-50 border border-gray-100 outline-none font-semibold">
                <option value="consistency">Consistency</option>
                <option value="performance">Performance</option>
                <option value="wellness">Wellness</option>
              </select>
            </label>
          </div>
        )}
      </div>

      <div className="flex flex-col items-center space-y-8 mb-8">
        <div className="flex space-x-2">
          {steps.map((_, i) => (
            <div 
              key={i} 
              className={`h-2 rounded-full transition-all duration-300 ${i === step ? 'w-8 bg-purple-500' : 'w-2 bg-gray-200'}`} 
            />
          ))}
        </div>

        <button 
          onClick={handleNext}
          className="w-full bg-gray-900 text-white py-4 rounded-2xl font-bold text-lg shadow-lg flex items-center justify-center active:scale-95 transition-transform"
        >
          {step === steps.length - 1 ? 'Get Started' : 'Next'}
          {step < steps.length - 1 && <ChevronRight className="ml-2" size={20} />}
        </button>
      </div>
    </div>
  );
};

export default Onboarding;
