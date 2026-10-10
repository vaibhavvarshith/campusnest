import React from 'react';
import { BookOpen } from 'lucide-react';

export default function Logo({ size = 'md', light = false }) {
  const isLg = size === 'lg';
  const isSm = size === 'sm';

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: isSm ? '8px' : '12px' }}>
      <div
        style={{
          width: isLg ? '44px' : isSm ? '30px' : '38px',
          height: isLg ? '44px' : isSm ? '30px' : '38px',
          backgroundColor: '#2563EB',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#FFFFFF',
          boxShadow: '0 2px 4px rgba(37, 99, 235, 0.25)',
        }}
      >
        <BookOpen size={isLg ? 26 : isSm ? 18 : 22} strokeWidth={2.2} />
      </div>
      <div>
        <div
          style={{
            fontSize: isLg ? '1.5rem' : isSm ? '1.1rem' : '1.3rem',
            fontWeight: 800,
            letterSpacing: '-0.02em',
            color: light ? '#FFFFFF' : '#142D4E',
            lineHeight: 1.1,
          }}
        >
          Campus<span style={{ color: '#2563EB' }}>Nest</span>
        </div>
        {!isSm && (
          <div
            style={{
              fontSize: '0.72rem',
              fontWeight: 500,
              color: light ? '#94A3B8' : '#64748B',
              letterSpacing: '0.01em',
            }}
          >
            Smart Library & Academic Portal
          </div>
        )}
      </div>
    </div>
  );
}
