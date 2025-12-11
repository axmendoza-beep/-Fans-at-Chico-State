import { Link } from 'react-router-dom';

function Home() {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#fdf7f7',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <header
        style={{
          backgroundColor: '#000000',
          color: '#ffffff',
          padding: '0.75rem 2rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: '0 2px 4px rgba(0,0,0,0.4)',
        }}
      >
        <div>
          <h1 style={{ margin: 0, fontSize: '1.75rem' }}>Fans at Chico State</h1>
          <p style={{ margin: '0.25rem 0 0', fontSize: '0.9rem', color: '#f5f5f5' }}>
            Find events, venues, and fan groups across campus.
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '0.85rem', letterSpacing: '0.05em', textTransform: 'uppercase', color: '#f5f5f5' }}>
            Chico State
          </span>
          <img
            src="/chico-logo.png"
            alt="Chico State logo"
            style={{ height: '40px', width: '40px', objectFit: 'contain' }}
          />
        </div>
      </header>

      <main style={{ flex: 1, padding: '2rem 1rem 3rem' }}>
        <div
          style={{
            maxWidth: '960px',
            margin: '0 auto',
            background: '#ffffff',
            borderRadius: '12px',
            padding: '2rem',
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
            border: '1px solid #f2d6d6',
          }}
        >
          <div style={{ borderLeft: '4px solid #990000', paddingLeft: '1rem', marginBottom: '2rem' }}>
            <h2 style={{ margin: 0, fontSize: '1.5rem', color: '#2b2b2b' }}>Welcome Wildcats</h2>
            <p style={{ margin: '0.5rem 0 0', color: '#555', maxWidth: '36rem' }}>
              Jump into the action: find events, discover venues, connect with fan groups, and manage your profile.
            </p>
          </div>

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
              background: '#fff5f5',
              border: '1px solid #f4b4b4',
              boxShadow: '0 2px 4px rgba(153,0,0,0.12)',
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
              background: '#fef7f2',
              border: '1px solid #f3c5a5',
              boxShadow: '0 2px 4px rgba(153,0,0,0.08)',
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
              background: '#fff5f5',
              border: '1px solid #f4b4b4',
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
              background: '#fef7f2',
              border: '1px solid #f3c5a5',
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
      </main>
    </div>
  );
}

export default Home;
