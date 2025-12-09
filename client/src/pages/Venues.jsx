import { useState, useEffect } from 'react';
import { venuesAPI } from '../lib/api';

function Venues() {
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newVenue, setNewVenue] = useState({
    name: '',
    type: 'lounge',
    address: '',
    food_options: '',
    parking_notes: '',
    atmosphere_rating: 3
  });

  useEffect(() => {
    fetchVenues();
  }, []);

  const fetchVenues = async () => {
    try {
      setLoading(true);
      const response = await venuesAPI.getAll();
      setVenues(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to load venues: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateVenue = async (e) => {
    e.preventDefault();
    try {
      await venuesAPI.create(newVenue);
      alert('Venue created successfully!');
      setShowCreateForm(false);
      setNewVenue({
        name: '',
        type: 'lounge',
        address: '',
        food_options: '',
        parking_notes: '',
        atmosphere_rating: 3
      });
      fetchVenues();
    } catch (err) {
      alert('Failed to create venue: ' + err.message);
    }
  };

  if (loading) return <div>Loading venues...</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;

  return (
    <div>
      <h1>Venues</h1>
      <p>Discover great locations for watch parties</p>

      <button onClick={() => setShowCreateForm(!showCreateForm)}>
        {showCreateForm ? 'Cancel' : 'Add New Venue'}
      </button>

      {showCreateForm && (
        <div style={{ border: '1px solid #ccc', padding: '1rem', marginTop: '1rem' }}>
          <h2>Add New Venue</h2>
          <form onSubmit={handleCreateVenue}>
            <div style={{ marginBottom: '1rem' }}>
              <label>Name:</label><br />
              <input
                type="text"
                value={newVenue.name}
                onChange={(e) => setNewVenue({ ...newVenue, name: e.target.value })}
                required
              />
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label>Type:</label><br />
              <select
                value={newVenue.type}
                onChange={(e) => setNewVenue({ ...newVenue, type: e.target.value })}
              >
                <option value="dorm">Dorm</option>
                <option value="lounge">Lounge</option>
                <option value="bar">Bar</option>
                <option value="house">House</option>
              </select>
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label>Address:</label><br />
              <input
                type="text"
                value={newVenue.address}
                onChange={(e) => setNewVenue({ ...newVenue, address: e.target.value })}
              />
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label>Food Options:</label><br />
              <input
                type="text"
                value={newVenue.food_options}
                onChange={(e) => setNewVenue({ ...newVenue, food_options: e.target.value })}
              />
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label>Parking Notes:</label><br />
              <input
                type="text"
                value={newVenue.parking_notes}
                onChange={(e) => setNewVenue({ ...newVenue, parking_notes: e.target.value })}
              />
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label>Atmosphere Rating (1-5):</label><br />
              <input
                type="number"
                min="1"
                max="5"
                value={newVenue.atmosphere_rating}
                onChange={(e) => setNewVenue({ ...newVenue, atmosphere_rating: parseInt(e.target.value) })}
              />
            </div>
            <button type="submit">Add Venue</button>
          </form>
        </div>
      )}

      <div style={{ marginTop: '2rem' }}>
        <h2>Available Venues ({venues.length})</h2>
        {venues.length === 0 ? (
          <p>No venues found. Add one to get started!</p>
        ) : (
          <div>
            {venues.map((venue) => (
              <div key={venue.venue_id} style={{ 
                border: '1px solid #ddd', 
                padding: '1rem', 
                marginBottom: '1rem' 
              }}>
                <h3>{venue.name}</h3>
                <p><strong>Venue ID:</strong> {venue.venue_id}</p>
                <p><strong>Type:</strong> {venue.type}</p>
                <p><strong>Address:</strong> {venue.address || 'Not specified'}</p>
                <p><strong>Food Options:</strong> {venue.food_options || 'None listed'}</p>
                <p><strong>Parking:</strong> {venue.parking_notes || 'No info'}</p>
                <p><strong>Atmosphere:</strong> {'⭐'.repeat(venue.atmosphere_rating || 0)}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Venues;
