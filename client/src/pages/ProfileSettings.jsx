import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { profilesAPI } from '../lib/api';

function ProfileSettings() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState('');
  const [userId, setUserId] = useState(null);
  const [formData, setFormData] = useState({
    email: '',
    followed_team_events: true,
    trending_opt_in: false,
    group_chat_setting: 'mentions',
    allow_email: true,
    allow_sms: false,
  });

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const { data, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) throw sessionError;

        const session = data?.session;
        if (!session) {
          navigate('/login');
          return;
        }

        const uid = session.user.id;
        const email = session.user.email;
        setUserId(uid);

        let existing = null;
        try {
          const response = await profilesAPI.getById(uid);
          existing = response.data;
        } catch (err) {
          if (err.response?.status !== 404) {
            throw err;
          }
        }

        if (existing) {
          setFormData({
            email: existing.email || email,
            followed_team_events: existing.followed_team_events ?? true,
            trending_opt_in: existing.trending_opt_in ?? false,
            group_chat_setting: existing.group_chat_setting || 'mentions',
            allow_email: existing.allow_email ?? true,
            allow_sms: existing.allow_sms ?? false,
          });
        } else {
          setFormData((prev) => ({
            ...prev,
            email,
          }));
        }
      } catch (err) {
        setError('Unable to load settings: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setMessage('');

    try {
      if (!userId) {
        setError('Missing user context. Please sign in again.');
        return;
      }

      const payload = {
        followed_team_events: formData.followed_team_events,
        trending_opt_in: formData.trending_opt_in,
        group_chat_setting: formData.group_chat_setting,
        allow_email: formData.allow_email,
        allow_sms: formData.allow_sms,
      };

      const response = await profilesAPI.update(userId, payload);
      const updated = response.data;
      localStorage.setItem('currentUser', JSON.stringify(updated));
      setMessage('Settings updated successfully.');
    } catch (err) {
      setError('Error updating settings: ' + (err.response?.data?.error || err.message));
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      // ignore sign-out errors, still clear local state
    }
    localStorage.removeItem('currentUser');
    localStorage.removeItem('pendingOtpEmail');
    navigate('/login');
  };

  if (loading) {
    return (
      <div style={{ maxWidth: '500px', margin: '2rem auto' }}>
        <p>Loading settings...</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '500px', margin: '2rem auto' }}>
      <h1>Profile Settings</h1>
      <p>Manage your private information and notification preferences.</p>

      {error && (
        <div style={{
          padding: '1rem',
          backgroundColor: '#ffebee',
          color: '#c62828',
          marginBottom: '1rem',
          borderRadius: '4px',
        }}>
          {error}
        </div>
      )}

      {message && (
        <div style={{
          padding: '1rem',
          backgroundColor: '#e8f5e9',
          color: '#2e7d32',
          marginBottom: '1rem',
          borderRadius: '4px',
        }}>
          {message}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        style={{
          border: '1px solid #ddd',
          padding: '2rem',
          borderRadius: '8px',
          backgroundColor: '#f9f9f9',
          marginBottom: '1.5rem',
        }}
      >
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
            Email (private)
          </label>
          <input
            type="email"
            value={formData.email}
            readOnly
            style={{
              width: '100%',
              padding: '0.5rem',
              fontSize: '1rem',
              border: '1px solid #ccc',
              borderRadius: '4px',
              backgroundColor: '#eee',
            }}
          />
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label style={{ fontWeight: 'bold' }}>Notifications</label>
          <div style={{ marginTop: '0.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.25rem' }}>
              <input
                type="checkbox"
                checked={formData.followed_team_events}
                onChange={(e) =>
                  setFormData({ ...formData, followed_team_events: e.target.checked })
                }
              />{' '}
              Updates about events for teams I follow
            </label>
            <label style={{ display: 'block', marginBottom: '0.25rem' }}>
              <input
                type="checkbox"
                checked={formData.trending_opt_in}
                onChange={(e) =>
                  setFormData({ ...formData, trending_opt_in: e.target.checked })
                }
              />{' '}
              Trending events and recommendations
            </label>
          </div>
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '0.5rem' }}>
            Group chat notifications
          </label>
          <select
            value={formData.group_chat_setting}
            onChange={(e) => setFormData({ ...formData, group_chat_setting: e.target.value })}
            style={{
              width: '100%',
              padding: '0.5rem',
              fontSize: '1rem',
              border: '1px solid #ccc',
              borderRadius: '4px',
            }}
          >
            <option value="all">All messages</option>
            <option value="mentions">Only when I am mentioned</option>
            <option value="none">Mute group chats</option>
          </select>
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label style={{ fontWeight: 'bold' }}>Contact channels</label>
          <div style={{ marginTop: '0.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.25rem' }}>
              <input
                type="checkbox"
                checked={formData.allow_email}
                onChange={(e) => setFormData({ ...formData, allow_email: e.target.checked })}
              />{' '}
              Allow email notifications
            </label>
            <label style={{ display: 'block', marginBottom: '0.25rem' }}>
              <input
                type="checkbox"
                checked={formData.allow_sms}
                onChange={(e) => setFormData({ ...formData, allow_sms: e.target.checked })}
              />{' '}
              Allow SMS notifications
            </label>
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          style={{
            width: '100%',
            padding: '0.75rem',
            fontSize: '1rem',
            backgroundColor: '#1976d2',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: saving ? 'not-allowed' : 'pointer',
            fontWeight: 'bold',
          }}
        >
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </form>

      <div style={{
        border: '1px solid #ddd',
        padding: '1.5rem',
        borderRadius: '8px',
        backgroundColor: '#fff3e0',
      }}>
        <h2 style={{ marginTop: 0 }}>Sign out</h2>
        <p style={{ marginBottom: '1rem' }}>
          If you are using a shared or public device, be sure to sign out when you are done.
        </p>
        <button
          type="button"
          onClick={handleLogout}
          style={{
            padding: '0.5rem 1rem',
            fontSize: '1rem',
            backgroundColor: '#d32f2f',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: 'bold',
          }}
        >
          Log out
        </button>
      </div>
    </div>
  );
}

export default ProfileSettings;
