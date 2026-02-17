import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Award, DollarSign, Calendar, Users, FileText } from 'lucide-react';
import { adminService } from '../../services/adminService';
import { toast } from 'react-hot-toast';

const CreateScholarship = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    amount: '',
    total_funding: '',
    max_recipients: '',
    application_deadline: '',
    award_date: '',
    academic_year: new Date().getFullYear() + '-' + (new Date().getFullYear() + 1),
    department: 'all',
    min_gpa: '',
    requirements: [''],
    is_renewable: false,
    renewal_criteria: {},
    year_of_study: [1, 2, 3, 4],
    criteria: {},
    status: 'draft'
  });

  const departments = [
    'all',
    'Computer Science',
    'Engineering',
    'Business',
    'Medicine',
    'Arts',
    'Sciences',
    'Education',
    'Law'
  ];

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleRequirementChange = (index, value) => {
    const newRequirements = [...formData.requirements];
    newRequirements[index] = value;
    setFormData(prev => ({
      ...prev,
      requirements: newRequirements
    }));
  };

  const addRequirement = () => {
    setFormData(prev => ({
      ...prev,
      requirements: [...prev.requirements, '']
    }));
  };

  const removeRequirement = (index) => {
    const newRequirements = formData.requirements.filter((_, i) => i !== index);
    setFormData(prev => ({
      ...prev,
      requirements: newRequirements
    }));
  };

  const handleYearOfStudyChange = (year) => {
    const newYears = formData.year_of_study.includes(year)
      ? formData.year_of_study.filter(y => y !== year)
      : [...formData.year_of_study, year];
    
    setFormData(prev => ({
      ...prev,
      year_of_study: newYears
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (parseFloat(formData.amount) <= 0) {
      toast.error('Award amount must be greater than 0');
      return;
    }

    if (parseInt(formData.max_recipients) <= 0) {
      toast.error('Maximum recipients must be greater than 0');
      return;
    }

    if (new Date(formData.application_deadline) <= new Date()) {
      toast.error('Application deadline must be in the future');
      return;
    }

    try {
      setLoading(true);
      const scholarshipData = {
        ...formData,
        amount: parseFloat(formData.amount),
        total_funding: parseFloat(formData.total_funding) || parseFloat(formData.amount) * parseInt(formData.max_recipients),
        max_recipients: parseInt(formData.max_recipients),
        min_gpa: formData.min_gpa ? parseFloat(formData.min_gpa) : null,
        requirements: formData.requirements.filter(req => req.trim() !== '')
      };
      
      await adminService.createScholarship(scholarshipData);
      toast.success('Scholarship created successfully');
      navigate('/admin/scholarships');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create scholarship');
      console.error('Error creating scholarship:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <button
          onClick={() => navigate('/admin/scholarships')}
          className="p-2 text-academic-600 hover:text-academic-900 hover:bg-academic-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-academic-900">Create New Scholarship</h1>
          <p className="text-academic-600 mt-1">Set up a new scholarship program</p>
        </div>
      </div>

      {/* Form */}
      <div className="card max-w-4xl">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div>
            <h3 className="text-lg font-medium text-academic-900 mb-4 flex items-center">
              <Award className="w-5 h-5 mr-2" />
              Basic Information
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-academic-700 mb-2">
                  Scholarship Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="input"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-academic-700 mb-2">
                  Description *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="4"
                  className="input"
                  required
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-academic-700 mb-2">
                    Academic Year *
                  </label>
                  <input
                    type="text"
                    name="academic_year"
                    value={formData.academic_year}
                    onChange={handleInputChange}
                    className="input"
                    placeholder="2024-2025"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-academic-700 mb-2">
                    Department
                  </label>
                  <select
                    name="department"
                    value={formData.department}
                    onChange={handleInputChange}
                    className="input"
                  >
                    {departments.map((dept) => (
                      <option key={dept} value={dept}>
                        {dept === 'all' ? 'All Departments' : dept}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Financial Details */}
          <div>
            <h3 className="text-lg font-medium text-academic-900 mb-4 flex items-center">
              <DollarSign className="w-5 h-5 mr-2" />
              Financial Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-academic-700 mb-2">
                  Award Amount ($) *
                </label>
                <input
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleInputChange}
                  className="input"
                  min="1"
                  step="0.01"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-academic-700 mb-2">
                  Maximum Recipients *
                </label>
                <input
                  type="number"
                  name="max_recipients"
                  value={formData.max_recipients}
                  onChange={handleInputChange}
                  className="input"
                  min="1"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-academic-700 mb-2">
                  Total Funding ($)
                </label>
                <input
                  type="number"
                  name="total_funding"
                  value={formData.total_funding}
                  onChange={handleInputChange}
                  className="input"
                  min="1"
                  step="0.01"
                  placeholder="Auto-calculated if empty"
                />
              </div>
            </div>
          </div>

          {/* Dates */}
          <div>
            <h3 className="text-lg font-medium text-academic-900 mb-4 flex items-center">
              <Calendar className="w-5 h-5 mr-2" />
              Important Dates
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-academic-700 mb-2">
                  Application Deadline *
                </label>
                <input
                  type="datetime-local"
                  name="application_deadline"
                  value={formData.application_deadline}
                  onChange={handleInputChange}
                  className="input"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-academic-700 mb-2">
                  Award Date
                </label>
                <input
                  type="datetime-local"
                  name="award_date"
                  value={formData.award_date}
                  onChange={handleInputChange}
                  className="input"
                />
              </div>
            </div>
          </div>

          {/* Eligibility Criteria */}
          <div>
            <h3 className="text-lg font-medium text-academic-900 mb-4 flex items-center">
              <Users className="w-5 h-5 mr-2" />
              Eligibility Criteria
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-academic-700 mb-2">
                  Minimum GPA
                </label>
                <input
                  type="number"
                  name="min_gpa"
                  value={formData.min_gpa}
                  onChange={handleInputChange}
                  className="input"
                  min="0"
                  max="4"
                  step="0.01"
                  placeholder="e.g., 3.0"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-academic-700 mb-2">
                  Eligible Year of Study
                </label>
                <div className="flex flex-wrap gap-3">
                  {[1, 2, 3, 4].map((year) => (
                    <label key={year} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.year_of_study.includes(year)}
                        onChange={() => handleYearOfStudyChange(year)}
                        className="rounded border-academic-300 text-primary-600 focus:ring-primary-500"
                      />
                      <span className="ml-2 text-sm text-academic-700">
                        Year {year}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Requirements */}
          <div>
            <h3 className="text-lg font-medium text-academic-900 mb-4 flex items-center">
              <FileText className="w-5 h-5 mr-2" />
              Requirements
            </h3>
            <div className="space-y-3">
              {formData.requirements.map((requirement, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={requirement}
                    onChange={(e) => handleRequirementChange(index, e.target.value)}
                    className="input flex-1"
                    placeholder="Enter requirement..."
                  />
                  {formData.requirements.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeRequirement(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={addRequirement}
                className="text-primary-600 hover:text-primary-800 text-sm font-medium"
              >
                + Add Requirement
              </button>
            </div>
          </div>

          {/* Renewal Settings */}
          <div>
            <h3 className="text-lg font-medium text-academic-900 mb-4">
              Renewal Settings
            </h3>
            <label className="flex items-center">
              <input
                type="checkbox"
                name="is_renewable"
                checked={formData.is_renewable}
                onChange={handleInputChange}
                className="rounded border-academic-300 text-primary-600 focus:ring-primary-500"
              />
              <span className="ml-2 text-sm text-academic-700">
                This scholarship is renewable
              </span>
            </label>
          </div>

          {/* Status */}
          <div>
            <h3 className="text-lg font-medium text-academic-900 mb-4">
              Publication Status
            </h3>
            <select
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              className="input max-w-xs"
            >
              <option value="draft">Draft (Not visible to students)</option>
              <option value="active">Active (Open for applications)</option>
            </select>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-academic-200">
            <button
              type="button"
              onClick={() => navigate('/admin/scholarships')}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary flex items-center space-x-2"
            >
              <Save className="w-4 h-4" />
              <span>{loading ? 'Creating...' : 'Create Scholarship'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateScholarship;