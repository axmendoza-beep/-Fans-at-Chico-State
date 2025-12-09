import { Link } from 'react-router-dom';

function Home() {
  return (
    <div style={{ maxWidth: '900px', margin: '2rem auto' }}>
      <h1>Fans at Chico State</h1>
      <p style={{ marginBottom: '2rem' }}>
        Jump into the action: find events, discover venues, connect with fan groups, and manage your profile.
      </p>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '1.5rem',
        }}
      >
        <Link
          to="/events"
          style={{
            textDecoration: 'none',
            color: 'inherit',
          }}
        >
          <div
            style={{
              borderRadius: '12px',
              padding: '1.5rem',
              background: '#e3f2fd',
              border: '1px solid #90caf9',
              boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
              cursor: 'pointer',
              height: '100%',
            }}
          >
            <h2 style={{ marginTop: 0, marginBottom: '0.5rem' }}>Events</h2>
            <p style={{ margin: 0 }}>
              See what games are on, RSVP, and find the best watch parties around campus.
            </p>
          </div>
        </Link>

        <Link
          to="/venues"
          style={{
            textDecoration: 'none',
            color: 'inherit',
          }}
        >
          <div
            style={{
              borderRadius: '12px',
              padding: '1.5rem',
              background: '#e8f5e9',
              border: '1px solid #a5d6a7',
              boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
              cursor: 'pointer',
              height: '100%',
            }}
          >
            <h2 style={{ marginTop: 0, marginBottom: '0.5rem' }}>Venues</h2>
            <p style={{ margin: 0 }}>
              Browse popular spots to watch the game, from dorm lounges to local bars.
            </p>
          </div>
        </Link>

        <Link
          to="/groups"
          style={{
            textDecoration: 'none',
            color: 'inherit',
          }}
        >
          <div
            style={{
              borderRadius: '12px',
              padding: '1.5rem',
              background: '#fff3e0',
              border: '1px solid #ffcc80',
              boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
              cursor: 'pointer',
              height: '100%',
            }}
          >
            <h2 style={{ marginTop: 0, marginBottom: '0.5rem' }}>Fan Groups</h2>
            <p style={{ margin: 0 }}>
              Join fan groups, chat with other students, and keep up with your teams.
            </p>
          </div>
        </Link>

        <Link
          to="/profile"
          style={{
            textDecoration: 'none',
            color: 'inherit',
          }}
        >
          <div
            style={{
              borderRadius: '12px',
              padding: '1.5rem',
              background: '#f3e5f5',
              border: '1px solid #ce93d8',
              boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
              cursor: 'pointer',
              height: '100%',
            }}
          >
            <h2 style={{ marginTop: 0, marginBottom: '0.5rem' }}>Profile</h2>
            <p style={{ margin: 0 }}>
              View your public profile, edit your info, and manage your settings.
            </p>
          </div>
        </Link>
      </div>
    </div>
  );
}

export default Home;
