const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');

// GET /v1/rsvps - List all RSVPs
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('rsvps')
      .select(`
        *,
        event:events(event_id, game_name, sport, start_time),
        user:profiles(user_id, display_name, email)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching RSVPs:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /v1/rsvps - Create a new RSVP
router.post('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('rsvps')
      .insert([req.body])
      .select(`
        *,
        event:events(event_id, game_name, sport, start_time),
        user:profiles(user_id, display_name, email)
      `)
      .single();

    if (error) throw error;

    res.status(201).json(data);
  } catch (error) {
    console.error('Error creating RSVP:', error);
    res.status(400).json({ error: error.message });
  }
});

// GET /v1/rsvps/:rsvp_id - Retrieve an RSVP by ID
router.get('/:rsvp_id', async (req, res) => {
  try {
    const { rsvp_id } = req.params;

    const { data, error } = await supabase
      .from('rsvps')
      .select(`
        *,
        event:events(event_id, game_name, sport, start_time),
        user:profiles(user_id, display_name, email)
      `)
      .eq('rsvp_id', rsvp_id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'RSVP not found' });
      }
      throw error;
    }

    res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching RSVP:', error);
    res.status(500).json({ error: error.message });
  }
});

// PUT /v1/rsvps/:rsvp_id - Update an RSVP by ID
router.put('/:rsvp_id', async (req, res) => {
  try {
    const { rsvp_id } = req.params;

    const { data, error } = await supabase
      .from('rsvps')
      .update(req.body)
      .eq('rsvp_id', rsvp_id)
      .select(`
        *,
        event:events(event_id, game_name, sport, start_time),
        user:profiles(user_id, display_name, email)
      `)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'RSVP not found' });
      }
      throw error;
    }

    res.status(200).json(data);
  } catch (error) {
    console.error('Error updating RSVP:', error);
    res.status(400).json({ error: error.message });
  }
});

// DELETE /v1/rsvps/:rsvp_id - Delete an RSVP by ID
router.delete('/:rsvp_id', async (req, res) => {
  try {
    const { rsvp_id } = req.params;

    const { error } = await supabase
      .from('rsvps')
      .delete()
      .eq('rsvp_id', rsvp_id);

    if (error) throw error;

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting RSVP:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
