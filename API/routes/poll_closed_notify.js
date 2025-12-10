const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');

// POST /v1/poll_closed_notify
// Input: { poll_id: string }
// Behavior: loads poll + votes, computes winning options, loads creator profile
// and returns a JSON payload describing the notification that should be sent
// based on the creator's notification preferences. This endpoint does NOT
// actually send email/SMS; it only prepares the payload.
router.post('/', async (req, res) => {
  try {
    const { poll_id } = req.body || {};

    if (!poll_id) {
      return res.status(400).json({ error: 'poll_id is required' });
    }

    // Load poll with author info
    const { data: poll, error: pollError } = await supabase
      .from('group_polls')
      .select(
        `*,
         group:groups(group_id, name, sport),
         author:profiles(user_id, display_name, email, allow_email, allow_sms, followed_team_events, trending_opt_in)`
      )
      .eq('poll_id', poll_id)
      .single();

    if (pollError) {
      if (pollError.code === 'PGRST116') {
        return res.status(404).json({ error: 'Group poll not found' });
      }
      throw pollError;
    }

    // Load all votes for this poll
    const { data: votes, error: votesError } = await supabase
      .from('group_poll_votes')
      .select('poll_vote_id, user_id, selected_option, created_at')
      .eq('poll_id', poll_id);

    if (votesError) {
      throw votesError;
    }

    const options = (() => {
      try {
        const parsed = JSON.parse(poll.options_text || '[]');
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    })();

    const totalVotes = (votes || []).length;
    const counts = {};
    options.forEach((opt) => {
      counts[opt] = 0;
    });
    (votes || []).forEach((v) => {
      if (v.selected_option in counts) {
        counts[v.selected_option] += 1;
      }
    });

    let maxCount = 0;
    options.forEach((opt) => {
      if (counts[opt] > maxCount) {
        maxCount = counts[opt];
      }
    });

    const winningOptions = options.filter((opt) => counts[opt] === maxCount && maxCount > 0);

    const results = options.map((opt) => {
      const count = counts[opt] || 0;
      const pct = totalVotes > 0 ? (count / totalVotes) * 100 : 0;
      return {
        option: opt,
        votes: count,
        percentage: Number(pct.toFixed(2)),
        is_winner: winningOptions.includes(opt),
      };
    });

    const author = poll.author || {};

    // Derive a simple notification preferences summary from profile
    const preferences = {
      allow_email: author.allow_email !== false,
      allow_sms: author.allow_sms === true,
      // These extra flags can be used by a future notifications worker
      followed_team_events: author.followed_team_events === true,
      trending_opt_in: author.trending_opt_in === true,
    };

    const payload = {
      poll_id: poll.poll_id,
      group_id: poll.group_id,
      group: poll.group || null,
      question: poll.question,
      closes_at: poll.closes_at,
      total_votes: totalVotes,
      results,
      winning_options: winningOptions,
      author: {
        user_id: author.user_id,
        display_name: author.display_name,
        email: author.email,
      },
      notification_preferences: preferences,
    };

    // In the future, this is where an email/SMS worker could be invoked.
    // For now we simply return the prepared payload.
    res.status(200).json({ notification: payload });
  } catch (error) {
    console.error('Error preparing poll closed notification:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
