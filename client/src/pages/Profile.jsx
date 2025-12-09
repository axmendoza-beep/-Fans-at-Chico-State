import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { profilesAPI } from '../lib/api';
import { supabase } from '../lib/supabaseClient';

function Profile() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        setError(null);

        let current = null;
        const stored = localStorage.getItem('currentUser');
        if (stored) {
          try {
            current = JSON.parse(stored);
          } catch {
            current = null;
          }
        }

        let userId = current?.user_id;

        if (!userId) {
          const { data, error: sessionError } = await supabase.auth.getSession();
          if (sessionError) {
            throw sessionError;
          }

          const session = data?.session;
          if (!session) {
            navigate('/login');
            return;
          }

          userId = session.user.id;
        }

        const response = await profilesAPI.getById(userId);
        const freshProfile = response.data;
        setProfile(freshProfile);
        localStorage.setItem('currentUser', JSON.stringify(freshProfile));
      } catch (err) {
        setError('Failed to load profile: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [navigate]);

  if (loading) return <div>Loading profile...</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;
  if (!profile) return <div>No profile found.</div>;

  const hasBio = !!profile.bio;
  const hasMajor = !!profile.major;
  const hasPhoto = !!profile.profile_photo_url;

  return (
    <div style={{ maxWidth: '600px', margin: '2rem auto' }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        marginBottom: '2rem',
      }}>
        <div style={{ marginRight: '1.5rem' }}>
          {hasPhoto ? (
            <img
              src={profile.profile_photo_url}
              alt={profile.display_name || 'Profile photo'}
              style={{
                width: '96px',
                height: '96px',
                borderRadius: '50%',
                objectFit: 'cover',
                border: '2px solid #1976d2',
              }}
            />
          ) : (
            <div
              style={{
                width: '96px',
                height: '96px',
                borderRadius: '50%',
                backgroundColor: '#e0e0e0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2rem',
                color: '#757575',
                border: '2px solid #bdbdbd',
              }}
            >
              {(profile.display_name || '?').charAt(0).toUpperCase()}
            </div>
          )}
        </div>

        <div>
          <h1 style={{ margin: 0 }}>
            {profile.display_name || 'Unnamed Fan'}
          </h1>
          {hasMajor && (
            <p style={{ margin: '0.25rem 0', color: '#555' }}>
              <strong>Major:</strong> {profile.major}
            </p>
          )}
        </div>
      </div>

      {hasBio && (
        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{ marginBottom: '0.5rem' }}>Bio</h2>
          <p style={{ whiteSpace: 'pre-wrap' }}>{profile.bio}</p>
        </div>
      )}

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
        <button
          type="button"
          onClick={() => navigate('/profile/edit')}
          style={{
            padding: '0.5rem 1rem',
            fontSize: '1rem',
            backgroundColor: '#1976d2',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: 'bold',
          }}
        >
          Edit Profile
        </button>

        <button
          type="button"
          onClick={() => navigate('/profile/settings')}
          style={{
            padding: '0.5rem 1rem',
            fontSize: '1rem',
            backgroundColor: '#ffffff',
            color: '#1976d2',
            border: '1px solid #1976d2',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: 'bold',
          }}
        >
          Profile Settings
        </button>
      </div>

      <div style={{ padding: '1rem', backgroundColor: '#e3f2fd', borderRadius: '4px' }}>
        <p style={{ margin: 0, fontSize: '0.9rem', color: '#1e88e5' }}>
          Your username, bio, major, and profile picture are visible to other users
          when they view your profile.
        </p>
      </div>
    </div>
  );
}

export default Profile;
