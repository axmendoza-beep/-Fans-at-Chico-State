import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { profilesAPI } from '../lib/api';
import { supabase } from '../lib/supabaseClient';

function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // If a Supabase session already exists (e.g., after using a magic link),
  // load the corresponding profile and store it as currentUser.
  useEffect(() => {
    const checkSessionAndProfile = async () => {
      const { data, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) {
        return;
      }

      const session = data?.session;
      if (!session) {
        return;
      }

      const userId = session.user.id;
      const email = session.user.email;

      try {
        let profile;

        try {
          const response = await profilesAPI.getById(userId);
          profile = response.data;
        } catch (err) {
          if (err.response?.status === 404) {
            // No profile exists yet for this Supabase user; attempt to create one
            const pendingRaw = localStorage.getItem('pendingSignupProfile');
            let pending = null;

            if (pendingRaw) {
              try {
                pending = JSON.parse(pendingRaw);
              } catch {
                pending = null;
              }
            }

            const newProfile = {
              user_id: userId,
              email,
              display_name:
                pending && pending.email && pending.email.toLowerCase() === email.toLowerCase()
                  ? pending.display_name
                  : null,
              major:
                pending && pending.email && pending.email.toLowerCase() === email.toLowerCase()
                  ? pending.major
                  : null,
            };

            const createRes = await profilesAPI.create(newProfile);
            profile = createRes.data;

            // Clear pending signup data once profile is created
            localStorage.removeItem('pendingSignupProfile');
          } else {
            throw err;
          }
        }

        if (!profile) {
          return;
        }

        localStorage.setItem('currentUser', JSON.stringify(profile));
        navigate('/');
      } catch (err) {
        console.error('Error loading profile for Supabase session', err);
      }
    };

    checkSessionAndProfile();
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage('');
    try {
      if (!formData.email.endsWith('@mail.csuchico.edu')) {
        setError('Please use a valid Chico State email (@mail.csuchico.edu)');
        return;
      }

      localStorage.setItem('pendingOtpEmail', formData.email);

      const { error: otpError } = await supabase.auth.signInWithOtp({
        email: formData.email,
        options: {
          emailRedirectTo: window.location.origin,
        },
      });

      if (otpError) {
        setError('Failed to send magic link: ' + otpError.message);
        return;
      }

      setMessage('Magic link sent! Check your Chico State email for a magic link or verification code, then enter the code on the verification page.');
      navigate('/verify-otp');
    } catch (err) {
      setError('Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '2rem auto' }}>
      <h1>Sign In</h1>
      <p>Enter your Chico State email to receive a one-time code.</p>

      {error && (
        <div style={{ 
          padding: '1rem', 
          backgroundColor: '#ffebee', 
          color: '#c62828',
          marginBottom: '1rem',
          borderRadius: '4px'
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
          borderRadius: '4px'
        }}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ 
        border: '1px solid #ddd', 
        padding: '2rem',
        borderRadius: '8px',
        backgroundColor: '#f9f9f9'
      }}>
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
            Chico State Email:
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="you@mail.csuchico.edu"
            required
            style={{ 
              width: '100%', 
              padding: '0.5rem',
              fontSize: '1rem',
              border: '1px solid #ccc',
              borderRadius: '4px'
            }}
          />
        </div>

        <button 
          type="submit" 
          disabled={loading}
          style={{ 
            width: '100%', 
            padding: '0.75rem',
            fontSize: '1rem',
            backgroundColor: '#1976d2',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontWeight: 'bold'
          }}
        >
          {loading ? 'Please wait...' : 'Continue'}
        </button>
      </form>

      <div style={{ marginTop: '2rem', padding: '1rem', backgroundColor: '#e3f2fd', borderRadius: '4px' }}>
        <h3>Test Accounts</h3>
        <p><strong>Email:</strong> alex@chico.edu</p>
        <p><strong>Email:</strong> jordan@chico.edu</p>
        <p><strong>Email:</strong> sam@chico.edu</p>
        <small>Use any password for testing</small>
      </div>
    </div>
  );
}

export default Login;
