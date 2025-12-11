import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { profilesAPI } from '../lib/api';

function EditProfile() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState('');
  const [userId, setUserId] = useState(null);
  const [formData, setFormData] = useState({
    email: '',
    display_name: '',
    major: '',
    bio: '',
    profile_photo_url: '',
  });
  const [profilePhotoFile, setProfilePhotoFile] = useState(null);

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
            display_name: existing.display_name || '',
            major: existing.major || '',
            bio: existing.bio || '',
            profile_photo_url: existing.profile_photo_url || '',
          });
        } else {
          setFormData((prev) => ({
            ...prev,
            email,
          }));
        }
      } catch (err) {
        setError('Unable to load profile: ' + err.message);
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

      if (!formData.display_name) {
        setError('Username is required.');
        return;
      }

      // If a new profile photo file was selected, upload it to Supabase Storage
      // and use the resulting public URL in the profile.
      let photoUrl = formData.profile_photo_url || null;

      if (profilePhotoFile) {
        const ext = (profilePhotoFile.name.split('.').pop() || 'jpg').toLowerCase();
        const path = `profiles/${userId}.${ext}`;

        const { error: uploadError } = await supabase.storage
          .from('profile-photos')
          .upload(path, profilePhotoFile, {
            cacheControl: '3600',
            upsert: true,
          });

        if (uploadError) {
          console.error('Error uploading profile photo', uploadError);
          setError('Error uploading profile photo: ' + uploadError.message);
          return;
        }

        const { data: publicData } = supabase.storage
          .from('profile-photos')
          .getPublicUrl(path);

        photoUrl = publicData.publicUrl || null;
      }

      const payload = {
        display_name: formData.display_name,
        major: formData.major || null,
        bio: formData.bio || null,
        profile_photo_url: photoUrl,
      };

      const response = await profilesAPI.update(userId, payload);
      const updated = response.data;
      localStorage.setItem('currentUser', JSON.stringify(updated));
      setMessage('Profile updated successfully.');
      navigate('/profile');
    } catch (err) {
      setError('Error updating profile: ' + (err.response?.data?.error || err.message));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ maxWidth: '500px', margin: '2rem auto' }}>
        <p>Loading profile...</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '500px', margin: '2rem auto' }}>
      <h1>Edit Profile</h1>
      <p>Update the information other users can see.</p>

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
        }}
      >
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
            Email (not publicly visible)
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
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
            Username (required)
          </label>
          <input
            type="text"
            value={formData.display_name}
            onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
            placeholder="Choose a username"
            required
            style={{
              width: '100%',
              padding: '0.5rem',
              fontSize: '1rem',
              border: '1px solid #ccc',
              borderRadius: '4px',
            }}
          />
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
            Major (optional)
          </label>
          <input
            type="text"
            value={formData.major}
            onChange={(e) => setFormData({ ...formData, major: e.target.value })}
            placeholder="e.g., Computer Science"
            style={{
              width: '100%',
              padding: '0.5rem',
              fontSize: '1rem',
              border: '1px solid #ccc',
              borderRadius: '4px',
            }}
          />
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
            Bio (optional)
          </label>
          <textarea
            value={formData.bio}
            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
            placeholder="Tell other fans a bit about yourself"
            rows={3}
            style={{
              width: '100%',
              padding: '0.5rem',
              fontSize: '1rem',
              border: '1px solid #ccc',
              borderRadius: '4px',
            }}
          />
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
            Profile photo (optional)
          </label>

          {formData.profile_photo_url && (
            <div style={{ marginBottom: '0.5rem' }}>
              <img
                src={formData.profile_photo_url}
                alt="Current profile"
                style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: '2px solid #1976d2',
                }}
              />
            </div>
          )}

          <input
            type="file"
            accept="image/*"
            onChange={(e) => setProfilePhotoFile(e.target.files?.[0] || null)}
            style={{
              width: '100%',
              padding: '0.25rem 0',
              fontSize: '1rem',
            }}
          />
          <small style={{ color: '#666' }}>
            This photo is only used inside the app (for example, in chats or your profile) and is not exposed publicly.
          </small>
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
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
}

export default EditProfile;
