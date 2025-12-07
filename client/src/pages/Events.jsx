import { useState, useEffect } from 'react';
import { eventsAPI, rsvpsAPI } from '../lib/api';

function Events() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newEvent, setNewEvent] = useState({
    sport: '',
    game_name: '',
    start_time: '',
    description: '',
    host_user_id: '',
    venue_id: '',
    photo_url: ''
  });
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  useEffect(() => {
    fetchEvents();
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

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    try {
      await eventsAPI.create(newEvent);
      alert('Event created successfully!');
      setShowCreateForm(false);
      setNewEvent({
        sport: '',
        game_name: '',
        start_time: '',
        description: '',
        host_user_id: '',
        venue_id: '',
        photo_url: ''
      });
      setSelectedPhoto(null);
      fetchEvents();
    } catch (err) {
      alert('Failed to create event: ' + err.message);
    }
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedPhoto(file);
      // In a real app, you'd upload to a storage service (e.g., Supabase Storage)
      // For now, we'll just create a local URL
      const photoUrl = URL.createObjectURL(file);
      setNewEvent({ ...newEvent, photo_url: photoUrl });
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
              <label>Host User ID:</label><br />
              <input
                type="text"
                value={newEvent.host_user_id}
                onChange={(e) => setNewEvent({ ...newEvent, host_user_id: e.target.value })}
                required
              />
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label>Venue ID:</label><br />
              <input
                type="text"
                value={newEvent.venue_id}
                onChange={(e) => setNewEvent({ ...newEvent, venue_id: e.target.value })}
                required
              />
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label>Event Photo (optional):</label><br />
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
              />
              {selectedPhoto && (
                <div style={{ marginTop: '0.5rem' }}>
                  <small>Selected: {selectedPhoto.name}</small>
                  {newEvent.photo_url && (
                    <img 
                      src={newEvent.photo_url} 
                      alt="Preview" 
                      style={{ display: 'block', maxWidth: '200px', marginTop: '0.5rem' }}
                    />
                  )}
                </div>
              )}
              <small style={{ display: 'block', marginTop: '0.5rem', color: '#666' }}>
                Upload a photo for your event (JPG, PNG, etc.)
              </small>
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
