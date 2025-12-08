import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';

function Navigation() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(() => {
    const stored = localStorage.getItem('currentUser');
    return stored ? JSON.parse(stored) : null;
  });

  useEffect(() => {
    const handleStorage = (event) => {
      if (event.key === 'currentUser') {
        const value = event.newValue ? JSON.parse(event.newValue) : null;
        setCurrentUser(value);
      }
    };

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (e) {
    }
    localStorage.removeItem('currentUser');
    setCurrentUser(null);
    navigate('/login');
  };

  return (
    <nav style={{ 
      padding: '1rem', 
      backgroundColor: '#f0f0f0', 
      marginBottom: '2rem',
      borderBottom: '2px solid #ccc'
    }}>
      <h2 style={{ margin: '0 0 1rem 0' }}>Fans at Chico State</h2>
      <ul style={{ 
        listStyle: 'none', 
        padding: 0, 
        display: 'flex', 
        gap: '1rem',
        flexWrap: 'wrap'
      }}>
        <li><Link to="/">Home</Link></li>
        {!currentUser && <li><Link to="/login">Login</Link></li>}
        <li><Link to="/events">Events</Link></li>
        <li><Link to="/venues">Venues</Link></li>
        <li><Link to="/search">Search</Link></li>
        <li><Link to="/map">Map</Link></li>
        <li><Link to="/groups">Fan Groups</Link></li>
        <li><Link to="/chat">Group Chat</Link></li>
        <li><Link to="/profile">Profile</Link></li>
        <li><Link to="/notifications">Notifications</Link></li>
        <li><Link to="/report">Report</Link></li>
        {currentUser && (
          <li>
            <button
              onClick={handleLogout}
              style={{
                background: 'none',
                border: '1px solid #1976d2',
                padding: '0.25rem 0.75rem',
                borderRadius: '4px',
                color: '#1976d2',
                cursor: 'pointer'
              }}
            >
              Logout
            </button>
          </li>
        )}
      </ul>
    </nav>
  );
}

export default Navigation;
