import React, { useState } from 'react';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, YAxis, CartesianGrid } from 'recharts';
import { Achievement, DailyStats } from '../types';
import { generateWeeklyReport } from '../services/geminiService';
import { Sparkles, Flame, Trophy } from 'lucide-react';

interface StatisticsProps {
  history: DailyStats[]; 
  achievements: Achievement[];
  currentStreak: number;
  isDarkMode: boolean;
  onViewAchievements?: () => void;
}

const Statistics: React.FC<StatisticsProps> = ({ history, achievements, currentStreak, isDarkMode, onViewAchievements }) => {
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);

  const weeklyData = history.map(day => ({
    day: new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' }),
    amount: day.records.reduce((sum, r) => sum + r.amount, 0),
  })).reverse().slice(0, 7).reverse();

  const typeDistribution: Record<string, number> = {};
  history.forEach(day => {
    day.records.forEach(r => {
      typeDistribution[r.type] = (typeDistribution[r.type] || 0) + r.amount;
    });
  });

  const pieData = Object.keys(typeDistribution).map(type => ({
    name: type,
    value: typeDistribution[type]
  }));

  const COLORS = ['#8b5cf6', '#f59e0b', '#10b981', '#f97316', '#ef4444'];

  const handleAnalyze = async () => {
    setLoadingAnalysis(true);
    const report = await generateWeeklyReport(history);
    setAnalysis(report);
    setLoadingAnalysis(false);
  };

  const unlockedCount = achievements.filter(a => a.unlocked).length;

  return (
    <div className={`flex flex-col h-full px-4 py-6 md:p-6 transition-colors duration-300 overflow-y-auto no-scrollbar pb-32 ${isDarkMode ? 'bg-black' : 'bg-purple-50'}`}>
      <h2 className={`text-2xl font-black mb-6 px-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Statistics</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          <div className="flex flex-col gap-4 md:gap-6">
             <div className="grid grid-cols-2 gap-4">
                <div className={`p-5 rounded-[2rem] shadow-sm flex flex-col items-center justify-center relative overflow-hidden ${isDarkMode ? 'bg-black border border-white/10' : 'bg-white'}`}>
                  <div className={`absolute -right-4 -top-4 w-20 h-20 rounded-full opacity-30 blur-xl ${isDarkMode ? 'bg-orange-900' : 'bg-orange-100'}`}></div>
                  <Flame size={28} className="text-orange-500 mb-2 animate-bounce-slow" />
                  <span className={`text-2xl font-black ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{currentStreak}</span>
                  <span className="text-[9px] text-gray-400 font-black uppercase tracking-widest">Day Streak</span>
                </div>
                
                <button onClick={onViewAchievements} className={`p-5 rounded-[2rem] shadow-sm flex flex-col items-center justify-center relative overflow-hidden hover:opacity-95 active:scale-[0.98] transition-all ${isDarkMode ? 'bg-black border border-white/10' : 'bg-white'}`}>
                    <div className={`absolute -left-4 -bottom-4 w-20 h-20 rounded-full opacity-30 blur-xl ${isDarkMode ? 'bg-yellow-900' : 'bg-yellow-100'}`}></div>
                    <Trophy size={28} className="text-yellow-500 mb-2" />
                    <span className={`text-2xl font-black ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{unlockedCount}/{achievements.length}</span>
                    <span className="text-[9px] text-gray-400 font-black uppercase tracking-widest">Badges</span>
                </button>
             </div>

             <div className={`p-6 rounded-[2rem] shadow-sm relative overflow-hidden border ${isDarkMode ? 'bg-black border-white/10' : 'bg-white border-transparent'}`}>
                <div className="flex justify-between items-start mb-4 relative z-10">
                    <div className="flex items-center">
                        <div className={`p-2.5 rounded-2xl mr-3 ${isDarkMode ? 'bg-white/5 text-purple-400' : 'bg-purple-50 text-purple-600'}`}>
                            <Sparkles size={18} className="fill-current" />
                        </div>
                        <div>
                            <h3 className={`font-black text-xs ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>Weekly Insights</h3>
                            <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest">AI Report</p>
                        </div>
                    </div>
                    {!analysis && (
                        <button 
                            onClick={handleAnalyze}
                            disabled={loadingAnalysis}
                            className="bg-purple-600 text-white px-3 py-1.5 rounded-xl text-[10px] font-black shadow-lg hover:opacity-90 transition-all disabled:opacity-50"
                        >
                            {loadingAnalysis ? '...' : 'Analyze'}
                        </button>
                    )}
                </div>
                
                {analysis ? (
                    <div className="animate-fade-in relative z-10">
                        <p className={`text-[11px] leading-relaxed font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            {analysis}
                        </p>
                        <button onClick={() => setAnalysis(null)} className="text-[9px] text-purple-600 font-black mt-3 uppercase tracking-wider">
                            Refresh
                        </button>
                    </div>
                ) : (
                    <p className="text-[10px] text-gray-400 font-medium italic">Get personalized insights on your hydration habits.</p>
                )}
             </div>
          </div>

          <div className="flex flex-col gap-4 md:gap-6">
             <div className={`p-5 md:p-6 rounded-[2.5rem] shadow-xl ${isDarkMode ? 'bg-black border border-white/10' : 'bg-white border border-purple-100 shadow-purple-200/10'}`}>
                <div className="flex justify-between items-center mb-6">
                  <h3 className={`font-black text-xs uppercase tracking-widest ${isDarkMode ? 'text-white' : 'text-purple-900'}`}>Weekly Intake</h3>
                  <div className={`text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-tighter shadow-sm border ${isDarkMode ? 'bg-white/5 border-white/10 text-purple-400' : 'bg-purple-600 border-purple-500 text-white'}`}>
                    Last 7 Days
                  </div>
                </div>
                
                <div className="h-44 md:h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={weeklyData} margin={{ top: 5, right: 0, left: -25, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDarkMode ? '#1a1a1a' : '#f0f0f0'} />
                      <XAxis 
                        dataKey="day" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: isDarkMode ? '#666666' : '#6b7280', fontSize: 10, fontWeight: 800 }} 
                        dy={8}
                      />
                      <YAxis 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: isDarkMode ? '#666666' : '#6b7280', fontSize: 9, fontWeight: 700 }}
                      />
                      <Tooltip 
                        cursor={{ fill: isDarkMode ? '#ffffff' : '#f3f4f6', opacity: 0.05 }} 
                        contentStyle={{
                            borderRadius: '12px', 
                            border: 'none', 
                            backgroundColor: '#000',
                            color: '#fff',
                            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)',
                            fontSize: '10px',
                            fontWeight: 'bold'
                        }}
                      />
                      <Bar dataKey="amount" fill="#8b5cf6" radius={[6, 6, 6, 6]} barSize={16} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
             </div>

             <div className={`p-6 rounded-[2.5rem] shadow-sm border ${isDarkMode ? 'bg-black border-white/10' : 'bg-white border-purple-50'}`}>
                <h3 className={`font-black text-xs uppercase tracking-widest mb-6 ${isDarkMode ? 'text-gray-200' : 'text-purple-900'}`}>Drink Types</h3>
                <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                  <div className="h-36 w-36 relative flex-shrink-0">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                              data={pieData.length > 0 ? pieData : [{ name: 'None', value: 1 }]}
                              innerRadius={40}
                              outerRadius={60}
                              paddingAngle={6}
                              dataKey="value"
                              stroke="none"
                            >
                            {pieData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} cornerRadius={6} />
                            ))}
                            {pieData.length === 0 && <Cell fill={isDarkMode ? '#1a1a1a' : '#f3f4f6'} />}
                            </Pie>
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none">
                         <span className="text-[8px] font-black text-gray-400 uppercase tracking-tighter">Mix</span>
                      </div>
                  </div>
                  <div className="flex-1 w-full space-y-2">
                      {pieData.map((entry, index) => (
                        <div key={entry.name} className={`flex items-center justify-between p-2.5 rounded-2xl ${isDarkMode ? 'bg-white/5' : 'bg-gray-50/50'}`}>
                            <div className="flex items-center">
                              <div className="w-2.5 h-2.5 rounded-full mr-3" style={{backgroundColor: COLORS[index % COLORS.length]}}></div>
                              <span className="text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-wider">{entry.name}</span>
                            </div>
                            <span className={`text-[10px] font-black ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>{entry.value}ml</span>
                        </div>
                      ))}
                  </div>
                </div>
             </div>
          </div>
      </div>
    </div>
  );
};

export default Statistics;