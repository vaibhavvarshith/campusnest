import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  User,
  Lock,
  CheckCircle,
  AlertCircle,
  Eye,
  EyeOff,
  ShieldCheck,
  BookOpen,
  GraduationCap,
  Users,
} from 'lucide-react';

export default function ProfilePage() {
  const { user, changePassword } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [toast, setToast] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setError('');
    setToast('');

    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('New password and confirmation password do not match.');
      return;
    }

    setLoading(true);
    try {
      await changePassword(currentPassword, newPassword);
      setToast('Your password has been changed successfully. You can now use your new password on subsequent sign-ins.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setError(err.message || 'Failed to update password. Please verify your current password.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setError('');
    setToast('');
  };

  const getRoleBadge = () => {
    if (user?.role === 'ROLE_ADMIN') {
      return { label: 'System Administrator', icon: ShieldCheck, color: '#142D4E', bg: '#F1F5F9' };
    }
    if (user?.role === 'ROLE_LIBRARIAN') {
      return { label: 'Librarian Desk Officer', icon: BookOpen, color: '#0F9D8A', bg: '#F0FDF4' };
    }
    if (user?.role === 'ROLE_FACULTY') {
      return { label: 'Faculty Member', icon: Users, color: '#D97706', bg: '#FFFBEB' };
    }
    return { label: 'Student Patron', icon: GraduationCap, color: '#2563EB', bg: '#EFF6FF' };
  };

  const badge = getRoleBadge();
  const BadgeIcon = badge.icon;

  return (
    <div className="page-container" style={{ maxWidth: '800px' }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">My Account & Security Profile</h1>
          <p className="page-subtitle">
            View your institution credentials and update your security password
          </p>
        </div>
      </div>

      {toast && (
        <div
          style={{
            backgroundColor: '#E6F8F5',
            color: '#0F9D8A',
            border: '1px solid #99F6E4',
            padding: '14px 18px',
            borderRadius: '8px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <CheckCircle size={22} style={{ flexShrink: 0 }} />
          <span>{toast}</span>
        </div>
      )}

      {/* Profile Details Card */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#142D4E' }}>
            Account Identification
          </h3>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 12px',
              borderRadius: '20px',
              backgroundColor: badge.bg,
              color: badge.color,
              fontSize: '0.8rem',
              fontWeight: 700,
            }}
          >
            <BadgeIcon size={14} /> {badge.label}
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', fontSize: '0.9rem' }}>
          <div>
            <div style={{ color: '#64748B', fontSize: '0.8rem', marginBottom: '2px' }}>Full Name</div>
            <div style={{ fontWeight: 600, color: '#142D4E' }}>{user?.fullName}</div>
          </div>

          <div>
            <div style={{ color: '#64748B', fontSize: '0.8rem', marginBottom: '2px' }}>Username / Identifier</div>
            <div style={{ fontWeight: 600, color: '#142D4E' }}>{user?.username}</div>
          </div>

          <div>
            <div style={{ color: '#64748B', fontSize: '0.8rem', marginBottom: '2px' }}>Email Address</div>
            <div style={{ fontWeight: 600, color: '#142D4E' }}>{user?.email}</div>
          </div>

          <div>
            <div style={{ color: '#64748B', fontSize: '0.8rem', marginBottom: '2px' }}>Account Status</div>
            <div style={{ fontWeight: 600, color: '#0F9D8A' }}>Active (Verified)</div>
          </div>

          {user?.department && (
            <div>
              <div style={{ color: '#64748B', fontSize: '0.8rem', marginBottom: '2px' }}>Department</div>
              <div style={{ fontWeight: 600, color: '#142D4E' }}>{user.department}</div>
            </div>
          )}

          {user?.course && (
            <div>
              <div style={{ color: '#64748B', fontSize: '0.8rem', marginBottom: '2px' }}>Course / Academic Year</div>
              <div style={{ fontWeight: 600, color: '#142D4E' }}>{user.course} ({user.academicYear})</div>
            </div>
          )}
        </div>
      </div>

      {/* Change Password Card */}
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
          <Lock size={20} color="#2563EB" />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#142D4E' }}>
            Change Account Password
          </h3>
        </div>
        <p style={{ fontSize: '0.85rem', color: '#64748B', marginBottom: '20px' }}>
          To update your password, enter your current password followed by your chosen new password.
        </p>

        {error && (
          <div
            style={{
              backgroundColor: '#FEE2E2',
              color: '#DC2626',
              border: '1px solid #FCA5A5',
              padding: '12px 14px',
              borderRadius: '6px',
              fontSize: '0.86rem',
              marginBottom: '18px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
            }}
          >
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handlePasswordChange}>
          <div className="form-group" style={{ marginBottom: '16px' }}>
            <label className="form-label">Current Password *</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showCurrent ? 'text' : 'password'}
                className="form-input"
                style={{ paddingRight: '40px' }}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current password"
                required
              />
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '10px',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#94A3B8',
                }}
              >
                {showCurrent ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
            <div className="form-group">
              <label className="form-label">New Password (Min. 6 chars) *</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showNew ? 'text' : 'password'}
                  className="form-input"
                  style={{ paddingRight: '40px' }}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '10px',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#94A3B8',
                  }}
                >
                  {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Confirm New Password *</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showConfirm ? 'text' : 'password'}
                  className="form-input"
                  style={{ paddingRight: '40px' }}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '10px',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#94A3B8',
                  }}
                >
                  {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{ minWidth: '160px' }}
            >
              {loading ? 'Updating Password...' : 'Change Password'}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="btn btn-secondary"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
