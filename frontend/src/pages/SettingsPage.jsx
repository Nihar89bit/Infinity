import React, { useState } from 'react';
import { Settings, Heart, Lock, KeyRound, Save, Music, UserCheck, Shield } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';
import { useAuth } from '../context/AuthContext';
import { Toast } from '../components/Toast';

export const SettingsPage = () => {
  const { settings, updateSettings } = useSettings();
  const { logout } = useAuth();

  // Settings form
  const [myName, setMyName] = useState(settings.my_name || '');
  const [gfName, setGfName] = useState(settings.gf_name || '');
  const [startDate, setStartDate] = useState(settings.relationship_start_date || '');
  const [anniversaryDate, setAnniversaryDate] = useState(settings.anniversary_date || '');
  const [appTitle, setAppTitle] = useState(settings.app_title || '');
  const [bgMusicUrl, setBgMusicUrl] = useState(settings.bg_music_url || '');
  const [musicFile, setMusicFile] = useState(null);
  const [uploadingMusic, setUploadingMusic] = useState(false);

  // Password Form
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  // PIN Form
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');

  const [savingSettings, setSavingSettings] = useState(false);
  const [toast, setToast] = useState({ message: '', type: 'success' });

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setSavingSettings(true);
    try {
      await updateSettings({
        my_name: myName,
        gf_name: gfName,
        relationship_start_date: startDate,
        anniversary_date: anniversaryDate,
        app_title: appTitle,
        bg_music_url: bgMusicUrl
      });
      setToast({ message: 'Couple settings saved! ❤️', type: 'success' });
    } catch (err) {
      setToast({ message: err.message || 'Failed to save settings', type: 'error' });
    } finally {
      setSavingSettings(false);
    }
  };

  const handleMusicUpload = async (e) => {
    e.preventDefault();
    if (!musicFile) return;

    setUploadingMusic(true);
    try {
      const formData = new FormData();
      formData.append('music', musicFile);
      const token = localStorage.getItem('token');
      const res = await fetch('/api/settings/music', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        credentials: 'include',
        body: formData
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to add music');
      setBgMusicUrl(data.bg_music_url);
      await updateSettings({ bg_music_url: data.bg_music_url });
      setMusicFile(null);
      e.target.reset();
      setToast({ message: 'Music changed successfully! 🎵', type: 'success' });
    } catch (err) {
      setToast({ message: err.message || 'Failed to add music', type: 'error' });
    } finally {
      setUploadingMusic(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) return;

    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/auth/password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ currentPassword, newPassword })
      });

      const data = await res.json();
      if (res.ok) {
        setToast({ message: 'Account password updated! 🔐', type: 'success' });
        setCurrentPassword('');
        setNewPassword('');
      } else {
        setToast({ message: data.error || 'Failed to update password', type: 'error' });
      }
    } catch (err) {
      setToast({ message: 'Error updating password', type: 'error' });
    }
  };

  const handleChangePin = async (e) => {
    e.preventDefault();
    if (!currentPin || !newPin) return;

    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/settings/pin', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ currentPin, newPin })
      });

      const data = await res.json();
      if (res.ok) {
        setToast({ message: 'Secret Corner PIN updated! 🔐', type: 'success' });
        sessionStorage.setItem('secret_pin', newPin);
        setCurrentPin('');
        setNewPin('');
      } else {
        setToast({ message: data.error || 'Failed to update PIN', type: 'error' });
      }
    } catch (err) {
      setToast({ message: 'Error updating PIN', type: 'error' });
    }
  };

  return (
    <div className="space-y-8 pb-12 animate-fade-in max-w-4xl mx-auto">
      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: 'success' })} />

      {/* Header */}
      <div className="glass-card p-6 rounded-3xl border border-white/80 shadow-romantic">
        <h2 className="text-2xl font-serif font-bold text-burgundy-700 flex items-center gap-2">
          <Settings className="w-6 h-6 text-rose-500" />
          <span>Settings & Personalization ⚙️</span>
        </h2>
        <p className="text-xs text-rose-700 mt-1">
          Customize your names, start date, anniversary, background audio, and private security.
        </p>
      </div>

      {/* 1. Couple Profile Settings */}
      <div className="glass-card p-6 md:p-8 rounded-3xl border border-white/80 shadow-romantic space-y-6">
        <h3 className="text-lg font-serif font-bold text-burgundy-700 flex items-center gap-2 border-b border-rose-100 pb-3">
          <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />
          <span>Couple Personalization</span>
        </h3>

        <form onSubmit={handleSaveSettings} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-rose-800 mb-1">
                Your Name (`MY_NAME`)
              </label>
              <input
                type="text"
                value={myName}
                onChange={(e) => setMyName(e.target.value)}
                required
                className="w-full px-4 py-2.5 rounded-xl bg-white/80 border border-rose-200 text-xs focus:outline-none focus:ring-2 focus:ring-rose-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-rose-800 mb-1">
                Her Name (`GF_NAME`)
              </label>
              <input
                type="text"
                value={gfName}
                onChange={(e) => setGfName(e.target.value)}
                required
                className="w-full px-4 py-2.5 rounded-xl bg-white/80 border border-rose-200 text-xs focus:outline-none focus:ring-2 focus:ring-rose-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-rose-800 mb-1">
                Relationship Start Date (`RELATIONSHIP_START_DATE`)
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
                className="w-full px-4 py-2.5 rounded-xl bg-white/80 border border-rose-200 text-xs focus:outline-none focus:ring-2 focus:ring-rose-400 text-rose-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-rose-800 mb-1">
                Anniversary Date (`ANNIVERSARY_DATE`)
              </label>
              <input
                type="date"
                value={anniversaryDate}
                onChange={(e) => setAnniversaryDate(e.target.value)}
                required
                className="w-full px-4 py-2.5 rounded-xl bg-white/80 border border-rose-200 text-xs focus:outline-none focus:ring-2 focus:ring-rose-400 text-rose-900"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-rose-800 mb-1">
              Website Title Header
            </label>
            <input
              type="text"
              value={appTitle}
              onChange={(e) => setAppTitle(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-white/80 border border-rose-200 text-xs focus:outline-none focus:ring-2 focus:ring-rose-400"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-rose-800 mb-1 flex items-center gap-1.5">
              <Music className="w-3.5 h-3.5 text-rose-500" />
              <span>Background Ambient Music URL</span>
            </label>
            <input
              type="url"
              value={bgMusicUrl}
              onChange={(e) => setBgMusicUrl(e.target.value)}
              placeholder="https://example.com/song.mp3"
              className="w-full px-4 py-2.5 rounded-xl bg-white/80 border border-rose-200 text-xs focus:outline-none focus:ring-2 focus:ring-rose-400"
            />
          </div>

          <div className="rounded-2xl border border-rose-200 bg-rose-50/60 p-4 space-y-3">
            <div>
              <p className="text-xs font-semibold text-rose-800">Add or change music</p>
              <p className="text-[11px] text-rose-600 mt-1">Upload an audio file to replace the current background track.</p>
            </div>
            <form onSubmit={handleMusicUpload} className="flex flex-col sm:flex-row gap-3 sm:items-center">
              <input
                type="file"
                accept="audio/*"
                onChange={(e) => setMusicFile(e.target.files?.[0] || null)}
                className="w-full text-xs text-rose-700 file:mr-3 file:rounded-xl file:border-0 file:bg-rose-500 file:px-3 file:py-2 file:text-xs file:font-semibold file:text-white hover:file:bg-rose-600"
              />
              <button
                type="submit"
                disabled={!musicFile || uploadingMusic}
                className="shrink-0 px-4 py-2.5 rounded-xl bg-burgundy-700 text-white text-xs font-semibold disabled:opacity-50"
              >
                {uploadingMusic ? 'Uploading...' : 'Add Music'}
              </button>
            </form>
          </div>

          <button
            type="submit"
            disabled={savingSettings}
            className="px-6 py-3 rounded-2xl bg-gradient-to-tr from-rose-500 to-burgundy-600 text-white text-xs font-semibold shadow-md hover:scale-105 transition-all flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>{savingSettings ? 'Saving...' : 'Save Settings'}</span>
          </button>
        </form>
      </div>

      {/* 2. Secret Corner PIN Management */}
      <div className="glass-card p-6 md:p-8 rounded-3xl border border-white/80 shadow-romantic space-y-6">
        <h3 className="text-lg font-serif font-bold text-burgundy-700 flex items-center gap-2 border-b border-rose-100 pb-3">
          <Lock className="w-5 h-5 text-rose-500" />
          <span>Secret Corner PIN (4-Digits)</span>
        </h3>

        <form onSubmit={handleChangePin} className="space-y-4 max-w-md">
          <div>
            <label className="block text-xs font-semibold text-rose-800 mb-1">
              Current PIN
            </label>
            <input
              type="password"
              maxLength="4"
              value={currentPin}
              onChange={(e) => setCurrentPin(e.target.value)}
              placeholder="••••"
              required
              className="w-full px-4 py-2.5 rounded-xl bg-white/80 border border-rose-200 text-xs focus:outline-none focus:ring-2 focus:ring-rose-400 font-mono tracking-widest text-center"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-rose-800 mb-1">
              New 4-Digit PIN
            </label>
            <input
              type="password"
              maxLength="4"
              value={newPin}
              onChange={(e) => setNewPin(e.target.value)}
              placeholder="••••"
              required
              className="w-full px-4 py-2.5 rounded-xl bg-white/80 border border-rose-200 text-xs focus:outline-none focus:ring-2 focus:ring-rose-400 font-mono tracking-widest text-center"
            />
          </div>

          <button
            type="submit"
            className="px-6 py-2.5 rounded-2xl bg-burgundy-700 text-white text-xs font-semibold shadow-md hover:bg-burgundy-800 transition-colors"
          >
            Update Secret PIN 🔐
          </button>
        </form>
      </div>

      {/* 3. Account Password Security */}
      <div className="glass-card p-6 md:p-8 rounded-3xl border border-white/80 shadow-romantic space-y-6">
        <h3 className="text-lg font-serif font-bold text-burgundy-700 flex items-center gap-2 border-b border-rose-100 pb-3">
          <KeyRound className="w-5 h-5 text-rose-500" />
          <span>Change Account Password</span>
        </h3>

        <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
          <div>
            <label className="block text-xs font-semibold text-rose-800 mb-1">
              Current Password
            </label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              className="w-full px-4 py-2.5 rounded-xl bg-white/80 border border-rose-200 text-xs focus:outline-none focus:ring-2 focus:ring-rose-400"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-rose-800 mb-1">
              New Password (Min 6 chars)
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={6}
              className="w-full px-4 py-2.5 rounded-xl bg-white/80 border border-rose-200 text-xs focus:outline-none focus:ring-2 focus:ring-rose-400"
            />
          </div>

          <button
            type="submit"
            className="px-6 py-2.5 rounded-2xl bg-rose-600 text-white text-xs font-semibold shadow-md hover:bg-rose-700 transition-colors"
          >
            Update Account Password 🔑
          </button>
        </form>
      </div>

    </div>
  );
};

export default SettingsPage;
