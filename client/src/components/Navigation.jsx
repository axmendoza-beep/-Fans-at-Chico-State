import { Link } from 'react-router-dom';

function Navigation() {
  return (
    <nav
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        padding: '0.5rem 0',
        backgroundColor: '#ffffff',
        borderTop: '1px solid #ccc',
        zIndex: 1000,
      }}
    >
      <ul
        style={{
          listStyle: 'none',
          padding: 0,
          margin: 0,
          display: 'flex',
          justifyContent: 'space-around',
          alignItems: 'center',
          fontSize: '0.85rem',
        }}
      >
        <li>
          <Link to="/" style={{ textDecoration: 'none', color: '#1976d2' }}>
            Home
          </Link>
        </li>
        <li>
          <Link to="/events" style={{ textDecoration: 'none', color: '#1976d2' }}>
            Events
          </Link>
        </li>
        <li>
          <Link to="/venues" style={{ textDecoration: 'none', color: '#1976d2' }}>
            Venues
          </Link>
        </li>
        <li>
          <Link to="/search" style={{ textDecoration: 'none', color: '#1976d2' }}>
            Search/Map
          </Link>
        </li>
        <li>
          <Link to="/groups" style={{ textDecoration: 'none', color: '#1976d2' }}>
            Fan Groups
          </Link>
        </li>
        <li>
          <Link to="/profile" style={{ textDecoration: 'none', color: '#1976d2' }}>
            Profile
          </Link>
        </li>
      </ul>
    </nav>
  );
}

export default Navigation;
