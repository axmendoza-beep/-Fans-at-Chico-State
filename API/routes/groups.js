const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');

// GET /v1/groups - List all groups
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('groups')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching groups:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /v1/groups - Create a new group
router.post('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('groups')
      .insert([req.body])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json(data);
  } catch (error) {
    console.error('Error creating group:', error);
    res.status(400).json({ error: error.message });
  }
});

// GET /v1/groups/:group_id - Retrieve a group by ID
router.get('/:group_id', async (req, res) => {
  try {
    const { group_id } = req.params;

    const { data, error } = await supabase
      .from('groups')
      .select('*')
      .eq('group_id', group_id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Group not found' });
      }
      throw error;
    }

    res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching group:', error);
    res.status(500).json({ error: error.message });
  }
});

// PUT /v1/groups/:group_id - Update a group by ID
router.put('/:group_id', async (req, res) => {
  try {
    const { group_id } = req.params;

    const { data, error } = await supabase
      .from('groups')
      .update(req.body)
      .eq('group_id', group_id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Group not found' });
      }
      throw error;
    }

    res.status(200).json(data);
  } catch (error) {
    console.error('Error updating group:', error);
    res.status(400).json({ error: error.message });
  }
});

// DELETE /v1/groups/:group_id - Delete a group by ID
router.delete('/:group_id', async (req, res) => {
  try {
    const { group_id } = req.params;

    const { error } = await supabase
      .from('groups')
      .delete()
      .eq('group_id', group_id);

    if (error) throw error;

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting group:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
