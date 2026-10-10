import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  BookMarked,
  Users,
  GraduationCap,
  ArrowRightLeft,
  History,
  AlertTriangle,
  Receipt,
  FolderGit2,
  FileCheck2,
  Bell,
  BarChart3,
  Settings,
  UserCircle,
  Clock,
} from 'lucide-react';

export default function Sidebar({ isOpen, onClose }) {
  const { user } = useAuth();
  const role = user?.role;

  const adminLinks = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/books', label: 'Book Catalogue', icon: BookMarked },
    { to: '/students', label: 'Students', icon: GraduationCap },
    { to: '/faculty', label: 'Faculty', icon: Users },
    { to: '/issue-return', label: 'Issue & Return', icon: ArrowRightLeft },
    { to: '/borrow-history', label: 'Borrowing History', icon: History },
    { to: '/overdue', label: 'Overdue Books', icon: AlertTriangle },
    { to: '/fines', label: 'Fine Management', icon: Receipt },
    { to: '/projects', label: 'Projects & Assign.', icon: FolderGit2 },
    { to: '/notifications', label: 'Notifications', icon: Bell },
    { to: '/reports', label: 'Reports & Audits', icon: BarChart3 },
    { to: '/settings', label: 'Library Settings', icon: Settings },
  ];

  const studentLinks = [
    { to: '/', label: 'My Dashboard', icon: LayoutDashboard },
    { to: '/books', label: 'Browse Books', icon: BookMarked },
    { to: '/my-books', label: 'My Borrowed Books', icon: History },
    { to: '/my-deadlines', label: 'Return Deadlines', icon: Clock },
    { to: '/my-fines', label: 'My Fines', icon: Receipt },
    { to: '/projects', label: 'Projects & Assign.', icon: FolderGit2 },
    { to: '/my-submissions', label: 'My Submissions', icon: FileCheck2 },
    { to: '/notifications', label: 'Notifications', icon: Bell },
    { to: '/profile', label: 'My Profile', icon: UserCircle },
  ];

  const facultyLinks = [
    { to: '/', label: 'Faculty Dashboard', icon: LayoutDashboard },
    { to: '/books', label: 'Browse Books', icon: BookMarked },
    { to: '/my-books', label: 'My Borrowed Books', icon: History },
    { to: '/my-fines', label: 'My Fines', icon: Receipt },
    { to: '/projects', label: 'Projects & Assign.', icon: FolderGit2 },
    { to: '/notifications', label: 'Notifications', icon: Bell },
    { to: '/profile', label: 'My Profile', icon: UserCircle },
  ];

  let links = adminLinks;
  if (role === 'ROLE_STUDENT') links = studentLinks;
  else if (role === 'ROLE_FACULTY') links = facultyLinks;

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.4)',
            zIndex: 40,
            display: isOpen ? 'block' : 'none',
          }}
        />
      )}

      <aside
        style={{
          width: '260px',
          backgroundColor: '#142D4E',
          color: '#F8FAFC',
          display: 'flex',
          flexDirection: 'column',
          flexShrink: 0,
          transition: 'all 0.25s ease-in-out',
          zIndex: 45,
          position: isOpen ? 'fixed' : 'relative',
          top: 0,
          bottom: 0,
          left: 0,
          boxShadow: isOpen ? '4px 0 10px rgba(0,0,0,0.15)' : 'none',
        }}
      >
        <div
          style={{
            padding: '24px 20px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          <div style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#94A3B8', fontWeight: 600 }}>
            {role === 'ROLE_ADMIN' ? 'Library Administration' : role === 'ROLE_FACULTY' ? 'Faculty Portal' : 'Student Academic Portal'}
          </div>
          <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#FFFFFF', marginTop: '4px' }}>
            {user?.fullName}
          </div>
        </div>

        <nav style={{ padding: '16px 12px', flex: 1, overflowY: 'auto' }}>
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={() => {
                  if (window.innerWidth < 1024) onClose();
                }}
                end={link.to === '/'}
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  marginBottom: '4px',
                  textDecoration: 'none',
                  fontSize: '0.88rem',
                  fontWeight: isActive ? 600 : 500,
                  color: isActive ? '#FFFFFF' : '#CBD5E1',
                  backgroundColor: isActive ? '#2563EB' : 'transparent',
                  transition: 'all 0.15s ease',
                })}
              >
                <Icon size={18} strokeWidth={2} />
                <span>{link.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div
          style={{
            padding: '16px 20px',
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            fontSize: '0.72rem',
            color: '#94A3B8',
          }}
        >
          <div>CampusNest v1.0.0</div>
          <div style={{ marginTop: '2px', color: '#64748B' }}>Java 21 • Spring Boot • MySQL</div>
        </div>
      </aside>
    </>
  );
}
