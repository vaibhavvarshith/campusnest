import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, BookOpen, GraduationCap, Users, ArrowRight } from 'lucide-react';
import Logo from '../components/Logo';

export default function Login() {
  const portals = [
    {
      to: '/student/login',
      title: 'Student Portal',
      description: 'Search 103+ textbooks, request borrowings, monitor return deadlines, and submit academic assignments.',
      badge: 'Students',
      icon: GraduationCap,
      color: '#2563EB',
      bgColor: '#EFF6FF',
    },
    {
      to: '/faculty/login',
      title: 'Faculty Portal',
      description: 'Browse the faculty collection, create course assignments by academic group, and evaluate submissions.',
      badge: 'Faculty Members',
      icon: Users,
      color: '#D97706',
      bgColor: '#FFFBEB',
    },
    {
      to: '/librarian/login',
      title: 'Librarian Portal',
      description: 'Manage circulation desk, review borrow requests, approve book issuances, and audit overdue fines.',
      badge: 'Library Staff',
      icon: BookOpen,
      color: '#0F9D8A',
      bgColor: '#F0FDF4',
    },
    {
      to: '/admin/login',
      title: 'Administrator Portal',
      description: 'Oversee student & faculty registrations, system security, institutional settings, and audit logs.',
      badge: 'Administration',
      icon: ShieldCheck,
      color: '#142D4E',
      bgColor: '#F8FAFC',
    },
  ];

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#F5F7FB',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '32px 20px',
      }}
    >
      <div style={{ textAlign: 'center', marginBottom: '36px', maxWidth: '600px' }}>
        <div style={{ display: 'inline-block', marginBottom: '16px' }}>
          <Logo size="lg" />
        </div>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#142D4E', marginBottom: '8px' }}>
          Select Your Campus Portal
        </h1>
        <p style={{ fontSize: '0.95rem', color: '#64748B', lineHeight: 1.5 }}>
          Welcome to the CampusNest Smart Library and Academic Management Gateway.
          Please select your authorized campus role to sign in.
        </p>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '20px',
          maxWidth: '1000px',
          width: '100%',
          marginBottom: '32px',
        }}
      >
        {portals.map((p) => {
          const Icon = p.icon;
          return (
            <Link
              key={p.to}
              to={p.to}
              style={{
                textDecoration: 'none',
                backgroundColor: '#FFFFFF',
                borderRadius: '14px',
                padding: '28px 24px',
                border: '1px solid #E2E8F0',
                boxShadow: '0 4px 6px -1px rgba(20, 45, 78, 0.05), 0 2px 4px -2px rgba(20, 45, 78, 0.05)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'all 0.2s ease-in-out',
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 12px 20px -5px rgba(20, 45, 78, 0.12)';
                e.currentTarget.style.borderColor = p.color;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(20, 45, 78, 0.05)';
                e.currentTarget.style.borderColor = '#E2E8F0';
              }}
            >
              <div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '16px',
                  }}
                >
                  <div
                    style={{
                      width: '46px',
                      height: '46px',
                      borderRadius: '12px',
                      backgroundColor: p.bgColor,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: p.color,
                    }}
                  >
                    <Icon size={24} />
                  </div>
                  <span
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      color: p.color,
                      backgroundColor: p.bgColor,
                      padding: '4px 10px',
                      borderRadius: '12px',
                    }}
                  >
                    {p.badge}
                  </span>
                </div>

                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#142D4E', marginBottom: '8px' }}>
                  {p.title}
                </h3>
                <p style={{ fontSize: '0.86rem', color: '#64748B', lineHeight: 1.5, marginBottom: '20px' }}>
                  {p.description}
                </p>
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '0.88rem',
                  fontWeight: 600,
                  color: p.color,
                  borderTop: '1px solid #F1F5F9',
                  paddingTop: '14px',
                }}
              >
                Access Portal <ArrowRight size={16} />
              </div>
            </Link>
          );
        })}
      </div>

      <div style={{ textAlign: 'center', fontSize: '0.8rem', color: '#94A3B8' }}>
        CampusNest &bull; Smart Library and Academic Management System &bull; Java 21 &bull; Spring Boot &bull; React
      </div>
    </div>
  );
}
