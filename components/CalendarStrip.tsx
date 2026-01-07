import React, { useEffect, useState, useRef } from 'react';

interface CalendarStripProps {
  selectedDate: string; // YYYY-MM-DD
  onSelectDate: (date: string) => void;
  isDarkMode?: boolean;
}

const CalendarStrip: React.FC<CalendarStripProps> = ({ selectedDate, onSelectDate, isDarkMode = false }) => {
  const [dates, setDates] = useState<{ day: string; dateNumber: number; fullDateStr: string }[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const dateExists = dates.some(d => d.fullDateStr === selectedDate);
    if (!dateExists) {
        const current = new Date(selectedDate);
        const tempDates = [];
        for (let i = -15; i <= 15; i++) {
            const d = new Date(current);
            d.setDate(current.getDate() + i);
            const isoDate = d.toISOString().split('T')[0];
            tempDates.push({
                day: d.toLocaleDateString('en-US', { weekday: 'short' }),
                dateNumber: d.getDate(),
                fullDateStr: isoDate,
            });
        }
        setDates(tempDates);
    }
  }, [selectedDate, dates]);

  useEffect(() => {
    if (scrollRef.current) {
        const selectedEl = scrollRef.current.querySelector(`[data-date="${selectedDate}"]`);
        if (selectedEl) {
            selectedEl.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
        }
    }
  }, [selectedDate]);

  return (
    <div className="w-full relative group"> 
        <div className={`absolute left-0 top-0 bottom-0 w-12 z-10 pointer-events-none bg-gradient-to-r ${isDarkMode ? 'from-black' : 'from-purple-50'} to-transparent`}></div>
        <div className={`absolute right-0 top-0 bottom-0 w-12 z-10 pointer-events-none bg-gradient-to-l ${isDarkMode ? 'from-black' : 'from-purple-50'} to-transparent`}></div>
        
        <div 
            ref={scrollRef}
            className="flex space-x-3 overflow-x-auto no-scrollbar py-4 px-4 snap-x items-center"
        >
            {dates.map((item) => {
            const isActive = item.fullDateStr === selectedDate;
            return (
                <button
                key={item.fullDateStr}
                data-date={item.fullDateStr}
                onClick={() => onSelectDate(item.fullDateStr)}
                className={`flex flex-col items-center justify-center min-w-[3.5rem] h-20 rounded-[20px] transition-all duration-500 ease-out snap-center ${
                    isActive
                    ? 'bg-purple-500 text-white shadow-lg scale-110 z-10'
                    : `${isDarkMode ? 'bg-white/5 text-gray-400 border border-white/10' : 'bg-white text-gray-400'} scale-95 hover:scale-100`
                }`}
                >
                <span className="text-[10px] font-bold mb-1 uppercase tracking-wider opacity-80">{item.day}</span>
                <span className={`text-xl font-bold ${isActive ? 'text-white' : isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                    {item.dateNumber}
                </span>
                <div className={`w-1 h-1 rounded-full mt-1 transition-all duration-500 ${isActive ? 'bg-white scale-100' : 'bg-transparent scale-0'}`}></div>
                </button>
            );
            })}
        </div>
    </div>
  );
};

export default CalendarStrip;