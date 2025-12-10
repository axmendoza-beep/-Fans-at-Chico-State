import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { eventsAPI, groupsAPI, venuesAPI, groupMembershipsAPI } from '../lib/api';
import Map from '../components/Map';

function Search() {
  const navigate = useNavigate();
  const [searchType, setSearchType] = useState('events');
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'map'
  const [events, setEvents] = useState([]);
  const [groups, setGroups] = useState([]);
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [groupMemberships, setGroupMemberships] = useState([]);

  // Filter states
  const [filters, setFilters] = useState({
    searchTerm: '',
    sport: '',
    date: '',
    venue_type: '',
    twentyOnePlus: 'all'
  });

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const loadMemberships = async () => {
      let currentUser = null;
      const stored = localStorage.getItem('currentUser');
      if (stored) {
        try {
          currentUser = JSON.parse(stored);
        } catch {
          currentUser = null;
        }
      }

      if (!currentUser || !currentUser.user_id) {
        return;
      }

      try {
        const res = await groupMembershipsAPI.getForUser(currentUser.user_id);
        setGroupMemberships(res.data || []);
      } catch (err) {
        console.error('Failed to load group memberships for search page', err);
      }
    };

    loadMemberships();
  }, []);

  // When switching into map view or between Events/Venues tabs while in map view,
  // refresh data so the map reflects newly created events/venues.
  useEffect(() => {
    if (viewMode === 'map' && (searchType === 'events' || searchType === 'venues')) {
      fetchData();
    }
  }, [viewMode, searchType]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [eventsRes, groupsRes, venuesRes] = await Promise.all([
        eventsAPI.getAll(),
        groupsAPI.getAll(),
        venuesAPI.getAll()
      ]);
      setEvents(eventsRes.data);
      setGroups(groupsRes.data);
      setVenues(venuesRes.data);
      setError(null);
    } catch (err) {
      setError('Failed to load data: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Filter events
  const filteredEvents = events.filter(event => {
    const matchesSearch = !filters.searchTerm || 
      event.game_name.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
      event.sport.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
      event.description?.toLowerCase().includes(filters.searchTerm.toLowerCase());
    
    const matchesSport = !filters.sport || event.sport.toLowerCase() === filters.sport.toLowerCase();
    
    const matchesDate = !filters.date || 
      new Date(event.start_time).toISOString().split('T')[0] === filters.date;
    
    const matches21Plus = filters.twentyOnePlus === 'all' ||
      (filters.twentyOnePlus === 'yes' && event.is_twentyone_plus) ||
      (filters.twentyOnePlus === 'no' && !event.is_twentyone_plus);

    return matchesSearch && matchesSport && matchesDate && matches21Plus;
  });

  // Filter groups
  const filteredGroups = groups.filter(group => {
    const matchesSearch = !filters.searchTerm ||
      group.name.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
      group.sport.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
      group.description?.toLowerCase().includes(filters.searchTerm.toLowerCase());
    
    const matchesSport = !filters.sport || group.sport.toLowerCase() === filters.sport.toLowerCase();

    return matchesSearch && matchesSport;
  });

  // Filter venues
  const filteredVenues = venues.filter(venue => {
    const matchesSearch = !filters.searchTerm ||
      venue.name.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
      venue.address?.toLowerCase().includes(filters.searchTerm.toLowerCase());
    
    const matchesType = !filters.venue_type || venue.type === filters.venue_type;

    return matchesSearch && matchesType;
  });

  const clearFilters = () => {
    setFilters({
      searchTerm: '',
      sport: '',
      date: '',
      venue_type: '',
      twentyOnePlus: 'all'
    });
  };

  const handleJoinGroup = async (groupId) => {
    let currentUser = null;
    const stored = localStorage.getItem('currentUser');
    if (stored) {
      try {
        currentUser = JSON.parse(stored);
      } catch {
        currentUser = null;
      }
    }

    if (!currentUser || !currentUser.user_id) {
      navigate('/login');
      return;
    }

    try {
      const res = await groupMembershipsAPI.create({
        group_id: groupId,
        user_id: currentUser.user_id,
        role: 'member',
      });
      alert('Joined group successfully!');
      if (res.data) {
        setGroupMemberships((prev) => [...prev, res.data]);
      }
    } catch (err) {
      alert('Failed to join group: ' + err.message);
    }
  };

  const handleLeaveGroup = async (groupId) => {
    let currentUser = null;
    const stored = localStorage.getItem('currentUser');
    if (stored) {
      try {
        currentUser = JSON.parse(stored);
      } catch {
        currentUser = null;
      }
    }

    if (!currentUser || !currentUser.user_id) {
      navigate('/login');
      return;
    }

    const membership = groupMemberships.find(
      (m) => m.group_id === groupId && m.user_id === currentUser.user_id,
    );
    if (!membership) {
      return;
    }

    try {
      await groupMembershipsAPI.delete(membership.membership_id);
      setGroupMemberships((prev) => prev.filter((m) => m.membership_id !== membership.membership_id));
      alert('Left group successfully.');
    } catch (err) {
      alert('Failed to leave group: ' + err.message);
    }
  };

  if (loading) return <div>Loading search data...</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;

  const displayData = searchType === 'events' ? filteredEvents :
                      searchType === 'groups' ? filteredGroups :
                      filteredVenues;

  // For the map view, ensure events carry venue location data so red pins can render.
  const eventsForMap = filteredEvents.map((event) => {
    // If event already has a venue with coordinates, use it as-is
    if (event.venue && event.venue.latitude && event.venue.longitude) {
      return event;
    }

    // Otherwise, try to find the venue by venue_id from the loaded venues list
    const matchingVenue = venues.find((v) => v.venue_id === event.venue_id);
    if (matchingVenue) {
      return { ...event, venue: matchingVenue };
    }

    return event;
  });

  return (
    <div>
      <h1>Search & Explore</h1>
      <p>Find events, fan groups, and venues in list or map view</p>

      {/* Search Type Tabs */}
      <div style={{ marginBottom: '1rem', borderBottom: '2px solid #ddd' }}>
        <button
          onClick={() => setSearchType('events')}
          style={{
            padding: '0.75rem 1.5rem',
            border: 'none',
            borderBottom: searchType === 'events' ? '3px solid #1976d2' : 'none',
            backgroundColor: searchType === 'events' ? '#f0f0f0' : 'transparent',
            cursor: 'pointer',
            fontWeight: searchType === 'events' ? 'bold' : 'normal'
          }}
        >
          Events ({filteredEvents.length})
        </button>
        <button
          onClick={() => setSearchType('groups')}
          style={{
            padding: '0.75rem 1.5rem',
            border: 'none',
            borderBottom: searchType === 'groups' ? '3px solid #1976d2' : 'none',
            backgroundColor: searchType === 'groups' ? '#f0f0f0' : 'transparent',
            cursor: 'pointer',
            fontWeight: searchType === 'groups' ? 'bold' : 'normal'
          }}
        >
          Fan Groups ({filteredGroups.length})
        </button>
        <button
          onClick={() => setSearchType('venues')}
          style={{
            padding: '0.75rem 1.5rem',
            border: 'none',
            borderBottom: searchType === 'venues' ? '3px solid #1976d2' : 'none',
            backgroundColor: searchType === 'venues' ? '#f0f0f0' : 'transparent',
            cursor: 'pointer',
            fontWeight: searchType === 'venues' ? 'bold' : 'normal'
          }}
        >
          Venues ({filteredVenues.length})
        </button>
      </div>

      {/* View Mode Toggle */}
      <div style={{ marginBottom: '1.5rem' }}>
        <span style={{ marginRight: '0.75rem', fontWeight: 'bold' }}>View:</span>
        <button
          type="button"
          onClick={() => setViewMode('list')}
          style={{
            padding: '0.5rem 1rem',
            marginRight: '0.5rem',
            borderRadius: '4px',
            border: viewMode === 'list' ? '2px solid #1976d2' : '1px solid #ccc',
            backgroundColor: viewMode === 'list' ? '#e3f2fd' : '#ffffff',
            cursor: 'pointer',
            fontWeight: viewMode === 'list' ? 'bold' : 'normal',
          }}
        >
          List
        </button>
        <button
          type="button"
          onClick={() => setViewMode('map')}
          style={{
            padding: '0.5rem 1rem',
            borderRadius: '4px',
            border: viewMode === 'map' ? '2px solid #1976d2' : '1px solid #ccc',
            backgroundColor: viewMode === 'map' ? '#e3f2fd' : '#ffffff',
            cursor: 'pointer',
            fontWeight: viewMode === 'map' ? 'bold' : 'normal',
          }}
        >
          Map
        </button>
      </div>

      {/* Filters */}
      <div style={{ 
        padding: '1rem', 
        backgroundColor: '#f9f9f9', 
        border: '1px solid #ddd',
        marginBottom: '2rem'
      }}>
        <h3>Filters</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          {/* Search Term */}
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
              Search:
            </label>
            <input
              type="text"
              value={filters.searchTerm}
              onChange={(e) => setFilters({ ...filters, searchTerm: e.target.value })}
              placeholder="Search by name, sport..."
              style={{ width: '100%', padding: '0.5rem' }}
            />
          </div>

          {/* Sport Filter */}
          {(searchType === 'events' || searchType === 'groups') && (
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                Sport:
              </label>
              <select
                value={filters.sport}
                onChange={(e) => setFilters({ ...filters, sport: e.target.value })}
                style={{ width: '100%', padding: '0.5rem' }}
              >
                <option value="">All Sports</option>
                <option value="football">Football</option>
                <option value="basketball">Basketball</option>
                <option value="baseball">Baseball</option>
                <option value="soccer">Soccer</option>
                <option value="hockey">Hockey</option>
              </select>
            </div>
          )}

          {/* Date Filter (Events only) */}
          {searchType === 'events' && (
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                Date:
              </label>
              <input
                type="date"
                value={filters.date}
                onChange={(e) => setFilters({ ...filters, date: e.target.value })}
                style={{ width: '100%', padding: '0.5rem' }}
              />
            </div>
          )}

          {/* 21+ Filter (Events only) */}
          {searchType === 'events' && (
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                Age Restriction:
              </label>
              <select
                value={filters.twentyOnePlus}
                onChange={(e) => setFilters({ ...filters, twentyOnePlus: e.target.value })}
                style={{ width: '100%', padding: '0.5rem' }}
              >
                <option value="all">All Events</option>
                <option value="no">All Ages</option>
                <option value="yes">21+ Only</option>
              </select>
            </div>
          )}

          {/* Venue Type Filter (Venues only) */}
          {searchType === 'venues' && (
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                Venue Type:
              </label>
              <select
                value={filters.venue_type}
                onChange={(e) => setFilters({ ...filters, venue_type: e.target.value })}
                style={{ width: '100%', padding: '0.5rem' }}
              >
                <option value="">All Types</option>
                <option value="dorm">Dorm</option>
                <option value="lounge">Lounge</option>
                <option value="bar">Bar</option>
                <option value="house">House</option>
              </select>
            </div>
          )}
        </div>

        <button 
          onClick={clearFilters}
          style={{ 
            marginTop: '1rem',
            padding: '0.5rem 1rem',
            backgroundColor: '#666',
            color: 'white',
            border: 'none',
            cursor: 'pointer'
          }}
        >
          Clear Filters
        </button>
      </div>

      {/* Results / Map */}
      {viewMode === 'list' && (
        <div>
          <h2>Results ({displayData.length})</h2>
          {displayData.length === 0 ? (
            <p>No results found. Try adjusting your filters.</p>
          ) : (
            <div>
              {searchType === 'events' && filteredEvents.map((event) => (
                <div key={event.event_id} style={{ 
                  border: '1px solid #ddd', 
                  padding: '1rem', 
                  marginBottom: '1rem' 
                }}>
                  <h3>{event.game_name}</h3>
                  <p><strong>Sport:</strong> {event.sport}</p>
                  <p><strong>Time:</strong> {new Date(event.start_time).toLocaleString()}</p>
                  <p><strong>Description:</strong> {event.description || 'No description'}</p>
                  {event.venue && <p><strong>Venue:</strong> {event.venue.name}</p>}
                  {event.host && <p><strong>Host:</strong> {event.host.display_name}</p>}
                  <p><strong>21+:</strong> {event.is_twentyone_plus ? 'Yes' : 'No'}</p>
                </div>
              ))}

              {searchType === 'groups' && filteredGroups.map((group) => (
                <div key={group.group_id} style={{ 
                  border: '1px solid #ddd', 
                  padding: '1rem', 
                  marginBottom: '1rem' 
                }}>
                  <h3>{group.name}</h3>
                  <p><strong>Sport:</strong> {group.sport}</p>
                  <p><strong>Description:</strong> {group.description || 'No description'}</p>
                  {groupMemberships.some((m) => m.group_id === group.group_id) ? (
                    <div style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{
                        padding: '0.15rem 0.5rem',
                        borderRadius: '999px',
                        backgroundColor: '#e8f5e9',
                        color: '#2e7d32',
                        fontSize: '0.8rem',
                        fontWeight: 'bold',
                      }}>
                        Joined
                      </span>
                      <button
                        type="button"
                        onClick={() => handleLeaveGroup(group.group_id)}
                        style={{
                          padding: '0.25rem 0.75rem',
                          borderRadius: '4px',
                          border: '1px solid #c62828',
                          backgroundColor: '#ffffff',
                          color: '#c62828',
                          cursor: 'pointer',
                          fontSize: '0.85rem',
                          fontWeight: 'bold',
                        }}
                      >
                        Leave
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleJoinGroup(group.group_id)}
                      style={{
                        marginTop: '0.5rem',
                        padding: '0.25rem 0.75rem',
                        borderRadius: '4px',
                        border: '1px solid #1976d2',
                        backgroundColor: '#1976d2',
                        color: '#fff',
                        cursor: 'pointer',
                        fontSize: '0.9rem',
                        fontWeight: 'bold',
                      }}
                    >
                      Join Group
                    </button>
                  )}
                </div>
              ))}

              {searchType === 'venues' && filteredVenues.map((venue) => (
                <div key={venue.venue_id} style={{ 
                  border: '1px solid #ddd', 
                  padding: '1rem', 
                  marginBottom: '1rem' 
                }}>
                  <h3>{venue.name}</h3>
                  <p><strong>Type:</strong> {venue.type}</p>
                  <p><strong>Address:</strong> {venue.address || 'Not specified'}</p>
                  <p><strong>Atmosphere:</strong> {' '.repeat(venue.atmosphere_rating || 0)}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {viewMode === 'map' && (
        <div style={{ marginTop: '1rem' }}>
          <h2>Map view</h2>
          {!window.google ? (
            <div style={{ 
              padding: '2rem', 
              backgroundColor: '#fff3cd', 
              border: '1px solid #ffc107',
              borderRadius: '4px',
              marginTop: '1rem'
            }}>
              <h3>Google Maps Not Loaded</h3>
              <p>To enable the map feature, you need to add the Google Maps script to <code>index.html</code>.</p>
              <p>For now, switch back to list view to browse results.</p>
            </div>
          ) : (
            <Map 
              venues={searchType === 'venues' ? filteredVenues : []}
              events={searchType === 'events' ? eventsForMap : []}
              center={{ lat: 39.7285, lng: -121.8375 }}
            />
          )}
        </div>
      )}
    </div>
  );
}

export default Search;
