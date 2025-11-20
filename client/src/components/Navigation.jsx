import { Link } from 'react-router-dom';

function Navigation() {
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
        <li><Link to="/login">Login</Link></li>
        <li><Link to="/events">Events</Link></li>
        <li><Link to="/venues">Venues</Link></li>
        <li><Link to="/search">Search</Link></li>
        <li><Link to="/map">Map</Link></li>
        <li><Link to="/groups">Fan Groups</Link></li>
        <li><Link to="/chat">Group Chat</Link></li>
        <li><Link to="/profile">Profile</Link></li>
        <li><Link to="/notifications">Notifications</Link></li>
        <li><Link to="/report">Report</Link></li>
      </ul>
    </nav>
  );
}

export default Navigation;
