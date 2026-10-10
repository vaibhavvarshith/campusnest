import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function StatCard({ title, value, icon: Icon, color = 'blue', subtitle, to }) {
  const navigate = useNavigate();

  const colorStyles = {
    blue: { bg: '#EFF6FF', text: '#2563EB' },
    teal: { bg: '#E6F8F5', text: '#0F9D8A' },
    amber: { bg: '#FEF3C7', text: '#D97706' },
    rose: { bg: '#FEE2E2', text: '#DC2626' },
    navy: { bg: '#EEF2F6', text: '#142D4E' },
  };

  const current = colorStyles[color] || colorStyles.blue;

  return (
    <div
      onClick={() => to && navigate(to)}
      className="card"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        padding: '20px',
        margin: 0,
        cursor: to ? 'pointer' : 'default',
        transition: 'transform 0.15s, box-shadow 0.15s',
      }}
      onMouseEnter={(e) => {
        if (to) {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = '0 6px 12px rgba(0,0,0,0.08)';
        }
      }}
      onMouseLeave={(e) => {
        if (to) {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
        }
      }}
    >
      <div
        style={{
          width: '50px',
          height: '50px',
          borderRadius: '12px',
          backgroundColor: current.bg,
          color: current.text,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <Icon size={24} strokeWidth={2.2} />
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          {title}
        </div>
        <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#142D4E', lineHeight: 1.2, marginTop: '2px' }}>
          {value}
        </div>
        {subtitle && (
          <div style={{ fontSize: '0.78rem', color: '#64748B', marginTop: '4px' }}>
            {subtitle}
          </div>
        )}
      </div>
    </div>
  );
}
