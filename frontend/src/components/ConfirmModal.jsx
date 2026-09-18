import React from 'react';
import { Heart, Trash2, AlertTriangle } from 'lucide-react';

export const ConfirmModal = ({ isOpen, title, message, confirmText = 'Delete', onConfirm, onCancel }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
      <div className="glass-card p-6 rounded-3xl max-w-sm w-full text-center border border-rose-200 shadow-romantic-lg">
        <div className="w-12 h-12 rounded-full bg-rose-100 flex items-center justify-center mx-auto mb-3 text-rose-600">
          <Trash2 className="w-6 h-6" />
        </div>
        <h3 className="text-xl font-serif font-bold text-burgundy-700 mb-1">
          {title || 'Are you sure?'}
        </h3>
        <p className="text-xs text-rose-700/80 mb-6 leading-relaxed">
          {message || 'Are you sure you want to let go of this memory? ❤️'}
        </p>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl border border-rose-200 text-rose-700 font-medium text-sm hover:bg-rose-50 transition-colors"
          >
            Keep It
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-2.5 rounded-xl bg-gradient-to-tr from-rose-600 to-burgundy-700 text-white font-medium text-sm shadow-md hover:opacity-90 transition-opacity"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
