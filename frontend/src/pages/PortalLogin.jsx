import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, User, AlertCircle, ArrowRight, Eye, EyeOff, ShieldCheck, BookOpen, GraduationCap, Users } from 'lucide-react';
import Logo from '../components/Logo';

export default function PortalLogin({ portal = 'student' }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const configs = {
    admin: {
      title: 'Administrator Portal',
      subtitle: 'System Governance, User Administration & Library Infrastructure',
      identifierLabel: 'Administrator Username or ID',
      identifierPlaceholder: 'e.g. admin',
      badge: 'System Administrator',
      badgeColor: '#142D4E',
      icon: ShieldCheck,
      homeUrl: '/',
    },
    librarian: {
      title: 'Librarian Portal',
      subtitle: 'Circulation Desk, Borrow Requests, Catalogue & Fine Management',
      identifierLabel: 'Librarian Employee ID',
      identifierPlaceholder: 'e.g. LIB2026001',
      badge: 'Library Staff',
      badgeColor: '#0F9D8A',
      icon: BookOpen,
      homeUrl: '/',
    },
    student: {
      title: 'Student Academic Portal',
      subtitle: 'Book Borrowing, Return Countdown & Academic Project Submissions',
      identifierLabel: 'Student Registration Number',
      identifierPlaceholder: 'e.g. STU2026001',
      badge: 'Student Portal',
      badgeColor: '#2563EB',
      icon: GraduationCap,
      homeUrl: '/',
    },
    faculty: {
      title: 'Faculty Portal',
      subtitle: 'Course Assignments, Group Deadlines & Student Evaluations',
      identifierLabel: 'Faculty or Employee ID',
      identifierPlaceholder: 'e.g. FAC2026001',
      badge: 'Faculty Member',
      badgeColor: '#D97706',
      icon: Users,
      homeUrl: '/',
    },
  };

  const config = configs[portal] || configs.student;
  const PortalIcon = config.icon;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!username.trim() || !password) {
      setError('Please provide both your identification and password.');
      return;
    }

    try {
      setLoading(true);
      await login(username.trim(), password, portal);
      navigate(config.homeUrl);
    } catch (err) {
      setError(err.message || 'Authentication failed. Please verify your credentials and portal role.');
    } finally {
      setLoading(false);
    }
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
          maxWidth: '460px',
          width: '100%',
          backgroundColor: '#FFFFFF',
          borderRadius: '16px',
          boxShadow: '0 10px 25px -5px rgba(20, 45, 78, 0.08), 0 8px 10px -6px rgba(20, 45, 78, 0.04)',
          border: '1px solid #E2E8F0',
          padding: '36px',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ display: 'inline-block', marginBottom: '14px' }}>
            <Logo size="lg" />
          </div>

          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 12px',
              borderRadius: '20px',
              backgroundColor: '#F1F5F9',
              color: config.badgeColor,
              fontSize: '0.8rem',
              fontWeight: 700,
              marginBottom: '10px',
            }}
          >
            <PortalIcon size={14} />
            {config.badge}
          </div>

          <h1 style={{ fontSize: '1.3rem', fontWeight: 700, color: '#142D4E', margin: '4px 0' }}>
            {config.title}
          </h1>
          <p style={{ fontSize: '0.86rem', color: '#64748B', marginTop: '4px', lineHeight: 1.4 }}>
            {config.subtitle}
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
              alignItems: 'flex-start',
              gap: '10px',
              marginBottom: '20px',
            }}
          >
            <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group" style={{ marginBottom: '18px' }}>
            <label className="form-label" style={{ fontSize: '0.86rem', fontWeight: 600, color: '#1E293B', marginBottom: '6px' }}>
              {config.identifierLabel}
            </label>
            <div style={{ position: 'relative' }}>
              <User
                size={18}
                style={{ position: 'absolute', left: '12px', top: '12px', color: '#94A3B8' }}
              />
              <input
                type="text"
                className="form-input"
                style={{ paddingLeft: '38px', fontSize: '0.92rem' }}
                placeholder={config.identifierPlaceholder}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoComplete="username"
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '22px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <label className="form-label" style={{ fontSize: '0.86rem', fontWeight: 600, color: '#1E293B', marginBottom: 0 }}>
                Password
              </label>
              <Link
                to={`/forgot-password?portal=${portal}`}
                style={{ fontSize: '0.82rem', color: '#2563EB', textDecoration: 'none', fontWeight: 600 }}
              >
                Forgot Password?
              </Link>
            </div>
            <div style={{ position: 'relative' }}>
              <Lock
                size={18}
                style={{ position: 'absolute', left: '12px', top: '12px', color: '#94A3B8' }}
              />
              <input
                type={showPassword ? 'text' : 'password'}
                className="form-input"
                style={{ paddingLeft: '38px', paddingRight: '40px', fontSize: '0.92rem' }}
                placeholder="Enter account password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '10px',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#94A3B8',
                  padding: '2px',
                }}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', padding: '12px', fontSize: '0.95rem', fontWeight: 600 }}
            disabled={loading}
          >
            {loading ? 'Authenticating...' : (
              <>
                Sign In to {config.badge} <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        {/* Portal Switching Directory */}
        <div
          style={{
            marginTop: '28px',
            paddingTop: '20px',
            borderTop: '1px solid #E2E8F0',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: '0.78rem', color: '#64748B', marginBottom: '10px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Switch Login Portal
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            {portal !== 'student' && (
              <Link to="/student/login" className="btn btn-secondary btn-sm" style={{ textDecoration: 'none', justifyContent: 'center', fontSize: '0.78rem' }}>
                <GraduationCap size={14} color="#2563EB" /> Student Portal
              </Link>
            )}
            {portal !== 'faculty' && (
              <Link to="/faculty/login" className="btn btn-secondary btn-sm" style={{ textDecoration: 'none', justifyContent: 'center', fontSize: '0.78rem' }}>
                <Users size={14} color="#D97706" /> Faculty Portal
              </Link>
            )}
            {portal !== 'librarian' && (
              <Link to="/librarian/login" className="btn btn-secondary btn-sm" style={{ textDecoration: 'none', justifyContent: 'center', fontSize: '0.78rem' }}>
                <BookOpen size={14} color="#0F9D8A" /> Librarian Portal
              </Link>
            )}
            {portal !== 'admin' && (
              <Link to="/admin/login" className="btn btn-secondary btn-sm" style={{ textDecoration: 'none', justifyContent: 'center', fontSize: '0.78rem' }}>
                <ShieldCheck size={14} color="#142D4E" /> Admin Portal
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
