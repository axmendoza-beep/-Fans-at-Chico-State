import { useState, useEffect } from 'react';
import { eventsAPI, venuesAPI } from '../lib/api';
import Map from '../components/Map';

function MapView() {
  const [events, setEvents] = useState([]);
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showEvents, setShowEvents] = useState(true);
  const [showVenues, setShowVenues] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [eventsRes, venuesRes] = await Promise.all([
        eventsAPI.getAll(),
        venuesAPI.getAll()
      ]);
      setEvents(eventsRes.data);
      setVenues(venuesRes.data);
      setError(null);
    } catch (err) {
      setError('Failed to load map data: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading map...</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;

  // Check if Google Maps is available
  if (!window.google) {
    return (
      <div>
        <h1>Map View</h1>
        <div style={{ 
          padding: '2rem', 
          backgroundColor: '#fff3cd', 
          border: '1px solid #ffc107',
          borderRadius: '4px',
          marginTop: '1rem'
        }}>
          <h3>⚠️ Google Maps Not Loaded</h3>
          <p>To enable the map feature, you need to:</p>
          <ol>
            <li>Get a Google Maps API key from <a href="https://console.cloud.google.com/" target="_blank" rel="noopener noreferrer">Google Cloud Console</a></li>
            <li>Add this script to <code>index.html</code> before the closing <code>&lt;/body&gt;</code> tag:</li>
          </ol>
          <pre style={{ 
            backgroundColor: '#f5f5f5', 
            padding: '1rem', 
            overflow: 'auto',
            borderRadius: '4px'
          }}>
{`<script src="https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY"></script>`}
          </pre>
          <p><strong>For now, showing venue and event data in list format:</strong></p>
        </div>

        <div style={{ marginTop: '2rem' }}>
          <h2>Venues ({venues.length})</h2>
          {venues.map(venue => (
            <div key={venue.venue_id} style={{ 
              border: '1px solid #ddd', 
              padding: '1rem', 
              marginBottom: '1rem' 
            }}>
              <h3>{venue.name}</h3>
              <p><strong>Address:</strong> {venue.address || 'Not specified'}</p>
              <p><strong>Type:</strong> {venue.type}</p>
              {venue.latitude && venue.longitude && (
                <p><strong>Coordinates:</strong> {venue.latitude}, {venue.longitude}</p>
              )}
            </div>
          ))}
        </div>

        <div style={{ marginTop: '2rem' }}>
          <h2>Events ({events.length})</h2>
          {events.map(event => (
            <div key={event.event_id} style={{ 
              border: '1px solid #ddd', 
              padding: '1rem', 
              marginBottom: '1rem' 
            }}>
              <h3>{event.game_name}</h3>
              <p><strong>Sport:</strong> {event.sport}</p>
              <p><strong>Time:</strong> {new Date(event.start_time).toLocaleString()}</p>
              {event.venue && <p><strong>Venue:</strong> {event.venue.name} - {event.venue.address}</p>}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1>Map View</h1>
      <p>View event and venue locations on the map</p>

      <div style={{ marginBottom: '1rem' }}>
        <label style={{ marginRight: '1rem' }}>
          <input
            type="checkbox"
            checked={showVenues}
            onChange={(e) => setShowVenues(e.target.checked)}
          />
          {' '}Show Venues ({venues.length})
        </label>
        <label>
          <input
            type="checkbox"
            checked={showEvents}
            onChange={(e) => setShowEvents(e.target.checked)}
          />
          {' '}Show Events ({events.length})
        </label>
      </div>

      <Map 
        venues={showVenues ? venues : []} 
        events={showEvents ? events : []}
        center={{ lat: 39.7285, lng: -121.8375 }} // Chico State coordinates
      />

      <div style={{ marginTop: '2rem' }}>
        <h2>Location Details</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
          <div>
            <h3>Venues ({venues.length})</h3>
            {venues.slice(0, 5).map(venue => (
              <div key={venue.venue_id} style={{ 
                padding: '0.5rem', 
                borderBottom: '1px solid #eee' 
              }}>
                <strong>{venue.name}</strong><br />
                <small>{venue.address || 'No address'}</small>
              </div>
            ))}
          </div>
          <div>
            <h3>Events ({events.length})</h3>
            {events.slice(0, 5).map(event => (
              <div key={event.event_id} style={{ 
                padding: '0.5rem', 
                borderBottom: '1px solid #eee' 
              }}>
                <strong>{event.game_name}</strong><br />
                <small>{event.venue?.name || 'No venue'}</small>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default MapView;
