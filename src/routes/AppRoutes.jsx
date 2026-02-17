import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ProtectedRoute from '../components/common/ProtectedRoute';
import Layout from '../components/common/Layout';

// Auth Pages
import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';

// Dashboard Pages
import StudentDashboard from '../pages/dashboard/StudentDashboard';
import AdminDashboard from '../pages/dashboard/AdminDashboard';
import CoordinatorDashboard from '../pages/dashboard/CoordinatorDashboard';
import CommitteeDashboard from '../pages/dashboard/CommitteeDashboard';
import FinanceDashboard from '../pages/dashboard/FinanceDashboard';

// Student Pages
import ProfilePage from '../pages/student/ProfilePage';
import ScholarshipsPage from '../pages/student/ScholarshipsPage';
import ScholarshipDetailPage from '../pages/student/ScholarshipDetailPage';
import ApplicationsPage from '../pages/student/ApplicationsPage';

// Admin Pages
import UsersManagement from '../pages/admin/UsersManagement';
import ScholarshipsManagement from '../pages/admin/ScholarshipsManagement';
import ApplicationsManagement from '../pages/admin/ApplicationsManagement';
import ReportsAnalytics from '../pages/admin/ReportsAnalytics';
import CreateUser from '../pages/admin/CreateUser';
import EditUser from '../pages/admin/EditUser';
import CreateScholarship from '../pages/admin/CreateScholarship';
import PaymentsManagement from '../pages/admin/PaymentsManagement';
import NotificationsManagement from '../pages/admin/NotificationsManagement';
import SystemSettings from '../pages/admin/SystemSettings';

// Coordinator Pages
import MyScholarships from '../pages/coordinator/MyScholarships';

// Committee Pages
import ApplicationReview from '../pages/committee/ApplicationReview';

// Common Pages
import UnauthorizedPage from '../pages/common/UnauthorizedPage';
import NotFoundPage from '../pages/common/NotFoundPage';

const AppRoutes = () => {
  const { isAuthenticated, user } = useAuth();

  const getDashboardComponent = () => {
    switch (user?.role?.name) {
      case 'student':
        return <StudentDashboard />;
      case 'coordinator':
        return <CoordinatorDashboard />;
      case 'committee':
        return <CommitteeDashboard />;
      case 'finance':
        return <FinanceDashboard />;
      case 'admin':
        return <AdminDashboard />;
      default:
        return <StudentDashboard />;
    }
  };

  return (
    <Routes>
      {/* Public Routes */}
      <Route 
        path="/login" 
        element={!isAuthenticated ? <LoginPage /> : <Navigate to="/dashboard" replace />} 
      />
      <Route 
        path="/register" 
        element={!isAuthenticated ? <RegisterPage /> : <Navigate to="/dashboard" replace />} 
      />

      {/* Protected Routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Layout>
              {getDashboardComponent()}
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* Profile Routes - Available to all authenticated users */}
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Layout>
              <ProfilePage />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <Layout>
              <SystemSettings />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/scholarships"
        element={
          <ProtectedRoute>
            <Layout>
              <ScholarshipsPage />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/scholarships/:id"
        element={
          <ProtectedRoute>
            <Layout>
              <ScholarshipDetailPage />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/applications"
        element={
          <ProtectedRoute>
            <Layout>
              <ApplicationsPage />
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* Admin Routes */}
      <Route
        path="/admin/users"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <Layout>
              <UsersManagement />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/users/create"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <Layout>
              <CreateUser />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/users/:id/edit"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <Layout>
              <EditUser />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/scholarships"
        element={
          <ProtectedRoute allowedRoles={['admin', 'coordinator']}>
            <Layout>
              <ScholarshipsManagement />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/scholarships/create"
        element={
          <ProtectedRoute allowedRoles={['admin', 'coordinator']}>
            <Layout>
              <CreateScholarship />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/applications"
        element={
          <ProtectedRoute allowedRoles={['admin', 'coordinator', 'committee']}>
            <Layout>
              <ApplicationsManagement />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/reports"
        element={
          <ProtectedRoute allowedRoles={['admin', 'coordinator', 'committee', 'finance']}>
            <Layout>
              <ReportsAnalytics />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/payments"
        element={
          <ProtectedRoute allowedRoles={['admin', 'finance']}>
            <Layout>
              <PaymentsManagement />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/notifications"
        element={
          <ProtectedRoute allowedRoles={['admin', 'coordinator']}>
            <Layout>
              <NotificationsManagement />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/settings"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <Layout>
              <SystemSettings />
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* Coordinator Specific Routes */}
      <Route
        path="/coordinator/scholarships"
        element={
          <ProtectedRoute allowedRoles={['coordinator']}>
            <Layout>
              <MyScholarships />
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* Committee Specific Routes */}
      <Route
        path="/committee/review"
        element={
          <ProtectedRoute allowedRoles={['committee']}>
            <Layout>
              <ApplicationReview />
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* Legacy Admin Routes for backward compatibility */}
      <Route
        path="/users"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <Layout>
              <UsersManagement />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/reports"
        element={
          <ProtectedRoute allowedRoles={['admin', 'coordinator', 'committee', 'finance']}>
            <Layout>
              <ReportsAnalytics />
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* Common Routes */}
      <Route path="/unauthorized" element={<UnauthorizedPage />} />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default AppRoutes;