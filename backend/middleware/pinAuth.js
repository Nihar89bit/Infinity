const bcrypt = require('bcryptjs');
const { query } = require('../database/db');

async function pinAuthMiddleware(req, res, next) {
  const providedPin = req.headers['x-secret-pin'] || req.body.pin;

  if (!providedPin) {
    return res.status(403).json({ error: 'PIN required to access Secret Corner 🔐' });
  }

  try {
    const settings = await query('SELECT secret_pin_hash FROM settings LIMIT 1');
    if (!settings || settings.length === 0) {
      return res.status(500).json({ error: 'App settings not initialized' });
    }

    const isMatch = await bcrypt.compare(String(providedPin), settings[0].secret_pin_hash);
    if (!isMatch) {
      return res.status(403).json({ error: 'Incorrect PIN. Secret Corner remains locked 🔐' });
    }

    next();
  } catch (err) {
    return res.status(500).json({ error: 'Failed to verify PIN', details: err.message });
  }
}

module.exports = pinAuthMiddleware;
