import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { applicationService } from '../../services/applicationService';
import { scholarshipService } from '../../services/scholarshipService';
import { notificationService } from '../../services/notificationService';
import {
  Award,
  FileText,
  Clock,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Calendar,
  DollarSign
} from 'lucide-react';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const StudentDashboard = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch all data in parallel
      const [applicationsRes, scholarshipsRes, notificationsRes] = await Promise.all([
        applicationService.getMyApplications({ limit: 5 }),
        scholarshipService.getScholarships({ status: 'active', limit: 5 }),
        notificationService.getNotifications({ limit: 5 })
      ]);

      const applications = applicationsRes.data.applications;
      const scholarships = scholarshipsRes.data.scholarships;
      const notifications = notificationsRes.data.notifications || [];

      // Calculate stats
      const stats = {
        totalApplications: applications.length,
        pendingApplications: applications.filter(app => ['submitted', 'under_review'].includes(app.status)).length,
        approvedApplications: applications.filter(app => app.status === 'approved').length,
        rejectedApplications: applications.filter(app => app.status === 'rejected').length,
        totalAwarded: applications
          .filter(app => app.status === 'approved')
          .reduce((sum, app) => sum + (app.scholarship?.amount || 0), 0)
      };

      setDashboardData({
        stats,
        recentApplications: applications.slice(0, 3),
        availableScholarships: scholarships.slice(0, 3),
        notifications: notifications.slice(0, 3)
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // Set empty data on error
      setDashboardData({
        stats: {
          totalApplications: 0,
          pendingApplications: 0,
          approvedApplications: 0,
          rejectedApplications: 0,
          totalAwarded: 0
        },
        recentApplications: [],
        availableScholarships: [],
        notifications: []
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading dashboard..." />;
  }

  const { stats, recentApplications, availableScholarships, notifications } = dashboardData;

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-lg p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">
          Welcome back, {user?.first_name}!
        </h1>
        <p className="text-primary-100">
          Track your scholarship applications and discover new opportunities
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-academic-600">Total Applications</p>
              <p className="text-2xl font-bold text-academic-900">{stats.totalApplications}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-academic-600">Pending Review</p>
              <p className="text-2xl font-bold text-academic-900">{stats.pendingApplications}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-academic-600">Approved</p>
              <p className="text-2xl font-bold text-academic-900">{stats.approvedApplications}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-academic-600">Total Awarded</p>
              <p className="text-2xl font-bold text-academic-900">${stats.totalAwarded.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Applications */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-academic-900">Recent Applications</h2>
            <Link to="/applications" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
              View All
            </Link>
          </div>
          <div className="space-y-4">
            {recentApplications.length > 0 ? (
              recentApplications.map((application) => (
                <div key={application.id} className="border border-academic-200 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium text-academic-900">{application.scholarship?.name}</h3>
                      <p className="text-sm text-academic-600 mt-1">
                        Amount: ${application.scholarship?.amount?.toLocaleString() || 'N/A'}
                      </p>
                      <div className="flex items-center mt-2 space-x-4">
                        <span className="text-xs text-academic-500">
                          Applied: {new Date(application.created_at).toLocaleDateString()}
                        </span>
                        {application.submitted_at && (
                          <span className="text-xs text-academic-500">
                            Submitted: {new Date(application.submitted_at).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                    <StatusBadge status={application.status} size="sm" />
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 text-academic-300 mx-auto mb-3" />
                <p className="text-academic-600">No applications yet</p>
                <Link to="/scholarships" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                  Browse Scholarships
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Available Scholarships */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-academic-900">Available Scholarships</h2>
            <Link to="/scholarships" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
              Browse All
            </Link>
          </div>
          <div className="space-y-4">
            {availableScholarships.length > 0 ? (
              availableScholarships.map((scholarship) => (
                <div key={scholarship.id} className="border border-academic-200 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium text-academic-900">{scholarship.name}</h3>
                      <p className="text-sm text-academic-600 mt-1">
                        Amount: ${scholarship.amount.toLocaleString()}
                      </p>
                      <div className="flex items-center mt-2 space-x-4">
                        <span className="text-xs text-academic-500 flex items-center">
                          <Calendar className="w-3 h-3 mr-1" />
                          Deadline: {new Date(scholarship.application_deadline).toLocaleDateString()}
                        </span>
                        <span className="text-xs text-academic-500">
                          {scholarship.max_recipients - scholarship.current_recipients} spots left
                        </span>
                      </div>
                    </div>
                    <Link
                      to={`/scholarships/${scholarship.id}`}
                      className="btn-primary text-xs px-3 py-1"
                    >
                      View
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <Award className="w-12 h-12 text-academic-300 mx-auto mb-3" />
                <p className="text-academic-600">No scholarships available</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className="card">
        <h2 className="text-lg font-semibold text-academic-900 mb-4">Recent Notifications</h2>
        <div className="space-y-3">
          {notifications.length > 0 ? (
            notifications.map((notification) => (
              <div key={notification.id} className="flex items-start space-x-3 p-3 bg-academic-50 rounded-lg">
                <div className="flex-shrink-0">
                  {notification.type === 'application_approved' ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-yellow-500" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm text-academic-900">{notification.message}</p>
                  <p className="text-xs text-academic-500 mt-1">
                    {new Date(notification.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <AlertCircle className="w-12 h-12 text-academic-300 mx-auto mb-3" />
              <p className="text-academic-600">No notifications</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;