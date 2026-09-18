const { query } = require('../database/db');

exports.getStory = async (req, res) => {
  try {
    const story = await query('SELECT * FROM our_story ORDER BY order_index ASC, event_date ASC');
    return res.json(story);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch relationship story', details: err.message });
  }
};

exports.createStoryStage = async (req, res) => {
  try {
    const { title, subtitle, content, stage_type, event_date, order_index } = req.body;
    if (!title || !content || !stage_type) {
      return res.status(400).json({ error: 'Title, content, and stage type are required' });
    }

    const dateToSave = event_date || new Date().toISOString().split('T')[0];
    const imageFilename = req.file ? req.file.filename : '';

    const result = await query(
      `INSERT INTO our_story (title, subtitle, content, stage_type, event_date, image_filename, order_index)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [title, subtitle || '', content, stage_type, dateToSave, imageFilename, order_index || 0]
    );

    const inserted = await query('SELECT * FROM our_story WHERE id = ?', [result.insertId]);
    return res.status(201).json({ message: 'New story chapter added! 💌', stage: inserted[0] });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to add story stage', details: err.message });
  }
};

exports.updateStoryStage = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, subtitle, content, stage_type, event_date, order_index } = req.body;
    const imageFilename = req.file ? req.file.filename : undefined;

    const existing = await query('SELECT * FROM our_story WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Story stage not found' });
    }

    await query(
      `UPDATE our_story SET 
         title = COALESCE(?, title),
         subtitle = COALESCE(?, subtitle),
         content = COALESCE(?, content),
         stage_type = COALESCE(?, stage_type),
         event_date = COALESCE(?, event_date),
         image_filename = COALESCE(?, image_filename),
         order_index = COALESCE(?, order_index)
       WHERE id = ?`,
      [title, subtitle, content, stage_type, event_date, imageFilename, order_index, id]
    );

    const updated = await query('SELECT * FROM our_story WHERE id = ?', [id]);
    return res.json({ message: 'Story stage updated! ❤️', stage: updated[0] });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to update story stage', details: err.message });
  }
};

exports.deleteStoryStage = async (req, res) => {
  try {
    const { id } = req.params;
    await query('DELETE FROM our_story WHERE id = ?', [id]);
    return res.json({ message: 'Story chapter deleted' });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to delete story stage', details: err.message });
  }
};
