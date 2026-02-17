import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Award,
  FileText,
  Users,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Calendar,
  DollarSign,
  BarChart3,
  Bell
} from 'lucide-react';
import { adminService } from '../../services/adminService';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { toast } from 'react-hot-toast';

const CoordinatorDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await adminService.getDashboardStats();
      
      // Coordinator-specific data structure
      setDashboardData({
        stats: {
          myScholarships: response.data?.totalScholarships || 12,
          totalApplications: response.data?.totalApplications || 245,
          pendingReview: response.data?.pendingApplications || 34,
          approvedToday: 8,
          totalAwarded: response.data?.totalAwarded || 450000,
          averageScore: 78.5,
          deadlinesSoon: 3,
          activeScholarships: response.data?.activeScholarships || 8
        },
        recentApplications: [
          {
            id: 1,
            studentName: 'Alice Johnson',
            scholarshipName: 'Computer Science Excellence Award',
            amount: 5000,
            status: 'submitted',
            submittedDate: '2024-02-01',
            score: null,
            priority: 'high'
          },
          {
            id: 2,
            studentName: 'Bob Smith',
            scholarshipName: 'Engineering Innovation Grant',
            amount: 7500,
            status: 'under_review',
            submittedDate: '2024-01-30',
            score: 85,
            priority: 'medium'
          },
          {
            id: 3,
            studentName: 'Carol Davis',
            scholarshipName: 'STEM Leadership Scholarship',
            amount: 6000,
            status: 'pending_documents',
            submittedDate: '2024-01-28',
            score: null,
            priority: 'low'
          }
        ],
        myScholarships: [
          {
            id: 1,
            name: 'Computer Science Excellence Award',
            applications: 45,
            deadline: '2024-03-15',
            status: 'active',
            amount: 5000,
            recipients: 8,
            maxRecipients: 10
          },
          {
            id: 2,
            name: 'Engineering Innovation Grant',
            applications: 32,
            deadline: '2024-02-28',
            status: 'active',
            amount: 7500,
            recipients: 5,
            maxRecipients: 6
          },
          {
            id: 3,
            name: 'STEM Leadership Scholarship',
            applications: 28,
            deadline: '2024-04-01',
            status: 'active',
            amount: 6000,
            recipients: 3,
            maxRecipients: 8
          }
        ],
        upcomingDeadlines: [
          {
            id: 1,
            name: 'Engineering Innovation Grant',
            deadline: '2024-02-28',
            daysLeft: 5,
            applications: 32
          },
          {
            id: 2,
            name: 'Computer Science Excellence Award',
            deadline: '2024-03-15',
            daysLeft: 20,
            applications: 45
          }
        ],
        departmentStats: {
          totalStudents: 156,
          applicants: 89,
          successRate: 68.5,
          averageGPA: 3.7
        }
      });
    } catch (error) {
      toast.error('Failed to fetch dashboard data');
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading coordinator dashboard..." />;
  }

  const { stats, recentApplications, myScholarships, upcomingDeadlines, departmentStats } = dashboardData;

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getDeadlineUrgency = (daysLeft) => {
    if (daysLeft <= 7) return 'text-red-600 bg-red-50';
    if (daysLeft <= 14) return 'text-yellow-600 bg-yellow-50';
    return 'text-green-600 bg-green-50';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">Department Coordinator Dashboard</h1>
        <p className="text-blue-100">
          Manage your department's scholarships and review applications
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Award className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-academic-600">My Scholarships</p>
              <p className="text-2xl font-bold text-academic-900">{stats.myScholarships}</p>
              <p className="text-xs text-green-600 flex items-center">
                <TrendingUp className="w-3 h-3 mr-1" />
                {stats.activeScholarships} active
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <FileText className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-academic-600">Total Applications</p>
              <p className="text-2xl font-bold text-academic-900">{stats.totalApplications}</p>
              <p className="text-xs text-yellow-600 flex items-center">
                <Clock className="w-3 h-3 mr-1" />
                {stats.pendingReview} pending review
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-academic-600">Approved Today</p>
              <p className="text-2xl font-bold text-academic-900">{stats.approvedToday}</p>
              <p className="text-xs text-academic-500">
                Avg Score: {stats.averageScore}
              </p>
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
              <p className="text-2xl font-bold text-academic-900">${(stats.totalAwarded / 1000).toFixed(0)}K</p>
              <p className="text-xs text-red-600 flex items-center">
                <AlertCircle className="w-3 h-3 mr-1" />
                {stats.deadlinesSoon} deadlines soon
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Department Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <Users className="w-6 h-6 text-indigo-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-academic-600">Department Students</p>
              <p className="text-2xl font-bold text-academic-900">{departmentStats.totalStudents}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-cyan-100 rounded-lg">
              <FileText className="w-6 h-6 text-cyan-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-academic-600">Applicants</p>
              <p className="text-2xl font-bold text-academic-900">{departmentStats.applicants}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-emerald-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-emerald-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-academic-600">Success Rate</p>
              <p className="text-2xl font-bold text-academic-900">{departmentStats.successRate}%</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <BarChart3 className="w-6 h-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-academic-600">Avg GPA</p>
              <p className="text-2xl font-bold text-academic-900">{departmentStats.averageGPA}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Applications Requiring Review */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-academic-900">Applications Requiring Review</h2>
            <Link to="/admin/applications" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
              View All
            </Link>
          </div>
          <div className="space-y-4">
            {recentApplications.map((application) => (
              <div key={application.id} className="border border-academic-200 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="font-medium text-academic-900">{application.studentName}</h3>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(application.priority)}`}>
                        {application.priority}
                      </span>
                    </div>
                    <p className="text-sm text-academic-600 mb-2">{application.scholarshipName}</p>
                    <div className="flex items-center space-x-4 text-xs text-academic-500">
                      <span className="flex items-center">
                        <DollarSign className="w-3 h-3 mr-1" />
                        ${application.amount.toLocaleString()}
                      </span>
                      <span className="flex items-center">
                        <Calendar className="w-3 h-3 mr-1" />
                        {new Date(application.submittedDate).toLocaleDateString()}
                      </span>
                      {application.score && (
                        <span className="flex items-center">
                          <BarChart3 className="w-3 h-3 mr-1" />
                          Score: {application.score}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end space-y-2">
                    <StatusBadge status={application.status} size="sm" />
                    <Link
                      to={`/admin/applications/${application.id}`}
                      className="text-xs text-primary-600 hover:text-primary-800 font-medium"
                    >
                      Review →
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* My Scholarships */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-academic-900">My Scholarships</h2>
            <Link to="/admin/scholarships" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
              Manage All
            </Link>
          </div>
          <div className="space-y-4">
            {myScholarships.map((scholarship) => (
              <div key={scholarship.id} className="border border-academic-200 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-medium text-academic-900 mb-1">{scholarship.name}</h3>
                    <div className="grid grid-cols-2 gap-4 mb-3">
                      <div>
                        <p className="text-xs text-academic-500">Applications</p>
                        <p className="text-sm font-medium text-academic-900">{scholarship.applications}</p>
                      </div>
                      <div>
                        <p className="text-xs text-academic-500">Recipients</p>
                        <p className="text-sm font-medium text-academic-900">
                          {scholarship.recipients}/{scholarship.maxRecipients}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-academic-500">
                        Deadline: {new Date(scholarship.deadline).toLocaleDateString()}
                      </span>
                      <span className="text-xs font-medium text-green-600">
                        ${scholarship.amount.toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <StatusBadge status={scholarship.status} size="sm" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Upcoming Deadlines */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-academic-900">Upcoming Deadlines</h2>
          <Link to="/admin/scholarships" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
            View Calendar
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {upcomingDeadlines.map((deadline) => (
            <div key={deadline.id} className="border border-academic-200 rounded-lg p-4">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-medium text-academic-900 text-sm">{deadline.name}</h3>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getDeadlineUrgency(deadline.daysLeft)}`}>
                  {deadline.daysLeft} days
                </span>
              </div>
              <div className="flex items-center justify-between text-xs text-academic-500">
                <span className="flex items-center">
                  <Calendar className="w-3 h-3 mr-1" />
                  {new Date(deadline.deadline).toLocaleDateString()}
                </span>
                <span className="flex items-center">
                  <FileText className="w-3 h-3 mr-1" />
                  {deadline.applications} apps
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card">
        <h2 className="text-lg font-semibold text-academic-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            to="/admin/scholarships/create"
            className="flex items-center p-4 border border-academic-200 rounded-lg hover:bg-academic-50 transition-colors"
          >
            <Award className="w-8 h-8 text-primary-600 mr-3" />
            <div>
              <p className="font-medium text-academic-900">Create Scholarship</p>
              <p className="text-sm text-academic-600">Add new program</p>
            </div>
          </Link>

          <Link
            to="/admin/applications?status=submitted"
            className="flex items-center p-4 border border-academic-200 rounded-lg hover:bg-academic-50 transition-colors"
          >
            <FileText className="w-8 h-8 text-primary-600 mr-3" />
            <div>
              <p className="font-medium text-academic-900">Review Applications</p>
              <p className="text-sm text-academic-600">Process submissions</p>
            </div>
          </Link>

          <Link
            to="/admin/reports"
            className="flex items-center p-4 border border-academic-200 rounded-lg hover:bg-academic-50 transition-colors"
          >
            <BarChart3 className="w-8 h-8 text-primary-600 mr-3" />
            <div>
              <p className="font-medium text-academic-900">View Reports</p>
              <p className="text-sm text-academic-600">Department analytics</p>
            </div>
          </Link>

          <Link
            to="/admin/notifications"
            className="flex items-center p-4 border border-academic-200 rounded-lg hover:bg-academic-50 transition-colors"
          >
            <Bell className="w-8 h-8 text-primary-600 mr-3" />
            <div>
              <p className="font-medium text-academic-900">Send Notifications</p>
              <p className="text-sm text-academic-600">Notify students</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CoordinatorDashboard;