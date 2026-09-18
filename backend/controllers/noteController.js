const { query } = require('../database/db');

exports.getNotes = async (req, res) => {
  try {
    const { category, search } = req.query;
    let sql = 'SELECT * FROM love_notes WHERE 1=1';
    const params = [];

    if (category) {
      sql += ' AND category = ?';
      params.push(category);
    }
    if (search) {
      sql += ' AND (title LIKE ? OR content LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    sql += ' ORDER BY is_bookmarked DESC, note_date DESC, id DESC';

    const notes = await query(sql, params);
    return res.json(notes);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch love notes', details: err.message });
  }
};

exports.createNote = async (req, res) => {
  try {
    const { title, content, category, note_date } = req.body;
    if (!title || !content) {
      return res.status(400).json({ error: 'Title and content are required for a love note ❤️' });
    }

    const dateToSave = note_date || new Date().toISOString().split('T')[0];
    const categoryToSave = category || 'General';

    const result = await query(
      `INSERT INTO love_notes (title, content, category, note_date) VALUES (?, ?, ?, ?)`,
      [title, content, categoryToSave, dateToSave]
    );

    const inserted = await query('SELECT * FROM love_notes WHERE id = ?', [result.insertId]);
    return res.status(201).json({ message: 'Love note sealed with a kiss! 💌', note: inserted[0] });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to save love note', details: err.message });
  }
};

exports.updateNote = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, category, note_date, is_bookmarked } = req.body;

    const existing = await query('SELECT * FROM love_notes WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Note not found' });
    }

    await query(
      `UPDATE love_notes SET 
         title = COALESCE(?, title),
         content = COALESCE(?, content),
         category = COALESCE(?, category),
         note_date = COALESCE(?, note_date),
         is_bookmarked = COALESCE(?, is_bookmarked)
       WHERE id = ?`,
      [title, content, category, note_date, is_bookmarked, id]
    );

    const updated = await query('SELECT * FROM love_notes WHERE id = ?', [id]);
    return res.json({ message: 'Love note updated ❤️', note: updated[0] });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to update love note', details: err.message });
  }
};

exports.deleteNote = async (req, res) => {
  try {
    const { id } = req.params;
    await query('DELETE FROM love_notes WHERE id = ?', [id]);
    return res.json({ message: 'Love note deleted' });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to delete love note', details: err.message });
  }
};
