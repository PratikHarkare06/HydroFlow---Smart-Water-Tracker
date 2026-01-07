import React, { useState } from 'react';
import { X, Droplet, Coffee, Bean, Cookie, Milk } from 'lucide-react';
import { DrinkType } from '../types';

interface AddDrinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (amount: number, type: DrinkType, note: string) => void;
  isDarkMode?: boolean;
}

const AddDrinkModal: React.FC<AddDrinkModalProps> = ({ isOpen, onClose, onAdd, isDarkMode }) => {
  const [selectedType, setSelectedType] = useState<DrinkType>(DrinkType.WATER);
  const [amount, setAmount] = useState(200);
  const [note, setNote] = useState('');

  if (!isOpen) return null;

  const drinkTypes = [
    { type: DrinkType.WATER, icon: Droplet, color: 'bg-blue-100 text-blue-500' },
    { type: DrinkType.COFFEE, icon: Coffee, color: 'bg-yellow-100 text-yellow-600' },
    { type: DrinkType.TEA, icon: Bean, color: 'bg-green-100 text-green-600' },
    { type: DrinkType.JUICE, icon: Cookie, color: 'bg-orange-100 text-orange-500' },
    { type: DrinkType.SODA, icon: Milk, color: 'bg-red-100 text-red-500' },
  ];

  const presetAmounts = [100, 200, 300, 500];

  const handleSave = () => {
    onAdd(amount, selectedType, note);
    onClose();
    setAmount(200);
    setNote('');
    setSelectedType(DrinkType.WATER);
  };

  return (
    <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center sm:p-4 animate-fade-in">
      <div className={`w-full max-w-md rounded-t-[30px] sm:rounded-[30px] p-6 shadow-2xl animate-slide-up border-t border-l border-r sm:border ${isDarkMode ? 'bg-black border-white/10' : 'bg-white border-transparent'}`}>
        <div className="flex justify-between items-center mb-6">
          <h3 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Add Drink</h3>
          <button onClick={onClose} className={`p-2 rounded-full transition-colors ${isDarkMode ? 'bg-white/10 hover:bg-white/20' : 'bg-gray-100 hover:bg-gray-200'}`}>
            <X size={20} className={isDarkMode ? 'text-white' : 'text-gray-600'} />
          </button>
        </div>

        <div className="flex justify-between mb-8 overflow-x-auto no-scrollbar pb-2">
          {drinkTypes.map((item) => (
            <button
              key={item.type}
              onClick={() => setSelectedType(item.type)}
              className={`flex flex-col items-center space-y-2 min-w-[64px] transition-all ${
                selectedType === item.type ? 'opacity-100 scale-110' : 'opacity-40 hover:opacity-80'
              }`}
            >
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${item.color} shadow-sm`}>
                <item.icon size={24} />
              </div>
              <span className={`text-xs font-bold ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{item.type}</span>
            </button>
          ))}
        </div>

        <div className="mb-8">
          <div className="flex justify-between items-end mb-4">
            <span className="text-gray-500 font-medium">Amount</span>
            <div className="text-3xl font-bold text-purple-600 flex items-baseline">
               {amount} <span className="text-sm text-gray-400 ml-1">ml</span>
            </div>
          </div>
          <input
            type="range"
            min="50"
            max="1000"
            step="50"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            className="w-full h-4 bg-gray-100 dark:bg-white/10 rounded-full appearance-none cursor-pointer accent-purple-500 mb-4"
          />
          <div className="flex justify-between gap-2">
            {presetAmounts.map((val) => (
              <button
                key={val}
                onClick={() => setAmount(val)}
                className={`flex-1 py-2 rounded-xl text-sm font-bold transition-colors ${
                  amount === val ? 'bg-purple-600 text-white' : 'bg-purple-50 text-purple-600 hover:bg-purple-100'
                }`}
              >
                {val}ml
              </button>
            ))}
          </div>
        </div>

        <div className="mb-8">
            <label className="block text-gray-500 font-medium mb-2">Notes (Optional)</label>
            <input 
                type="text" 
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="e.g., After workout"
                className={`w-full rounded-xl p-4 outline-none transition-all ${isDarkMode ? 'bg-white/5 border border-white/10 text-white focus:border-purple-500' : 'bg-gray-50 text-gray-700 focus:ring-2 focus:ring-purple-200'}`}
            />
        </div>

        <button
          onClick={handleSave}
          className="w-full bg-purple-600 text-white py-4 rounded-2xl font-bold text-lg shadow-lg active:scale-95 transition-transform"
        >
          Add Record
        </button>
      </div>
    </div>
  );
};

export default AddDrinkModal;