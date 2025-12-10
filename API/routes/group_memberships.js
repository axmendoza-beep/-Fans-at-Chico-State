const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');

// GET /v1/group_memberships - List all group memberships (optionally filtered by user_id)
router.get('/', async (req, res) => {
  try {
    const { user_id: userId } = req.query;

    let query = supabase
      .from('group_memberships')
      .select('*');

    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { data, error } = await query;

    if (error) throw error;

    res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching group memberships:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /v1/group_memberships - Create a new group membership
router.post('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('group_memberships')
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
    console.error('Error creating group membership:', error);
    res.status(400).json({ error: error.message });
  }
});

// GET /v1/group_memberships/:membership_id - Retrieve a group membership by ID
router.get('/:membership_id', async (req, res) => {
  try {
    const { membership_id } = req.params;

    const { data, error } = await supabase
      .from('group_memberships')
      .select(`
        *,
        group:groups(group_id, name, sport),
        user:profiles(user_id, display_name, email)
      `)
      .eq('membership_id', membership_id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Group membership not found' });
      }
      throw error;
    }

    res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching group membership:', error);
    res.status(500).json({ error: error.message });
  }
});

// PUT /v1/group_memberships/:membership_id - Update a group membership by ID
router.put('/:membership_id', async (req, res) => {
  try {
    const { membership_id } = req.params;

    const { data, error } = await supabase
      .from('group_memberships')
      .update(req.body)
      .eq('membership_id', membership_id)
      .select(`
        *,
        group:groups(group_id, name, sport),
        user:profiles(user_id, display_name, email)
      `)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Group membership not found' });
      }
      throw error;
    }

    res.status(200).json(data);
  } catch (error) {
    console.error('Error updating group membership:', error);
    res.status(400).json({ error: error.message });
  }
});

// DELETE /v1/group_memberships/:membership_id - Delete a group membership by ID
router.delete('/:membership_id', async (req, res) => {
  try {
    const { membership_id } = req.params;

    const { error } = await supabase
      .from('group_memberships')
      .delete()
      .eq('membership_id', membership_id);

    if (error) throw error;

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting group membership:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
