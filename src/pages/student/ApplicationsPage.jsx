import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { applicationService } from '../../services/applicationService';
import { FileText, Calendar, DollarSign, Eye, Edit, Trash2, Plus, Filter } from 'lucide-react';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import StatusBadge from '../../components/common/StatusBadge';

const ApplicationsPage = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');

  useEffect(() => {
    fetchApplications();
  }, [filter, sortBy, sortOrder]);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const response = await applicationService.getMyApplications({
        status: filter !== 'all' ? filter : undefined,
        sort: sortBy,
        order: sortOrder
      });
      setApplications(response.data.applications);
    } catch (error) {
      console.error('Error fetching applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteApplication = async (applicationId) => {
    if (window.confirm('Are you sure you want to delete this application?')) {
      try {
        await applicationService.deleteApplication(applicationId);
        setApplications(prev => prev.filter(app => app.id !== applicationId));
      } catch (error) {
        console.error('Error deleting application:', error);
      }
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      draft: 'bg-gray-100 text-gray-800',
      submitted: 'bg-blue-100 text-blue-800',
      under_review: 'bg-yellow-100 text-yellow-800',
      pending_documents: 'bg-orange-100 text-orange-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      withdrawn: 'bg-gray-100 text-gray-800'
    };
    return colors[status] || colors.draft;
  };

  const getStatusText = (status) => {
    const texts = {
      draft: 'Draft',
      submitted: 'Submitted',
      under_review: 'Under Review',
      pending_documents: 'Pending Documents',
      approved: 'Approved',
      rejected: 'Rejected',
      withdrawn: 'Withdrawn'
    };
    return texts[status] || status;
  };

  const canEdit = (status) => {
    return ['draft', 'pending_documents'].includes(status);
  };

  const canDelete = (status) => {
    return ['draft'].includes(status);
  };

  const filteredApplications = applications.filter(app => {
    if (filter === 'all') return true;
    return app.status === filter;
  });

  if (loading) {
    return <LoadingSpinner text="Loading applications..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-academic-900">My Applications</h1>
          <p className="text-academic-600">Track and manage your scholarship applications</p>
        </div>
        <Link to="/scholarships" className="btn-primary flex items-center space-x-2 mt-4 sm:mt-0">
          <Plus className="w-4 h-4" />
          <span>New Application</span>
        </Link>
      </div>

      {/* Filters and Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <div className="card">
            <h3 className="text-lg font-semibold text-academic-900 mb-4">Filter Applications</h3>
            <div className="space-y-2">
              {[
                { value: 'all', label: 'All Applications', count: applications.length },
                { value: 'draft', label: 'Drafts', count: applications.filter(a => a.status === 'draft').length },
                { value: 'submitted', label: 'Submitted', count: applications.filter(a => a.status === 'submitted').length },
                { value: 'under_review', label: 'Under Review', count: applications.filter(a => a.status === 'under_review').length },
                { value: 'approved', label: 'Approved', count: applications.filter(a => a.status === 'approved').length },
                { value: 'rejected', label: 'Rejected', count: applications.filter(a => a.status === 'rejected').length }
              ].map(({ value, label, count }) => (
                <button
                  key={value}
                  onClick={() => setFilter(value)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                    filter === value
                      ? 'bg-primary-100 text-primary-700 font-medium'
                      : 'text-academic-600 hover:bg-academic-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span>{label}</span>
                    <span className="text-xs bg-academic-200 text-academic-700 px-2 py-1 rounded-full">
                      {count}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-3">
          {/* Sort Controls */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Filter className="w-4 h-4 text-academic-600" />
                <span className="text-sm text-academic-600">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="text-sm border border-academic-300 rounded px-2 py-1"
                >
                  <option value="created_at">Date Created</option>
                  <option value="submitted_at">Date Submitted</option>
                  <option value="scholarship_name">Scholarship Name</option>
                  <option value="amount">Amount</option>
                  <option value="status">Status</option>
                </select>
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                  className="text-sm border border-academic-300 rounded px-2 py-1"
                >
                  <option value="desc">Descending</option>
                  <option value="asc">Ascending</option>
                </select>
              </div>
            </div>
            <div className="text-sm text-academic-600">
              {filteredApplications.length} applications
            </div>
          </div>

          {/* Applications List */}
          <div className="space-y-4">
            {filteredApplications.map((application) => (
              <div key={application.id} className="card hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-lg font-semibold text-academic-900">
                          {application.scholarship?.name || 'Unknown Scholarship'}
                        </h3>
                        <div className="flex items-center space-x-4 mt-1">
                          <div className="flex items-center text-sm text-academic-600">
                            <DollarSign className="w-4 h-4 mr-1" />
                            <span>${application.scholarship?.amount?.toLocaleString() || 'N/A'}</span>
                          </div>
                          <div className="flex items-center text-sm text-academic-600">
                            <Calendar className="w-4 h-4 mr-1" />
                            <span>
                              Applied: {new Date(application.created_at).toLocaleDateString()}
                            </span>
                          </div>
                          {application.submitted_at && (
                            <div className="flex items-center text-sm text-academic-600">
                              <FileText className="w-4 h-4 mr-1" />
                              <span>
                                Submitted: {new Date(application.submitted_at).toLocaleDateString()}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                      <StatusBadge 
                        status={application.status}
                        text={getStatusText(application.status)}
                      />
                    </div>

                    {application.scholarship?.application_deadline && (
                      <div className="text-sm text-academic-600 mb-3">
                        <span className="font-medium">Deadline:</span>{' '}
                        {new Date(application.scholarship.application_deadline).toLocaleDateString()}
                      </div>
                    )}

                    {application.rejection_reason && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-3">
                        <p className="text-sm text-red-800">
                          <span className="font-medium">Rejection Reason:</span> {application.rejection_reason}
                        </p>
                      </div>
                    )}

                    {application.notes && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
                        <p className="text-sm text-blue-800">
                          <span className="font-medium">Notes:</span> {application.notes}
                        </p>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-3 border-t border-academic-200">
                      <div className="text-sm text-academic-600">
                        {application.current_approval_step && (
                          <span>Current Step: {application.current_approval_step}</span>
                        )}
                        {application.score && (
                          <span className="ml-4">Score: {application.score}/100</span>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <Link
                          to={`/applications/${application.id}`}
                          className="btn-secondary text-sm px-3 py-1 flex items-center space-x-1"
                        >
                          <Eye className="w-3 h-3" />
                          <span>View</span>
                        </Link>
                        {canEdit(application.status) && (
                          <Link
                            to={`/applications/${application.id}/edit`}
                            className="btn-primary text-sm px-3 py-1 flex items-center space-x-1"
                          >
                            <Edit className="w-3 h-3" />
                            <span>Edit</span>
                          </Link>
                        )}
                        {canDelete(application.status) && (
                          <button
                            onClick={() => handleDeleteApplication(application.id)}
                            className="btn-danger text-sm px-3 py-1 flex items-center space-x-1"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>Delete</span>
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
              <FileText className="w-16 h-16 text-academic-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-academic-900 mb-2">
                {filter === 'all' ? 'No applications yet' : `No ${filter} applications`}
              </h3>
              <p className="text-academic-600 mb-4">
                {filter === 'all' 
                  ? 'Start by browsing available scholarships and submitting your first application.'
                  : `You don't have any ${filter} applications at the moment.`
                }
              </p>
              {filter === 'all' && (
                <Link to="/scholarships" className="btn-primary">
                  Browse Scholarships
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ApplicationsPage;