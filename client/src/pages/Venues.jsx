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
    atmosphere_rating: 3,
    latitude: '',
    longitude: ''
  });
  const [editingVenueId, setEditingVenueId] = useState(null);
  const [currentUser] = useState(() => {
    try {
      const raw = localStorage.getItem('currentUser');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
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

  const handleCreateOrUpdateVenue = async (e) => {
    e.preventDefault();
    try {
      let latitude = newVenue.latitude;
      let longitude = newVenue.longitude;

      // If Google Maps is available and we have an address, try to geocode it.
      // Users only enter the street address; we assume Chico, CA as the city.
      if (window.google && window.google.maps && newVenue.address && (!latitude || !longitude)) {
        const geocoder = new window.google.maps.Geocoder();

        // Always treat the address as being in Chico, CA for this app.
        const fullAddress = `${newVenue.address}, Chico, CA`;

        const geocodeResult = await new Promise((resolve, reject) => {
          geocoder.geocode({ address: fullAddress }, (results, status) => {
            if (status === 'OK' && results && results[0]) {
              resolve(results[0]);
            } else {
              reject(new Error('Geocoding failed: ' + status));
            }
          });
        });

        if (geocodeResult && geocodeResult.geometry && geocodeResult.geometry.location) {
          latitude = geocodeResult.geometry.location.lat();
          longitude = geocodeResult.geometry.location.lng();
        }
      }

      const payload = {
        ...newVenue,
        latitude,
        longitude,
        creator_email: currentUser && currentUser.email ? currentUser.email : undefined,
      };

      if (editingVenueId) {
        await venuesAPI.update(editingVenueId, payload);
        alert('Venue updated successfully!');
      } else {
        await venuesAPI.create(payload);
        alert('Venue created successfully!');
      }
      setShowCreateForm(false);
      setEditingVenueId(null);
      setNewVenue({
        name: '',
        type: 'lounge',
        address: '',
        food_options: '',
        parking_notes: '',
        atmosphere_rating: 3,
        latitude: '',
        longitude: ''
      });
      fetchVenues();
    } catch (err) {
      alert('Failed to save venue: ' + err.message);
    }
  };

  const startEditVenue = (venue) => {
    const userEmail = currentUser && currentUser.email ? currentUser.email.toLowerCase() : null;
    const creatorEmail = venue && venue.creator_email ? venue.creator_email.toLowerCase() : null;

    if (!userEmail || !creatorEmail || userEmail !== creatorEmail) {
      return;
    }

    setShowCreateForm(true);
    setEditingVenueId(venue.venue_id);

    setNewVenue({
      name: venue.name || '',
      type: venue.type || 'lounge',
      address: venue.address || '',
      food_options: venue.food_options || '',
      parking_notes: venue.parking_notes || '',
      atmosphere_rating: venue.atmosphere_rating || 3,
      latitude: venue.latitude || '',
      longitude: venue.longitude || '',
    });
  };

  const handleDeleteVenue = async (venueId) => {
    const venue = venues.find((v) => v.venue_id === venueId);
    const userEmail = currentUser && currentUser.email ? currentUser.email.toLowerCase() : null;
    const creatorEmail = venue && venue.creator_email ? venue.creator_email.toLowerCase() : null;

    if (!venue || !userEmail || !creatorEmail || userEmail !== creatorEmail) {
      return;
    }

    const confirmed = window.confirm('Are you sure you want to delete this venue?');
    if (!confirmed) return;

    try {
      await venuesAPI.delete(venueId);
      setVenues((prev) => prev.filter((v) => v.venue_id !== venueId));
    } catch (err) {
      alert('Failed to delete venue: ' + err.message);
    }
  };

  if (loading) return <div>Loading venues...</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;

  return (
    <div>
      <h1>Venues</h1>
      <p>Discover great locations for watch parties</p>

      <button
        onClick={() => {
          setShowCreateForm(!showCreateForm);
          setEditingVenueId(null);
          setNewVenue({
            name: '',
            type: 'lounge',
            address: '',
            food_options: '',
            parking_notes: '',
            atmosphere_rating: 3,
            latitude: '',
            longitude: ''
          });
        }}
      >
        {showCreateForm ? 'Cancel' : 'Add New Venue'}
      </button>

      {showCreateForm && (
        <div style={{ border: '1px solid #ccc', padding: '1rem', marginTop: '1rem' }}>
          <h2>{editingVenueId ? 'Edit Venue' : 'Add New Venue'}</h2>
          <form onSubmit={handleCreateOrUpdateVenue}>
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
              <label>Street Address (Chico, CA):</label><br />
              <input
                type="text"
                value={newVenue.address}
                onChange={(e) => setNewVenue({ ...newVenue, address: e.target.value })}
                placeholder="123 Main St"
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
            <button type="submit">{editingVenueId ? 'Save Changes' : 'Add Venue'}</button>
          </form>
        </div>
      )}

      <div style={{ marginTop: '2rem' }}>
        <h2>Available Venues ({venues.length})</h2>
        {venues.length === 0 ? (
          <p>No venues found. Add one to get started!</p>
        ) : (
          <div>
            {venues.map((venue) => {
              const userEmail = currentUser && currentUser.email ? currentUser.email.toLowerCase() : null;
              const creatorEmail = venue && venue.creator_email ? venue.creator_email.toLowerCase() : null;
              const isOwner = !!userEmail && !!creatorEmail && userEmail === creatorEmail;
              return (
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
                  {isOwner && (
                    <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.5rem' }}>
                      <button
                        type="button"
                        onClick={() => startEditVenue(venue)}
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
                        onClick={() => handleDeleteVenue(venue.venue_id)}
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
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default Venues;
