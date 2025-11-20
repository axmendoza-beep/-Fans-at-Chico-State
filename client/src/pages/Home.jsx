function Home() {
  return (
    <div>
      <h1>Welcome to Fans at Chico State</h1>
      <p>Find, host, and join sports watch parties. Connect with fellow fans!</p>
      
      <div style={{ marginTop: '2rem' }}>
        <h2>Features</h2>
        <ul>
          <li><strong>Events:</strong> Browse, create, and RSVP to watch parties</li>
          <li><strong>Venues:</strong> Discover great locations for watch parties</li>
          <li><strong>Fan Groups:</strong> Join groups, chat with fans, and stay connected</li>
          <li><strong>Profile:</strong> Manage your account and preferences</li>
          <li><strong>Notifications:</strong> Get alerts for your favorite teams</li>
          <li><strong>Safety:</strong> Report inappropriate content</li>
        </ul>
      </div>

      <div style={{ marginTop: '2rem' }}>
        <h2>Quick Stats</h2>
        <p>API Status: Connected to http://localhost:3000</p>
      </div>
    </div>
  );
}

export default Home;
