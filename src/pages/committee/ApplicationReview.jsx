import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  Search,
  Filter,
  Eye,
  Star,
  Clock,
  User,
  Award,
  Calendar,
  DollarSign,
  MessageSquare,
  CheckCircle,
  XCircle,
  AlertTriangle,
  BarChart3
} from 'lucide-react';
import { adminService } from '../../services/adminService';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Modal from '../../components/common/Modal';
import { toast } from 'react-hot-toast';

const ApplicationReview = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('under_review');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewData, setReviewData] = useState({
    score: '',
    decision: '',
    comments: '',
    criteria_scores: {
      academic_merit: '',
      financial_need: '',
      leadership: '',
      community_service: '',
      essay_quality: ''
    }
  });

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const response = await adminService.getAllApplicationsAdmin();
      // Add mock priority and review data for committee view
      const applicationsWithPriority = (Array.isArray(response.data) ? response.data : []).map(app => ({
        ...app,
        priority: Math.random() > 0.7 ? 'high' : Math.random() > 0.4 ? 'medium' : 'low',
        review_deadline: new Date(Date.now() + Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
        committee_notes: Math.random() > 0.5 ? 'Requires additional review' : null
      }));
      setApplications(applicationsWithPriority);
    } catch (error) {
      toast.error('Failed to fetch applications');
      console.error('Error fetching applications:', error);
      setApplications([]);
    } finally {
      setLoading(false);
    }
  };

  const handleReviewSubmit = async () => {
    try {
      const reviewPayload = {
        ...reviewData,
        score: parseFloat(reviewData.score),
        criteria_scores: Object.fromEntries(
          Object.entries(reviewData.criteria_scores).map(([key, value]) => [key, parseFloat(value) || 0])
        )
      };
      
      await adminService.reviewApplication(selectedApplication.id, reviewPayload);
      toast.success('Review submitted successfully');
      setShowReviewModal(false);
      setReviewData({
        score: '',
        decision: '',
        comments: '',
        criteria_scores: {
          academic_merit: '',
          financial_need: '',
          leadership: '',
          community_service: '',
          essay_quality: ''
        }
      });
      fetchApplications();
    } catch (error) {
      toast.error('Failed to submit review');
      console.error('Error submitting review:', error);
    }
  };

  const filteredApplications = applications.filter(application => {
    const matchesSearch = 
      application.student?.user?.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      application.student?.user?.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      application.scholarship?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || application.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || application.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });

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

  if (loading) {
    return <LoadingSpinner text="Loading applications for review..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-academic-900">Application Review</h1>
          <p className="text-academic-600 mt-1">Review and evaluate scholarship applications</p>
        </div>
        <div className="flex space-x-3">
          <Link
            to="/admin/reports"
            className="btn btn-secondary flex items-center space-x-2"
          >
            <BarChart3 className="w-4 h-4" />
            <span>Review Analytics</span>
          </Link>
        </div>
      </div>

      {/* Review Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-academic-600">Total Assigned</p>
              <p className="text-2xl font-bold text-academic-900">{applications.length}</p>
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
              <p className="text-2xl font-bold text-academic-900">
                {applications.filter(app => app.status === 'under_review' || app.status === 'submitted').length}
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
              <p className="text-2xl font-bold text-academic-900">
                {applications.filter(app => app.priority === 'high').length}
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
              <p className="text-sm font-medium text-academic-600">Avg Score</p>
              <p className="text-2xl font-bold text-academic-900">
                {applications.filter(app => app.score).length > 0 
                  ? Math.round(applications.filter(app => app.score).reduce((sum, app) => sum + app.score, 0) / applications.filter(app => app.score).length)
                  : 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-academic-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search applications..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input pl-10"
              />
            </div>
          </div>
          <div className="flex gap-4">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input"
            >
              <option value="all">All Status</option>
              <option value="submitted">Submitted</option>
              <option value="under_review">Under Review</option>
              <option value="pending_documents">Pending Documents</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="input"
            >
              <option value="all">All Priority</option>
              <option value="high">High Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="low">Low Priority</option>
            </select>
          </div>
        </div>
      </div>

      {/* Applications List */}
      <div className="space-y-4">
        {filteredApplications.map((application) => (
          <div key={application.id} className="card hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="flex-shrink-0 h-10 w-10">
                    <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                      <span className="text-sm font-medium text-primary-700">
                        {application.student?.user?.first_name?.[0]}{application.student?.user?.last_name?.[0]}
                      </span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-academic-900">
                      {application.student?.user?.first_name} {application.student?.user?.last_name}
                    </h3>
                    <p className="text-sm text-academic-600">{application.scholarship?.name}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(application.priority)}`}>
                      {application.priority}
                    </span>
                    <StatusBadge status={application.status} size="sm" />
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                  <div>
                    <p className="text-xs text-academic-500">Award Amount</p>
                    <p className="text-sm font-medium text-academic-900">
                      ${application.scholarship?.amount?.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-academic-500">Submitted</p>
                    <p className="text-sm font-medium text-academic-900">
                      {application.submitted_at ? new Date(application.submitted_at).toLocaleDateString() : 'Not submitted'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-academic-500">Review Deadline</p>
                    <p className={`text-sm font-medium ${getDeadlineUrgency(application.review_deadline).split(' ')[0]}`}>
                      {new Date(application.review_deadline).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-academic-500">Current Score</p>
                    <p className={`text-sm font-medium ${application.score ? getScoreColor(application.score) : 'text-academic-400'}`}>
                      {application.score ? `${application.score}/100` : 'Not scored'}
                    </p>
                  </div>
                </div>

                {application.committee_notes && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-3">
                    <div className="flex items-start space-x-2">
                      <MessageSquare className="w-4 h-4 text-yellow-600 mt-0.5" />
                      <p className="text-sm text-yellow-800">{application.committee_notes}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 text-xs text-academic-500">
                    <span className="flex items-center">
                      <User className="w-3 h-3 mr-1" />
                      {application.student?.department || 'N/A'}
                    </span>
                    <span className="flex items-center">
                      <BarChart3 className="w-3 h-3 mr-1" />
                      GPA: {application.student?.gpa || 'N/A'}
                    </span>
                    <span className="flex items-center">
                      <Calendar className="w-3 h-3 mr-1" />
                      Year {application.student?.year_of_study || 'N/A'}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Link
                      to={`/admin/applications/${application.id}`}
                      className="text-academic-400 hover:text-academic-600"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </Link>
                    {(application.status === 'submitted' || application.status === 'under_review') && (
                      <button
                        onClick={() => {
                          setSelectedApplication(application);
                          setShowReviewModal(true);
                        }}
                        className="btn btn-sm btn-primary"
                      >
                        Review
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredApplications.length === 0 && (
        <div className="text-center py-12">
          <FileText className="mx-auto h-12 w-12 text-academic-400" />
          <h3 className="mt-2 text-sm font-medium text-academic-900">No applications found</h3>
          <p className="mt-1 text-sm text-academic-500">
            {searchTerm || statusFilter !== 'all' || priorityFilter !== 'all'
              ? 'Try adjusting your search or filter criteria.'
              : 'No applications are currently assigned for review.'}
          </p>
        </div>
      )}

      {/* Review Modal */}
      <Modal
        isOpen={showReviewModal}
        onClose={() => {
          setShowReviewModal(false);
          setReviewData({
            score: '',
            decision: '',
            comments: '',
            criteria_scores: {
              academic_merit: '',
              financial_need: '',
              leadership: '',
              community_service: '',
              essay_quality: ''
            }
          });
        }}
        title="Review Application"
        size="lg"
      >
        {selectedApplication && (
          <div className="space-y-6">
            <div className="bg-academic-50 rounded-lg p-4">
              <h3 className="font-medium text-academic-900 mb-2">
                {selectedApplication.student?.user?.first_name} {selectedApplication.student?.user?.last_name}
              </h3>
              <p className="text-sm text-academic-600 mb-2">{selectedApplication.scholarship?.name}</p>
              <div className="flex items-center space-x-4 text-xs text-academic-500">
                <span>${selectedApplication.scholarship?.amount?.toLocaleString()}</span>
                <span>{selectedApplication.student?.department}</span>
                <span>GPA: {selectedApplication.student?.gpa}</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-academic-700 mb-2">
                Overall Decision
              </label>
              <select
                value={reviewData.decision}
                onChange={(e) => setReviewData({ ...reviewData, decision: e.target.value })}
                className="input"
                required
              >
                <option value="">Select decision...</option>
                <option value="approved">Approve</option>
                <option value="rejected">Reject</option>
                <option value="returned">Return for more information</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-academic-700 mb-2">
                Overall Score (0-100)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={reviewData.score}
                onChange={(e) => setReviewData({ ...reviewData, score: e.target.value })}
                className="input"
                placeholder="Enter overall score..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-academic-700 mb-3">
                Criteria Scores (0-20 each)
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(reviewData.criteria_scores).map(([criteria, score]) => (
                  <div key={criteria}>
                    <label className="block text-xs font-medium text-academic-600 mb-1 capitalize">
                      {criteria.replace('_', ' ')}
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="20"
                      value={score}
                      onChange={(e) => setReviewData({
                        ...reviewData,
                        criteria_scores: {
                          ...reviewData.criteria_scores,
                          [criteria]: e.target.value
                        }
                      })}
                      className="input"
                      placeholder="0-20"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-academic-700 mb-2">
                Review Comments
              </label>
              <textarea
                value={reviewData.comments}
                onChange={(e) => setReviewData({ ...reviewData, comments: e.target.value })}
                className="input"
                rows="4"
                placeholder="Enter your detailed review comments..."
                required
              />
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowReviewModal(false);
                  setReviewData({
                    score: '',
                    decision: '',
                    comments: '',
                    criteria_scores: {
                      academic_merit: '',
                      financial_need: '',
                      leadership: '',
                      community_service: '',
                      essay_quality: ''
                    }
                  });
                }}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleReviewSubmit}
                className="btn btn-primary"
                disabled={!reviewData.decision || !reviewData.comments}
              >
                Submit Review
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ApplicationReview;