
import React, { useState } from 'react';
import { ChevronRight } from 'lucide-react';

interface OnboardingProps {
  onComplete: () => void;
}

const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [step, setStep] = useState(0);

  const steps = [
    {
      title: "Track your water intake",
      desc: "Easily log your daily water consumption to maintain a healthy lifestyle.",
      image: "🌊"
    },
    {
      title: "Set daily goals",
      desc: "Customize your hydration targets based on your body needs and routine.",
      image: "🎯"
    },
    {
      title: "Stay hydrated",
      desc: "Get smart reminders and insights to keep your hydration on track.",
      image: "🔔"
    }
  ];

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      onComplete();
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
