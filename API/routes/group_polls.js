const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');

// GET /v1/group_polls - List all group polls
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('group_polls')
      .select(`
        *,
        group:groups(group_id, name, sport),
        author:profiles(user_id, display_name, email)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching group polls:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /v1/group_polls - Create a new group poll
router.post('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('group_polls')
      .insert([req.body])
      .select(`
        *,
        group:groups(group_id, name, sport),
        author:profiles(user_id, display_name, email)
      `)
      .single();

    if (error) throw error;

    res.status(201).json(data);
  } catch (error) {
    console.error('Error creating group poll:', error);
    res.status(400).json({ error: error.message });
  }
});

// GET /v1/group_polls/:poll_id - Retrieve a group poll by ID
router.get('/:poll_id', async (req, res) => {
  try {
    const { poll_id } = req.params;

    const { data, error } = await supabase
      .from('group_polls')
      .select(`
        *,
        group:groups(group_id, name, sport),
        author:profiles(user_id, display_name, email)
      `)
      .eq('poll_id', poll_id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Group poll not found' });
      }
      throw error;
    }

    res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching group poll:', error);
    res.status(500).json({ error: error.message });
  }
});

// PUT /v1/group_polls/:poll_id - Update a group poll by ID
router.put('/:poll_id', async (req, res) => {
  try {
    const { poll_id } = req.params;

    const { data, error } = await supabase
      .from('group_polls')
      .update(req.body)
      .eq('poll_id', poll_id)
      .select(`
        *,
        group:groups(group_id, name, sport),
        author:profiles(user_id, display_name, email)
      `)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Group poll not found' });
      }
      throw error;
    }

    res.status(200).json(data);
  } catch (error) {
    console.error('Error updating group poll:', error);
    res.status(400).json({ error: error.message });
  }
});

// DELETE /v1/group_polls/:poll_id - Delete a group poll by ID
router.delete('/:poll_id', async (req, res) => {
  try {
    const { poll_id } = req.params;

    const { error } = await supabase
      .from('group_polls')
      .delete()
      .eq('poll_id', poll_id);

    if (error) throw error;

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting group poll:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
