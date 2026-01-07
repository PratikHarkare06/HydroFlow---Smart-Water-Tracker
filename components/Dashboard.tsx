import React, { useState, useMemo, useEffect } from 'react';
import { Search, Droplet, Coffee, Bean, Cookie, Milk, Flame, Trash2, Plus, Timer, Zap, Target, GlassWater, Utensils } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import CalendarStrip from './CalendarStrip';
import { DailyStats, User, DrinkType } from '../types';
import { getHydrationAdvice } from '../services/geminiService';
import { playClickSound } from '../services/soundService';

interface DashboardProps {
  stats: DailyStats;
  user: User | null;
  onAddWaterClick: () => void;
  onQuickAdd: (amount: number, type: DrinkType, note: string) => void;
  selectedDate: string;
  onSelectDate: (date: string) => void;
  weeklyStats: DailyStats[]; 
  isDarkMode: boolean;
  streak: number;
  onDeleteRecord: (id: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ stats, user, onAddWaterClick, onQuickAdd, selectedDate, onSelectDate, weeklyStats, isDarkMode, streak, onDeleteRecord }) => {
  const [advice, setAdvice] = useState<string | null>(null);
  const [loadingAdvice, setLoadingAdvice] = useState(false);
  const [greeting, setGreeting] = useState('Good Morning');
  const [searchQuery, setSearchQuery] = useState('');

  const totalIntake = useMemo(() => {
    return stats.records.reduce((sum, record) => sum + record.amount, 0);
  }, [stats.records]);

  const waterPurity = useMemo(() => {
    if (totalIntake === 0) return 0;
    const pureWater = stats.records
      .filter(r => r.type === DrinkType.WATER)
      .reduce((sum, r) => sum + r.amount, 0);
    return Math.round((pureWater / totalIntake) * 100);
  }, [stats.records, totalIntake]);

  const lastDrinkInterval = useMemo(() => {
    if (stats.records.length === 0) return null;
    const sorted = [...stats.records].sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    const lastTime = new Date(sorted[0].timestamp).getTime();
    const now = new Date().getTime();
    const diffMins = Math.floor((now - lastTime) / (1000 * 60));
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const hours = Math.floor(diffMins / 60);
    return `${hours}h ago`;
  }, [stats.records]);

  const percentage = Math.min(100, Math.round((totalIntake / stats.target) * 100));

  const chartData = [
    { name: 'Completed', value: totalIntake || 0.001 },
    { name: 'Remaining', value: Math.max(0, stats.target - totalIntake) }, 
  ];

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good Morning');
    else if (hour < 18) setGreeting('Good Afternoon');
    else setGreeting('Good Evening');
  }, []);

  const handleGetAdvice = async () => {
    playClickSound();
    setLoadingAdvice(true);
    const tip = await getHydrationAdvice(totalIntake, stats.target);
    setAdvice(tip);
    setLoadingAdvice(false);
  };

  const dateDisplay = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const d = new Date(selectedDate);
    if (selectedDate === today) return `Today, ${d.toLocaleDateString('en-US', { day: 'numeric', month: 'long' })}`;
    return d.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' });
  }, [selectedDate]);

  const filteredRecords = useMemo(() => {
    if (!searchQuery) return [];
    const query = searchQuery.toLowerCase();
    return stats.records.filter(r => 
      r.type.toLowerCase().includes(query) || 
      (r.note && r.note.toLowerCase().includes(query)) ||
      r.amount.toString().includes(query)
    ).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [searchQuery, stats.records]);

  const getDrinkIcon = (type: DrinkType) => {
    switch (type) {
      case DrinkType.COFFEE: return <Coffee size={20} />;
      case DrinkType.TEA: return <Bean size={20} />;
      case DrinkType.JUICE: return <Cookie size={20} />;
      case DrinkType.SODA: return <Milk size={20} />;
      default: return <Droplet size={20} />;
    }
  };

  const getDrinkColor = (type: DrinkType) => {
    switch (type) {
      case DrinkType.COFFEE: return 'bg-yellow-100 text-yellow-600';
      case DrinkType.TEA: return 'bg-green-100 text-green-600';
      case DrinkType.JUICE: return 'bg-orange-100 text-orange-500';
      case DrinkType.SODA: return 'bg-red-100 text-red-500';
      default: return 'bg-blue-100 text-blue-500';
    }
  };

  const hydrationMetrics = [
    { 
      icon: <Timer size={24} className="text-purple-500" />, 
      val: lastDrinkInterval || '---', 
      label: 'Interval' 
    },
    { 
      icon: <Zap size={24} className="text-yellow-500" />, 
      val: `${waterPurity}%`, 
      label: 'Purity' 
    },
    { 
      icon: <Target size={24} className="text-blue-500" />, 
      val: `${percentage}%`, 
      label: 'Hydration' 
    }
  ];

  const QuickAddButton = ({ amount, icon: Icon, label }: { amount: number, icon: any, label: string }) => (
    <button 
      onClick={() => { playClickSound(); onQuickAdd(amount, DrinkType.WATER, "Quick add"); }}
      className={`flex flex-col items-center justify-center p-4 rounded-[2rem] border transition-all active:scale-90 flex-1 ${isDarkMode ? 'bg-black border-white/10 hover:bg-white/5' : 'bg-white border-purple-50 hover:bg-purple-50'}`}
    >
      <div className={`p-3 rounded-2xl mb-2 ${isDarkMode ? 'bg-white/5 text-purple-400' : 'bg-purple-50 text-purple-600'}`}>
        <Icon size={20} />
      </div>
      <span className={`text-[11px] font-black uppercase tracking-widest ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>{amount}ml</span>
      <span className="text-[8px] text-gray-400 font-bold uppercase tracking-wider">{label}</span>
    </button>
  );

  return (
    <div className={`flex flex-col h-full px-4 sm:px-6 py-6 sm:py-8 transition-colors duration-300 overflow-x-hidden ${isDarkMode ? 'bg-black' : 'bg-[#FAF9FF]'}`}>
      
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-8">
        <div className="flex items-center space-x-4">
            <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full overflow-hidden border-2 shadow-lg ${isDarkMode ? 'bg-black border-white/20' : 'bg-white border-white'}`}>
                <img src={user?.avatar || "https://picsum.photos/100"} alt="User" className="w-full h-full object-cover" />
            </div>
            <div>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-none mb-1">{greeting}</p>
                <h2 className={`text-lg sm:text-xl font-black ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{user?.name || 'Guest'}</h2>
            </div>
            <div className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-2xl shadow-sm border ${isDarkMode ? 'bg-black border-white/10 text-orange-400' : 'bg-orange-50 border-orange-100 text-orange-500'}`}>
                <Flame size={16} className="fill-current animate-pulse" />
                <span className="text-xs sm:text-sm font-black">{streak}</span>
            </div>
        </div>

        <div className={`w-full lg:max-w-md rounded-2xl p-3 sm:p-4 flex items-center shadow-sm focus-within:ring-2 focus-within:ring-purple-200 transition-all ${isDarkMode ? 'bg-black border border-white/10' : 'bg-white'}`}>
            <Search size={18} className="text-gray-300 mr-2 sm:mr-3" />
            <input 
            type="text" 
            placeholder="Search records..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`flex-1 outline-none border-none focus:ring-0 ring-0 text-sm bg-transparent placeholder-gray-300 ${isDarkMode ? 'text-gray-200' : 'text-gray-700 font-medium'}`} 
            />
        </div>
      </div>

      {searchQuery ? (
        <div className="flex-1 animate-fade-in overflow-y-auto pb-24 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
             {filteredRecords.map(record => (
                 <div key={record.id} className={`p-5 rounded-3xl flex justify-between items-center shadow-sm border ${isDarkMode ? 'bg-black border-white/10' : 'bg-white border-purple-50'}`}>
                    <div className="flex items-center space-x-4">
                        <div className={`p-3 rounded-2xl ${getDrinkColor(record.type)}`}>{getDrinkIcon(record.type)}</div>
                        <div>
                           <p className={`font-black text-base ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{record.amount}ml</p>
                           <p className="text-xs text-gray-400 font-bold uppercase tracking-wide">{record.type}</p>
                        </div>
                    </div>
                    <button onClick={() => onDeleteRecord(record.id)} className="text-gray-300 hover:text-red-500 transition-colors"><Trash2 size={20} /></button>
                 </div>
             ))}
             {filteredRecords.length === 0 && (
               <div className="col-span-full text-center py-20 text-gray-400 font-bold uppercase tracking-widest">No results found</div>
             )}
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto no-scrollbar pb-32">
          {/* Calendar Strip */}
          <div className="mb-6 sm:mb-8">
            <div className="flex justify-between items-end mb-3 sm:mb-4">
                <h3 className={`font-black text-xl sm:text-2xl lg:text-3xl ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{dateDisplay}</h3>
                <div className={`hidden sm:flex items-center space-x-2 font-bold text-xs px-3 py-1.5 rounded-xl ${isDarkMode ? 'bg-white/5 text-purple-400 border border-white/5' : 'bg-purple-50 text-purple-600'}`}>
                   <Target size={14} />
                   <span>Goal: {stats.target}ml</span>
                </div>
            </div>
            <CalendarStrip selectedDate={selectedDate} onSelectDate={onSelectDate} isDarkMode={isDarkMode} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
             {/* Hydration Main Widget */}
             <div className="md:col-span-2 bg-[#7C6AF7] rounded-[2.5rem] sm:rounded-[3.5rem] p-6 sm:p-8 md:p-10 relative shadow-2xl shadow-purple-300/30 text-white overflow-hidden flex flex-col sm:flex-row items-center justify-between">
                <div className="flex flex-col h-full justify-between gap-8 relative z-10 w-full sm:w-1/2">
                    <div className="space-y-4 sm:space-y-6">
                        <div className="flex items-center space-x-2 sm:space-x-3">
                            <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 bg-white rounded-full opacity-100"></div>
                            <span className="text-[10px] sm:text-xs font-black tracking-[0.2em] uppercase opacity-90">Today's Progress</span>
                        </div>
                        <div className="flex items-baseline flex-wrap">
                            <span className="text-6xl sm:text-7xl lg:text-8xl font-black tabular-nums tracking-tighter leading-none">{totalIntake}</span>
                            <span className="text-xl sm:text-2xl lg:text-3xl font-bold ml-2 opacity-50 whitespace-nowrap">/ {stats.target}ml</span>
                        </div>
                    </div>
                    
                    <button 
                        onClick={() => { playClickSound(); onAddWaterClick(); }}
                        className="bg-white text-[#7C6AF7] pl-6 pr-4 sm:pl-8 sm:pr-6 py-4 sm:py-5 rounded-[2.5rem] font-black text-sm sm:text-base shadow-xl active:scale-95 transition-all flex items-center justify-between w-full sm:max-w-[220px]"
                    >
                        <span>Add Drink</span>
                        <Plus size={20} className="sm:size-6 ml-2" />
                    </button>
                </div>

                <div className="flex-shrink-0 flex items-center justify-center relative mt-8 sm:mt-0 w-full sm:w-auto">
                    <div className="relative w-[180px] h-[180px] sm:w-[220px] sm:h-[220px] lg:w-[280px] lg:h-[280px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={chartData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius="75%"
                                    outerRadius="90%"
                                    startAngle={90}
                                    endAngle={-270}
                                    dataKey="value"
                                    stroke="none"
                                    cornerRadius={40}
                                    paddingAngle={0}
                                >
                                    <Cell key="completed" fill="#ffffff" />
                                    <Cell key="remaining" fill="#ffffff" fillOpacity={0.15} />
                                </Pie>
                            </PieChart>
                        </ResponsiveContainer>
                        
                        <div className="absolute inset-0 flex items-center justify-center flex-col text-center">
                            <span className="text-4xl sm:text-5xl lg:text-6xl font-black leading-none">{percentage}%</span>
                            <span className="text-[10px] sm:text-xs lg:text-sm font-black opacity-80 tracking-[0.3em] uppercase mt-1 sm:mt-3">Hydrated</span>
                        </div>
                    </div>
                </div>
             </div>

             {/* Side Stats Sidebar */}
             <div className="grid grid-cols-1 gap-4 lg:gap-6">
                <div className="grid grid-cols-2 md:grid-cols-1 gap-4">
                    {hydrationMetrics.slice(0, 2).map((item, i) => (
                        <div key={i} className={`p-4 sm:p-5 lg:p-6 rounded-[2rem] sm:rounded-[2.5rem] shadow-sm flex items-center border ${isDarkMode ? 'bg-black border-white/10' : 'bg-white border-purple-50'}`}>
                            <div className={`p-3 sm:p-4 rounded-2xl mr-3 sm:mr-4 flex-shrink-0 ${isDarkMode ? 'bg-white/5' : 'bg-[#F4F2FF]'}`}>
                               {React.cloneElement(item.icon as React.ReactElement, { size: 20 })}
                            </div>
                            <div className="min-w-0">
                               <p className={`text-lg sm:text-xl font-black truncate ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{item.val}</p>
                               <p className="text-[9px] sm:text-[10px] text-gray-400 font-bold uppercase tracking-widest truncate">{item.label}</p>
                            </div>
                        </div>
                    ))}
                </div>
                
                <div className={`p-5 sm:p-6 rounded-[2rem] sm:rounded-[2.5rem] shadow-sm border-l-8 border-purple-500 relative overflow-hidden flex flex-col justify-center min-h-[120px] ${isDarkMode ? 'bg-black border border-white/10' : 'bg-white'}`}>
                    <div className="flex justify-between items-center mb-2">
                        <h4 className={`font-black text-[10px] uppercase tracking-widest ${isDarkMode ? 'text-gray-300' : 'text-purple-900'}`}>AI Health Advisor</h4>
                        <button onClick={handleGetAdvice} disabled={loadingAdvice} className={`text-[9px] font-black px-2 py-1 rounded-lg transition-colors ${isDarkMode ? 'bg-white/10 text-purple-400 hover:bg-white/20' : 'bg-purple-50 text-purple-600 hover:bg-purple-100'}`}>
                           {loadingAdvice ? '...' : 'Tip'}
                        </button>
                    </div>
                    <p className={`text-[10px] sm:text-[11px] font-medium leading-relaxed italic pr-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                       {advice || "Click to get personalized hydration insights from HydroAI."}
                    </p>
                </div>
             </div>
          </div>

          {/* Quick Add Presets Section */}
          <div className="mt-8">
            <h3 className={`text-[10px] font-black uppercase tracking-[0.2em] mb-4 ml-4 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>Quick Log</h3>
            <div className="flex gap-4">
              <QuickAddButton amount={250} icon={Droplet} label="Glass" />
              <QuickAddButton amount={500} icon={GlassWater} label="Bottle" />
              <QuickAddButton amount={750} icon={Flame} label="Sport" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;