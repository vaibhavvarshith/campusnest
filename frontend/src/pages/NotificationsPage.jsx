import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useNotifications } from '../context/NotificationContext';
import { Bell, CheckCheck, Clock, BookOpen, AlertTriangle, FolderGit2 } from 'lucide-react';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const { markAsRead, markAllAsRead, fetchNotifications } = useNotifications();

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const res = await api.get('/notifications?page=0&size=50');
      if (res.success && res.data) {
        setNotifications(res.data.content || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkOne = async (id) => {
    await markAsRead(id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const handleMarkAll = async () => {
    await markAllAsRead();
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Automated Notification Center</h1>
          <p className="page-subtitle">
            System deadline alerts, 2-day return reminders, and penalty assessments
          </p>
        </div>

        <button onClick={handleMarkAll} className="btn btn-secondary">
          <CheckCheck size={18} /> Mark All as Read
        </button>
      </div>

      <div className="card">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: '#2563EB' }}>
            Loading notification records...
          </div>
        ) : notifications.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#94A3B8' }}>
            <Bell size={48} style={{ margin: '0 auto 12px', color: '#CBD5E1' }} />
            <h3 style={{ fontSize: '1.1rem', color: '#142D4E', fontWeight: 700 }}>Inbox Clear</h3>
            <p style={{ fontSize: '0.88rem', marginTop: '4px' }}>No notification records to display.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {notifications.map((n) => {
              const is2DayBook = n.type === 'BOOK_RETURN_REMINDER_2DAYS';
              const isOverdue = n.type === 'BOOK_OVERDUE';
              const isProject = n.type.includes('PROJECT');

              return (
                <div
                  key={n.id}
                  style={{
                    padding: '16px 20px',
                    borderRadius: '10px',
                    backgroundColor: n.isRead ? '#FFFFFF' : '#EFF6FF',
                    border: '1px solid #E2E8F0',
                    borderLeft: isOverdue
                      ? '4px solid #DC2626'
                      : is2DayBook || isProject
                      ? '4px solid #2563EB'
                      : '4px solid #0F9D8A',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '16px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                    <div
                      style={{
                        width: '38px',
                        height: '38px',
                        borderRadius: '50%',
                        backgroundColor: isOverdue ? '#FEE2E2' : '#DBEAFE',
                        color: isOverdue ? '#DC2626' : '#2563EB',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        marginTop: '2px',
                      }}
                    >
                      {isOverdue ? <AlertTriangle size={18} /> : isProject ? <FolderGit2 size={18} /> : <BookOpen size={18} />}
                    </div>

                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#142D4E' }}>
                          {n.title}
                        </h4>
                        {!n.isRead && (
                          <span className="badge badge-info" style={{ fontSize: '0.68rem', padding: '1px 6px' }}>
                            New
                          </span>
                        )}
                      </div>

                      <p style={{ fontSize: '0.86rem', color: '#475569', marginTop: '4px', lineHeight: 1.4 }}>
                        {n.message}
                      </p>

                      <div style={{ fontSize: '0.75rem', color: '#94A3B8', marginTop: '6px' }}>
                        {new Date(n.createdAt).toLocaleString()}
                      </div>
                    </div>
                  </div>

                  {!n.isRead && (
                    <button
                      onClick={() => handleMarkOne(n.id)}
                      className="btn btn-secondary btn-sm"
                      style={{ flexShrink: 0 }}
                    >
                      Mark Read
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
