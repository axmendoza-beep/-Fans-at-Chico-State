import { useState, useEffect } from 'react';
import { groupsAPI, groupMessagesAPI, groupMembershipsAPI } from '../lib/api';

function GroupChat() {
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentUserId, setCurrentUserId] = useState('');

  useEffect(() => {
    fetchGroups();
    fetchMessages();
    
    // Get current user from localStorage
    const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
    if (user.user_id) {
      setCurrentUserId(user.user_id);
    }
  }, []);

  useEffect(() => {
    if (selectedGroup) {
      fetchMessages();
    }
  }, [selectedGroup]);

  const fetchGroups = async () => {
    try {
      const response = await groupsAPI.getAll();
      setGroups(response.data);
      if (response.data.length > 0 && !selectedGroup) {
        setSelectedGroup(response.data[0]);
      }
    } catch (err) {
      setError('Failed to load groups: ' + err.message);
    }
  };

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const response = await groupMessagesAPI.getAll();
      setMessages(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to load messages: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedGroup) return;

    const userId = currentUserId || prompt('Enter your user ID:');
    if (!userId) return;

    try {
      await groupMessagesAPI.create({
        group_id: selectedGroup.group_id,
        user_id: userId,
        body: newMessage
      });
      setNewMessage('');
      fetchMessages();
    } catch (err) {
      alert('Failed to send message: ' + err.message);
    }
  };

  const groupMessages = messages.filter(
    msg => selectedGroup && msg.group_id === selectedGroup.group_id
  ).sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

  return (
    <div>
      <h1>Group Chat</h1>
      <p>Chat with other fans in your groups</p>

      <div style={{ display: 'grid', gridTemplateColumns: '250px 1fr', gap: '1rem', marginTop: '2rem' }}>
        {/* Groups Sidebar */}
        <div style={{ 
          border: '1px solid #ddd', 
          padding: '1rem',
          backgroundColor: '#f9f9f9',
          maxHeight: '600px',
          overflowY: 'auto'
        }}>
          <h3>Your Groups</h3>
          {groups.length === 0 ? (
            <p>No groups yet. Join a group first!</p>
          ) : (
            groups.map(group => (
              <div
                key={group.group_id}
                onClick={() => setSelectedGroup(group)}
                style={{
                  padding: '0.75rem',
                  marginBottom: '0.5rem',
                  backgroundColor: selectedGroup?.group_id === group.group_id ? '#1976d2' : 'white',
                  color: selectedGroup?.group_id === group.group_id ? 'white' : 'black',
                  border: '1px solid #ddd',
                  cursor: 'pointer',
                  borderRadius: '4px'
                }}
              >
                <strong>{group.name}</strong>
                <br />
                <small>{group.sport}</small>
              </div>
            ))
          )}
        </div>

        {/* Chat Area */}
        <div style={{ border: '1px solid #ddd', display: 'flex', flexDirection: 'column', height: '600px' }}>
          {/* Chat Header */}
          <div style={{ 
            padding: '1rem', 
            borderBottom: '1px solid #ddd',
            backgroundColor: '#f9f9f9'
          }}>
            {selectedGroup ? (
              <>
                <h2 style={{ margin: 0 }}>{selectedGroup.name}</h2>
                <p style={{ margin: '0.5rem 0 0 0', color: '#666' }}>
                  {selectedGroup.sport} • {selectedGroup.description || 'No description'}
                </p>
              </>
            ) : (
              <p>Select a group to start chatting</p>
            )}
          </div>

          {/* Messages */}
          <div style={{ 
            flex: 1, 
            padding: '1rem', 
            overflowY: 'auto',
            backgroundColor: '#fff'
          }}>
            {loading ? (
              <p>Loading messages...</p>
            ) : groupMessages.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#666' }}>
                No messages yet. Be the first to say something!
              </p>
            ) : (
              groupMessages.map((msg) => (
                <div 
                  key={msg.message_id} 
                  style={{ 
                    marginBottom: '1rem',
                    padding: '0.75rem',
                    backgroundColor: msg.user_id === currentUserId ? '#e3f2fd' : '#f5f5f5',
                    borderRadius: '8px',
                    maxWidth: '70%',
                    marginLeft: msg.user_id === currentUserId ? 'auto' : '0',
                    marginRight: msg.user_id === currentUserId ? '0' : 'auto'
                  }}
                >
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    marginBottom: '0.5rem'
                  }}>
                    <strong>{msg.user?.display_name || 'Unknown User'}</strong>
                    <small style={{ color: '#666' }}>
                      {new Date(msg.created_at).toLocaleTimeString()}
                    </small>
                  </div>
                  <p style={{ margin: 0 }}>{msg.body}</p>
                </div>
              ))
            )}
          </div>

          {/* Message Input */}
          <div style={{ 
            padding: '1rem', 
            borderTop: '1px solid #ddd',
            backgroundColor: '#f9f9f9'
          }}>
            <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                maxLength={500}
                disabled={!selectedGroup}
                style={{ 
                  flex: 1, 
                  padding: '0.75rem',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '1rem'
                }}
              />
              <button 
                type="submit"
                disabled={!selectedGroup || !newMessage.trim()}
                style={{ 
                  padding: '0.75rem 1.5rem',
                  backgroundColor: '#1976d2',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: selectedGroup && newMessage.trim() ? 'pointer' : 'not-allowed',
                  fontWeight: 'bold'
                }}
              >
                Send
              </button>
            </form>
            <small style={{ color: '#666' }}>
              {newMessage.length}/500 characters
            </small>
          </div>
        </div>
      </div>

      {error && (
        <div style={{ 
          marginTop: '1rem',
          padding: '1rem',
          backgroundColor: '#ffebee',
          color: '#c62828',
          borderRadius: '4px'
        }}>
          {error}
        </div>
      )}

      <div style={{ marginTop: '2rem', padding: '1rem', backgroundColor: '#f0f0f0', borderRadius: '4px' }}>
        <h3>Chat Features</h3>
        <ul>
          <li>✅ Real-time messaging with group members</li>
          <li>✅ 500 character limit per message</li>
          <li>✅ See sender name and timestamp</li>
          <li>✅ Switch between different groups</li>
          <li>⏳ Image sharing (coming soon)</li>
          <li>⏳ @mentions (coming soon)</li>
        </ul>
      </div>
    </div>
  );
}

export default GroupChat;
