const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { query } = require('../database/db');

const RESET_TOKEN_LIFETIME_MS = 60 * 60 * 1000;

function hashResetToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

function toDatabaseDate(date) {
  // SQL DATETIME values have no timezone. Format in the server's local timezone
  // so JavaScript reads the same instant back on SQLite and MySQL.
  const pad = (value) => String(value).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Please enter both username and password ❤️' });
    }

    const users = await query('SELECT * FROM users WHERE username = ? OR email = ? LIMIT 1', [username, username]);
    if (users.length === 0) {
      return res.status(401).json({ error: 'Invalid username or password.' });
    }

    const user = users[0];
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid username or password.' });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET || 'our_little_world_super_secret_jwt_key_2026_xoxo',
      { expiresIn: '30d' }
    );

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
    });

    const settings = await query('SELECT * FROM settings LIMIT 1');

    return res.json({
      message: 'Welcome back to Our Little World ❤️',
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role
      },
      settings: settings[0] || {}
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Server error during authentication', details: err.message });
  }
};

exports.logout = (req, res) => {
  res.clearCookie('token');
  return res.json({ message: 'Logged out successfully. Until next time! ❤️' });
};

exports.me = async (req, res) => {
  try {
    const users = await query('SELECT id, username, email, role, created_at FROM users WHERE id = ?', [req.user.id]);
    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const settings = await query('SELECT * FROM settings LIMIT 1');

    return res.json({
      user: users[0],
      settings: settings[0] || {}
    });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch user data', details: err.message });
  }
};

exports.updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Both current password and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters long' });
    }

    const users = await query('SELECT password_hash FROM users WHERE id = ?', [req.user.id]);
    const isMatch = await bcrypt.compare(currentPassword, users[0].password_hash);
    if (!isMatch) {
      return res.status(400).json({ error: 'Current password does not match' });
    }

    const newHash = await bcrypt.hash(newPassword, 10);
    await query('UPDATE users SET password_hash = ? WHERE id = ?', [newHash, req.user.id]);

    return res.json({ message: 'Password updated successfully! ❤️' });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to update password', details: err.message });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const identifier = String(req.body.identifier || '').trim();
    const response = {
      message: 'If that account exists, a password reset link has been created.'
    };

    if (!identifier) {
      return res.status(400).json({ error: 'Please enter your username or email address.' });
    }

    const users = await query(
      'SELECT id FROM users WHERE username = ? OR email = ? LIMIT 1',
      [identifier, identifier]
    );

    // Keep this response the same whether the account exists, preventing account enumeration.
    if (users.length === 0) {
      return res.json(response);
    }

    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = hashResetToken(rawToken);
    const expiresAt = new Date(Date.now() + RESET_TOKEN_LIFETIME_MS);

    // Only the most recent link remains usable.
    await query('DELETE FROM password_reset_tokens WHERE user_id = ?', [users[0].id]);
    await query(
      'INSERT INTO password_reset_tokens (user_id, token_hash, expires_at) VALUES (?, ?, ?)',
      [users[0].id, tokenHash, toDatabaseDate(expiresAt)]
    );

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const resetUrl = `${frontendUrl.replace(/\/$/, '')}/?resetToken=${rawToken}`;

    // An email provider can send resetUrl in production. Until one is configured,
    // development mode makes the link available to test the full reset flow.
    if (process.env.NODE_ENV !== 'production') {
      response.resetUrl = resetUrl;
      console.log(`Password reset link for user ${users[0].id}: ${resetUrl}`);
    }

    return res.json(response);
  } catch (err) {
    console.error('Forgot-password error:', err);
    return res.status(500).json({ error: 'Unable to start password reset. Please try again.' });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const token = String(req.body.token || '');
    const newPassword = String(req.body.newPassword || '');

    if (!token || !newPassword) {
      return res.status(400).json({ error: 'A reset link and new password are required.' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters long.' });
    }

    const tokens = await query(
      'SELECT id, user_id, expires_at, used_at FROM password_reset_tokens WHERE token_hash = ? LIMIT 1',
      [hashResetToken(token)]
    );
    const resetRecord = tokens[0];

    if (!resetRecord || resetRecord.used_at || Number.isNaN(new Date(resetRecord.expires_at).getTime()) || new Date(resetRecord.expires_at) <= new Date()) {
      return res.status(400).json({ error: 'This reset link is invalid or has expired. Please request a new one.' });
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await query('UPDATE users SET password_hash = ? WHERE id = ?', [passwordHash, resetRecord.user_id]);
    await query('UPDATE password_reset_tokens SET used_at = ? WHERE user_id = ?', [toDatabaseDate(new Date()), resetRecord.user_id]);

    return res.json({ message: 'Password reset successfully. You can now log in.' });
  } catch (err) {
    console.error('Reset-password error:', err);
    return res.status(500).json({ error: 'Unable to reset password. Please try again.' });
  }
};
