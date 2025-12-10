const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');

// GET /v1/event_votes - list votes, optionally filtered by user_id
router.get('/', async (req, res) => {
  try {
    const { user_id: userId } = req.query;

    let query = supabase
      .from('event_votes')
      .select('*');

    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { data, error } = await query;

    if (error) throw error;

    res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching event votes:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /v1/event_votes - upsert or clear a vote for an event by a user
router.post('/', async (req, res) => {
  try {
    const { event_id: eventId, user_id: userId, value } = req.body;

    if (!eventId || !userId) {
      return res.status(400).json({ error: 'event_id and user_id are required' });
    }

    // If value is 0, null, or undefined, clear the vote
    if (value === 0 || value === null || value === undefined) {
      const { error } = await supabase
        .from('event_votes')
        .delete()
        .eq('event_id', eventId)
        .eq('user_id', userId);

      if (error) throw error;

      return res.status(204).send();
    }

    if (value !== 1 && value !== -1) {
      return res.status(400).json({ error: 'value must be 1 (upvote) or -1 (downvote)' });
    }

    const payload = {
      event_id: eventId,
      user_id: userId,
      value,
    };

    const { data, error } = await supabase
      .from('event_votes')
      .upsert(payload, { onConflict: 'event_id,user_id' })
      .select('*')
      .single();

    if (error) throw error;

    res.status(201).json(data);
  } catch (error) {
    console.error('Error upserting event vote:', error);
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
