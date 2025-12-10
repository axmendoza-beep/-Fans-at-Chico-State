import { useState, useEffect } from 'react';
import { eventsAPI, rsvpsAPI, venuesAPI } from '../lib/api';

function Events() {
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

  useEffect(() => {
    fetchEvents();
    fetchVenues();
  }, []);

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

  const fetchVenues = async () => {
    try {
      const response = await venuesAPI.getAll();
      setVenues(response.data);
    } catch (err) {
      // Leave venues empty on failure; event creation will still allow manual ID entry.
      console.error('Failed to load venues for event creation', err);
    }
  };

  const handleCreateEvent = async (e) => {
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
      await eventsAPI.create(newEvent);
      alert('Event created successfully!');
      setShowCreateForm(false);
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

  const handleRSVP = async (eventId) => {
    const userId = prompt('Enter your user ID:');
    if (!userId) return;

    try {
      await rsvpsAPI.create({
        event_id: eventId,
        user_id: userId,
        status: 'going'
      });
      alert('RSVP successful!');
    } catch (err) {
      alert('Failed to RSVP: ' + err.message);
    }
  };

  if (loading) return <div>Loading events...</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;

  return (
    <div>
      <h1>Events</h1>
      <p>Browse upcoming watch parties and RSVP to join</p>

      <button onClick={() => setShowCreateForm(!showCreateForm)}>
        {showCreateForm ? 'Cancel' : 'Create New Event'}
      </button>

      {showCreateForm && (
        <div style={{ border: '1px solid #ccc', padding: '1rem', marginTop: '1rem' }}>
          <h2>Create New Event</h2>
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
          <form onSubmit={handleCreateEvent}>
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
            <button type="submit">Create Event</button>
          </form>
        </div>
      )}

      <div style={{ marginTop: '2rem' }}>
        <h2>Upcoming Events ({events.length})</h2>
        {events.length === 0 ? (
          <p>No events found. Create one to get started!</p>
        ) : (
          <div>
            {events.map((event) => (
              <div key={event.event_id} style={{ 
                border: '1px solid #ddd', 
                padding: '1rem', 
                marginBottom: '1rem' 
              }}>
                <h3>{event.game_name}</h3>
                <p><strong>Sport:</strong> {event.sport}</p>
                <p><strong>Time:</strong> {new Date(event.start_time).toLocaleString()}</p>
                <p><strong>Description:</strong> {event.description || 'No description'}</p>
                {event.venue && (
                  <p><strong>Venue:</strong> {event.venue.name} ({event.venue.type})</p>
                )}
                {event.host && (
                  <p><strong>Host:</strong> {event.host.display_name}</p>
                )}
                <p><strong>21+:</strong> {event.is_twentyone_plus ? 'Yes' : 'No'}</p>
                <button onClick={() => handleRSVP(event.event_id)}>RSVP</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Events;
