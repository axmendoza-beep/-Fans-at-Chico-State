import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { profilesAPI } from '../services/api';

function Login() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    display_name: '',
    major: ''
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isLogin) {
        // Login logic - for now, just check if profile exists
        const response = await profilesAPI.getAll();
        const user = response.data.find(p => p.email === formData.email);
        
        if (user) {
          // Store user in localStorage
          localStorage.setItem('currentUser', JSON.stringify(user));
          alert('Login successful!');
          navigate('/');
        } else {
          setError('User not found. Please sign up first.');
        }
      } else {
        // Sign up logic
        if (!formData.email.endsWith('@mail.csuchico.edu')) {
          setError('Please use a valid Chico State email (@mail.csuchico.edu)');
          return;
        }

        const newProfile = {
          email: formData.email,
          display_name: formData.display_name,
          major: formData.major,
          password_hash: 'hashed_' + formData.password, // In production, hash this properly
          email_verified: false
        };

        await profilesAPI.create(newProfile);
        alert('Account created! Please login.');
        setIsLogin(true);
        setFormData({ email: '', password: '', display_name: '', major: '' });
      }
    } catch (err) {
      setError('Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '2rem auto' }}>
      <h1>{isLogin ? 'Login' : 'Sign Up'}</h1>
      <p>Welcome to Fans at Chico State</p>

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

        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
            Password:
          </label>
          <input
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            placeholder="Enter password"
            required
            minLength={8}
            style={{ 
              width: '100%', 
              padding: '0.5rem',
              fontSize: '1rem',
              border: '1px solid #ccc',
              borderRadius: '4px'
            }}
          />
          <small style={{ color: '#666' }}>Minimum 8 characters</small>
        </div>

        {!isLogin && (
          <>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                Display Name:
              </label>
              <input
                type="text"
                value={formData.display_name}
                onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
                placeholder="Your name"
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

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                Major:
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
                  borderRadius: '4px'
                }}
              />
            </div>
          </>
        )}

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
          {loading ? 'Please wait...' : (isLogin ? 'Login' : 'Sign Up')}
        </button>
      </form>

      <div style={{ textAlign: 'center', marginTop: '1rem' }}>
        <button
          onClick={() => {
            setIsLogin(!isLogin);
            setError(null);
          }}
          style={{ 
            background: 'none',
            border: 'none',
            color: '#1976d2',
            textDecoration: 'underline',
            cursor: 'pointer',
            fontSize: '1rem'
          }}
        >
          {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Login"}
        </button>
      </div>

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
