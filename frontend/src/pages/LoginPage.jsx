import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, AlertCircle, ArrowRight, Sparkles } from 'lucide-react';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await login(email, password);
      if (user.has_profile) {
        navigate('/dashboard');
      } else {
        navigate('/profile');
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || 'Invalid email or password. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemoCredentials = () => {
    setEmail('arjun.verma@example.com');
    setPassword('Password123!');
  };

  return (
    <div style={{ maxWidth: '440px', margin: '2rem auto', width: '100%' }}>
      <div className="card" style={{ padding: '2rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
            Welcome Back
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            Sign in to access your Indian credit health dashboard
          </p>
        </div>

        {error && (
          <div style={{
            background: 'var(--danger-light)',
            border: '1px solid #fecaca',
            color: 'var(--danger-text)',
            padding: '0.75rem 1rem',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.85rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '1.25rem'
          }}>
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div style={{ position: 'relative' }}>
              <input
                type="email"
                required
                className="form-input"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ paddingLeft: '2.5rem' }}
              />
              <Mail size={18} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type="password"
                required
                className="form-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ paddingLeft: '2.5rem' }}
              />
              <Lock size={18} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '0.5rem' }}
          >
            {loading ? 'Authenticating...' : 'Sign In'}
            <ArrowRight size={16} />
          </button>
        </form>

        {/* Demo Quick-Fill Helper */}
        <div style={{
          marginTop: '1.5rem',
          padding: '0.875rem',
          background: 'var(--bg-card-subtle)',
          borderRadius: 'var(--radius-md)',
          border: '1px dashed var(--border-color)',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
            Testing or evaluating the app?
          </div>
          <button
            type="button"
            onClick={fillDemoCredentials}
            className="btn btn-secondary btn-sm"
            style={{ width: '100%', fontSize: '0.8rem', display: 'flex', gap: '6px' }}
          >
            <Sparkles size={14} style={{ color: '#7c3aed' }} />
            Fill Demo Account (Arjun Verma)
          </button>
        </div>

        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ fontWeight: 600 }}>Create account</Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
