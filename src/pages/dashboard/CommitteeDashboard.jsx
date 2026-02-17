import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  Star,
  TrendingUp,
  Calendar,
  BarChart3,
  Award,
  AlertTriangle,
  Target
} from 'lucide-react';
import { adminService } from '../../services/adminService';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { toast } from 'react-hot-toast';

const CommitteeDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await adminService.getDashboardStats();
      
      // Committee-specific data structure
      setDashboardData({
        stats: {
          assignedApplications: 89,
          reviewedToday: 12,
          pendingReview: 34,
          averageScore: 82.3,
          approvalRate: 68.5,
          totalReviewed: 156,
          highPriorityApps: 8,
          committeeMeetings: 2
        },
        reviewQueue: [
          {
            id: 1,
            studentName: 'Emma Wilson',
            scholarshipName: 'Academic Excellence Scholarship',
            amount: 8000,
            status: 'under_review',
            submittedDate: '2024-02-01',
            priority: 'high',
            score: null,
            department: 'Computer Science',
            gpa: 3.9,
            reviewDeadline: '2024-02-05'
          },
          {
            id: 2,
            studentName: 'James Rodriguez',
            scholarshipName: 'Leadership Development Grant',
            amount: 6500,
            status: 'under_review',
            submittedDate: '2024-01-30',
            priority: 'medium',
            score: 78,
            department: 'Business',
            gpa: 3.7,
            reviewDeadline: '2024-02-06'
          },
          {
            id: 3,
            studentName: 'Sarah Chen',
            scholarshipName: 'Innovation Research Award',
            amount: 10000,
            status: 'under_review',
            submittedDate: '2024-01-29',
            priority: 'high',
            score: 91,
            department: 'Engineering',
            gpa: 3.95,
            reviewDeadline: '2024-02-04'
          }
        ],
        recentDecisions: [
          {
            id: 1,
            studentName: 'Michael Brown',
            scholarshipName: 'Merit Scholarship',
            decision: 'approved',
            score: 88,
            reviewedDate: '2024-02-01',
            amount: 5000
          },
          {
            id: 2,
            studentName: 'Lisa Garcia',
            scholarshipName: 'STEM Excellence Award',
            decision: 'approved',
            score: 92,
            reviewedDate: '2024-02-01',
            amount: 7500
          },
          {
            id: 3,
            studentName: 'David Kim',
            scholarshipName: 'Community Service Grant',
            decision: 'rejected',
            score: 65,
            reviewedDate: '2024-01-31',
            amount: 3000
          }
        ],
        upcomingMeetings: [
          {
            id: 1,
            title: 'Weekly Review Meeting',
            date: '2024-02-05',
            time: '10:00 AM',
            agenda: 'Review high-priority applications',
            attendees: 8
          },
          {
            id: 2,
            title: 'Policy Discussion',
            date: '2024-02-08',
            time: '2:00 PM',
            agenda: 'Update evaluation criteria',
            attendees: 12
          }
        ],
        performanceMetrics: {
          reviewsThisWeek: 28,
          averageReviewTime: 45, // minutes
          consistencyScore: 94.2,
          feedbackRating: 4.7
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
    return <LoadingSpinner text="Loading committee dashboard..." />;
  }

  const { stats, reviewQueue, recentDecisions, upcomingMeetings, performanceMetrics } = dashboardData;

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getScoreColor = (score) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-blue-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getDeadlineUrgency = (deadline) => {
    const daysLeft = Math.ceil((new Date(deadline) - new Date()) / (1000 * 60 * 60 * 24));
    if (daysLeft <= 1) return 'text-red-600 bg-red-50';
    if (daysLeft <= 3) return 'text-yellow-600 bg-yellow-50';
    return 'text-green-600 bg-green-50';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-lg p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">Scholarship Committee Dashboard</h1>
        <p className="text-purple-100">
          Review applications and make scholarship award decisions
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-academic-600">Assigned Applications</p>
              <p className="text-2xl font-bold text-academic-900">{stats.assignedApplications}</p>
              <p className="text-xs text-yellow-600 flex items-center">
                <Clock className="w-3 h-3 mr-1" />
                {stats.pendingReview} pending
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
              <p className="text-sm font-medium text-academic-600">Reviewed Today</p>
              <p className="text-2xl font-bold text-academic-900">{stats.reviewedToday}</p>
              <p className="text-xs text-academic-500">
                Total: {stats.totalReviewed}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Star className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-academic-600">Average Score</p>
              <p className="text-2xl font-bold text-academic-900">{stats.averageScore}</p>
              <p className="text-xs text-green-600 flex items-center">
                <TrendingUp className="w-3 h-3 mr-1" />
                {stats.approvalRate}% approval rate
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-academic-600">High Priority</p>
              <p className="text-2xl font-bold text-academic-900">{stats.highPriorityApps}</p>
              <p className="text-xs text-academic-500">
                {stats.committeeMeetings} meetings scheduled
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <BarChart3 className="w-6 h-6 text-indigo-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-academic-600">Reviews This Week</p>
              <p className="text-2xl font-bold text-academic-900">{performanceMetrics.reviewsThisWeek}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-cyan-100 rounded-lg">
              <Clock className="w-6 h-6 text-cyan-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-academic-600">Avg Review Time</p>
              <p className="text-2xl font-bold text-academic-900">{performanceMetrics.averageReviewTime}m</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-emerald-100 rounded-lg">
              <Target className="w-6 h-6 text-emerald-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-academic-600">Consistency Score</p>
              <p className="text-2xl font-bold text-academic-900">{performanceMetrics.consistencyScore}%</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Star className="w-6 h-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-academic-600">Feedback Rating</p>
              <p className="text-2xl font-bold text-academic-900">{performanceMetrics.feedbackRating}/5</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Review Queue */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-academic-900">Priority Review Queue</h2>
            <Link to="/admin/applications" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
              View All
            </Link>
          </div>
          <div className="space-y-4">
            {reviewQueue.map((application) => (
              <div key={application.id} className="border border-academic-200 rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="font-medium text-academic-900">{application.studentName}</h3>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(application.priority)}`}>
                        {application.priority}
                      </span>
                    </div>
                    <p className="text-sm text-academic-600 mb-2">{application.scholarshipName}</p>
                    <div className="grid grid-cols-2 gap-4 mb-2">
                      <div>
                        <p className="text-xs text-academic-500">Department</p>
                        <p className="text-sm font-medium text-academic-900">{application.department}</p>
                      </div>
                      <div>
                        <p className="text-xs text-academic-500">GPA</p>
                        <p className="text-sm font-medium text-academic-900">{application.gpa}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-academic-500">
                        Amount: ${application.amount.toLocaleString()}
                      </span>
                      <span className={`text-xs font-medium px-2 py-1 rounded ${getDeadlineUrgency(application.reviewDeadline)}`}>
                        Due: {new Date(application.reviewDeadline).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end space-y-2">
                    {application.score && (
                      <span className={`text-sm font-bold ${getScoreColor(application.score)}`}>
                        {application.score}/100
                      </span>
                    )}
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

        {/* Recent Decisions */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-academic-900">Recent Decisions</h2>
            <Link to="/admin/applications?status=reviewed" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
              View History
            </Link>
          </div>
          <div className="space-y-4">
            {recentDecisions.map((decision) => (
              <div key={decision.id} className="border border-academic-200 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-medium text-academic-900 mb-1">{decision.studentName}</h3>
                    <p className="text-sm text-academic-600 mb-2">{decision.scholarshipName}</p>
                    <div className="flex items-center space-x-4 text-xs text-academic-500">
                      <span>
                        ${decision.amount.toLocaleString()}
                      </span>
                      <span>
                        {new Date(decision.reviewedDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end space-y-2">
                    <StatusBadge status={decision.decision} size="sm" />
                    <span className={`text-sm font-bold ${getScoreColor(decision.score)}`}>
                      {decision.score}/100
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Upcoming Meetings */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-academic-900">Upcoming Committee Meetings</h2>
          <Link to="/admin/meetings" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
            View Calendar
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {upcomingMeetings.map((meeting) => (
            <div key={meeting.id} className="border border-academic-200 rounded-lg p-4">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-medium text-academic-900">{meeting.title}</h3>
                <span className="text-xs text-academic-500">
                  {meeting.attendees} attendees
                </span>
              </div>
              <p className="text-sm text-academic-600 mb-3">{meeting.agenda}</p>
              <div className="flex items-center space-x-4 text-xs text-academic-500">
                <span className="flex items-center">
                  <Calendar className="w-3 h-3 mr-1" />
                  {new Date(meeting.date).toLocaleDateString()}
                </span>
                <span className="flex items-center">
                  <Clock className="w-3 h-3 mr-1" />
                  {meeting.time}
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
            to="/admin/applications?status=under_review&priority=high"
            className="flex items-center p-4 border border-academic-200 rounded-lg hover:bg-academic-50 transition-colors"
          >
            <AlertTriangle className="w-8 h-8 text-primary-600 mr-3" />
            <div>
              <p className="font-medium text-academic-900">High Priority Reviews</p>
              <p className="text-sm text-academic-600">Urgent applications</p>
            </div>
          </Link>

          <Link
            to="/admin/applications?status=submitted"
            className="flex items-center p-4 border border-academic-200 rounded-lg hover:bg-academic-50 transition-colors"
          >
            <FileText className="w-8 h-8 text-primary-600 mr-3" />
            <div>
              <p className="font-medium text-academic-900">New Submissions</p>
              <p className="text-sm text-academic-600">Recently submitted</p>
            </div>
          </Link>

          <Link
            to="/admin/reports"
            className="flex items-center p-4 border border-academic-200 rounded-lg hover:bg-academic-50 transition-colors"
          >
            <BarChart3 className="w-8 h-8 text-primary-600 mr-3" />
            <div>
              <p className="font-medium text-academic-900">Review Analytics</p>
              <p className="text-sm text-academic-600">Performance metrics</p>
            </div>
          </Link>

          <Link
            to="/admin/applications?status=approved"
            className="flex items-center p-4 border border-academic-200 rounded-lg hover:bg-academic-50 transition-colors"
          >
            <Award className="w-8 h-8 text-primary-600 mr-3" />
            <div>
              <p className="font-medium text-academic-900">Approved Awards</p>
              <p className="text-sm text-academic-600">Recent approvals</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CommitteeDashboard;