import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { Link, useNavigate } from 'react-router-dom';
import { Bell, LogOut, User, Menu, CheckCheck } from 'lucide-react';
import Logo from './Logo';

export default function Navbar({ onToggleSidebar }) {
  const { user, logout } = useAuth();
  const { unreadCount, recentNotifications, markAsRead, markAllAsRead } = useNotifications();
  const [showNotifications, setShowNotifications] = useState(false);
  const notifRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getRoleLabel = () => {
    if (user?.role === 'ROLE_ADMIN') return 'Librarian / Admin';
    if (user?.role === 'ROLE_FACULTY') return 'Faculty';
    if (user?.role === 'ROLE_STUDENT') return 'Student';
    return '';
  };

  return (
    <header
      style={{
        height: '68px',
        backgroundColor: '#FFFFFF',
        borderBottom: '1px solid #E2E8F0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
        position: 'sticky',
        top: 0,
        zIndex: 50,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button
          onClick={onToggleSidebar}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '6px',
            color: '#64748B',
            display: 'flex',
            alignItems: 'center',
            borderRadius: '6px',
          }}
          aria-label="Toggle menu"
        >
          <Menu size={22} />
        </button>
        <Link to="/" style={{ textDecoration: 'none' }}>
          <Logo size="sm" />
        </Link>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
        {/* Notification Bell Dropdown */}
        <div style={{ position: 'relative' }} ref={notifRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            style={{
              position: 'relative',
              background: '#F8FAFC',
              border: '1px solid #E2E8F0',
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#142D4E',
            }}
            aria-label="Notifications"
          >
            <Bell size={19} />
            {unreadCount > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: '-3px',
                  right: '-3px',
                  backgroundColor: '#DC2626',
                  color: '#FFFFFF',
                  borderRadius: '9999px',
                  padding: '2px 6px',
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  boxShadow: '0 0 0 2px #fff',
                }}
              >
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div
              style={{
                position: 'absolute',
                top: '50px',
                right: '0',
                width: '360px',
                backgroundColor: '#FFFFFF',
                borderRadius: '10px',
                boxShadow: '0 10px 25px rgba(0, 0, 0, 0.12)',
                border: '1px solid #E2E8F0',
                padding: '16px',
                zIndex: 100,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '12px',
                  borderBottom: '1px solid #F1F5F9',
                  paddingBottom: '8px',
                }}
              >
                <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#142D4E' }}>
                  Notifications
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#2563EB',
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <CheckCheck size={14} /> Mark all read
                  </button>
                )}
              </div>

              <div style={{ maxHeight: '320px', overflowY: 'auto' }}>
                {recentNotifications.length === 0 ? (
                  <div style={{ padding: '24px 0', textAlign: 'center', color: '#94A3B8', fontSize: '0.85rem' }}>
                    No notifications yet.
                  </div>
                ) : (
                  recentNotifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => !n.isRead && markAsRead(n.id)}
                      style={{
                        padding: '10px',
                        borderRadius: '6px',
                        backgroundColor: n.isRead ? '#FFFFFF' : '#EFF6FF',
                        borderLeft: n.isRead ? '3px solid transparent' : '3px solid #2563EB',
                        marginBottom: '8px',
                        cursor: n.isRead ? 'default' : 'pointer',
                        transition: 'background-color 0.15s',
                      }}
                    >
                      <div style={{ fontWeight: 600, fontSize: '0.83rem', color: '#142D4E' }}>
                        {n.title}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: '#64748B', marginTop: '3px' }}>
                        {n.message}
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div style={{ marginTop: '10px', borderTop: '1px solid #F1F5F9', paddingTop: '8px', textAlign: 'center' }}>
                <Link
                  to="/notifications"
                  onClick={() => setShowNotifications(false)}
                  style={{ fontSize: '0.8rem', color: '#2563EB', textDecoration: 'none', fontWeight: 600 }}
                >
                  View all notifications →
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Pill */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ textAlign: 'right', display: 'none', md: 'block' }}>
            <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#142D4E' }}>
              {user?.fullName}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#64748B' }}>
              {getRoleLabel()} {user?.identifier ? `• ${user.identifier}` : ''}
            </div>
          </div>

          <Link
            to="/profile"
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              backgroundColor: '#EFF6FF',
              color: '#2563EB',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: '0.88rem',
              textDecoration: 'none',
              border: '1px solid #DBEAFE',
            }}
            title="My Profile"
          >
            {user?.fullName ? user.fullName.charAt(0).toUpperCase() : <User size={18} />}
          </Link>

          <button
            onClick={handleLogout}
            className="btn btn-secondary btn-sm"
            style={{ padding: '6px 10px', color: '#DC2626' }}
            title="Logout"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </header>
  );
}
