import { useState, useEffect } from 'react';
import { followedTeamsAPI, eventsAPI } from '../services/api';

function Notifications() {
  const [followedTeams, setFollowedTeams] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [teamsRes, eventsRes] = await Promise.all([
        followedTeamsAPI.getAll(),
        eventsAPI.getAll()
      ]);
      setFollowedTeams(teamsRes.data);
      setEvents(eventsRes.data);
      setError(null);
    } catch (err) {
      setError('Failed to load notifications: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading notifications...</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;

  // Filter events that match followed teams
  const relevantEvents = events.filter(event => 
    followedTeams.some(team => 
      event.sport.toLowerCase() === team.sport.toLowerCase() ||
      event.game_name.toLowerCase().includes(team.team_name.toLowerCase())
    )
  );

  return (
    <div>
      <h1>Notifications</h1>
      <p>Get alerts for your favorite teams and upcoming events</p>

      <div style={{ marginTop: '2rem' }}>
        <h2>Your Followed Teams ({followedTeams.length})</h2>
        {followedTeams.length === 0 ? (
          <p>You haven't followed any teams yet. Go to your Profile to follow teams!</p>
        ) : (
          <ul>
            {followedTeams.map((team) => (
              <li key={team.followed_team_id}>
                <strong>{team.team_name}</strong> - {team.sport}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div style={{ marginTop: '2rem' }}>
        <h2>Events for Your Teams ({relevantEvents.length})</h2>
        {relevantEvents.length === 0 ? (
          <p>No upcoming events for your followed teams.</p>
        ) : (
          <div>
            {relevantEvents.map((event) => (
              <div key={event.event_id} style={{ 
                border: '1px solid #ddd', 
                padding: '1rem', 
                marginBottom: '1rem',
                backgroundColor: '#f9f9f9'
              }}>
                <h3>🔔 {event.game_name}</h3>
                <p><strong>Sport:</strong> {event.sport}</p>
                <p><strong>Time:</strong> {new Date(event.start_time).toLocaleString()}</p>
                <p><strong>Description:</strong> {event.description || 'No description'}</p>
                {event.venue && (
                  <p><strong>Location:</strong> {event.venue.name}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ marginTop: '2rem' }}>
        <h2>All Upcoming Events ({events.length})</h2>
        <p>Browse all events or follow more teams to get personalized notifications</p>
        {events.slice(0, 3).map((event) => (
          <div key={event.event_id} style={{ 
            border: '1px solid #eee', 
            padding: '0.5rem', 
            marginBottom: '0.5rem' 
          }}>
            <strong>{event.game_name}</strong> - {event.sport}
            <br />
            <small>{new Date(event.start_time).toLocaleString()}</small>
          </div>
        ))}
      </div>

      <div style={{ marginTop: '2rem', padding: '1rem', backgroundColor: '#f0f0f0' }}>
        <h3>Notification Settings</h3>
        <p>Configure your notification preferences:</p>
        <label>
          <input type="checkbox" defaultChecked /> Email notifications
        </label>
        <br />
        <label>
          <input type="checkbox" defaultChecked /> Push notifications
        </label>
        <br />
        <label>
          <input type="checkbox" /> SMS notifications
        </label>
      </div>
    </div>
  );
}

export default Notifications;
