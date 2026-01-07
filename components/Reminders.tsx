import React, { useMemo } from 'react';
import { ChevronLeft, MoreHorizontal, Coffee, Droplet, Clock, Trash2 } from 'lucide-react';
import WaveGauge from './WaveGauge';
import { DailyStats, DrinkType, UserSettings } from '../types';

interface RemindersProps {
  stats: DailyStats;
  onBack: () => void;
  isDarkMode: boolean;
  onDeleteRecord: (id: string) => void;
  settings: UserSettings;
}

const Reminders: React.FC<RemindersProps> = ({ stats, onBack, isDarkMode, onDeleteRecord, settings }) => {
  const totalIntake = useMemo(() => {
    return stats.records.reduce((sum, record) => sum + record.amount, 0);
  }, [stats.records]);

  const percentage = Math.min(100, (totalIntake / stats.target) * 100);

  const nextTime = useMemo(() => {
    if (settings.reminderType === 'specific') {
       if (!settings.specificTimes || settings.specificTimes.length === 0) return "Not set";
       const now = new Date();
       const currentHm = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
       const sortedTimes = [...settings.specificTimes].sort();
       const next = sortedTimes.find(t => t > currentHm);
       return next || sortedTimes[0];
    }
    if (stats.records.length === 0) return "Now";
    const sorted = [...stats.records].sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    const lastRecordTime = new Date(sorted[0].timestamp);
    lastRecordTime.setMinutes(lastRecordTime.getMinutes() + settings.reminderIntervalMinutes);
    if (lastRecordTime < new Date()) return "Now";
    return lastRecordTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }, [stats.records, settings]);

  const sortedRecords = [...stats.records].sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  return (
    <div className={`flex flex-col h-full p-6 pb-32 overflow-y-auto no-scrollbar transition-colors duration-300 ${isDarkMode ? 'bg-black' : 'bg-purple-50/30'}`}>
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <button onClick={onBack} className={`p-2.5 rounded-2xl shadow-sm transition-all active:scale-90 ${isDarkMode ? 'bg-white/5 border border-white/10 text-gray-300' : 'bg-white text-gray-600'}`}>
          <ChevronLeft size={22} />
        </button>
        <h2 className={`text-xl font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Reminders</h2>
        <button className={`p-2.5 rounded-2xl shadow-sm transition-all active:scale-90 ${isDarkMode ? 'bg-white/5 border border-white/10 text-gray-300' : 'bg-white text-gray-600'}`}>
          <MoreHorizontal size={22} />
        </button>
      </div>

      {/* Main Gauge Widget Section */}
      <div className="mb-10 flex flex-col items-center">
        <div className="animate-fade-in">
          <WaveGauge percentage={percentage} current={totalIntake} target={stats.target} isDarkMode={isDarkMode} />
        </div>
        
        <button className={`mt-8 flex items-center space-x-3 px-6 py-3 rounded-full shadow-lg active:scale-95 transition-all ${isDarkMode ? 'bg-white/5 border border-white/10' : 'bg-white shadow-purple-500/5 hover:bg-gray-50'}`}>
          <span className={`text-sm font-black uppercase tracking-widest ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>Today</span>
          <ChevronLeft size={16} className="text-gray-400 rotate-270" />
        </button>
      </div>

      {/* Stats Summary Container */}
      <div className="grid grid-cols-1 gap-4 mb-8">
          <div className={`p-6 rounded-[2.5rem] flex justify-between items-center shadow-sm border animate-fade-in ${isDarkMode ? 'bg-black border-white/10' : 'bg-white border-white'}`}>
            <div className="flex items-center space-x-4">
              <div className={`p-4 rounded-2xl ${isDarkMode ? 'bg-white/5 text-purple-400' : 'bg-purple-50 text-purple-600'}`}>
                <Clock size={24} />
              </div>
              <div>
                <p className={`text-xl font-black ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{nextTime}</p>
                <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Next Break</p>
              </div>
            </div>
            <div className="text-right">
              <p className={`font-black ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>Goal</p>
              <p className="text-[10px] text-purple-500 font-black uppercase tracking-widest">{stats.target} ml</p>
            </div>
          </div>
      </div>

      {/* Records History */}
      <div className="animate-fade-in">
        <div className="flex justify-between items-center mb-6">
          <h3 className={`font-black text-lg ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Consumption log</h3>
          <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-lg ${isDarkMode ? 'bg-white/5 text-purple-400' : 'bg-purple-50 text-purple-500'}`}>View All</span>
        </div>
        <div className="space-y-4">
          {sortedRecords.map((record) => (
            <div key={record.id} className={`p-5 rounded-[2rem] flex justify-between items-center shadow-sm border transition-all hover:translate-x-1 ${isDarkMode ? 'bg-black border-white/10' : 'bg-white border-white'}`}>
              <div className="flex items-center space-x-4">
                <div className={`p-3.5 rounded-2xl ${record.type === DrinkType.COFFEE ? 'bg-yellow-50 text-yellow-600' : 'bg-blue-50 text-blue-500'}`}>
                  {record.type === DrinkType.COFFEE ? <Coffee size={22} /> : <Droplet size={22} />}
                </div>
                <div>
                  <p className={`font-black text-sm ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                    {new Date(record.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{record.type}</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                 <span className={`font-black text-base ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`}>{record.amount}ml</span>
                 <button onClick={() => onDeleteRecord(record.id)} className="text-gray-300 hover:text-red-500 transition-colors p-1">
                    <Trash2 size={18} />
                 </button>
              </div>
            </div>
          ))}
          
          {stats.records.length === 0 && (
            <div className={`text-center py-12 rounded-[2.5rem] border-2 border-dashed ${isDarkMode ? 'bg-black border-white/5' : 'bg-white/50 border-purple-100'}`}>
              <Droplet size={32} className="mx-auto text-purple-200 mb-3" />
              <p className="text-xs font-black text-gray-400 uppercase tracking-widest leading-relaxed">No intake recorded today.<br/>Hydration is key!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Reminders;