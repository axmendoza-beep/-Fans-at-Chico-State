import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navigation from './components/Navigation';
import Home from './pages/Home';
import Login from './pages/Login';
import OtpVerify from './pages/OtpVerify';
import Events from './pages/Events';
import Venues from './pages/Venues';
import Search from './pages/Search';
import MapView from './pages/MapView';
import Groups from './pages/Groups';
import GroupChat from './pages/GroupChat';
import Profile from './pages/Profile';
import Notifications from './pages/Notifications';
import Report from './pages/Report';

function ProtectedRoute({ children }) {
  const hasUser = !!localStorage.getItem('currentUser');
  if (!hasUser) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

function App() {
  return (
    <Router>
      <div style={{ fontFamily: 'Arial, sans-serif' }}>
        <Navigation />
        <div style={{ padding: '0 2rem', maxWidth: '1200px', margin: '0 auto' }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/verify-otp" element={<OtpVerify />} />
            <Route
              path="/events"
              element={(
                <ProtectedRoute>
                  <Events />
                </ProtectedRoute>
              )}
            />
            <Route
              path="/venues"
              element={(
                <ProtectedRoute>
                  <Venues />
                </ProtectedRoute>
              )}
            />
            <Route
              path="/search"
              element={(
                <ProtectedRoute>
                  <Search />
                </ProtectedRoute>
              )}
            />
            <Route
              path="/map"
              element={(
                <ProtectedRoute>
                  <MapView />
                </ProtectedRoute>
              )}
            />
            <Route
              path="/groups"
              element={(
                <ProtectedRoute>
                  <Groups />
                </ProtectedRoute>
              )}
            />
            <Route
              path="/chat"
              element={(
                <ProtectedRoute>
                  <GroupChat />
                </ProtectedRoute>
              )}
            />
            <Route
              path="/profile"
              element={(
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              )}
            />
            <Route
              path="/notifications"
              element={(
                <ProtectedRoute>
                  <Notifications />
                </ProtectedRoute>
              )}
            />
            <Route
              path="/report"
              element={(
                <ProtectedRoute>
                  <Report />
                </ProtectedRoute>
              )}
            />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
