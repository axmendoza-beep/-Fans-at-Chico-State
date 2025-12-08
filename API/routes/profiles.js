const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');

// GET /v1/profiles - List all profiles
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching profiles:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /v1/profiles - Create a new profile
router.post('/', async (req, res) => {
  try {
    const { user_id, email, display_name, major, ...rest } = req.body;

    if (!user_id || !email) {
      return res.status(400).json({ error: 'user_id and email are required' });
    }

    const payload = {
      user_id,
      email,
      display_name,
      major,
      ...rest,
    };

    const { data, error } = await supabase
      .from('profiles')
      .upsert(payload, { onConflict: 'user_id' })
      .select()
      .single();

    if (error) throw error;

    res.status(201).json(data);
  } catch (error) {
    console.error('Error creating profile:', error);
    res.status(400).json({ error: error.message });
  }
});

// GET /v1/profiles/:user_id - Retrieve a profile by ID
router.get('/:user_id', async (req, res) => {
  try {
    const { user_id } = req.params;

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user_id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Profile not found' });
      }
      throw error;
    }

    res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ error: error.message });
  }
});

// PUT /v1/profiles/:user_id - Update a profile by ID
router.put('/:user_id', async (req, res) => {
  try {
    const { user_id } = req.params;

    const { data, error } = await supabase
      .from('profiles')
      .update(req.body)
      .eq('user_id', user_id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Profile not found' });
      }
      throw error;
    }

    res.status(200).json(data);
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(400).json({ error: error.message });
  }
});

// DELETE /v1/profiles/:user_id - Delete a profile by ID
router.delete('/:user_id', async (req, res) => {
  try {
    const { user_id } = req.params;

    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('user_id', user_id);

    if (error) throw error;

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting profile:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
