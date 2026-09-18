import React, { useEffect } from 'react';
import { Heart, CheckCircle2, AlertCircle, X } from 'lucide-react';

export const Toast = ({ message, type = 'success', onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  if (!message) return null;

  const isError = type === 'error';

  return (
    <div className="fixed top-6 right-6 z-50 animate-bounce">
      <div className={`flex items-center gap-3 px-4 py-3 rounded-2xl shadow-romantic-lg border ${
        isError 
          ? 'bg-rose-900/90 text-rose-100 border-rose-700' 
          : 'bg-white/90 backdrop-blur-md text-burgundy-700 border-rose-200'
      }`}>
        {isError ? (
          <AlertCircle className="w-5 h-5 text-rose-400" />
        ) : (
          <Heart className="w-5 h-5 text-rose-500 fill-rose-500 animate-pulse" />
        )}
        <span className="text-sm font-medium">{message}</span>
        <button
          onClick={onClose}
          className="ml-2 text-rose-400 hover:text-rose-600 p-0.5 rounded-full hover:bg-rose-100/50"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default Toast;
