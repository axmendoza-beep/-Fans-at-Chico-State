const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');

// GET /v1/venues - List all venues
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('venues')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching venues:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /v1/venues - Create a new venue
router.post('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('venues')
      .insert([req.body])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json(data);
  } catch (error) {
    console.error('Error creating venue:', error);
    res.status(400).json({ error: error.message });
  }
});

// GET /v1/venues/:venue_id - Retrieve a venue by ID
router.get('/:venue_id', async (req, res) => {
  try {
    const { venue_id } = req.params;

    const { data, error } = await supabase
      .from('venues')
      .select('*')
      .eq('venue_id', venue_id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Venue not found' });
      }
      throw error;
    }

    res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching venue:', error);
    res.status(500).json({ error: error.message });
  }
});

// PUT /v1/venues/:venue_id - Update a venue by ID
router.put('/:venue_id', async (req, res) => {
  try {
    const { venue_id } = req.params;

    const { data, error } = await supabase
      .from('venues')
      .update(req.body)
      .eq('venue_id', venue_id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Venue not found' });
      }
      throw error;
    }

    res.status(200).json(data);
  } catch (error) {
    console.error('Error updating venue:', error);
    res.status(400).json({ error: error.message });
  }
});

// DELETE /v1/venues/:venue_id - Delete a venue by ID
router.delete('/:venue_id', async (req, res) => {
  try {
    const { venue_id } = req.params;

    const { error } = await supabase
      .from('venues')
      .delete()
      .eq('venue_id', venue_id);

    if (error) throw error;

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting venue:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
