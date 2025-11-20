const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');

// GET /v1/followed_teams - List all followed teams
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('followed_teams')
      .select(`
        *,
        user:profiles(user_id, display_name, email)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching followed teams:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /v1/followed_teams - Create a new followed team
router.post('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('followed_teams')
      .insert([req.body])
      .select(`
        *,
        user:profiles(user_id, display_name, email)
      `)
      .single();

    if (error) throw error;

    res.status(201).json(data);
  } catch (error) {
    console.error('Error creating followed team:', error);
    res.status(400).json({ error: error.message });
  }
});

// GET /v1/followed_teams/:followed_team_id - Retrieve a followed team by ID
router.get('/:followed_team_id', async (req, res) => {
  try {
    const { followed_team_id } = req.params;

    const { data, error } = await supabase
      .from('followed_teams')
      .select(`
        *,
        user:profiles(user_id, display_name, email)
      `)
      .eq('followed_team_id', followed_team_id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Followed team not found' });
      }
      throw error;
    }

    res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching followed team:', error);
    res.status(500).json({ error: error.message });
  }
});

// PUT /v1/followed_teams/:followed_team_id - Update a followed team by ID
router.put('/:followed_team_id', async (req, res) => {
  try {
    const { followed_team_id } = req.params;

    const { data, error } = await supabase
      .from('followed_teams')
      .update(req.body)
      .eq('followed_team_id', followed_team_id)
      .select(`
        *,
        user:profiles(user_id, display_name, email)
      `)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Followed team not found' });
      }
      throw error;
    }

    res.status(200).json(data);
  } catch (error) {
    console.error('Error updating followed team:', error);
    res.status(400).json({ error: error.message });
  }
});

// DELETE /v1/followed_teams/:followed_team_id - Delete a followed team by ID
router.delete('/:followed_team_id', async (req, res) => {
  try {
    const { followed_team_id } = req.params;

    const { error } = await supabase
      .from('followed_teams')
      .delete()
      .eq('followed_team_id', followed_team_id);

    if (error) throw error;

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting followed team:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
