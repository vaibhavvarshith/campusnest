import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { Lock, Eye, EyeOff, CheckCircle2, AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react';
import Logo from '../components/Logo';
import api from '../services/api';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();

  const [validating, setValidating] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [username, setUsername] = useState('');
  const [tokenError, setTokenError] = useState('');

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      setValidating(false);
      setTokenValid(false);
      setTokenError('No password reset token was provided in the URL.');
      return;
    }

    const checkToken = async () => {
      try {
        setValidating(true);
        const res = await api.get(`/auth/reset-password/validate-token?token=${encodeURIComponent(token)}`);
        if (res.data?.success && res.data.data?.valid) {
          setTokenValid(true);
          setUsername(res.data.data.username || '');
        } else {
          setTokenValid(false);
          setTokenError(res.data?.data?.message || 'The password reset link is invalid or has expired.');
        }
      } catch (err) {
        setTokenValid(false);
        setTokenError(err.response?.data?.message || 'This password reset link is invalid or has expired.');
      } finally {
        setValidating(false);
      }
    };

    checkToken();
  }, [token]);

  // Password strength checks
  const checks = [
    { label: 'At least 8 characters', met: newPassword.length >= 8 },
    { label: 'Contains uppercase letter', met: /[A-Z]/.test(newPassword) },
    { label: 'Contains lowercase letter', met: /[a-z]/.test(newPassword) },
    { label: 'Contains a number', met: /[0-9]/.test(newPassword) },
    { label: 'Contains a special character (@$!%*?&#)', met: /[@$!%*?&#]/.test(newPassword) },
  ];
  const passedChecks = checks.filter((c) => c.met).length;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (newPassword !== confirmPassword) {
      setError('New password and confirmation do not match.');
      return;
    }

    if (passedChecks < 5) {
      setError('Please satisfy all password complexity requirements before proceeding.');
      return;
    }

    try {
      setSubmitting(true);
      await api.post('/auth/reset-password', {
        token,
        newPassword,
        confirmPassword,
      });
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to update password.');
    } finally {
      setSubmitting(false);
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
            <ShieldCheck size={24} />
          </div>

          <h1 style={{ fontSize: '1.35rem', fontWeight: 700, color: '#142D4E', margin: '4px 0' }}>
            Set New Password
          </h1>
          {username && (
            <div style={{ fontSize: '0.84rem', color: '#2563EB', fontWeight: 600, marginTop: '4px' }}>
              Account: {username}
            </div>
          )}
        </div>

        {validating ? (
          <div style={{ textAlign: 'center', padding: '30px 0', color: '#64748B' }}>
            Verifying security token...
          </div>
        ) : !tokenValid ? (
          <div style={{ textAlign: 'center' }}>
            <div
              style={{
                backgroundColor: '#FEF2F2',
                border: '1px solid #FECACA',
                color: '#DC2626',
                padding: '16px',
                borderRadius: '10px',
                marginBottom: '20px',
              }}
            >
              <AlertCircle size={36} color="#DC2626" style={{ margin: '0 auto 10px' }} />
              <h3 style={{ fontSize: '0.98rem', fontWeight: 700, marginBottom: '6px' }}>
                Reset Link Expired or Invalid
              </h3>
              <p style={{ fontSize: '0.84rem', color: '#991B1B', lineHeight: 1.4 }}>
                {tokenError || 'This password reset token has either expired (15-minute validity) or has already been used.'}
              </p>
            </div>

            <Link
              to="/forgot-password"
              className="btn btn-primary"
              style={{ width: '100%', justifyContent: 'center', textDecoration: 'none', padding: '10px' }}
            >
              Request a New Reset Link
            </Link>
          </div>
        ) : success ? (
          <div style={{ textAlign: 'center' }}>
            <div
              style={{
                backgroundColor: '#F0FDF4',
                border: '1px solid #86EFAC',
                color: '#15803D',
                padding: '20px',
                borderRadius: '10px',
                marginBottom: '24px',
              }}
            >
              <CheckCircle2 size={44} color="#16A34A" style={{ margin: '0 auto 10px' }} />
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '6px' }}>
                Password Reset Successfully!
              </h3>
              <p style={{ fontSize: '0.86rem', color: '#166534', lineHeight: 1.4 }}>
                Your account password has been updated securely. You can now log into your campus portal using your new credentials.
              </p>
            </div>

            <Link
              to="/login"
              className="btn btn-primary"
              style={{ width: '100%', justifyContent: 'center', textDecoration: 'none', padding: '12px', fontSize: '0.95rem' }}
            >
              Go to Portal Login <ArrowRight size={16} />
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
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

            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label className="form-label" style={{ fontSize: '0.86rem', fontWeight: 600, color: '#1E293B', marginBottom: '6px' }}>
                New Password
              </label>
              <div style={{ position: 'relative' }}>
                <Lock
                  size={18}
                  style={{ position: 'absolute', left: '12px', top: '12px', color: '#94A3B8' }}
                />
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  className="form-input"
                  style={{ paddingLeft: '38px', paddingRight: '40px', fontSize: '0.92rem' }}
                  placeholder="Enter new strong password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
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
                  aria-label="Toggle password visibility"
                >
                  {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label className="form-label" style={{ fontSize: '0.86rem', fontWeight: 600, color: '#1E293B', marginBottom: '6px' }}>
                Confirm New Password
              </label>
              <div style={{ position: 'relative' }}>
                <Lock
                  size={18}
                  style={{ position: 'absolute', left: '12px', top: '12px', color: '#94A3B8' }}
                />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  className="form-input"
                  style={{ paddingLeft: '38px', paddingRight: '40px', fontSize: '0.92rem' }}
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
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
                  aria-label="Toggle password visibility"
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Password strength checklist */}
            <div
              style={{
                backgroundColor: '#F8FAFC',
                border: '1px solid #E2E8F0',
                borderRadius: '8px',
                padding: '12px',
                marginBottom: '20px',
              }}
            >
              <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569', marginBottom: '8px', textTransform: 'uppercase' }}>
                Password Security Requirements:
              </div>
              <div style={{ display: 'grid', gap: '6px' }}>
                {checks.map((chk, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.78rem', color: chk.met ? '#16A34A' : '#94A3B8' }}>
                    <div
                      style={{
                        width: '14px',
                        height: '14px',
                        borderRadius: '50%',
                        backgroundColor: chk.met ? '#DCFCE7' : '#F1F5F9',
                        color: chk.met ? '#16A34A' : '#94A3B8',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '10px',
                        fontWeight: 'bold',
                      }}
                    >
                      {chk.met ? '✓' : '•'}
                    </div>
                    <span>{chk.label}</span>
                  </div>
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', padding: '12px', fontSize: '0.95rem', fontWeight: 600 }}
              disabled={submitting || passedChecks < 5}
            >
              {submitting ? 'Updating Password...' : 'Save & Update Password'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
