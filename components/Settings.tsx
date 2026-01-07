import React, { useState, useEffect } from 'react';
import { User, UserSettings } from '../types';
import { ChevronRight, Bell, Moon, LogOut, Sun, Clock, Calculator } from 'lucide-react';
import { requestNotificationPermission } from '../services/notificationService';
import { playClickSound } from '../services/soundService';
import EditProfileModal from './EditProfileModal';

interface SettingsProps {
  user: User | null;
  settings: UserSettings;
  onUpdateSettings: (newSettings: Partial<UserSettings>) => void;
  onUpdateUser: (name: string, avatar: string) => void;
  onLogout: () => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  onAddSpecificTime: (time: string) => void;
  onRemoveSpecificTime: (time: string) => void;
  onOpenCalculator: () => void;
}

const Settings: React.FC<SettingsProps> = ({ 
  user, 
  settings, 
  onUpdateSettings, 
  onUpdateUser, 
  onLogout,
  isDarkMode,
  onToggleDarkMode,
  onAddSpecificTime,
  onRemoveSpecificTime,
  onOpenCalculator
}) => {
  const [newTime, setNewTime] = useState("");
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission>('default');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
    if ('Notification' in window) {
        setPermissionStatus(Notification.permission);
    }
  }, []);

  const handleNotificationToggle = async () => {
      playClickSound();
      const newState = !settings.notificationsEnabled;
      if (newState) {
          await requestNotificationPermission();
          setPermissionStatus(Notification.permission); 
          onUpdateSettings({notificationsEnabled: true});
      } else {
          onUpdateSettings({notificationsEnabled: false});
      }
  };
  
  const handleManualAdd = (e: React.FormEvent) => {
      e.preventDefault();
      const specificTimes = Array.isArray(settings.specificTimes) ? settings.specificTimes : [];
      if (!newTime || specificTimes.includes(newTime)) return;
      playClickSound();
      onAddSpecificTime(newTime);
      setNewTime("");
  };

  const formatInterval = (mins: number) => {
    if (mins < 60) return `${mins}m`;
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
  };

  const SettingRow = ({ icon: Icon, label, value, onClick, toggle, danger, badge }: any) => (
    <div onClick={onClick} className={`flex items-center justify-between p-5 rounded-3xl shadow-sm mb-3 cursor-pointer active:scale-[0.99] transition-all border ${isDarkMode ? 'bg-black border-white/10' : 'bg-white border-purple-50'} ${danger ? 'border-red-100' : ''}`}>
      <div className="flex items-center">
        <div className={`p-2.5 rounded-2xl mr-4 ${danger ? 'text-red-500 bg-red-50' : (isDarkMode ? 'bg-white/5 text-purple-400' : 'bg-purple-50 text-purple-600')}`}>
          <Icon size={20} />
        </div>
        <span className={`font-black text-sm uppercase tracking-wider ${danger ? 'text-red-500' : (isDarkMode ? 'text-gray-200' : 'text-gray-800')}`}>{label}</span>
      </div>
      <div className="flex items-center">
        {badge}
        {toggle !== undefined ? (
            <div className={`w-12 h-6 rounded-full p-1 ml-3 transition-colors ${toggle ? 'bg-purple-600' : 'bg-gray-300'}`}>
                <div className={`w-4 h-4 bg-white rounded-full transition-transform ${toggle ? 'translate-x-6' : 'translate-x-0'}`} />
            </div>
        ) : (
            <div className="flex items-center text-gray-400">
            {value && <span className="text-xs font-black mr-2 text-purple-600">{value}</span>}
            <ChevronRight size={18} />
            </div>
        )}
      </div>
    </div>
  );

  const specificTimes = Array.isArray(settings.specificTimes) ? settings.specificTimes : [];

  return (
    <div className={`flex flex-col h-full p-6 overflow-y-auto pb-32 transition-colors duration-300 ${isDarkMode ? 'bg-black' : 'bg-purple-50'}`}>
      <h2 className={`text-2xl font-black mb-8 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Settings</h2>

      {/* User Profile Section */}
      <div className={`p-5 rounded-[2.5rem] shadow-sm mb-8 flex items-center border ${isDarkMode ? 'bg-black border-white/10 shadow-purple-500/5' : 'bg-white border-purple-50 shadow-sm'}`}>
        <div className="w-16 h-16 rounded-full overflow-hidden mr-5 border-2 border-purple-100 shadow-sm">
           <img src={user?.avatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=guest"} alt="Profile" className="w-full h-full object-cover" />
        </div>
        <div className="flex-1">
           <h3 className={`font-black text-lg ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{user?.name || 'Guest'}</h3>
           <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-none">{user?.email || 'Local Account'}</p>
        </div>
        <button onClick={() => setIsEditModalOpen(true)} className="bg-purple-600 text-white px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-purple-500/20 active:scale-95 transition-all">Edit</button>
      </div>

      <div className="mb-8">
        <h3 className="text-[10px] font-black text-gray-400 uppercase mb-4 ml-4 tracking-[0.2em]">Goal & Health</h3>
        <SettingRow icon={Calculator} label="Smart Goal Calculator" onClick={onOpenCalculator} value={`${settings.dailyGoal}ml`} />
      </div>

      <div className="mb-8">
        <h3 className="text-[10px] font-black text-gray-400 uppercase mb-4 ml-4 tracking-[0.2em]">Notifications</h3>
        <SettingRow icon={Bell} label="Enable Reminders" toggle={settings.notificationsEnabled} onClick={handleNotificationToggle}
            badge={permissionStatus === 'denied' ? <span className="text-[10px] bg-orange-100 text-orange-600 px-2 py-1 rounded-full font-bold">Blocked</span> : null} 
        />
        
        {settings.notificationsEnabled && (
            <div className={`p-6 rounded-[2.5rem] shadow-sm mb-3 animate-fade-in border ${isDarkMode ? 'bg-black border-white/10' : 'bg-white border-purple-50'}`}>
                <div className={`flex p-1.5 rounded-2xl mb-6 ${isDarkMode ? 'bg-white/5' : 'bg-gray-100'}`}>
                    <button onClick={() => { playClickSound(); onUpdateSettings({reminderType: 'interval'}); }} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest ${settings.reminderType === 'interval' ? 'bg-purple-600 text-white shadow-lg' : 'text-gray-400'}`}>Interval</button>
                    <button onClick={() => { playClickSound(); onUpdateSettings({reminderType: 'specific'}); }} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest ${settings.reminderType === 'specific' ? 'bg-purple-600 text-white shadow-lg' : 'text-gray-400'}`}>Schedule</button>
                </div>

                {settings.reminderType === 'interval' ? (
                    <div>
                         <div className="mb-8">
                            <div className="flex justify-between items-center mb-3 px-1 text-sm">
                                <span className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">Frequency</span>
                                <span className="font-black text-purple-600">{formatInterval(settings.reminderIntervalMinutes)}</span>
                            </div>
                            <input type="range" min="15" max="240" step="15" value={settings.reminderIntervalMinutes}
                                onChange={(e) => onUpdateSettings({reminderIntervalMinutes: parseInt(e.target.value)})}
                                className="w-full h-2 bg-purple-100 dark:bg-white/10 rounded-lg appearance-none accent-purple-600"
                            />
                        </div>
                        <div className="flex gap-4">
                            <div className="flex-1">
                                <label className="text-[9px] font-black text-gray-400 mb-2 block uppercase tracking-widest text-center">Wake Up</label>
                                <input type="time" value={settings.wakeUpTime} onChange={(e) => onUpdateSettings({wakeUpTime: e.target.value})}
                                    className={`w-full p-4 rounded-2xl text-center font-black text-sm outline-none border transition-all ${isDarkMode ? 'bg-black border-white/10 text-white' : 'bg-gray-50 text-gray-900 border-purple-50'}`}
                                />
                            </div>
                            <div className="flex-1">
                                <label className="text-[9px] font-black text-gray-400 mb-2 block uppercase tracking-widest text-center">Bed Time</label>
                                <input type="time" value={settings.bedTime} onChange={(e) => onUpdateSettings({bedTime: e.target.value})}
                                    className={`w-full p-4 rounded-2xl text-center font-black text-sm outline-none border transition-all ${isDarkMode ? 'bg-black border-white/10 text-white' : 'bg-gray-50 text-gray-900 border-purple-50'}`}
                                />
                            </div>
                        </div>
                    </div>
                ) : (
                    <div>
                        <form onSubmit={handleManualAdd} className="flex items-center space-x-3 mb-6">
                            <input 
                                type="time" 
                                required
                                value={newTime} 
                                onChange={(e) => setNewTime(e.target.value)}
                                className={`flex-1 p-4 rounded-2xl text-sm outline-none border transition-all ${isDarkMode ? 'bg-black border-white/10 text-white' : 'bg-gray-50 border-purple-50 text-gray-900 font-bold'}`}
                            />
                            <button type="submit" className="px-6 py-4 bg-purple-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-purple-500/20 active:scale-95">Add</button>
                        </form>
                        <div className="space-y-3 max-h-64 overflow-y-auto no-scrollbar">
                            {specificTimes.map((time) => (
                                <div key={time} className={`flex justify-between items-center p-4 rounded-2xl border transition-all ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-purple-50'}`}>
                                    <div className="flex items-center gap-4">
                                        <div className="p-2 bg-purple-100 text-purple-600 rounded-xl"><Clock size={16} /></div>
                                        <span className={`font-black text-sm ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>{time}</span>
                                    </div>
                                    <button onClick={() => onRemoveSpecificTime(time)} className="text-gray-400 hover:text-red-500 p-2 transition-colors">
                                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        )}
      </div>

      <div className="mb-8">
        <h3 className="text-[10px] font-black text-gray-400 uppercase mb-4 ml-4 tracking-[0.2em]">General</h3>
        <SettingRow icon={isDarkMode ? Sun : Moon} label={isDarkMode ? "Light Mode" : "Dark Mode"} toggle={isDarkMode} onClick={onToggleDarkMode} />
        <SettingRow icon={LogOut} label="Log Out" onClick={() => { playClickSound(); onLogout(); }} danger />
      </div>

      {isEditModalOpen && (
        <EditProfileModal 
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSave={onUpdateUser}
          currentName={user?.name || ''}
          currentAvatar={user?.avatar || ''}
          isDarkMode={isDarkMode}
        />
      )}
    </div>
  );
};

export default Settings;