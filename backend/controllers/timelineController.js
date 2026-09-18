const { query } = require('../database/db');

exports.getTimeline = async (req, res) => {
  try {
    const timeline = await query('SELECT * FROM timeline_events ORDER BY event_date ASC, id ASC');
    return res.json(timeline);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch timeline events', details: err.message });
  }
};

exports.createTimelineEvent = async (req, res) => {
  try {
    const { title, description, event_date, icon } = req.body;
    if (!title || !event_date) {
      return res.status(400).json({ error: 'Title and event date are required' });
    }

    const imageFilename = req.file ? req.file.filename : '';

    const result = await query(
      `INSERT INTO timeline_events (title, description, event_date, image_filename, icon)
       VALUES (?, ?, ?, ?, ?)`,
      [title, description || '', event_date, imageFilename, icon || 'heart']
    );

    const inserted = await query('SELECT * FROM timeline_events WHERE id = ?', [result.insertId]);
    return res.status(201).json({ message: 'Timeline event added! 🌸', event: inserted[0] });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to create timeline event', details: err.message });
  }
};

exports.updateTimelineEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, event_date, icon } = req.body;
    const imageFilename = req.file ? req.file.filename : undefined;

    const existing = await query('SELECT * FROM timeline_events WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Timeline event not found' });
    }

    await query(
      `UPDATE timeline_events SET 
         title = COALESCE(?, title),
         description = COALESCE(?, description),
         event_date = COALESCE(?, event_date),
         image_filename = COALESCE(?, image_filename),
         icon = COALESCE(?, icon)
       WHERE id = ?`,
      [title, description, event_date, imageFilename, icon, id]
    );

    const updated = await query('SELECT * FROM timeline_events WHERE id = ?', [id]);
    return res.json({ message: 'Timeline event updated! ❤️', event: updated[0] });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to update timeline event', details: err.message });
  }
};

exports.deleteTimelineEvent = async (req, res) => {
  try {
    const { id } = req.params;
    await query('DELETE FROM timeline_events WHERE id = ?', [id]);
    return res.json({ message: 'Timeline event deleted' });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to delete timeline event', details: err.message });
  }
};
