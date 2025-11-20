import { useState, useEffect } from 'react';
import { profilesAPI, followedTeamsAPI } from '../services/api';

function Profile() {
  const [profiles, setProfiles] = useState([]);
  const [followedTeams, setFollowedTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateProfile, setShowCreateProfile] = useState(false);
  const [showFollowTeam, setShowFollowTeam] = useState(false);
  const [newProfile, setNewProfile] = useState({
    email: '',
    display_name: '',
    major: '',
    bio: ''
  });
  const [newTeam, setNewTeam] = useState({
    user_id: '',
    sport: '',
    team_name: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [profilesRes, teamsRes] = await Promise.all([
        profilesAPI.getAll(),
        followedTeamsAPI.getAll()
      ]);
      setProfiles(profilesRes.data);
      setFollowedTeams(teamsRes.data);
      setError(null);
    } catch (err) {
      setError('Failed to load data: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProfile = async (e) => {
    e.preventDefault();
    try {
      await profilesAPI.create(newProfile);
      alert('Profile created successfully!');
      setShowCreateProfile(false);
      setNewProfile({
        email: '',
        display_name: '',
        major: '',
        bio: ''
      });
      fetchData();
    } catch (err) {
      alert('Failed to create profile: ' + err.message);
    }
  };

  const handleFollowTeam = async (e) => {
    e.preventDefault();
    try {
      await followedTeamsAPI.create(newTeam);
      alert('Team followed successfully!');
      setShowFollowTeam(false);
      setNewTeam({
        user_id: '',
        sport: '',
        team_name: ''
      });
      fetchData();
    } catch (err) {
      alert('Failed to follow team: ' + err.message);
    }
  };

  if (loading) return <div>Loading profile data...</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;

  return (
    <div>
      <h1>Profile & Account</h1>
      <p>Manage your account, bio, and sports interests</p>

      <div style={{ marginBottom: '2rem' }}>
        <button onClick={() => setShowCreateProfile(!showCreateProfile)}>
          {showCreateProfile ? 'Cancel' : 'Create Profile'}
        </button>
        {' '}
        <button onClick={() => setShowFollowTeam(!showFollowTeam)}>
          {showFollowTeam ? 'Cancel' : 'Follow Team'}
        </button>
      </div>

      {showCreateProfile && (
        <div style={{ border: '1px solid #ccc', padding: '1rem', marginBottom: '2rem' }}>
          <h2>Create Profile</h2>
          <form onSubmit={handleCreateProfile}>
            <div style={{ marginBottom: '1rem' }}>
              <label>Email (Chico State):</label><br />
              <input
                type="email"
                value={newProfile.email}
                onChange={(e) => setNewProfile({ ...newProfile, email: e.target.value })}
                placeholder="you@mail.csuchico.edu"
                required
              />
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label>Display Name:</label><br />
              <input
                type="text"
                value={newProfile.display_name}
                onChange={(e) => setNewProfile({ ...newProfile, display_name: e.target.value })}
                required
              />
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label>Major:</label><br />
              <input
                type="text"
                value={newProfile.major}
                onChange={(e) => setNewProfile({ ...newProfile, major: e.target.value })}
              />
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label>Bio:</label><br />
              <textarea
                value={newProfile.bio}
                onChange={(e) => setNewProfile({ ...newProfile, bio: e.target.value })}
              />
            </div>
            <button type="submit">Create Profile</button>
          </form>
        </div>
      )}

      {showFollowTeam && (
        <div style={{ border: '1px solid #ccc', padding: '1rem', marginBottom: '2rem' }}>
          <h2>Follow a Team</h2>
          <form onSubmit={handleFollowTeam}>
            <div style={{ marginBottom: '1rem' }}>
              <label>Your User ID:</label><br />
              <input
                type="text"
                value={newTeam.user_id}
                onChange={(e) => setNewTeam({ ...newTeam, user_id: e.target.value })}
                required
              />
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label>Sport:</label><br />
              <input
                type="text"
                value={newTeam.sport}
                onChange={(e) => setNewTeam({ ...newTeam, sport: e.target.value })}
                required
              />
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label>Team Name:</label><br />
              <input
                type="text"
                value={newTeam.team_name}
                onChange={(e) => setNewTeam({ ...newTeam, team_name: e.target.value })}
                required
              />
            </div>
            <button type="submit">Follow Team</button>
          </form>
        </div>
      )}

      <div style={{ marginTop: '2rem' }}>
        <h2>All Profiles ({profiles.length})</h2>
        {profiles.length === 0 ? (
          <p>No profiles found.</p>
        ) : (
          <div>
            {profiles.slice(0, 5).map((profile) => (
              <div key={profile.user_id} style={{ 
                border: '1px solid #ddd', 
                padding: '1rem', 
                marginBottom: '1rem' 
              }}>
                <h3>{profile.display_name}</h3>
                <p><strong>Email:</strong> {profile.email}</p>
                <p><strong>Major:</strong> {profile.major || 'Not specified'}</p>
                <p><strong>Bio:</strong> {profile.bio || 'No bio'}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ marginTop: '2rem' }}>
        <h2>Followed Teams ({followedTeams.length})</h2>
        {followedTeams.length === 0 ? (
          <p>No followed teams yet.</p>
        ) : (
          <ul>
            {followedTeams.map((team) => (
              <li key={team.followed_team_id}>
                <strong>{team.team_name}</strong> ({team.sport})
                {team.user && ` - Followed by ${team.user.display_name}`}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default Profile;
