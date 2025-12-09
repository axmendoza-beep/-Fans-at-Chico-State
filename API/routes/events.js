const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');

// GET /v1/events - List all events
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('events')
      .select(`
        *,
        venue:venues(venue_id, name, type, address),
        host:profiles!events_host_user_id_fkey(user_id, display_name, email)
      `)
      .order('start_time', { ascending: true });

    if (error) throw error;

    res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /v1/events - Create a new event
router.post('/', async (req, res) => {
  try {
    const { host_email, ...rest } = req.body;

    if (!host_email) {
      return res.status(400).json({ error: 'host_email is required to create an event' });
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('user_id, email, display_name')
      .ilike('email', host_email);

    if (profileError) {
      throw profileError;
    }

    if (!profile || profile.length === 0) {
      return res.status(404).json({ error: 'No profile found for the provided email' });
    }

    const hostProfile = profile[0];

    const payload = {
      ...rest,
      host_user_id: hostProfile.user_id,
    };

    const { data, error } = await supabase
      .from('events')
      .insert([payload])
      .select(`
        *,
        venue:venues(venue_id, name, type, address),
        host:profiles!events_host_user_id_fkey(user_id, display_name, email)
      `)
      .single();

    if (error) throw error;

    res.status(201).json(data);
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(400).json({ error: error.message });
  }
});

// GET /v1/events/:event_id - Retrieve an event by ID
router.get('/:event_id', async (req, res) => {
  try {
    const { event_id } = req.params;

    const { data, error } = await supabase
      .from('events')
      .select(`
        *,
        venue:venues(venue_id, name, type, address),
        host:profiles!events_host_user_id_fkey(user_id, display_name, email)
      `)
      .eq('event_id', event_id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Event not found' });
      }
      throw error;
    }

    res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching event:', error);
    res.status(500).json({ error: error.message });
  }
});

// PUT /v1/events/:event_id - Update an event by ID
router.put('/:event_id', async (req, res) => {
  try {
    const { event_id } = req.params;

    const { data, error } = await supabase
      .from('events')
      .update(req.body)
      .eq('event_id', event_id)
      .select(`
        *,
        venue:venues(venue_id, name, type, address),
        host:profiles!events_host_user_id_fkey(user_id, display_name, email)
      `)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Event not found' });
      }
      throw error;
    }

    res.status(200).json(data);
  } catch (error) {
    console.error('Error updating event:', error);
    res.status(400).json({ error: error.message });
  }
});

// DELETE /v1/events/:event_id - Delete an event by ID
router.delete('/:event_id', async (req, res) => {
  try {
    const { event_id } = req.params;

    const { error } = await supabase
      .from('events')
      .delete()
      .eq('event_id', event_id);

    if (error) throw error;

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting event:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
