const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');
const { query } = require('../database/db');

exports.getSettings = async (req, res) => {
  try {
    const settings = await query('SELECT id, my_name, gf_name, relationship_start_date, anniversary_date, app_title, my_avatar, gf_avatar, hero_background_filename, hero_background_scale, hero_background_x, hero_background_y, bg_music_url, updated_at FROM settings LIMIT 1');
    if (settings.length === 0) {
      return res.status(404).json({ error: 'Settings not initialized' });
    }
    return res.json(settings[0]);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch settings', details: err.message });
  }
};

exports.updateSettings = async (req, res) => {
  try {
    const { my_name, gf_name, relationship_start_date, anniversary_date, app_title, bg_music_url } = req.body;

    const existing = await query('SELECT id FROM settings LIMIT 1');
    if (existing.length === 0) {
      const defaultPinHash = await bcrypt.hash('1234', 10);
      await query(
        `INSERT INTO settings (my_name, gf_name, relationship_start_date, anniversary_date, secret_pin_hash, app_title, bg_music_url) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [my_name || 'Nihar', gf_name || 'Isha', relationship_start_date || '2026-06-23', anniversary_date || '2026-06-23', defaultPinHash, app_title || 'Infinity ❤️', bg_music_url || '']
      );
    } else {
      await query(
        `UPDATE settings SET 
           my_name = COALESCE(?, my_name),
           gf_name = COALESCE(?, gf_name),
           relationship_start_date = COALESCE(?, relationship_start_date),
           anniversary_date = COALESCE(?, anniversary_date),
           app_title = COALESCE(?, app_title),
           bg_music_url = COALESCE(?, bg_music_url),
           updated_at = CURRENT_TIMESTAMP
         WHERE id = ?`,
        [my_name, gf_name, relationship_start_date, anniversary_date, app_title, bg_music_url, existing[0].id]
      );
    }

    const updated = await query('SELECT id, my_name, gf_name, relationship_start_date, anniversary_date, app_title, my_avatar, gf_avatar, hero_background_filename, hero_background_scale, hero_background_x, hero_background_y, bg_music_url, updated_at FROM settings LIMIT 1');
    return res.json({ message: 'Couple settings saved! ❤️', settings: updated[0] });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to update settings', details: err.message });
  }
};

exports.uploadMusic = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Please choose an audio file.' });
    }

    const settings = await query('SELECT id, bg_music_url FROM settings LIMIT 1');
    if (settings.length === 0) {
      return res.status(404).json({ error: 'Settings are not initialized.' });
    }

    const musicUrl = `/api/settings/music/${encodeURIComponent(req.file.filename)}`;
    await query('UPDATE settings SET bg_music_url = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [musicUrl, settings[0].id]);

    if (settings[0].bg_music_url?.startsWith('/api/settings/music/')) {
      const previousFilename = path.basename(settings[0].bg_music_url.split('?')[0]);
      const previousPath = path.join(__dirname, '..', 'uploads', 'music', previousFilename);
      if (fs.existsSync(previousPath) && previousFilename !== req.file.filename) fs.unlinkSync(previousPath);
    }

    return res.json({ message: 'Music changed successfully!', bg_music_url: musicUrl });
  } catch (err) {
    if (req.file?.path && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    return res.status(500).json({ error: err.message || 'Failed to upload music' });
  }
};

exports.streamMusic = (req, res) => {
  const safeFilename = path.basename(req.params.filename);
  const filePath = path.join(__dirname, '..', 'uploads', 'music', safeFilename);
  if (!fs.existsSync(filePath)) return res.status(404).json({ error: 'Music file not found.' });
  return res.sendFile(filePath);
};

exports.uploadHeroBackground = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Please choose a JPG, PNG, or WEBP photo.' });
    }

    const settings = await query('SELECT id, hero_background_filename FROM settings LIMIT 1');
    if (settings.length === 0) {
      return res.status(404).json({ error: 'Settings are not initialized.' });
    }

    const previousFilename = settings[0].hero_background_filename;
    await query('UPDATE settings SET hero_background_filename = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [req.file.filename, settings[0].id]);

    // The old background is no longer needed and is not referenced by memories.
    if (previousFilename && previousFilename !== req.file.filename) {
      const previousPath = path.join(__dirname, '..', 'uploads', 'memories', path.basename(previousFilename));
      if (fs.existsSync(previousPath)) fs.unlinkSync(previousPath);
    }

    return res.json({
      message: 'Dashboard background updated!',
      hero_background_filename: req.file.filename
    });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to upload dashboard background', details: err.message });
  }
};

exports.updateHeroBackgroundLayout = async (req, res) => {
  try {
    const clamp = (value, min, max, fallback) => {
      const numeric = Number(value);
      return Number.isFinite(numeric) ? Math.min(max, Math.max(min, Math.round(numeric))) : fallback;
    };
    const scale = clamp(req.body.scale, 100, 200, 100);
    const x = clamp(req.body.x, 0, 100, 50);
    const y = clamp(req.body.y, 0, 100, 50);

    const settings = await query('SELECT id FROM settings LIMIT 1');
    if (settings.length === 0) {
      return res.status(404).json({ error: 'Settings are not initialized.' });
    }
    await query(
      'UPDATE settings SET hero_background_scale = ?, hero_background_x = ?, hero_background_y = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [scale, x, y, settings[0].id]
    );
    return res.json({ message: 'Background framing saved!', hero_background_scale: scale, hero_background_x: x, hero_background_y: y });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to save background framing', details: err.message });
  }
};

exports.verifyPin = async (req, res) => {
  try {
    const { pin } = req.body;
    if (!pin) {
      return res.status(400).json({ error: 'PIN is required' });
    }

    const settings = await query('SELECT secret_pin_hash FROM settings LIMIT 1');
    if (settings.length === 0) {
      return res.status(500).json({ error: 'Settings not initialized' });
    }

    const isMatch = await bcrypt.compare(String(pin), settings[0].secret_pin_hash);
    if (!isMatch) {
      return res.status(403).json({ error: 'Incorrect Secret PIN. Keyhole remains locked 🔐' });
    }

    return res.json({ success: true, message: 'Secret Corner unlocked ❤️' });
  } catch (err) {
    return res.status(500).json({ error: 'PIN verification failed', details: err.message });
  }
};

exports.updatePin = async (req, res) => {
  try {
    const { currentPin, newPin } = req.body;
    if (!currentPin || !newPin) {
      return res.status(400).json({ error: 'Both current PIN and new 4-digit PIN are required' });
    }

    if (newPin.length !== 4 || isNaN(newPin)) {
      return res.status(400).json({ error: 'PIN must be exactly 4 digits' });
    }

    const settings = await query('SELECT secret_pin_hash FROM settings LIMIT 1');
    const isMatch = await bcrypt.compare(String(currentPin), settings[0].secret_pin_hash);
    if (!isMatch) {
      return res.status(400).json({ error: 'Current PIN is incorrect' });
    }

    const newHash = await bcrypt.hash(String(newPin), 10);
    await query('UPDATE settings SET secret_pin_hash = ?', [newHash]);

    return res.json({ message: 'Secret Corner PIN updated successfully! 🔐' });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to update PIN', details: err.message });
  }
};
