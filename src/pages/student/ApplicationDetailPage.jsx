import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { applicationService } from '../../services/applicationService';
import {
  ArrowLeft, FileText, Calendar, DollarSign, CheckCircle,
  AlertCircle, Clock, Edit, Send
} from 'lucide-react';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import StatusBadge from '../../components/common/StatusBadge';

const ApplicationDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchApplication();
  }, [id]);

  const fetchApplication = async () => {
    try {
      const response = await applicationService.getApplicationById(id);
      setApplication(response.data.application);
    } catch (err) {
      setError('Failed to load application.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!window.confirm('Submit this application? You cannot edit it after submission.')) return;
    setSubmitting(true);
    try {
      await applicationService.submitApplication(id);
      await fetchApplication();
    } catch (err) {
      setError(err.message || 'Failed to submit application.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner text="Loading application..." />;

  if (error || !application) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-16 h-16 text-red-300 mx-auto mb-4" />
        <p className="text-academic-600 mb-4">{error || 'Application not found.'}</p>
        <Link to="/applications" className="btn-primary">Back to Applications</Link>
      </div>
    );
  }

  const { scholarship, status } = application;
  const canEdit = ['draft', 'pending_documents'].includes(status);
  const canSubmit = status === 'draft';

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <button onClick={() => navigate('/applications')} className="flex items-center text-academic-600 hover:text-academic-900">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Applications
      </button>

      {/* Header */}
      <div className="card">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-academic-900">{scholarship?.name}</h1>
            <p className="text-academic-600 mt-1">Application #{application.id?.slice(0, 8)}</p>
          </div>
          <StatusBadge status={status} />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
          <div className="flex items-center text-academic-600">
            <DollarSign className="w-4 h-4 mr-2" />
            <div>
              <p className="text-xs text-academic-500">Amount</p>
              <p className="font-medium">${scholarship?.amount?.toLocaleString()}</p>
            </div>
          </div>
          <div className="flex items-center text-academic-600">
            <Calendar className="w-4 h-4 mr-2" />
            <div>
              <p className="text-xs text-academic-500">Applied</p>
              <p className="font-medium">{new Date(application.created_at).toLocaleDateString()}</p>
            </div>
          </div>
          {application.submitted_at && (
            <div className="flex items-center text-academic-600">
              <FileText className="w-4 h-4 mr-2" />
              <div>
                <p className="text-xs text-academic-500">Submitted</p>
                <p className="font-medium">{new Date(application.submitted_at).toLocaleDateString()}</p>
              </div>
            </div>
          )}
        </div>

        {application.notes && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
            <p className="text-sm text-blue-800"><span className="font-medium">Notes:</span> {application.notes}</p>
          </div>
        )}
        {application.rejection_reason && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
            <p className="text-sm text-red-800"><span className="font-medium">Rejection Reason:</span> {application.rejection_reason}</p>
          </div>
        )}

        <div className="flex space-x-3 pt-4 border-t border-academic-200">
          {canEdit && (
            <Link to={`/applications/${id}/edit`} className="btn-primary flex items-center space-x-2">
              <Edit className="w-4 h-4" /><span>Edit Application</span>
            </Link>
          )}
          {canSubmit && (
            <button onClick={handleSubmit} disabled={submitting} className="btn-secondary flex items-center space-x-2">
              <Send className="w-4 h-4" /><span>{submitting ? 'Submitting...' : 'Submit Application'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Personal Info */}
      {application.personal_info && (
        <div className="card">
          <h2 className="text-lg font-semibold text-academic-900 mb-4">Personal Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            {Object.entries(application.personal_info).map(([key, val]) => (
              <div key={key}>
                <p className="text-academic-500 capitalize">{key.replace(/_/g, ' ')}</p>
                <p className="text-academic-900 font-medium">{String(val)}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Academic Info */}
      {application.academic_info && (
        <div className="card">
          <h2 className="text-lg font-semibold text-academic-900 mb-4">Academic Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            {Object.entries(application.academic_info).map(([key, val]) => (
              <div key={key}>
                <p className="text-academic-500 capitalize">{key.replace(/_/g, ' ')}</p>
                <p className="text-academic-900 font-medium">{String(val)}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Essays */}
      {application.essays && (
        <div className="card">
          <h2 className="text-lg font-semibold text-academic-900 mb-4">Essays</h2>
          <div className="space-y-4">
            {application.essays.personal_statement && (
              <div>
                <p className="text-sm font-medium text-academic-700 mb-1">Personal Statement</p>
                <p className="text-academic-900 text-sm bg-academic-50 rounded p-3">{application.essays.personal_statement}</p>
              </div>
            )}
            {application.essays.career_goals && (
              <div>
                <p className="text-sm font-medium text-academic-700 mb-1">Career Goals</p>
                <p className="text-academic-900 text-sm bg-academic-50 rounded p-3">{application.essays.career_goals}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Approval History */}
      {application.approval_history && application.approval_history.length > 0 && (
        <div className="card">
          <h2 className="text-lg font-semibold text-academic-900 mb-4">Approval History</h2>
          <div className="space-y-3">
            {application.approval_history.map((step, i) => (
              <div key={i} className="flex items-start space-x-3 p-3 bg-academic-50 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-academic-900 capitalize">{step.step} - {step.action}</p>
                  <p className="text-xs text-academic-500">{step.reviewer} · {new Date(step.date).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ApplicationDetailPage;
