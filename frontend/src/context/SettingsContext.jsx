import React, { createContext, useContext, useState, useEffect } from 'react';
import { CONFIG } from '../config';

const SettingsContext = createContext();

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState({
    my_name: CONFIG.MY_NAME,
    gf_name: CONFIG.GF_NAME,
    relationship_start_date: CONFIG.RELATIONSHIP_START_DATE,
    anniversary_date: CONFIG.ANNIVERSARY_DATE,
    app_title: CONFIG.WEBSITE_TITLE,
    bg_music_url: CONFIG.DEFAULT_AUDIO_URL,
    my_avatar: '',
    gf_avatar: '',
    hero_background_filename: '',
    hero_background_scale: 100,
    hero_background_x: 50,
    hero_background_y: 50
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/settings');
      if (res.ok) {
        const data = await res.json();
        setSettings(prev => ({
          ...prev,
          my_name: data.my_name || CONFIG.MY_NAME,
          gf_name: data.gf_name || CONFIG.GF_NAME,
          relationship_start_date: data.relationship_start_date ? data.relationship_start_date.split('T')[0] : CONFIG.RELATIONSHIP_START_DATE,
          anniversary_date: data.anniversary_date ? data.anniversary_date.split('T')[0] : CONFIG.ANNIVERSARY_DATE,
          app_title: data.app_title || CONFIG.WEBSITE_TITLE,
          bg_music_url: data.bg_music_url !== undefined ? data.bg_music_url : CONFIG.DEFAULT_AUDIO_URL,
          my_avatar: data.my_avatar || '',
          gf_avatar: data.gf_avatar || '',
          hero_background_filename: data.hero_background_filename || '',
          hero_background_scale: data.hero_background_scale ?? 100,
          hero_background_x: data.hero_background_x ?? 50,
          hero_background_y: data.hero_background_y ?? 50
        }));
      }
    } catch (err) {
      console.warn('Failed to load DB settings, using default config:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateSettings = async (newSettings) => {
    const token = localStorage.getItem('token');
    const res = await fetch('/api/settings', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      credentials: 'include',
      body: JSON.stringify(newSettings)
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to update settings');
    }

    if (data.settings) {
      setSettings(prev => ({
        ...prev,
        ...data.settings,
        relationship_start_date: data.settings.relationship_start_date?.split('T')[0] || prev.relationship_start_date,
        anniversary_date: data.settings.anniversary_date?.split('T')[0] || prev.anniversary_date,
      }));
    }
    return data;
  };

  return (
    <SettingsContext.Provider value={{ settings, loading, fetchSettings, updateSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => useContext(SettingsContext);
