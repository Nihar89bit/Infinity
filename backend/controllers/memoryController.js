const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');
const { query } = require('../database/db');

exports.getMemories = async (req, res) => {
  try {
    const { sort, startDate, endDate, search } = req.query;

    let sql = 'SELECT * FROM memories WHERE 1=1';
    const params = [];

    if (startDate) {
      sql += ' AND memory_date >= ?';
      params.push(startDate);
    }
    if (endDate) {
      sql += ' AND memory_date <= ?';
      params.push(endDate);
    }
    if (search) {
      sql += ' AND (title LIKE ? OR caption LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    const order = sort === 'oldest' ? 'ASC' : 'DESC';
    sql += ` ORDER BY memory_date ${order}, id DESC`;

    const memories = await query(sql, params);
    return res.json(memories);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch memories', details: err.message });
  }
};

exports.uploadMemory = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Please select an image file to upload ❤️' });
    }

    const { title, caption, memory_date } = req.body;
    const dateToSave = memory_date || new Date().toISOString().split('T')[0];

    const result = await query(
      `INSERT INTO memories (title, caption, memory_date, image_filename, original_name, mime_type)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [title || 'Our Memory ❤️', caption || '', dateToSave, req.file.filename, req.file.originalname, req.file.mimetype]
    );

    const inserted = await query('SELECT * FROM memories WHERE id = ?', [result.insertId]);
    return res.status(201).json({ message: 'Memory added to our scrapbook! 📸', memory: inserted[0] });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to upload memory', details: err.message });
  }
};

exports.updateMemory = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, caption, memory_date } = req.body;

    const existing = await query('SELECT * FROM memories WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Memory not found' });
    }

    await query(
      `UPDATE memories SET 
         title = COALESCE(?, title),
         caption = COALESCE(?, caption),
         memory_date = COALESCE(?, memory_date)
       WHERE id = ?`,
      [title, caption, memory_date, id]
    );

    const updated = await query('SELECT * FROM memories WHERE id = ?', [id]);
    return res.json({ message: 'Memory updated successfully! ❤️', memory: updated[0] });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to update memory', details: err.message });
  }
};

exports.deleteMemory = async (req, res) => {
  try {
    const { id } = req.params;
    const memories = await query('SELECT * FROM memories WHERE id = ?', [id]);
    if (memories.length === 0) {
      return res.status(404).json({ error: 'Memory not found' });
    }

    const filename = memories[0].image_filename;
    const filePath = path.join(__dirname, '..', 'uploads', 'memories', filename);

    // Delete DB record
    await query('DELETE FROM memories WHERE id = ?', [id]);

    // Delete physical file if exists
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    return res.json({ message: 'Memory removed from gallery ❤️' });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to delete memory', details: err.message });
  }
};

/**
 * PRIVATE SECURE MEDIA STREAMING ROUTE
 * Checks JWT authentication token (from cookie, query param ?token=, or Authorization header).
 * Only streams the requested image file if user is authenticated!
 */
exports.serveMedia = async (req, res) => {
  try {
    let token = req.cookies?.token || req.query.token;
    if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ error: 'Unauthorized: Private media access forbidden.' });
    }

    try {
      jwt.verify(token, process.env.JWT_SECRET || 'our_little_world_super_secret_jwt_key_2026_xoxo');
    } catch (tokenErr) {
      return res.status(401).json({ error: 'Invalid or expired session token.' });
    }

    const { filename } = req.params;
    // Sanitize filename to prevent directory traversal
    const safeFilename = path.basename(filename);
    const filePath = path.join(__dirname, '..', 'uploads', 'memories', safeFilename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Image not found' });
    }

    return res.sendFile(filePath);
  } catch (err) {
    return res.status(500).json({ error: 'Error streaming private media', details: err.message });
  }
};
