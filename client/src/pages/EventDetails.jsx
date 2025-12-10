import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { eventsAPI, rsvpsAPI, eventVotesAPI } from '../lib/api';

function EventDetails() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [rsvpMessage, setRsvpMessage] = useState('');
  const [currentUser] = useState(() => {
    try {
      const raw = localStorage.getItem('currentUser');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });
  const [voteSummary, setVoteSummary] = useState({ up: 0, down: 0 });

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const response = await eventsAPI.getById(eventId);
        setEvent(response.data);
        try {
          const votesResponse = await eventVotesAPI.getForEvent(eventId);
          let up = 0;
          let down = 0;
          votesResponse.data.forEach((vote) => {
            if (vote.value === 1) up += 1;
            if (vote.value === -1) down += 1;
          });
          setVoteSummary({ up, down });
        } catch (voteErr) {
          console.error('Failed to load event vote summary', voteErr);
        }
        setError(null);
      } catch (err) {
        setError('Failed to load event: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [eventId]);

  const handleRSVP = async () => {
    setRsvpMessage('');

    if (!currentUser) {
      navigate('/login');
      return;
    }

    try {
      await rsvpsAPI.create({
        event_id: event.event_id,
        user_id: currentUser.user_id,
        name_at_rsvp: currentUser.display_name || null,
        email_at_rsvp: currentUser.email || null,
        status: 'going',
      });
      setRsvpMessage('RSVP successful!');
    } catch (err) {
      setRsvpMessage('Failed to RSVP: ' + err.message);
    }
  };

  if (loading) {
    return <div>Loading event details...</div>;
  }

  if (error) {
    return <div style={{ color: 'red' }}>{error}</div>;
  }

  if (!event) {
    return <div>Event not found.</div>;
  }

  const start = new Date(event.start_time);
  const dateString = start.toLocaleDateString();
  const timeString = start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div style={{ maxWidth: '800px', margin: '2rem auto' }}>
      <button
        type="button"
        onClick={() => navigate(-1)}
        style={{
          marginBottom: '1rem',
          padding: '0.25rem 0.5rem',
          borderRadius: '4px',
          border: '1px solid #ccc',
          backgroundColor: '#fff',
          cursor: 'pointer',
        }}
      >
        ← Back to Events
      </button>
      <h1>{event.game_name}</h1>
      <p><strong>Sport:</strong> {event.sport}</p>
      <p>
        <strong>Score:</strong>{' '}
        {voteSummary.up + voteSummary.down === 0
          ? 'No votes yet'
          : `${voteSummary.up} up / ${voteSummary.down} down (${voteSummary.up >= voteSummary.down ? 'mostly upvotes' : 'mostly downvotes'})`}
      </p>
      <p style={{ margin: '0.25rem 0', color: '#555' }}>
        <strong>Date:</strong> {dateString}
      </p>
      <p style={{ margin: '0.25rem 0', color: '#555' }}>
        <strong>Start Time:</strong> {timeString}
      </p>

      {event.venue && (
        <p style={{ margin: '0.25rem 0', color: '#555' }}>
          <strong>Venue:</strong> {event.venue.name} ({event.venue.type})
        </p>
      )}

      {event.host && (
        <p style={{ margin: '0.25rem 0', color: '#555' }}>
          <strong>Host:</strong> {event.host.display_name} ({event.host.email})
        </p>
      )}

      <p style={{ margin: '0.25rem 0', color: '#555' }}>
        <strong>Age Restriction:</strong> {event.is_twentyone_plus ? '21+ only' : 'All ages'}
      </p>

      {'capacity' in event && (
        <p style={{ margin: '0.25rem 0', color: '#555' }}>
          <strong>Capacity:</strong> {event.capacity ?? 'Not specified'}
        </p>
      )}

      <div style={{ marginTop: '1.5rem' }}>
        <h2>Description</h2>
        <p>{event.description || 'No description provided.'}</p>
      </div>

      <div style={{ marginTop: '1.5rem' }}>
        <button
          type="button"
          onClick={handleRSVP}
          style={{
            padding: '0.5rem 1.25rem',
            borderRadius: '4px',
            border: 'none',
            backgroundColor: '#1976d2',
            color: '#fff',
            cursor: 'pointer',
            fontWeight: 'bold',
          }}
        >
          RSVP
        </button>
        {rsvpMessage && (
          <p style={{ marginTop: '0.75rem', color: rsvpMessage.startsWith('Failed') ? '#c62828' : '#2e7d32' }}>
            {rsvpMessage}
          </p>
        )}
      </div>
    </div>
  );
}

export default EventDetails;
