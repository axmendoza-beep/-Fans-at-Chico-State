const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');

// GET /v1/group_poll_votes - List all group poll votes
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('group_poll_votes')
      .select(`
        *,
        poll:group_polls(poll_id, question, options_text),
        user:profiles(user_id, display_name, email)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching group poll votes:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /v1/group_poll_votes - Create a new group poll vote
router.post('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('group_poll_votes')
      .insert([req.body])
      .select(`
        *,
        poll:group_polls(poll_id, question, options_text),
        user:profiles(user_id, display_name, email)
      `)
      .single();

    if (error) throw error;

    res.status(201).json(data);
  } catch (error) {
    console.error('Error creating group poll vote:', error);
    res.status(400).json({ error: error.message });
  }
});

// GET /v1/group_poll_votes/:poll_vote_id - Retrieve a group poll vote by ID
router.get('/:poll_vote_id', async (req, res) => {
  try {
    const { poll_vote_id } = req.params;

    const { data, error } = await supabase
      .from('group_poll_votes')
      .select(`
        *,
        poll:group_polls(poll_id, question, options_text),
        user:profiles(user_id, display_name, email)
      `)
      .eq('poll_vote_id', poll_vote_id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Group poll vote not found' });
      }
      throw error;
    }

    res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching group poll vote:', error);
    res.status(500).json({ error: error.message });
  }
});

// PUT /v1/group_poll_votes/:poll_vote_id - Update a group poll vote by ID
router.put('/:poll_vote_id', async (req, res) => {
  try {
    const { poll_vote_id } = req.params;

    const { data, error } = await supabase
      .from('group_poll_votes')
      .update(req.body)
      .eq('poll_vote_id', poll_vote_id)
      .select(`
        *,
        poll:group_polls(poll_id, question, options_text),
        user:profiles(user_id, display_name, email)
      `)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Group poll vote not found' });
      }
      throw error;
    }

    res.status(200).json(data);
  } catch (error) {
    console.error('Error updating group poll vote:', error);
    res.status(400).json({ error: error.message });
  }
});

// DELETE /v1/group_poll_votes/:poll_vote_id - Delete a group poll vote by ID
router.delete('/:poll_vote_id', async (req, res) => {
  try {
    const { poll_vote_id } = req.params;

    const { error } = await supabase
      .from('group_poll_votes')
      .delete()
      .eq('poll_vote_id', poll_vote_id);

    if (error) throw error;

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting group poll vote:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
