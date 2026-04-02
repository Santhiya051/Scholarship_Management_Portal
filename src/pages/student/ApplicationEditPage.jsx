import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { applicationService } from '../../services/applicationService';
import { ArrowLeft, Save, Send, AlertCircle } from 'lucide-react';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const ApplicationEditPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    personal_statement: '',
    career_goals: '',
    family_income: '',
    work_study_hours: ''
  });

  useEffect(() => {
    fetchApplication();
  }, [id]);

  const fetchApplication = async () => {
    try {
      const response = await applicationService.getApplicationById(id);
      const app = response.data.application;

      if (!['draft', 'pending_documents'].includes(app.status)) {
        navigate(`/applications/${id}`);
        return;
      }

      setApplication(app);
      setFormData({
        personal_statement: app.essays?.personal_statement || '',
        career_goals: app.essays?.career_goals || '',
        family_income: app.financial_info?.family_income || '',
        work_study_hours: app.financial_info?.work_study_hours || ''
      });
    } catch (err) {
      setError('Failed to load application.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      await applicationService.updateApplication(id, {
        essays: {
          personal_statement: formData.personal_statement,
          career_goals: formData.career_goals
        },
        financial_info: {
          ...application.financial_info,
          family_income: Number(formData.family_income) || 0,
          work_study_hours: Number(formData.work_study_hours) || 0
        }
      });
      navigate(`/applications/${id}`);
    } catch (err) {
      setError(err.message || 'Failed to save application.');
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.personal_statement.trim()) {
      setError('Personal statement is required before submitting.');
      return;
    }
    if (!window.confirm('Submit this application? You cannot edit it after submission.')) return;

    setSubmitting(true);
    setError('');
    try {
      // Save first, then submit
      await applicationService.updateApplication(id, {
        essays: {
          personal_statement: formData.personal_statement,
          career_goals: formData.career_goals
        },
        financial_info: {
          ...application?.financial_info,
          family_income: Number(formData.family_income) || 0,
          work_study_hours: Number(formData.work_study_hours) || 0
        }
      });
      await applicationService.submitApplication(id);
      navigate(`/applications/${id}`);
    } catch (err) {
      setError(err.message || 'Failed to submit application.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner text="Loading application..." />;

  if (error && !application) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-16 h-16 text-red-300 mx-auto mb-4" />
        <p className="text-academic-600 mb-4">{error}</p>
        <button onClick={() => navigate('/applications')} className="btn-primary">Back to Applications</button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <button onClick={() => navigate(`/applications/${id}`)} className="flex items-center text-academic-600 hover:text-academic-900">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Application
      </button>

      <div className="card">
        <h1 className="text-2xl font-bold text-academic-900 mb-1">Edit Application</h1>
        <p className="text-academic-600">{application?.scholarship?.name}</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center space-x-2">
          <AlertCircle className="w-5 h-5 text-red-500" />
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {/* Essays */}
      <div className="card space-y-4">
        <h2 className="text-lg font-semibold text-academic-900">Essays</h2>

        <div>
          <label className="block text-sm font-medium text-academic-700 mb-1">
            Personal Statement <span className="text-red-500">*</span>
          </label>
          <textarea
            name="personal_statement"
            value={formData.personal_statement}
            onChange={handleChange}
            rows={6}
            className="input-field resize-none"
            placeholder="Tell us about yourself, your achievements, and why you deserve this scholarship..."
          />
          <p className="text-xs text-academic-500 mt-1">{formData.personal_statement.length} characters</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-academic-700 mb-1">Career Goals</label>
          <textarea
            name="career_goals"
            value={formData.career_goals}
            onChange={handleChange}
            rows={4}
            className="input-field resize-none"
            placeholder="Describe your career goals and how this scholarship will help you achieve them..."
          />
        </div>
      </div>

      {/* Financial Info */}
      <div className="card space-y-4">
        <h2 className="text-lg font-semibold text-academic-900">Financial Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-academic-700 mb-1">Annual Family Income ($)</label>
            <input
              type="number"
              name="family_income"
              value={formData.family_income}
              onChange={handleChange}
              className="input-field"
              placeholder="e.g. 50000"
              min="0"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-academic-700 mb-1">Work-Study Hours per Week</label>
            <input
              type="number"
              name="work_study_hours"
              value={formData.work_study_hours}
              onChange={handleChange}
              className="input-field"
              placeholder="e.g. 10"
              min="0"
              max="40"
            />
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-2">
        <button onClick={() => navigate(`/applications/${id}`)} className="btn-secondary">
          Cancel
        </button>
        <div className="flex space-x-3">
          <button onClick={handleSave} disabled={saving || submitting} className="btn-secondary flex items-center space-x-2">
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save Draft'}</span>
          </button>
          <button onClick={handleSubmit} disabled={saving || submitting} className="btn-primary flex items-center space-x-2">
            <Send className="w-4 h-4" />
            <span>{submitting ? 'Submitting...' : 'Submit Application'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ApplicationEditPage;
