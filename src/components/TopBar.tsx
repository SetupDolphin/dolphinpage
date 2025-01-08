import { useState, useEffect } from 'react';

export const TopBar = () => {
  const [datetime, setDatetime] = useState({
    time: '',
    day: '',
    date: '',
    month: '',
    year: ''
  });

  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      
      setDatetime({
        time: now.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false
        }),
        day: now.toLocaleDateString('en-US', { weekday: 'long' }),
        date: now.getDate().toString().padStart(2, '0'),
        month: now.toLocaleDateString('en-US', { month: 'long' }),
        year: now.getFullYear().toString()
      });
    };

    updateDateTime();
    const timer = setInterval(updateDateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex justify-between items-center px-6 py-2 border-[#76E4F7] border-x-2">
      <div className="flex gap-4 text-[#76E4F7] font-mono">
        <span>{datetime.time}</span>
        <span>|</span>
        <span>{datetime.day}</span>
        <span>|</span>
        <span>{datetime.date} {datetime.month}, {datetime.year}</span>
      </div>
      <div className="flex gap-6">
        {['X / TWITTER', 'TELEGRAM'].map((social) => (
          <a 
            key={social} 
            href="#" 
            className="text-[#76E4F7] hover:text-[#0F172A] hover:bg-[#76E4F7] border border-[#76E4F7] px-2 py-1 transition-colors"
          >
            {social}
          </a>
        ))}
      </div>
    </div>
  );
};
