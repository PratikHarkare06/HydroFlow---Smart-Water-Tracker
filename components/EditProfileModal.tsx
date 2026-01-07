import React, { useState } from 'react';
import { X, Check, User as UserIcon } from 'lucide-react';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string, avatar: string) => void;
  currentName: string;
  currentAvatar: string;
  isDarkMode: boolean;
}

const EditProfileModal: React.FC<EditProfileModalProps> = ({ 
  isOpen, 
  onClose, 
  onSave, 
  currentName, 
  currentAvatar,
  isDarkMode 
}) => {
  const [name, setName] = useState(currentName);
  const [selectedAvatar, setSelectedAvatar] = useState(currentAvatar);

  if (!isOpen) return null;

  const avatarSeeds = [
    'Felix', 'Aneka', 'Jasper', 'Luna', 'Oliver', 
    'Willow', 'Leo', 'Maya', 'Milo', 'Zara', 
    'Finn', 'Ava', 'Jack', 'Zoey', 'Silas'
  ];

  const avatars = avatarSeeds.map(seed => `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`);

  const handleSave = () => {
    if (name.trim()) {
      onSave(name.trim(), selectedAvatar);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center sm:p-4 animate-fade-in">
      <div className={`w-full max-w-md rounded-t-[32px] sm:rounded-[32px] p-8 shadow-2xl border-t border-l border-r sm:border flex flex-col max-h-[90dvh] ${isDarkMode ? 'bg-black border-white/10' : 'bg-white border-purple-50'}`}>
        <div className="flex justify-between items-center mb-6 shrink-0">
          <div>
            <h3 className={`text-2xl font-black ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Edit Profile</h3>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">Personalize your identity</p>
          </div>
          <button onClick={onClose} className={`p-2 rounded-2xl transition-all ${isDarkMode ? 'bg-white/5 hover:bg-white/10 text-white' : 'bg-gray-100 text-gray-600'}`}>
            <X size={20} />
          </button>
        </div>

        <div className="space-y-8 overflow-y-auto no-scrollbar pr-1">
          {/* Avatar Selection */}
          <div>
            <label className={`block text-[10px] font-black uppercase tracking-widest mb-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Choose Avatar</label>
            <div className="grid grid-cols-3 gap-4 pb-2">
              {avatars.map((url, index) => (
                <button 
                  key={index}
                  onClick={() => setSelectedAvatar(url)}
                  className={`relative rounded-2xl overflow-hidden border-4 transition-all aspect-square ${selectedAvatar === url ? 'border-purple-600 scale-105' : 'border-transparent opacity-60 hover:opacity-100'}`}
                >
                  <img src={url} alt={`Avatar ${index}`} className="w-full h-full object-cover" />
                  {selectedAvatar === url && (
                    <div className="absolute inset-0 bg-purple-600/20 flex items-center justify-center">
                      <div className="bg-purple-600 text-white rounded-full p-1">
                        <Check size={12} strokeWidth={4} />
                      </div>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Name Input */}
          <div>
            <label className={`block text-[10px] font-black uppercase tracking-widest mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Display Name</label>
            <div className={`flex items-center p-4 rounded-2xl border transition-all ${isDarkMode ? 'bg-white/5 border-white/10 focus-within:border-purple-500' : 'bg-gray-50 border-gray-100 focus-within:border-purple-300'}`}>
              <UserIcon size={20} className="text-gray-400 mr-3" />
              <input 
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                className="bg-transparent outline-none flex-1 text-sm font-bold text-inherit"
              />
            </div>
          </div>
        </div>

        <div className="pt-6 shrink-0">
          <button
            onClick={handleSave}
            disabled={!name.trim()}
            className="w-full bg-purple-600 text-white py-5 rounded-3xl font-black text-lg shadow-xl shadow-purple-500/30 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:scale-100"
          >
            Save Profile
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditProfileModal;