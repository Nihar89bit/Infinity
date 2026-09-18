const { query } = require('../database/db');

exports.getSecretItems = async (req, res) => {
  try {
    const { category } = req.query;
    let sql = 'SELECT * FROM secret_notes WHERE 1=1';
    const params = [];

    if (category) {
      sql += ' AND category = ?';
      params.push(category);
    }

    sql += ' ORDER BY created_at DESC, id DESC';
    const items = await query(sql, params);
    return res.json(items);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch secret corner items', details: err.message });
  }
};

exports.createSecretItem = async (req, res) => {
  try {
    const { title, content, category, target_date } = req.body;
    if (!title || !content) {
      return res.status(400).json({ error: 'Title and content are required for secret entries 🔐' });
    }

    const result = await query(
      `INSERT INTO secret_notes (title, content, category, target_date) VALUES (?, ?, ?, ?)`,
      [title, content, category || 'secret_note', target_date || null]
    );

    const inserted = await query('SELECT * FROM secret_notes WHERE id = ?', [result.insertId]);
    return res.status(201).json({ message: 'Secret entry locked into vault 🔐', item: inserted[0] });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to save secret entry', details: err.message });
  }
};

exports.updateSecretItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, category, target_date } = req.body;

    const existing = await query('SELECT * FROM secret_notes WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Secret entry not found' });
    }

    await query(
      `UPDATE secret_notes SET 
         title = COALESCE(?, title),
         content = COALESCE(?, content),
         category = COALESCE(?, category),
         target_date = COALESCE(?, target_date)
       WHERE id = ?`,
      [title, content, category, target_date, id]
    );

    const updated = await query('SELECT * FROM secret_notes WHERE id = ?', [id]);
    return res.json({ message: 'Secret entry updated! 🔐', item: updated[0] });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to update secret entry', details: err.message });
  }
};

exports.deleteSecretItem = async (req, res) => {
  try {
    const { id } = req.params;
    await query('DELETE FROM secret_notes WHERE id = ?', [id]);
    return res.json({ message: 'Secret entry deleted' });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to delete secret entry', details: err.message });
  }
};
