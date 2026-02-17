import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  Search,
  Filter,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  User,
  Award,
  Calendar,
  DollarSign,
  Download,
  MessageSquare
} from 'lucide-react';
import { adminService } from '../../services/adminService';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Avatar from '../../components/common/Avatar';
import Modal from '../../components/common/Modal';
import { toast } from 'react-hot-toast';

const ApplicationsManagement = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [scholarshipFilter, setScholarshipFilter] = useState('all');
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewData, setReviewData] = useState({
    action: '',
    comments: '',
    score: ''
  });

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const response = await adminService.getAllApplicationsAdmin();
      // Ensure we always have an array
      setApplications(Array.isArray(response.data) ? response.data : response.applications || []);
    } catch (error) {
      toast.error('Failed to fetch applications');
      console.error('Error fetching applications:', error);
      setApplications([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const handleReviewApplication = async () => {
    try {
      await adminService.reviewApplication(selectedApplication.id, reviewData);
      toast.success('Application reviewed successfully');
      setShowReviewModal(false);
      setReviewData({ action: '', comments: '', score: '' });
      fetchApplications();
    } catch (error) {
      toast.error('Failed to review application');
      console.error('Error reviewing application:', error);
    }
  };

  const handleExportApplications = () => {
    try {
      // Convert applications to CSV
      const headers = ['Student Name', 'Email', 'Scholarship', 'Status', 'Score', 'Submitted Date'];
      const csvData = filteredApplications.map(app => [
        `${app.student?.first_name || ''} ${app.student?.last_name || ''}`,
        app.student?.email || '',
        app.scholarship?.name || '',
        app.status || '',
        app.score || 'N/A',
        app.submitted_at ? new Date(app.submitted_at).toLocaleDateString() : 'N/A'
      ]);

      const csvContent = [
        headers.join(','),
        ...csvData.map(row => row.map(cell => `"${cell}"`).join(','))
      ].join('\n');

      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `applications_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success('Applications exported successfully');
    } catch (error) {
      toast.error('Failed to export applications');
      console.error('Error exporting applications:', error);
    }
  };

  const filteredApplications = applications.filter(application => {
    const matchesSearch = 
      application.student?.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      application.student?.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      application.scholarship?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || application.status === statusFilter;
    const matchesScholarship = scholarshipFilter === 'all' || application.scholarship?.id === scholarshipFilter;

    return matchesSearch && matchesStatus && matchesScholarship;
  });

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'rejected': return <XCircle className="w-4 h-4 text-red-600" />;
      case 'under_review': return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'pending_documents': return <FileText className="w-4 h-4 text-orange-600" />;
      default: return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const getPriorityColor = (deadline) => {
    const daysUntilDeadline = Math.ceil((new Date(deadline) - new Date()) / (1000 * 60 * 60 * 24));
    if (daysUntilDeadline < 7) return 'text-red-600 bg-red-50';
    if (daysUntilDeadline < 30) return 'text-yellow-600 bg-yellow-50';
    return 'text-green-600 bg-green-50';
  };

  if (loading) {
    return <LoadingSpinner text="Loading applications..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-academic-900">Applications Management</h1>
          <p className="text-academic-600 mt-1">Review and manage scholarship applications</p>
        </div>
        <div className="flex space-x-3">
          <button 
            onClick={handleExportApplications}
            className="btn btn-secondary flex items-center space-x-2"
          >
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-academic-600">Total Applications</p>
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
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-academic-600">Approved</p>
              <p className="text-2xl font-bold text-academic-900">
                {applications.filter(app => app.status === 'approved').length}
              </p>
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
              <p className="text-2xl font-bold text-academic-900">
                {applications.filter(app => app.status === 'rejected').length}
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
              <option value="draft">Draft</option>
              <option value="submitted">Submitted</option>
              <option value="under_review">Under Review</option>
              <option value="pending_documents">Pending Documents</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="withdrawn">Withdrawn</option>
            </select>
            <select
              value={scholarshipFilter}
              onChange={(e) => setScholarshipFilter(e.target.value)}
              className="input"
            >
              <option value="all">All Scholarships</option>
              {/* Add scholarship options dynamically */}
            </select>
          </div>
        </div>
      </div>

      {/* Applications Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-academic-200">
            <thead className="bg-academic-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-academic-500 uppercase tracking-wider">
                  Student
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-academic-500 uppercase tracking-wider">
                  Scholarship
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-academic-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-academic-500 uppercase tracking-wider">
                  Score
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-academic-500 uppercase tracking-wider">
                  Submitted
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-academic-500 uppercase tracking-wider">
                  Priority
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-academic-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-academic-200">
              {filteredApplications.map((application) => (
                <tr key={application.id} className="hover:bg-academic-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Avatar 
                        user={{
                          first_name: application.student?.first_name,
                          last_name: application.student?.last_name
                        }}
                        size="md"
                      />
                      <div className="ml-3">
                        <div className="text-sm font-medium text-academic-900">
                          {application.student?.first_name} {application.student?.last_name}
                        </div>
                        <div className="text-sm text-academic-500">
                          {application.student?.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-academic-900">
                      {application.scholarship?.name}
                    </div>
                    <div className="text-sm text-academic-500 flex items-center">
                      <DollarSign className="w-3 h-3 mr-1" />
                      ${application.scholarship?.amount?.toLocaleString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(application.status)}
                      <StatusBadge status={application.status} size="sm" />
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-academic-900">
                      {application.score ? `${application.score}/100` : 'Not scored'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-academic-500">
                    {application.submitted_at ? (
                      <div className="flex items-center">
                        <Calendar className="w-3 h-3 mr-1" />
                        {new Date(application.submitted_at).toLocaleDateString()}
                      </div>
                    ) : (
                      'Not submitted'
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      getPriorityColor(application.scholarship?.application_deadline)
                    }`}>
                      {Math.ceil((new Date(application.scholarship?.application_deadline) - new Date()) / (1000 * 60 * 60 * 24))} days
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => {
                          setSelectedApplication(application);
                          setShowApplicationModal(true);
                        }}
                        className="text-academic-400 hover:text-academic-600"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      {(application.status === 'submitted' || application.status === 'under_review') && (
                        <button
                          onClick={() => {
                            setSelectedApplication(application);
                            setShowReviewModal(true);
                          }}
                          className="text-primary-600 hover:text-primary-900"
                          title="Review Application"
                        >
                          <MessageSquare className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredApplications.length === 0 && (
          <div className="text-center py-12">
            <FileText className="mx-auto h-12 w-12 text-academic-400" />
            <h3 className="mt-2 text-sm font-medium text-academic-900">No applications found</h3>
            <p className="mt-1 text-sm text-academic-500">
              {searchTerm || statusFilter !== 'all' || scholarshipFilter !== 'all'
                ? 'Try adjusting your search or filter criteria.'
                : 'No applications have been submitted yet.'}
            </p>
          </div>
        )}
      </div>

      {/* Application Details Modal */}
      <Modal
        isOpen={showApplicationModal}
        onClose={() => {
          setShowApplicationModal(false);
          setSelectedApplication(null);
        }}
        title="Application Details"
        size="lg"
      >
        {selectedApplication && (
          <div className="space-y-6">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-xl font-semibold text-academic-900">
                  {selectedApplication.student?.first_name} {selectedApplication.student?.last_name}
                </h3>
                <p className="text-academic-600">{selectedApplication.scholarship?.name}</p>
                <div className="flex items-center space-x-2 mt-2">
                  <StatusBadge status={selectedApplication.status} size="sm" />
                  {selectedApplication.score && (
                    <span className="text-sm text-academic-500">
                      Score: {selectedApplication.score}/100
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-academic-900 mb-3">Personal Information</h4>
                <div className="space-y-2">
                  {selectedApplication.personal_info && Object.entries(selectedApplication.personal_info).map(([key, value]) => (
                    <div key={key}>
                      <label className="block text-sm font-medium text-academic-700 capitalize">
                        {key.replace('_', ' ')}
                      </label>
                      <p className="text-sm text-academic-900">{value}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-medium text-academic-900 mb-3">Academic Information</h4>
                <div className="space-y-2">
                  {selectedApplication.academic_info && Object.entries(selectedApplication.academic_info).map(([key, value]) => (
                    <div key={key}>
                      <label className="block text-sm font-medium text-academic-700 capitalize">
                        {key.replace('_', ' ')}
                      </label>
                      <p className="text-sm text-academic-900">{value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {selectedApplication.essays && Object.keys(selectedApplication.essays).length > 0 && (
              <div>
                <h4 className="font-medium text-academic-900 mb-3">Essays</h4>
                <div className="space-y-4">
                  {Object.entries(selectedApplication.essays).map(([key, value]) => (
                    <div key={key}>
                      <label className="block text-sm font-medium text-academic-700 capitalize mb-2">
                        {key.replace('_', ' ')}
                      </label>
                      <div className="bg-academic-50 p-3 rounded-lg">
                        <p className="text-sm text-academic-900 whitespace-pre-wrap">{value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedApplication.financial_info && Object.keys(selectedApplication.financial_info).length > 0 && (
              <div>
                <h4 className="font-medium text-academic-900 mb-3">Financial Information</h4>
                <div className="grid grid-cols-2 gap-4">
                  {Object.entries(selectedApplication.financial_info).map(([key, value]) => (
                    <div key={key}>
                      <label className="block text-sm font-medium text-academic-700 capitalize">
                        {key.replace('_', ' ')}
                      </label>
                      <p className="text-sm text-academic-900">{value}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-3">
              {(selectedApplication.status === 'submitted' || selectedApplication.status === 'under_review') && (
                <button
                  onClick={() => {
                    setShowApplicationModal(false);
                    setShowReviewModal(true);
                  }}
                  className="btn btn-primary"
                >
                  Review Application
                </button>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Review Modal */}
      <Modal
        isOpen={showReviewModal}
        onClose={() => {
          setShowReviewModal(false);
          setReviewData({ action: '', comments: '', score: '' });
        }}
        title="Review Application"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-academic-700 mb-2">
              Decision
            </label>
            <select
              value={reviewData.action}
              onChange={(e) => setReviewData({ ...reviewData, action: e.target.value })}
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
              Score (0-100)
            </label>
            <input
              type="number"
              min="0"
              max="100"
              value={reviewData.score}
              onChange={(e) => setReviewData({ ...reviewData, score: e.target.value })}
              className="input"
              placeholder="Enter score..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-academic-700 mb-2">
              Comments
            </label>
            <textarea
              value={reviewData.comments}
              onChange={(e) => setReviewData({ ...reviewData, comments: e.target.value })}
              className="input"
              rows="4"
              placeholder="Enter your review comments..."
              required
            />
          </div>

          <div className="flex justify-end space-x-3">
            <button
              onClick={() => {
                setShowReviewModal(false);
                setReviewData({ action: '', comments: '', score: '' });
              }}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button
              onClick={handleReviewApplication}
              className="btn btn-primary"
              disabled={!reviewData.action || !reviewData.comments}
            >
              Submit Review
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ApplicationsManagement;