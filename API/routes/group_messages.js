const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');

// GET /v1/group_messages - List all group messages
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('group_messages')
      .select(`
        *,
        group:groups(group_id, name, sport),
        user:profiles(user_id, display_name, email)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching group messages:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /v1/group_messages - Create a new group message
router.post('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('group_messages')
      .insert([req.body])
      .select(`
        *,
        group:groups(group_id, name, sport),
        user:profiles(user_id, display_name, email)
      `)
      .single();

    if (error) throw error;

    res.status(201).json(data);
  } catch (error) {
    console.error('Error creating group message:', error);
    res.status(400).json({ error: error.message });
  }
});

// GET /v1/group_messages/:message_id - Retrieve a group message by ID
router.get('/:message_id', async (req, res) => {
  try {
    const { message_id } = req.params;

    const { data, error } = await supabase
      .from('group_messages')
      .select(`
        *,
        group:groups(group_id, name, sport),
        user:profiles(user_id, display_name, email)
      `)
      .eq('message_id', message_id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Group message not found' });
      }
      throw error;
    }

    res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching group message:', error);
    res.status(500).json({ error: error.message });
  }
});

// PUT /v1/group_messages/:message_id - Update a group message by ID
router.put('/:message_id', async (req, res) => {
  try {
    const { message_id } = req.params;

    const { data, error } = await supabase
      .from('group_messages')
      .update(req.body)
      .eq('message_id', message_id)
      .select(`
        *,
        group:groups(group_id, name, sport),
        user:profiles(user_id, display_name, email)
      `)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Group message not found' });
      }
      throw error;
    }

    res.status(200).json(data);
  } catch (error) {
    console.error('Error updating group message:', error);
    res.status(400).json({ error: error.message });
  }
});

// DELETE /v1/group_messages/:message_id - Delete a group message by ID
router.delete('/:message_id', async (req, res) => {
  try {
    const { message_id } = req.params;

    const { error } = await supabase
      .from('group_messages')
      .delete()
      .eq('message_id', message_id);

    if (error) throw error;

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting group message:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
