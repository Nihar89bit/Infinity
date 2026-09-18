import React, { useState, useEffect, useRef } from 'react';
import { 
  Heart, 
  Camera, 
  Mail, 
  BookOpen, 
  Clock, 
  Lock, 
  Calendar, 
  Sparkles, 
  ChevronRight,
  Quote,
  ImagePlus,
  SlidersHorizontal,
  X
} from 'lucide-react';
import { useSettings } from '../context/SettingsContext';
import { CONFIG } from '../config';

export const DashboardPage = ({ setActiveTab }) => {
  const { settings, fetchSettings } = useSettings();
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [uploadingBackground, setUploadingBackground] = useState(false);
  const [savingBackgroundLayout, setSavingBackgroundLayout] = useState(false);
  const [isBackgroundAdjusterOpen, setIsBackgroundAdjusterOpen] = useState(true);
  const [backgroundLayout, setBackgroundLayout] = useState({ scale: 100, x: 50, y: 50 });
  const backgroundInputRef = useRef(null);
  const [timeTogether, setTimeTogether] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  const startDateStr = settings.relationship_start_date || CONFIG.RELATIONSHIP_START_DATE;
  const heroBackgroundUrl = settings.hero_background_filename
    ? `/api/media/${encodeURIComponent(settings.hero_background_filename)}`
    : '';

  useEffect(() => {
    setBackgroundLayout({
      scale: Number(settings.hero_background_scale ?? 100),
      x: Number(settings.hero_background_x ?? 50),
      y: Number(settings.hero_background_y ?? 50)
    });
  }, [settings.hero_background_filename, settings.hero_background_scale, settings.hero_background_x, settings.hero_background_y]);

  const handleBackgroundSelect = async (event) => {
    const image = event.target.files?.[0];
    if (!image) return;

    setUploadingBackground(true);
    try {
      const formData = new FormData();
      formData.append('image', image);
      const token = localStorage.getItem('token');
      const res = await fetch('/api/settings/hero-background', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        credentials: 'include',
        body: formData
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Could not update the background.');
      await fetchSettings();
      setIsBackgroundAdjusterOpen(true);
    } catch (err) {
      window.alert(err.message || 'Could not update the background.');
    } finally {
      setUploadingBackground(false);
      event.target.value = '';
    }
  };

  const saveBackgroundLayout = async () => {
    setSavingBackgroundLayout(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/settings/hero-background', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        credentials: 'include',
        body: JSON.stringify(backgroundLayout)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Could not save the photo adjustment.');
      await fetchSettings();
    } catch (err) {
      window.alert(err.message || 'Could not save the photo adjustment.');
    } finally {
      setSavingBackgroundLayout(false);
    }
  };

  // Live timer tick
  useEffect(() => {
    const calculateTime = () => {
      const start = new Date(startDateStr);
      const now = new Date();
      const diffMs = Math.max(0, now - start);

      const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diffMs / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diffMs / (1000 * 60)) % 60);
      const seconds = Math.floor((diffMs / 1000) % 60);

      setTimeTogether({ days, hours, minutes, seconds });
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [startDateStr]);

  // Quotes auto rotation
  useEffect(() => {
    const quotes = CONFIG.ROMANTIC_QUOTES;
    const interval = setInterval(() => {
      setQuoteIndex(prev => (prev + 1) % quotes.length);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  const quickNavCards = [
    {
      id: 'memories',
      title: 'Our Memories',
      subtitle: 'Photo Gallery & Moments',
      icon: Camera,
      badge: '📸 Gallery',
      color: 'from-rose-400 to-rose-600',
    },
    {
      id: 'story',
      title: 'Our Story',
      subtitle: 'How our love unfolded',
      icon: BookOpen,
      badge: '💌 Chapter',
      color: 'from-pink-400 to-rose-500',
    },
    {
      id: 'notes',
      title: 'Love Notes',
      subtitle: 'Handwritten digital letters',
      icon: Mail,
      badge: '💕 Letters',
      color: 'from-burgundy-500 to-rose-600',
    },
    {
      id: 'timeline',
      title: 'Our Timeline',
      subtitle: 'Visual journey together',
      icon: Clock,
      badge: '🕰️ Visual',
      color: 'from-rose-500 to-purple-600',
    },
    {
      id: 'secret',
      title: 'Secret Corner',
      subtitle: 'PIN-protected bucket list',
      icon: Lock,
      badge: '🔐 Private',
      color: 'from-burgundy-600 to-rose-900',
    },
    {
      id: 'events',
      title: 'Special Days',
      subtitle: 'Anniversaries & Countdowns',
      icon: Calendar,
      badge: '🗓️ Countdowns',
      color: 'from-rose-400 to-pink-600',
    },
  ];

  return (
    <div className="space-y-8 pb-12 animate-fade-in">
      
      {/* Welcome Hero Banner */}
      <div
        className="glass-card p-8 md:p-12 rounded-3xl relative overflow-hidden text-center border border-white/80 shadow-romantic-lg bg-cover bg-center"
        style={heroBackgroundUrl ? {
          backgroundImage: `url(${heroBackgroundUrl})`,
          backgroundSize: `${backgroundLayout.scale}% auto`,
          backgroundPosition: `${backgroundLayout.x}% ${backgroundLayout.y}%`
        } : undefined}
      >
        {heroBackgroundUrl && <div className="absolute inset-0 bg-white/70 backdrop-blur-[1px]" />}
        <input
          ref={backgroundInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleBackgroundSelect}
          className="hidden"
        />
        <button
          type="button"
          onClick={() => backgroundInputRef.current?.click()}
          disabled={uploadingBackground}
          className="absolute z-20 top-4 right-4 inline-flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-2 text-xs font-bold text-burgundy-700 shadow-md hover:bg-white disabled:opacity-70 transition-all"
        >
          <ImagePlus className="w-4 h-4 text-rose-500" />
          {uploadingBackground ? 'Uploading...' : heroBackgroundUrl ? 'Change Background' : 'Add Background'}
        </button>
        {heroBackgroundUrl && !isBackgroundAdjusterOpen && (
          <button
            type="button"
            onClick={() => setIsBackgroundAdjusterOpen(true)}
            className="absolute z-20 top-14 right-4 inline-flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-2 text-xs font-bold text-burgundy-700 shadow-md hover:bg-white transition-all"
          >
            <SlidersHorizontal className="w-4 h-4 text-rose-500" /> Adjust photo
          </button>
        )}
        {heroBackgroundUrl && isBackgroundAdjusterOpen && (
          <div className="absolute z-20 bottom-4 right-4 w-56 rounded-2xl bg-white/90 p-3 text-left shadow-lg backdrop-blur">
            <div className="mb-2 flex items-center justify-between">
              <p className="flex items-center gap-1.5 text-xs font-bold text-burgundy-700">
                <SlidersHorizontal className="w-4 h-4 text-rose-500" /> Adjust photo
              </p>
              <button type="button" onClick={() => setIsBackgroundAdjusterOpen(false)} aria-label="Close photo adjustment panel" className="rounded-full p-1 text-rose-500 hover:bg-rose-100 hover:text-burgundy-700">
                <X className="h-4 w-4" />
              </button>
            </div>
            <label className="mb-2 block text-[11px] font-semibold text-rose-700">
              Zoom: {backgroundLayout.scale}%
              <input type="range" min="100" max="220" value={backgroundLayout.scale} onChange={(e) => setBackgroundLayout(prev => ({ ...prev, scale: e.target.value }))} className="mt-1 w-full accent-rose-600" />
            </label>
            <label className="mb-2 block text-[11px] font-semibold text-rose-700">
              Left / right
              <input type="range" min="0" max="100" value={backgroundLayout.x} onChange={(e) => setBackgroundLayout(prev => ({ ...prev, x: e.target.value }))} className="mt-1 w-full accent-rose-600" />
            </label>
            <label className="block text-[11px] font-semibold text-rose-700">
              Up / down
              <input type="range" min="0" max="100" value={backgroundLayout.y} onChange={(e) => setBackgroundLayout(prev => ({ ...prev, y: e.target.value }))} className="mt-1 w-full accent-rose-600" />
            </label>
            <button type="button" onClick={saveBackgroundLayout} disabled={savingBackgroundLayout} className="mt-2 w-full rounded-xl bg-rose-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-burgundy-700 disabled:opacity-70">
              {savingBackgroundLayout ? 'Saving...' : 'Save adjustment'}
            </button>
          </div>
        )}
        
        {/* Decorative ambient elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-rose-200/40 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-cream-100/60 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 max-w-2xl mx-auto space-y-4">
          
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-100/80 text-burgundy-700 text-xs font-semibold shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-rose-500 animate-spin" />
            <span>Just You & Me Forever</span>
          </div>

          <h1 className="font-handwriting text-5xl md:text-6xl font-bold text-burgundy-700 leading-tight">
            Welcome to Our Little World ❤️
          </h1>

          <p className="text-base md:text-lg text-rose-800 font-medium">
            {settings.my_name} <Heart className="w-5 h-5 text-rose-500 fill-rose-500 inline mx-1 animate-pulse" /> {settings.gf_name}
          </p>

          {/* Days Together Counter */}
          <div className="pt-6">
            <p className="text-xs uppercase tracking-widest text-rose-500 font-bold mb-3">
              We Have Been Together For
            </p>
            
            <div className="grid grid-cols-4 gap-2 md:gap-4 max-w-lg mx-auto">
              <div className="glass-card p-3 md:p-4 rounded-2xl border border-rose-200 text-center shadow-xs">
                <span className="block text-2xl md:text-4xl font-serif font-bold text-burgundy-700">
                  {timeTogether.days}
                </span>
                <span className="text-[10px] md:text-xs text-rose-500 uppercase font-semibold">Days</span>
              </div>
              <div className="glass-card p-3 md:p-4 rounded-2xl border border-rose-200 text-center shadow-xs">
                <span className="block text-2xl md:text-4xl font-serif font-bold text-burgundy-700">
                  {timeTogether.hours}
                </span>
                <span className="text-[10px] md:text-xs text-rose-500 uppercase font-semibold">Hours</span>
              </div>
              <div className="glass-card p-3 md:p-4 rounded-2xl border border-rose-200 text-center shadow-xs">
                <span className="block text-2xl md:text-4xl font-serif font-bold text-burgundy-700">
                  {timeTogether.minutes}
                </span>
                <span className="text-[10px] md:text-xs text-rose-500 uppercase font-semibold">Mins</span>
              </div>
              <div className="glass-card p-3 md:p-4 rounded-2xl border border-rose-200 text-center shadow-xs">
                <span className="block text-2xl md:text-4xl font-serif font-bold text-rose-600">
                  {timeTogether.seconds}
                </span>
                <span className="text-[10px] md:text-xs text-rose-500 uppercase font-semibold">Secs</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Rotating Quote Card */}
      <div className="glass-card p-6 md:p-8 rounded-3xl relative border border-rose-200/70 shadow-romantic text-center">
        <Quote className="w-8 h-8 text-rose-300 mx-auto mb-2 opacity-60" />
        <p className="font-serif italic text-lg md:text-xl text-burgundy-700 max-w-xl mx-auto leading-relaxed">
          "{CONFIG.ROMANTIC_QUOTES[quoteIndex]}"
        </p>
        <div className="flex justify-center gap-1.5 mt-4">
          {CONFIG.ROMANTIC_QUOTES.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setQuoteIndex(idx)}
              className={`w-2 h-2 rounded-full transition-all ${
                idx === quoteIndex ? 'bg-rose-600 w-6' : 'bg-rose-200'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Quick Navigation Cards Grid */}
      <div>
        <h2 className="text-xl md:text-2xl font-serif font-bold text-burgundy-700 mb-4 flex items-center gap-2">
          <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />
          <span>Explore Our World</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {quickNavCards.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.id}
                onClick={() => setActiveTab(card.id)}
                className="glass-card p-6 rounded-3xl border border-white/80 shadow-romantic hover:shadow-romantic-lg hover:-translate-y-1 transition-all cursor-pointer group relative overflow-hidden"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${card.color} flex items-center justify-center text-white shadow-md group-hover:scale-110 transition-transform`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-[11px] font-semibold text-rose-600 bg-rose-100/80 px-2.5 py-1 rounded-full">
                    {card.badge}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-burgundy-700 mb-1 group-hover:text-rose-600 transition-colors flex items-center justify-between">
                  <span>{card.title}</span>
                  <ChevronRight className="w-4 h-4 text-rose-400 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                </h3>
                <p className="text-xs text-rose-700/80">
                  {card.subtitle}
                </p>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};

export default DashboardPage;
