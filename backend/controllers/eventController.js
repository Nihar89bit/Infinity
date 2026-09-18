const { query } = require('../database/db');

exports.getEvents = async (req, res) => {
  try {
    const events = await query('SELECT * FROM special_events ORDER BY event_date ASC');
    return res.json(events);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch special events', details: err.message });
  }
};

exports.createEvent = async (req, res) => {
  try {
    const { title, event_date, event_type, icon, notes } = req.body;
    if (!title || !event_date) {
      return res.status(400).json({ error: 'Title and date are required for a special day ❤️' });
    }

    const result = await query(
      `INSERT INTO special_events (title, event_date, event_type, icon, notes) VALUES (?, ?, ?, ?, ?)`,
      [title, event_date, event_type || 'custom', icon || 'heart', notes || '']
    );

    const inserted = await query('SELECT * FROM special_events WHERE id = ?', [result.insertId]);
    return res.status(201).json({ message: 'Special date added to countdown! 🗓️', event: inserted[0] });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to add special event', details: err.message });
  }
};

exports.updateEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, event_date, event_type, icon, notes } = req.body;

    const existing = await query('SELECT * FROM special_events WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Special date not found' });
    }

    await query(
      `UPDATE special_events SET 
         title = COALESCE(?, title),
         event_date = COALESCE(?, event_date),
         event_type = COALESCE(?, event_type),
         icon = COALESCE(?, icon),
         notes = COALESCE(?, notes)
       WHERE id = ?`,
      [title, event_date, event_type, icon, notes, id]
    );

    const updated = await query('SELECT * FROM special_events WHERE id = ?', [id]);
    return res.json({ message: 'Special date updated! ❤️', event: updated[0] });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to update special date', details: err.message });
  }
};

exports.deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;
    await query('DELETE FROM special_events WHERE id = ?', [id]);
    return res.json({ message: 'Special date deleted' });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to delete special date', details: err.message });
  }
};
