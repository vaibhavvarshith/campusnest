import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import FirstLoginModal from './components/FirstLoginModal';

import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import StudentDashboard from './pages/StudentDashboard';
import FacultyDashboard from './pages/FacultyDashboard';
import BookCatalog from './pages/BookCatalog';
import IssueReturn from './pages/IssueReturn';
import BorrowHistory from './pages/BorrowHistory';
import OverdueBooks from './pages/OverdueBooks';
import FineManagement from './pages/FineManagement';
import StudentsList from './pages/StudentsList';
import FacultyList from './pages/FacultyList';
import ProjectsPage from './pages/ProjectsPage';
import NotificationsPage from './pages/NotificationsPage';
import ReportsPage from './pages/ReportsPage';
import SettingsPage from './pages/SettingsPage';
import ProfilePage from './pages/ProfilePage';

function ProtectedLayout() {
  const { user, loading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (loading) {
    return (
      <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', backgroundColor: '#F5F7FB', color: '#2563EB', fontWeight: 600 }}>
        Loading CampusNest...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Dashboard component selection based on role
  const getDashboard = () => {
    if (user.role === 'ROLE_STUDENT') return <StudentDashboard />;
    if (user.role === 'ROLE_FACULTY') return <FacultyDashboard />;
    return <AdminDashboard />;
  };

  return (
    <div className="app-layout">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="main-content">
        <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        <Routes>
          <Route path="/" element={getDashboard()} />
          <Route path="/books" element={<BookCatalog />} />
          <Route path="/issue-return" element={<IssueReturn />} />
          <Route path="/borrow-history" element={<BorrowHistory />} />
          <Route path="/my-books" element={<BorrowHistory />} />
          <Route path="/my-deadlines" element={<StudentDashboard />} />
          <Route path="/overdue" element={<OverdueBooks />} />
          <Route path="/fines" element={<FineManagement />} />
          <Route path="/my-fines" element={<FineManagement />} />
          <Route path="/students" element={<StudentsList />} />
          <Route path="/faculty" element={<FacultyList />} />
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/projects/submissions" element={<ProjectsPage />} />
          <Route path="/my-submissions" element={<ProjectsPage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
      <FirstLoginModal />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <NotificationProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/*" element={<ProtectedLayout />} />
          </Routes>
        </NotificationProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
