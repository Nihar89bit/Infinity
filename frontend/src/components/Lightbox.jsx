import React, { useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, Calendar, Heart } from 'lucide-react';

export const Lightbox = ({ memories, currentIndex, onClose, onPrev, onNext }) => {
  if (currentIndex === null || !memories || memories.length === 0) return null;

  const current = memories[currentIndex];
  const token = localStorage.getItem('token');

  // Build authenticated image URL
  const imageUrl = current?.image_filename
    ? `/api/media/${current.image_filename}?token=${token}`
    : '';

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') onPrev();
      if (e.key === 'ArrowRight') onNext();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, onPrev, onNext]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-xl p-4 md:p-8 animate-fade-in">
      
      {/* Top Bar Controls */}
      <div className="absolute top-4 right-4 z-50 flex items-center gap-3">
        <button
          onClick={onClose}
          className="p-2.5 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
          title="Close (Esc)"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Previous Button */}
      {memories.length > 1 && (
        <button
          onClick={onPrev}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-50 p-3 rounded-full bg-white/20 hover:bg-white/30 text-white transition-all hover:scale-110"
          title="Previous Photo (←)"
        >
          <ChevronLeft className="w-8 h-8" />
        </button>
      )}

      {/* Next Button */}
      {memories.length > 1 && (
        <button
          onClick={onNext}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-50 p-3 rounded-full bg-white/20 hover:bg-white/30 text-white transition-all hover:scale-110"
          title="Next Photo (→)"
        >
          <ChevronRight className="w-8 h-8" />
        </button>
      )}

      {/* Main Image Container */}
      <div className="max-w-4xl max-h-[85vh] flex flex-col items-center justify-center">
        <div className="relative group rounded-2xl overflow-hidden shadow-2xl bg-black/40 border border-white/10">
          <img
            src={imageUrl}
            alt={current.title || 'Couple Memory'}
            className="max-h-[70vh] max-w-full object-contain mx-auto transition-transform duration-300"
          />
        </div>

        {/* Photo Info Bar */}
        <div className="mt-4 text-center text-white max-w-xl">
          <h3 className="text-xl md:text-2xl font-serif font-bold text-rose-200 flex items-center justify-center gap-2">
            <Heart className="w-5 h-5 fill-rose-400 text-rose-400 inline" />
            {current.title || 'Our Special Memory'}
          </h3>
          {current.caption && (
            <p className="mt-2 text-sm text-gray-200 leading-relaxed font-sans">
              "{current.caption}"
            </p>
          )}
          {current.memory_date && (
            <div className="mt-2 inline-flex items-center gap-1.5 text-xs text-rose-300/80 bg-white/10 px-3 py-1 rounded-full">
              <Calendar className="w-3.5 h-3.5" />
              <span>{new Date(current.memory_date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Lightbox;
