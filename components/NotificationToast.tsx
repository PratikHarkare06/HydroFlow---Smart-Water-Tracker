import React, { useEffect } from 'react';
import { X, Droplet } from 'lucide-react';

interface NotificationToastProps {
  title: string;
  message: string;
  onClose: () => void;
  onAction?: () => void;
  actionLabel?: string;
}

const NotificationToast: React.FC<NotificationToastProps> = ({ title, message, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed top-6 left-4 right-4 z-[100] animate-slide-up flex justify-center pointer-events-none">
      <div className="rounded-2xl shadow-2xl border-l-4 border-purple-500 p-4 flex items-start gap-3 w-full max-w-sm pointer-events-auto border border-white/10 bg-black backdrop-blur-md">
        <div className="bg-purple-100 dark:bg-purple-900/30 p-2 rounded-full text-purple-600 dark:text-purple-300 flex-shrink-0">
          <Droplet size={20} />
        </div>
        <div className="flex-1">
          <h4 className="font-bold text-sm text-white">{title}</h4>
          <p className="text-xs text-gray-400 mt-1 leading-relaxed">{message}</p>
        </div>
        <button 
          onClick={onClose} 
          className="text-gray-400 hover:text-white p-1"
        >
          <X size={18} />
        </button>
      </div>
    </div>
  );
};

export default NotificationToast;