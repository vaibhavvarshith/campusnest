import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Lock, CheckCircle, AlertCircle } from 'lucide-react';

export default function ProfilePage() {
  const { user, changePassword } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
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
      setError('New passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await changePassword(currentPassword, newPassword);
      setToast('Password updated successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setError(err.message || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container" style={{ maxWidth: '800px' }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">My Account & Security Profile</h1>
          <p className="page-subtitle">
            Manage your personal profile and authentication credentials
          </p>
        </div>
      </div>

      {toast && (
        <div style={{ backgroundColor: '#E6F8F5', color: '#0F9D8A', border: '1px solid #99F6E4', padding: '12px 16px', borderRadius: '8px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <CheckCircle size={20} />
          <span>{toast}</span>
        </div>
      )}

      {/* Profile Details Card */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#142D4E', marginBottom: '16px' }}>
          Account Information
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', fontSize: '0.9rem' }}>
          <div>
            <div style={{ color: '#64748B', fontSize: '0.8rem' }}>Full Name</div>
            <div style={{ fontWeight: 600, color: '#142D4E' }}>{user?.fullName}</div>
          </div>

          <div>
            <div style={{ color: '#64748B', fontSize: '0.8rem' }}>Username / Identifier</div>
            <div style={{ fontWeight: 600, color: '#142D4E' }}>{user?.username}</div>
          </div>

          <div>
            <div style={{ color: '#64748B', fontSize: '0.8rem' }}>Email Address</div>
            <div style={{ fontWeight: 600, color: '#142D4E' }}>{user?.email}</div>
          </div>

          <div>
            <div style={{ color: '#64748B', fontSize: '0.8rem' }}>Role</div>
            <div style={{ fontWeight: 600, color: '#2563EB' }}>
              {user?.role === 'ROLE_ADMIN' ? 'Library Administrator' : user?.role === 'ROLE_FACULTY' ? 'Faculty Instructor' : 'College Student'}
            </div>
          </div>

          {user?.department && (
            <div>
              <div style={{ color: '#64748B', fontSize: '0.8rem' }}>Department</div>
              <div style={{ fontWeight: 600, color: '#142D4E' }}>{user.department}</div>
            </div>
          )}

          {user?.course && (
            <div>
              <div style={{ color: '#64748B', fontSize: '0.8rem' }}>Course Program</div>
              <div style={{ fontWeight: 600, color: '#142D4E' }}>{user.course} ({user.academicYear})</div>
            </div>
          )}
        </div>
      </div>

      {/* Change Password Card */}
      <div className="card">
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#142D4E', marginBottom: '16px' }}>
          Change Password
        </h3>

        {error && (
          <div style={{ backgroundColor: '#FEE2E2', color: '#DC2626', padding: '10px 14px', borderRadius: '6px', fontSize: '0.85rem', marginBottom: '16px' }}>
            {error}
          </div>
        )}

        <form onSubmit={handlePasswordChange}>
          <div className="form-group">
            <label className="form-label">Current Password</label>
            <input
              type="password"
              className="form-input"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">New Password (Min. 6 chars)</label>
              <input
                type="password"
                className="form-input"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Confirm New Password</label>
              <input
                type="password"
                className="form-input"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  );
}
