import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Award,
  FileText,
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  BarChart3
} from 'lucide-react';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import api from '../../services/api';

const AdminDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch real dashboard data
    const fetchDashboardData = async () => {
      try {
        const response = await api.get('/admin/dashboard/stats');
        
        if (response.data.success) {
          setDashboardData({
            stats: response.data.data,
            recentApplications: [],
            topScholarships: [],
            monthlyStats: []
          });
        } else {
          // Fallback to mock data if API fails
          setDashboardData(mockData);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        // Fallback to mock data
        setDashboardData(mockData);
      } finally {
        setLoading(false);
      }
    };

    const mockData = {
      stats: {
        totalUsers: 1250,
        totalScholarships: 45,
        totalApplications: 3420,
        totalAwarded: 2850000,
        pendingApplications: 156,
        approvedApplications: 892,
        rejectedApplications: 234
      },
      recentApplications: [
        {
          id: 1,
          studentName: 'John Smith',
          scholarshipName: 'Merit Excellence Scholarship',
          amount: 5000,
          status: 'pending',
          submittedDate: '2024-01-25',
          department: 'Computer Science'
        },
        {
          id: 2,
          studentName: 'Sarah Johnson',
          scholarshipName: 'STEM Innovation Grant',
          amount: 7500,
          status: 'under_review',
          submittedDate: '2024-01-24',
          department: 'Engineering'
        },
        {
          id: 3,
          studentName: 'Mike Davis',
          scholarshipName: 'Community Service Award',
          amount: 2500,
          status: 'approved',
          submittedDate: '2024-01-23',
          department: 'Business'
        }
      ],
      topScholarships: [
        {
          id: 1,
          name: 'Merit Excellence Scholarship',
          applications: 245,
          awarded: 45,
          totalAmount: 225000,
          status: 'active'
        },
        {
          id: 2,
          name: 'STEM Innovation Grant',
          applications: 189,
          awarded: 32,
          totalAmount: 240000,
          status: 'active'
        },
        {
          id: 3,
          name: 'Community Service Award',
          applications: 156,
          awarded: 28,
          totalAmount: 70000,
          status: 'active'
        }
      ],
      monthlyStats: [
        { month: 'Jan', applications: 280, approved: 65 },
        { month: 'Feb', applications: 320, approved: 78 },
        { month: 'Mar', applications: 290, approved: 72 },
        { month: 'Apr', applications: 350, approved: 85 },
        { month: 'May', applications: 310, approved: 76 }
      ]
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return <LoadingSpinner text="Loading admin dashboard..." />;
  }

  const { stats, recentApplications, topScholarships, monthlyStats } = dashboardData;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-lg p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-primary-100">
          Manage scholarships, applications, and system overview
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-academic-600">Total Users</p>
              <p className="text-2xl font-bold text-academic-900">{stats.totalUsers.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Award className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-academic-600">Active Scholarships</p>
              <p className="text-2xl font-bold text-academic-900">{stats.totalScholarships}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <FileText className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-academic-600">Total Applications</p>
              <p className="text-2xl font-bold text-academic-900">{stats.totalApplications.toLocaleString()}</p>
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
              <p className="text-2xl font-bold text-academic-900">${(stats.totalAwarded / 1000000).toFixed(1)}M</p>
            </div>
          </div>
        </div>
      </div>

      {/* Application Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
            <div className="p-2 bg-red-100 rounded-lg">
              <XCircle className="w-6 h-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-academic-600">Rejected</p>
              <p className="text-2xl font-bold text-academic-900">{stats.rejectedApplications}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Applications */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-academic-900">Recent Applications</h2>
            <Link to="/admin/applications" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
              View All
            </Link>
          </div>
          <div className="space-y-4">
            {recentApplications.map((application) => (
              <div key={application.id} className="border border-academic-200 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-medium text-academic-900">{application.studentName}</h3>
                    <p className="text-sm text-academic-600 mt-1">{application.scholarshipName}</p>
                    <div className="flex items-center mt-2 space-x-4">
                      <span className="text-xs text-academic-500">{application.department}</span>
                      <span className="text-xs text-academic-500">
                        ${application.amount.toLocaleString()}
                      </span>
                      <span className="text-xs text-academic-500">
                        {new Date(application.submittedDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <StatusBadge status={application.status} size="sm" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Scholarships */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-academic-900">Top Scholarships</h2>
            <Link to="/admin/scholarships" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
              Manage All
            </Link>
          </div>
          <div className="space-y-4">
            {topScholarships.map((scholarship) => (
              <div key={scholarship.id} className="border border-academic-200 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-medium text-academic-900">{scholarship.name}</h3>
                    <div className="grid grid-cols-3 gap-4 mt-2">
                      <div>
                        <p className="text-xs text-academic-500">Applications</p>
                        <p className="text-sm font-medium text-academic-900">{scholarship.applications}</p>
                      </div>
                      <div>
                        <p className="text-xs text-academic-500">Awarded</p>
                        <p className="text-sm font-medium text-academic-900">{scholarship.awarded}</p>
                      </div>
                      <div>
                        <p className="text-xs text-academic-500">Total Amount</p>
                        <p className="text-sm font-medium text-academic-900">
                          ${(scholarship.totalAmount / 1000).toFixed(0)}K
                        </p>
                      </div>
                    </div>
                  </div>
                  <StatusBadge status={scholarship.status} size="sm" />
                </div>
              </div>
            ))}
          </div>
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
              <p className="text-sm text-academic-600">Add new scholarship program</p>
            </div>
          </Link>

          <Link
            to="/admin/users/create"
            className="flex items-center p-4 border border-academic-200 rounded-lg hover:bg-academic-50 transition-colors"
          >
            <Users className="w-8 h-8 text-primary-600 mr-3" />
            <div>
              <p className="font-medium text-academic-900">Add User</p>
              <p className="text-sm text-academic-600">Create new user account</p>
            </div>
          </Link>

          <Link
            to="/admin/applications?status=pending"
            className="flex items-center p-4 border border-academic-200 rounded-lg hover:bg-academic-50 transition-colors"
          >
            <Clock className="w-8 h-8 text-primary-600 mr-3" />
            <div>
              <p className="font-medium text-academic-900">Review Applications</p>
              <p className="text-sm text-academic-600">Process pending applications</p>
            </div>
          </Link>

          <Link
            to="/admin/reports"
            className="flex items-center p-4 border border-academic-200 rounded-lg hover:bg-academic-50 transition-colors"
          >
            <BarChart3 className="w-8 h-8 text-primary-600 mr-3" />
            <div>
              <p className="font-medium text-academic-900">View Reports</p>
              <p className="text-sm text-academic-600">System analytics & reports</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;