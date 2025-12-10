import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { eventsAPI, rsvpsAPI, venuesAPI, eventVotesAPI } from '../lib/api';

function Events() {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newEvent, setNewEvent] = useState({
    sport: '',
    game_name: '',
    start_time: '',
    description: '',
    host_email: '',
    venue_id: ''
  });
  const [createError, setCreateError] = useState(null);
  const [editingEventId, setEditingEventId] = useState(null);
  const [currentUser] = useState(() => {
    try {
      const raw = localStorage.getItem('currentUser');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });
  const [votes, setVotes] = useState({}); // { [event_id]: 1 | -1 | 0 }
  const [savedEvents, setSavedEvents] = useState(() => {
    try {
      const raw = localStorage.getItem('savedEvents');
      const parsed = raw ? JSON.parse(raw) : {};
      if (currentUser && parsed[currentUser.user_id]) {
        return parsed[currentUser.user_id];
      }
      return [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    fetchEvents();
    fetchVenues();
    if (currentUser) {
      fetchVotes(currentUser.user_id);
    }
  }, [currentUser]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await eventsAPI.getAll();
      setEvents(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to load events: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchVotes = async (userId) => {
    try {
      const response = await eventVotesAPI.getForUser(userId);
      const voteMap = {};
      response.data.forEach((vote) => {
        voteMap[vote.event_id] = vote.value;
      });
      setVotes(voteMap);
    } catch (err) {
      console.error('Failed to load event votes for user', err);
    }
  };

  const fetchVenues = async () => {
    try {
      const response = await venuesAPI.getAll();
      setVenues(response.data);
    } catch (err) {
      // Leave venues empty on failure; event creation will still allow manual ID entry.
      console.error('Failed to load venues for event creation', err);
    }
  };

  const handleCreateOrUpdateEvent = async (e) => {
    e.preventDefault();
    setCreateError(null);

    const email = newEvent.host_email.trim();
    if (!email) {
      setCreateError('Host email is required.');
      return;
    }

    if (!email.toLowerCase().endsWith('@mail.csuchico.edu')) {
      setCreateError('Please use a valid Chico State email ending in @mail.csuchico.edu for the host.');
      return;
    }

    try {
      if (editingEventId) {
        const { host_email, ...updatePayload } = newEvent;
        await eventsAPI.update(editingEventId, updatePayload);
        alert('Event updated successfully!');
      } else {
        await eventsAPI.create(newEvent);
        alert('Event created successfully!');
      }
      setShowCreateForm(false);
      setEditingEventId(null);
      setNewEvent({
        sport: '',
        game_name: '',
        start_time: '',
        description: '',
        host_email: '',
        venue_id: ''
      });
      fetchEvents();
    } catch (err) {
      setCreateError('Failed to create event: ' + err.message);
    }
  };

  const startEditEvent = (event) => {
    if (!currentUser || currentUser.user_id !== event.host_user_id) {
      return;
    }

    setShowCreateForm(true);
    setEditingEventId(event.event_id);
    setCreateError(null);

    setNewEvent({
      sport: event.sport || '',
      game_name: event.game_name || '',
      start_time: event.start_time
        ? new Date(event.start_time).toISOString().slice(0, 16)
        : '',
      description: event.description || '',
      host_email: event.host?.email || '',
      venue_id: event.venue_id || '',
    });
  };

  const handleDeleteEvent = async (eventId) => {
    const event = events.find((e) => e.event_id === eventId);
    if (!event || !currentUser || currentUser.user_id !== event.host_user_id) {
      return;
    }

    const confirmed = window.confirm('Are you sure you want to delete this event?');
    if (!confirmed) return;

    try {
      await eventsAPI.delete(eventId);
      setEvents((prev) => prev.filter((e) => e.event_id !== eventId));
    } catch (err) {
      alert('Failed to delete event: ' + err.message);
    }
  };

  const toggleVote = (eventId, value) => {
    if (!currentUser) {
      alert('Please sign in to vote on events.');
      navigate('/login');
      return;
    }

    setVotes((prev) => {
      const current = prev[eventId] || 0;
      const nextValue = current === value ? 0 : value;

      // Optimistic update
      const updated = { ...prev, [eventId]: nextValue };

      // Persist to backend
      eventVotesAPI.setVote({
        event_id: eventId,
        user_id: currentUser.user_id,
        value: nextValue,
      }).catch((err) => {
        console.error('Failed to persist vote', err);
      });

      return updated;
    });
  };

  const toggleSave = (eventId) => {
    if (!currentUser) {
      alert('Please sign in to save events.');
      navigate('/login');
      return;
    }

    setSavedEvents((prev) => {
      let next;
      if (prev.includes(eventId)) {
        next = prev.filter((id) => id !== eventId);
      } else {
        next = [...prev, eventId];
      }
      try {
        const raw = localStorage.getItem('savedEvents');
        const parsed = raw ? JSON.parse(raw) : {};
        const userId = currentUser.user_id;
        const updated = { ...parsed, [userId]: next };
        localStorage.setItem('savedEvents', JSON.stringify(updated));
      } catch {
        // ignore storage errors
      }
      return next;
    });
  };

  if (loading) return <div>Loading events...</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;

  // Reorder events so that saved events for this user appear at the top
  const sortedEvents = [...events].sort((a, b) => {
    const aSaved = savedEvents.includes(a.event_id);
    const bSaved = savedEvents.includes(b.event_id);

    if (aSaved && !bSaved) return -1;
    if (!aSaved && bSaved) return 1;

    // If both are saved or both are not, keep chronological order by start_time
    return new Date(a.start_time) - new Date(b.start_time);
  });

  return (
    <div>
      <h1>Events</h1>
      <p>Browse upcoming watch parties, vote on what looks fun, and open an event to see full details.</p>

      <button onClick={() => {
        setShowCreateForm(!showCreateForm);
        setEditingEventId(null);
        setCreateError(null);
        setNewEvent({
          sport: '',
          game_name: '',
          start_time: '',
          description: '',
          host_email: '',
          venue_id: ''
        });
      }}>
        {showCreateForm ? 'Cancel' : 'Create New Event'}
      </button>

      {showCreateForm && (
        <div style={{ border: '1px solid #ccc', padding: '1rem', marginTop: '1rem' }}>
          <h2>{editingEventId ? 'Edit Event' : 'Create New Event'}</h2>
          {createError && (
            <div style={{
              padding: '0.75rem 1rem',
              marginBottom: '1rem',
              backgroundColor: '#ffebee',
              color: '#c62828',
              borderRadius: '4px',
            }}>
              {createError}
            </div>
          )}
          <form onSubmit={handleCreateOrUpdateEvent}>
            <div style={{ marginBottom: '1rem' }}>
              <label>Sport:</label><br />
              <input
                type="text"
                value={newEvent.sport}
                onChange={(e) => setNewEvent({ ...newEvent, sport: e.target.value })}
                required
              />
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label>Game Name:</label><br />
              <input
                type="text"
                value={newEvent.game_name}
                onChange={(e) => setNewEvent({ ...newEvent, game_name: e.target.value })}
                required
              />
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label>Start Time:</label><br />
              <input
                type="datetime-local"
                value={newEvent.start_time}
                onChange={(e) => setNewEvent({ ...newEvent, start_time: e.target.value })}
                required
              />
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label>Description:</label><br />
              <textarea
                value={newEvent.description}
                onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
              />
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label>Host Email (Chico State):</label><br />
              <input
                type="email"
                value={newEvent.host_email}
                onChange={(e) => setNewEvent({ ...newEvent, host_email: e.target.value })}
                placeholder="you@mail.csuchico.edu"
                required
              />
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label>Venue:</label><br />
              <select
                value={newEvent.venue_id}
                onChange={(e) => setNewEvent({ ...newEvent, venue_id: e.target.value })}
                style={{ minWidth: '250px' }}
              >
                <option value="">Select a venue (optional)</option>
                {venues.map((venue) => (
                  <option key={venue.venue_id} value={venue.venue_id}>
                    {venue.name} 
                    ({venue.type}) - {venue.venue_id}
                  </option>
                ))}
              </select>
              <small style={{ display: 'block', marginTop: '0.25rem', color: '#666' }}>
                Choosing a venue here will automatically fill the Venue ID field below.
              </small>
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label>Venue ID:</label><br />
              <input
                type="text"
                value={newEvent.venue_id}
                onChange={(e) => setNewEvent({ ...newEvent, venue_id: e.target.value })}
                placeholder="Select a venue above or paste a Venue ID"
                required
              />
            </div>
            <button type="submit">{editingEventId ? 'Save Changes' : 'Create Event'}</button>
          </form>
        </div>
      )}

      <div style={{ marginTop: '2rem' }}>
        <h2>Upcoming Events ({events.length})</h2>
        {events.length === 0 ? (
          <p>No events found. Create one to get started!</p>
        ) : (
          <div>
            {sortedEvents.map((event) => {
              const isOwner = currentUser && currentUser.user_id === event.host_user_id;
              return (
                <div
                  key={event.event_id}
                  style={{ 
                    border: '1px solid #ddd', 
                    padding: '1rem', 
                    marginBottom: '1rem',
                    borderRadius: '8px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    gap: '1rem',
                    cursor: 'pointer',
                    backgroundColor: savedEvents.includes(event.event_id) ? '#f3e5f5' : 'white',
                  }}
                  onClick={() =>
                    navigate(`/events/${event.event_id}`, {
                      state: { userVote: votes[event.event_id] || 0 },
                    })
                  }
                >
                  <div style={{ flex: 1 }}>
                    <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.25rem' }}>
                      {event.game_name}
                    </h3>
                    <p style={{ margin: '0.25rem 0', color: '#555' }}>
                      <strong>Sport:</strong> {event.sport}
                    </p>
                    <p style={{ margin: '0.25rem 0', color: '#555' }}>
                      <strong>Start:</strong> {new Date(event.start_time).toLocaleString()}
                    </p>
                    {event.venue && (
                      <p style={{ margin: '0.25rem 0', color: '#555' }}>
                        <strong>Venue:</strong> {event.venue.name} ({event.venue.type})
                      </p>
                    )}
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      alignItems: 'flex-end',
                      minWidth: '120px',
                    }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                      <button
                        type="button"
                        onClick={() => toggleVote(event.event_id, 1)}
                        style={{
                          padding: '0.25rem 0.5rem',
                          borderRadius: '4px',
                          border: votes[event.event_id] === 1 ? '2px solid #2e7d32' : '1px solid #ccc',
                          backgroundColor: votes[event.event_id] === 1 ? '#e8f5e9' : '#ffffff',
                          cursor: 'pointer',
                        }}
                      >
                        ▲ Upvote
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleVote(event.event_id, -1)}
                        style={{
                          padding: '0.25rem 0.5rem',
                          borderRadius: '4px',
                          border: votes[event.event_id] === -1 ? '2px solid #c62828' : '1px solid #ccc',
                          backgroundColor: votes[event.event_id] === -1 ? '#ffebee' : '#ffffff',
                          cursor: 'pointer',
                        }}
                      >
                        ▼ Downvote
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => toggleSave(event.event_id)}
                      style={{
                        marginTop: '0.5rem',
                        padding: '0.25rem 0.75rem',
                        borderRadius: '4px',
                        border: savedEvents.includes(event.event_id) ? '2px solid #6a1b9a' : '1px solid #ccc',
                        backgroundColor: savedEvents.includes(event.event_id) ? '#f3e5f5' : '#ffffff',
                        cursor: 'pointer',
                        fontSize: '0.85rem',
                      }}
                    >
                      {savedEvents.includes(event.event_id) ? 'Saved' : 'Save'}
                    </button>
                    {isOwner && (
                      <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.5rem' }}>
                        <button
                          type="button"
                          onClick={() => startEditEvent(event)}
                          style={{
                            padding: '0.25rem 0.5rem',
                            borderRadius: '4px',
                            border: '1px solid #1976d2',
                            backgroundColor: '#e3f2fd',
                            cursor: 'pointer',
                            fontSize: '0.8rem',
                          }}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteEvent(event.event_id)}
                          style={{
                            padding: '0.25rem 0.5rem',
                            borderRadius: '4px',
                            border: '1px solid #c62828',
                            backgroundColor: '#ffebee',
                            cursor: 'pointer',
                            fontSize: '0.8rem',
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Events;
