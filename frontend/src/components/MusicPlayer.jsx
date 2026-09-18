import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Music, Disc } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';

export const MusicPlayer = () => {
  const { settings } = useSettings();
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);

  const audioRef = useRef(null);

  const audioUrl = settings.bg_music_url || 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3';
  const playableAudioUrl = audioUrl.startsWith('/api/')
    ? `${audioUrl}${audioUrl.includes('?') ? '&' : '?'}token=${encodeURIComponent(localStorage.getItem('token') || '')}`
    : audioUrl;

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.load();
      setIsPlaying(false);
      setProgress(0);
      setCurrentTime(0);
      setDuration(0);
    }
  }, [playableAudioUrl]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch(err => {
        console.warn('Audio playback prevented or error:', err);
      });
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const cur = audioRef.current.currentTime;
      const dur = audioRef.current.duration || 1;
      setCurrentTime(cur);
      setDuration(dur);
      setProgress((cur / dur) * 100);
    }
  };

  const handleSeek = (e) => {
    const newProgress = parseFloat(e.target.value);
    if (audioRef.current && duration) {
      const newTime = (newProgress / 100) * duration;
      audioRef.current.currentTime = newTime;
      setProgress(newProgress);
    }
  };

  const formatTime = (secs) => {
    if (!secs || isNaN(secs)) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="fixed bottom-20 md:bottom-6 right-4 z-40">
      <audio
        ref={audioRef}
        src={playableAudioUrl}
        onTimeUpdate={handleTimeUpdate}
        onEnded={() => setIsPlaying(false)}
      />

      {isExpanded ? (
        <div className="glass-card p-4 rounded-2xl shadow-romantic-lg w-72 border border-rose-200/80 animate-fade-in text-rose-900">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 overflow-hidden">
              <Disc className={`w-5 h-5 text-rose-600 ${isPlaying ? 'animate-spin' : ''}`} />
              <span className="text-xs font-semibold truncate text-burgundy-700">
                Our Ambient Melody 🎵
              </span>
            </div>
            <button
              onClick={() => setIsExpanded(false)}
              className="text-xs text-rose-500 hover:text-rose-700 px-1.5 py-0.5 rounded-md hover:bg-rose-100"
            >
              ✕
            </button>
          </div>

          {/* Progress Bar */}
          <div className="space-y-1 mb-3">
            <input
              type="range"
              min="0"
              max="100"
              value={progress || 0}
              onChange={handleSeek}
              className="w-full accent-rose-600 h-1 bg-rose-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-rose-500 font-mono">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between gap-2">
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="p-1.5 rounded-full hover:bg-rose-100 text-rose-600"
            >
              {isMuted || volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>

            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={isMuted ? 0 : volume}
              onChange={(e) => {
                setVolume(parseFloat(e.target.value));
                setIsMuted(false);
              }}
              className="w-16 accent-rose-600 h-1 bg-rose-200 rounded-lg appearance-none cursor-pointer"
            />

            <button
              onClick={togglePlay}
              className="w-9 h-9 rounded-full bg-gradient-to-tr from-rose-500 to-burgundy-600 text-white flex items-center justify-center shadow-md hover:scale-105 transition-transform"
            >
              {isPlaying ? <Pause className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 fill-white ml-0.5" />}
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setIsExpanded(true)}
          className="flex items-center gap-2 px-3 py-2 rounded-full glass-card border border-rose-200 text-burgundy-700 shadow-romantic hover:scale-105 transition-all"
        >
          <Music className={`w-4 h-4 text-rose-600 ${isPlaying ? 'animate-bounce' : ''}`} />
          <span className="text-xs font-semibold hidden sm:inline">Music</span>
          {isPlaying && (
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
          )}
        </button>
      )}
    </div>
  );
};

export default MusicPlayer;
