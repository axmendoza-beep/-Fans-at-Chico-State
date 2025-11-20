import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navigation from './components/Navigation';
import Home from './pages/Home';
import Login from './pages/Login';
import Events from './pages/Events';
import Venues from './pages/Venues';
import Search from './pages/Search';
import MapView from './pages/MapView';
import Groups from './pages/Groups';
import GroupChat from './pages/GroupChat';
import Profile from './pages/Profile';
import Notifications from './pages/Notifications';
import Report from './pages/Report';

function App() {
  return (
    <Router>
      <div style={{ fontFamily: 'Arial, sans-serif' }}>
        <Navigation />
        <div style={{ padding: '0 2rem', maxWidth: '1200px', margin: '0 auto' }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/events" element={<Events />} />
            <Route path="/venues" element={<Venues />} />
            <Route path="/search" element={<Search />} />
            <Route path="/map" element={<MapView />} />
            <Route path="/groups" element={<Groups />} />
            <Route path="/chat" element={<GroupChat />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/report" element={<Report />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
