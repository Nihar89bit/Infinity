import React, { useState, useEffect } from 'react';
import { Lock, Unlock, Delete, KeyRound, Sparkles } from 'lucide-react';

export const PinModal = ({ isOpen, onUnlock, onClose }) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [isShaking, setIsShaking] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setPin('');
      setError('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleKeyPress = (num) => {
    if (pin.length < 4) {
      const nextPin = pin + num;
      setPin(nextPin);
      setError('');
      if (nextPin.length === 4) {
        submitPin(nextPin);
      }
    }
  };

  const handleDelete = () => {
    setPin(prev => prev.slice(0, -1));
    setError('');
  };

  const submitPin = async (enteredPin) => {
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/settings/verify-pin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include',
        body: JSON.stringify({ pin: enteredPin })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        onUnlock(enteredPin);
      } else {
        setError(data.error || 'Incorrect Secret PIN. Keyhole remains locked 🔐');
        setIsShaking(true);
        setTimeout(() => setIsShaking(false), 600);
        setPin('');
      }
    } catch (err) {
      setError('Connection error. Please try again.');
      setPin('');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in">
      <div className={`glass-card-dark p-6 md:p-8 rounded-3xl max-w-sm w-full text-center relative border border-rose-500/30 text-rose-100 ${isShaking ? 'animate-bounce' : ''}`}>
        
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-rose-300/60 hover:text-white text-sm"
          >
            ✕
          </button>
        )}

        <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-rose-600 to-burgundy-700 flex items-center justify-center mx-auto mb-4 shadow-xl border border-rose-400/30">
          <Lock className="w-8 h-8 text-white fill-white/20 animate-pulse" />
        </div>

        <h3 className="text-2xl font-serif font-bold text-white mb-1 flex items-center justify-center gap-2">
          Secret Corner 🔐
        </h3>
        <p className="text-xs text-rose-300 mb-6">
          Enter our private 4-digit PIN to open the vault.
        </p>

        {/* PIN Indicators */}
        <div className="flex justify-center gap-4 mb-6">
          {[0, 1, 2, 3].map((index) => (
            <div
              key={index}
              className={`w-4 h-4 rounded-full border-2 transition-all duration-200 ${
                pin.length > index
                  ? 'bg-rose-500 border-rose-400 scale-125 shadow-lg shadow-rose-500/50'
                  : 'border-rose-400/40 bg-transparent'
              }`}
            />
          ))}
        </div>

        {error && (
          <p className="text-xs text-rose-400 mb-4 bg-rose-950/60 py-1.5 px-3 rounded-lg border border-rose-800">
            {error}
          </p>
        )}

        {/* Keypad Grid */}
        <div className="grid grid-cols-3 gap-3 max-w-[240px] mx-auto">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <button
              key={num}
              onClick={() => handleKeyPress(String(num))}
              disabled={isSubmitting}
              className="w-14 h-14 rounded-2xl bg-white/10 hover:bg-rose-600/40 border border-white/10 text-xl font-semibold text-white flex items-center justify-center active:scale-95 transition-all"
            >
              {num}
            </button>
          ))}
          <div />
          <button
            onClick={() => handleKeyPress('0')}
            disabled={isSubmitting}
            className="w-14 h-14 rounded-2xl bg-white/10 hover:bg-rose-600/40 border border-white/10 text-xl font-semibold text-white flex items-center justify-center active:scale-95 transition-all"
          >
            0
          </button>
          <button
            onClick={handleDelete}
            disabled={isSubmitting}
            className="w-14 h-14 rounded-2xl bg-white/10 hover:bg-rose-600/40 border border-white/10 text-white flex items-center justify-center active:scale-95 transition-all"
            title="Backspace"
          >
            <Delete className="w-5 h-5 text-rose-300" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default PinModal;
