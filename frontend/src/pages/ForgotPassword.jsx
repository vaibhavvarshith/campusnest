import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Mail, KeyRound, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';
import Logo from '../components/Logo';
import api from '../services/api';

export default function ForgotPassword() {
  const [searchParams] = useSearchParams();
  const portal = searchParams.get('portal') || 'student';

  const [identifier, setIdentifier] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [devToken, setDevToken] = useState(null);

  const portalBackUrl = {
    admin: '/admin/login',
    librarian: '/librarian/login',
    student: '/student/login',
    faculty: '/faculty/login',
  }[portal] || '/login';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setDevToken(null);

    if (!identifier.trim()) {
      setError('Please provide your account username, registration number, or employee ID.');
      return;
    }

    try {
      setLoading(true);
      const res = await api.post('/auth/forgot-password', {
        identifier: identifier.trim(),
      });

      setSuccess(true);
      // In local dev, if response data contains link or token hint
      if (res.data?.data && typeof res.data.data === 'string' && res.data.data.includes('token=')) {
        const extracted = res.data.data.split('token=')[1]?.split('&')[0];
        if (extracted) {
          setDevToken(extracted);
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Unable to process reset request.');
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
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              backgroundColor: '#EFF6FF',
              color: '#2563EB',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 12px',
            }}
          >
            <KeyRound size={24} />
          </div>

          <h1 style={{ fontSize: '1.35rem', fontWeight: 700, color: '#142D4E', margin: '4px 0' }}>
            Password Recovery
          </h1>
          <p style={{ fontSize: '0.86rem', color: '#64748B', marginTop: '6px', lineHeight: 1.4 }}>
            Enter your registration number, employee ID, or username to securely reset your CampusNest password.
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

        {success ? (
          <div style={{ textAlign: 'center' }}>
            <div
              style={{
                backgroundColor: '#F0FDF4',
                border: '1px solid #86EFAC',
                color: '#15803D',
                padding: '16px',
                borderRadius: '10px',
                marginBottom: '20px',
              }}
            >
              <CheckCircle2 size={36} color="#16A34A" style={{ margin: '0 auto 10px' }} />
              <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '6px' }}>
                Reset Instructions Dispatched
              </h3>
              <p style={{ fontSize: '0.84rem', color: '#166534', lineHeight: 1.4 }}>
                If an account exists with the provided identifier, instructions and a single-use verification token (valid for 15 minutes) have been generated.
              </p>
            </div>

            {/* Local dev bypass link if available */}
            {devToken && (
              <div
                style={{
                  backgroundColor: '#EFF6FF',
                  border: '1px dashed #93C5FD',
                  borderRadius: '8px',
                  padding: '12px',
                  marginBottom: '20px',
                  textAlign: 'left',
                }}
              >
                <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#1D4ED8', textTransform: 'uppercase', marginBottom: '4px' }}>
                  Local Development Reset Link:
                </div>
                <Link
                  to={`/reset-password?token=${devToken}`}
                  style={{
                    fontSize: '0.84rem',
                    color: '#2563EB',
                    fontWeight: 600,
                    wordBreak: 'break-all',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  Proceed to Reset Password Form <ArrowRight size={14} />
                </Link>
              </div>
            )}

            <Link
              to={portalBackUrl}
              className="btn btn-primary"
              style={{ width: '100%', justifyContent: 'center', textDecoration: 'none', padding: '10px' }}
            >
              <ArrowLeft size={16} /> Return to Portal Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="form-group" style={{ marginBottom: '22px' }}>
              <label className="form-label" style={{ fontSize: '0.86rem', fontWeight: 600, color: '#1E293B', marginBottom: '6px' }}>
                Account Identifier
              </label>
              <div style={{ position: 'relative' }}>
                <Mail
                  size={18}
                  style={{ position: 'absolute', left: '12px', top: '12px', color: '#94A3B8' }}
                />
                <input
                  type="text"
                  className="form-input"
                  style={{ paddingLeft: '38px', fontSize: '0.92rem' }}
                  placeholder="e.g. STU2026001, FAC2026001, admin"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  required
                  autoFocus
                />
              </div>
              <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '6px' }}>
                Enter your student register number, faculty employee ID, or username.
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', padding: '12px', fontSize: '0.95rem', fontWeight: 600, marginBottom: '16px' }}
              disabled={loading}
            >
              {loading ? 'Processing...' : 'Send Reset Instructions'}
            </button>

            <div style={{ textAlign: 'center' }}>
              <Link
                to={portalBackUrl}
                style={{
                  fontSize: '0.84rem',
                  color: '#64748B',
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontWeight: 500,
                }}
              >
                <ArrowLeft size={14} /> Back to Sign In
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
