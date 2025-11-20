import { useState, useEffect } from 'react';
import { groupsAPI, groupMembershipsAPI, groupMessagesAPI } from '../services/api';

function Groups() {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newGroup, setNewGroup] = useState({
    name: '',
    sport: '',
    description: ''
  });

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      setLoading(true);
      const response = await groupsAPI.getAll();
      setGroups(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to load groups: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    try {
      await groupsAPI.create(newGroup);
      alert('Group created successfully!');
      setShowCreateForm(false);
      setNewGroup({
        name: '',
        sport: '',
        description: ''
      });
      fetchGroups();
    } catch (err) {
      alert('Failed to create group: ' + err.message);
    }
  };

  const handleJoinGroup = async (groupId) => {
    const userId = prompt('Enter your user ID:');
    if (!userId) return;

    try {
      await groupMembershipsAPI.create({
        group_id: groupId,
        user_id: userId,
        role: 'member'
      });
      alert('Joined group successfully!');
    } catch (err) {
      alert('Failed to join group: ' + err.message);
    }
  };

  if (loading) return <div>Loading groups...</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;

  return (
    <div>
      <h1>Fan Groups</h1>
      <p>Join groups, chat with fans, and stay connected</p>

      <button onClick={() => setShowCreateForm(!showCreateForm)}>
        {showCreateForm ? 'Cancel' : 'Create New Group'}
      </button>

      {showCreateForm && (
        <div style={{ border: '1px solid #ccc', padding: '1rem', marginTop: '1rem' }}>
          <h2>Create New Group</h2>
          <form onSubmit={handleCreateGroup}>
            <div style={{ marginBottom: '1rem' }}>
              <label>Group Name:</label><br />
              <input
                type="text"
                value={newGroup.name}
                onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })}
                required
              />
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label>Sport:</label><br />
              <input
                type="text"
                value={newGroup.sport}
                onChange={(e) => setNewGroup({ ...newGroup, sport: e.target.value })}
                required
              />
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label>Description:</label><br />
              <textarea
                value={newGroup.description}
                onChange={(e) => setNewGroup({ ...newGroup, description: e.target.value })}
              />
            </div>
            <button type="submit">Create Group</button>
          </form>
        </div>
      )}

      <div style={{ marginTop: '2rem' }}>
        <h2>Available Groups ({groups.length})</h2>
        {groups.length === 0 ? (
          <p>No groups found. Create one to get started!</p>
        ) : (
          <div>
            {groups.map((group) => (
              <div key={group.group_id} style={{ 
                border: '1px solid #ddd', 
                padding: '1rem', 
                marginBottom: '1rem' 
              }}>
                <h3>{group.name}</h3>
                <p><strong>Sport:</strong> {group.sport}</p>
                <p><strong>Description:</strong> {group.description || 'No description'}</p>
                <p><strong>Created:</strong> {new Date(group.created_at).toLocaleDateString()}</p>
                <button onClick={() => handleJoinGroup(group.group_id)}>Join Group</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Groups;
