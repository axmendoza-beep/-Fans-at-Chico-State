const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');

// GET /v1/reports - List all reports
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('reports')
      .select(`
        *,
        reporter:profiles!reports_reporter_user_id_fkey(user_id, display_name, email),
        event:events(event_id, game_name, sport)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching reports:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /v1/reports - Create a new report
router.post('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('reports')
      .insert([req.body])
      .select(`
        *,
        reporter:profiles!reports_reporter_user_id_fkey(user_id, display_name, email),
        event:events(event_id, game_name, sport)
      `)
      .single();

    if (error) throw error;

    res.status(201).json(data);
  } catch (error) {
    console.error('Error creating report:', error);
    res.status(400).json({ error: error.message });
  }
});

// GET /v1/reports/:report_id - Retrieve a report by ID
router.get('/:report_id', async (req, res) => {
  try {
    const { report_id } = req.params;

    const { data, error } = await supabase
      .from('reports')
      .select(`
        *,
        reporter:profiles!reports_reporter_user_id_fkey(user_id, display_name, email),
        event:events(event_id, game_name, sport)
      `)
      .eq('report_id', report_id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Report not found' });
      }
      throw error;
    }

    res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching report:', error);
    res.status(500).json({ error: error.message });
  }
});

// PUT /v1/reports/:report_id - Update a report by ID
router.put('/:report_id', async (req, res) => {
  try {
    const { report_id } = req.params;

    const { data, error } = await supabase
      .from('reports')
      .update(req.body)
      .eq('report_id', report_id)
      .select(`
        *,
        reporter:profiles!reports_reporter_user_id_fkey(user_id, display_name, email),
        event:events(event_id, game_name, sport)
      `)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Report not found' });
      }
      throw error;
    }

    res.status(200).json(data);
  } catch (error) {
    console.error('Error updating report:', error);
    res.status(400).json({ error: error.message });
  }
});

// DELETE /v1/reports/:report_id - Delete a report by ID
router.delete('/:report_id', async (req, res) => {
  try {
    const { report_id } = req.params;

    const { error } = await supabase
      .from('reports')
      .delete()
      .eq('report_id', report_id);

    if (error) throw error;

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting report:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
