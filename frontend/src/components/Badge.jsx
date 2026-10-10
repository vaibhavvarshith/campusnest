import React from 'react';

export default function Badge({ status, text }) {
  const s = (status || '').toUpperCase();
  let badgeClass = 'badge-neutral';

  if (['ISSUED', 'ACTIVE', 'SUBMITTED', 'ROLE_STUDENT', 'B.TECH'].some(k => s.includes(k))) {
    badgeClass = 'badge-info';
  } else if (['RETURNED', 'PAID', 'REVIEWED', 'TRUE', 'ACTIVE'].some(k => s === k)) {
    badgeClass = 'badge-success';
  } else if (['PARTIALLY_PAID', 'LATE', 'ROLE_FACULTY'].some(k => s.includes(k))) {
    badgeClass = 'badge-warning';
  } else if (['OVERDUE', 'UNPAID', 'FALSE', 'INACTIVE'].some(k => s.includes(k))) {
    badgeClass = 'badge-danger';
  }

  return (
    <span className={`badge ${badgeClass}`}>
      {text || status}
    </span>
  );
}
