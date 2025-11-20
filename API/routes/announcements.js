const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');

// GET /v1/announcements - List all announcements
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('announcements')
      .select(`
        *,
        group:groups(group_id, name, sport)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching announcements:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /v1/announcements - Create a new announcement
router.post('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('announcements')
      .insert([req.body])
      .select(`
        *,
        group:groups(group_id, name, sport)
      `)
      .single();

    if (error) throw error;

    res.status(201).json(data);
  } catch (error) {
    console.error('Error creating announcement:', error);
    res.status(400).json({ error: error.message });
  }
});

// GET /v1/announcements/:announcement_id - Retrieve an announcement by ID
router.get('/:announcement_id', async (req, res) => {
  try {
    const { announcement_id } = req.params;

    const { data, error } = await supabase
      .from('announcements')
      .select(`
        *,
        group:groups(group_id, name, sport)
      `)
      .eq('announcement_id', announcement_id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Announcement not found' });
      }
      throw error;
    }

    res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching announcement:', error);
    res.status(500).json({ error: error.message });
  }
});

// PUT /v1/announcements/:announcement_id - Update an announcement by ID
router.put('/:announcement_id', async (req, res) => {
  try {
    const { announcement_id } = req.params;

    const { data, error } = await supabase
      .from('announcements')
      .update(req.body)
      .eq('announcement_id', announcement_id)
      .select(`
        *,
        group:groups(group_id, name, sport)
      `)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Announcement not found' });
      }
      throw error;
    }

    res.status(200).json(data);
  } catch (error) {
    console.error('Error updating announcement:', error);
    res.status(400).json({ error: error.message });
  }
});

// DELETE /v1/announcements/:announcement_id - Delete an announcement by ID
router.delete('/:announcement_id', async (req, res) => {
  try {
    const { announcement_id } = req.params;

    const { error } = await supabase
      .from('announcements')
      .delete()
      .eq('announcement_id', announcement_id);

    if (error) throw error;

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting announcement:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
