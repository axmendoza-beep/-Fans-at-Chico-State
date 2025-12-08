import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { profilesAPI } from '../lib/api';

function OtpVerify() {
  const navigate = useNavigate();
  const [code, setCode] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState('');
  const [resendLoading, setResendLoading] = useState(false);

  useEffect(() => {
    const storedEmail = localStorage.getItem('pendingOtpEmail');
    if (storedEmail) {
      setEmail(storedEmail);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage('');

    try {
      if (!email) {
        setError('Missing email context. Please start from the login page again.');
        return;
      }

      const { data, error: verifyError } = await supabase.auth.verifyOtp({
        email,
        token: code,
        type: 'email',
      });

      if (verifyError) {
        setError('Invalid or expired code: ' + verifyError.message);
        return;
      }

      const session = data.session;
      if (!session) {
        setError('No active session after verification. Please try again.');
        return;
      }

      const userId = session.user.id;
      const userEmail = session.user.email;

      try {
        let profile;

        try {
          const response = await profilesAPI.getById(userId);
          profile = response.data;
        } catch (err) {
          if (err.response?.status === 404) {
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
              email: userEmail,
              display_name:
                pending && pending.email && pending.email.toLowerCase() === userEmail.toLowerCase()
                  ? pending.display_name
                  : null,
              major:
                pending && pending.email && pending.email.toLowerCase() === userEmail.toLowerCase()
                  ? pending.major
                  : null,
            };

            const createRes = await profilesAPI.create(newProfile);
            profile = createRes.data;

            localStorage.removeItem('pendingSignupProfile');
          } else {
            throw err;
          }
        }

        if (!profile) {
          setError('Unable to load profile after verification.');
          return;
        }

        localStorage.setItem('currentUser', JSON.stringify(profile));
        localStorage.removeItem('pendingOtpEmail');
        navigate('/');
      } catch (err) {
        setError('Error loading profile after verification: ' + err.message);
      }
    } catch (err) {
      setError('Error verifying code: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError(null);
    setMessage('');

    if (!email) {
      setError('Missing email context. Please start from the login page again.');
      return;
    }

    setResendLoading(true);

    try {
      const { error: otpError } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: window.location.origin,
        },
      });

      if (otpError) {
        setError('Failed to resend email: ' + otpError.message);
        return;
      }

      setMessage('Email resent! Check your inbox for a new magic link or verification code.');
    } catch (err) {
      setError('Error resending email: ' + err.message);
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '2rem auto' }}>
      <h1>Enter Verification Code</h1>
      <p>We sent a one-time code to your Chico State email.</p>

      {email && (
        <p style={{ marginBottom: '1rem', fontStyle: 'italic' }}>Email: {email}</p>
      )}

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
            Verification Code
          </label>
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Enter the 6-digit code"
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
          {loading ? 'Verifying...' : 'Verify Code'}
        </button>
      </form>

      <div style={{ marginTop: '1rem', textAlign: 'center' }}>
        <button
          type="button"
          onClick={handleResend}
          disabled={resendLoading}
          style={{
            padding: '0.5rem 1rem',
            fontSize: '0.95rem',
            backgroundColor: '#ffffff',
            color: '#1976d2',
            border: '1px solid #1976d2',
            borderRadius: '4px',
            cursor: resendLoading ? 'not-allowed' : 'pointer',
            fontWeight: 'bold'
          }}
        >
          {resendLoading ? 'Resending...' : 'Resend email'}
        </button>
      </div>
    </div>
  );
}

export default OtpVerify;
