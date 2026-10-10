import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Lock, User, AlertCircle, ArrowRight, ShieldCheck, BookOpen, GraduationCap, Users } from 'lucide-react';
import Logo from '../components/Logo';

export default function Login() {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('Admin@123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(false);

    try {
      setLoading(true);
      await login(username, password);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Login failed. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const setDemoAccount = (u, p) => {
    setUsername(u);
    setPassword(p);
    setError('');
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F5F7FB',
        padding: '24px',
      }}
    >
      <div
        style={{
          maxWidth: '480px',
          width: '100%',
          backgroundColor: '#FFFFFF',
          borderRadius: '16px',
          boxShadow: '0 10px 25px -5px rgba(20, 45, 78, 0.1)',
          border: '1px solid #E2E8F0',
          padding: '36px',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{ display: 'inline-block', marginBottom: '10px' }}>
            <Logo size="lg" />
          </div>
          <p style={{ fontSize: '0.9rem', color: '#64748B', marginTop: '6px' }}>
            Sign in to access library borrowing, catalogs, and academic projects
          </p>
        </div>

        {error && (
          <div
            style={{
              backgroundColor: '#FEE2E2',
              border: '1px solid #FCA5A5',
              color: '#DC2626',
              padding: '12px 14px',
              borderRadius: '8px',
              fontSize: '0.86rem',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              marginBottom: '20px',
            }}
          >
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">
              Registration No. / Employee ID / Username
            </label>
            <div style={{ position: 'relative' }}>
              <User
                size={18}
                style={{ position: 'absolute', left: '12px', top: '12px', color: '#94A3B8' }}
              />
              <input
                type="text"
                className="form-input"
                style={{ paddingLeft: '38px' }}
                placeholder="e.g. STU2026001 or admin"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <Lock
                size={18}
                style={{ position: 'absolute', left: '12px', top: '12px', color: '#94A3B8' }}
              />
              <input
                type="password"
                className="form-input"
                style={{ paddingLeft: '38px' }}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', padding: '12px', fontSize: '0.95rem', marginTop: '8px' }}
            disabled={loading}
          >
            {loading ? 'Authenticating...' : (
              <>
                Sign In to CampusNest <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        {/* Demo Quick-Login Credentials Box */}
        <div
          style={{
            marginTop: '28px',
            paddingTop: '20px',
            borderTop: '1px dashed #E2E8F0',
          }}
        >
          <div
            style={{
              fontSize: '0.78rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: '#64748B',
              marginBottom: '10px',
              textAlign: 'center',
            }}
          >
            One-Click Demo Credentials
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => setDemoAccount('admin', 'Admin@123')}
              style={{ justifyContent: 'flex-start', fontSize: '0.78rem' }}
            >
              <ShieldCheck size={14} color="#2563EB" />
              <strong>Admin / Librarian</strong>
            </button>

            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => setDemoAccount('STU2026001', '15082006')}
              style={{ justifyContent: 'flex-start', fontSize: '0.78rem' }}
            >
              <GraduationCap size={14} color="#0F9D8A" />
              <span>Student (Arjun)</span>
            </button>

            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => setDemoAccount('STU2026002', 'Student@123')}
              style={{ justifyContent: 'flex-start', fontSize: '0.78rem' }}
            >
              <GraduationCap size={14} color="#0F9D8A" />
              <span>Student (Priya)</span>
            </button>

            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => setDemoAccount('FAC2026001', 'Faculty@123')}
              style={{ justifyContent: 'flex-start', fontSize: '0.78rem' }}
            >
              <Users size={14} color="#D97706" />
              <span>Faculty (Dr. Rajesh)</span>
            </button>
          </div>

          <div
            style={{
              marginTop: '14px',
              fontSize: '0.72rem',
              color: '#94A3B8',
              textAlign: 'center',
              lineHeight: 1.4,
            }}
          >
            Student initial password is Date of Birth (format: <code>DDMMYYYY</code>). On first login, a mandatory password change dialog is required.
          </div>
        </div>
      </div>
    </div>
  );
}
