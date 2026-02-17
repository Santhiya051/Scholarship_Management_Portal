import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Upload, X, FileText, AlertCircle } from 'lucide-react';
import LoadingSpinner from '../common/LoadingSpinner';

const ScholarshipApplicationForm = ({ scholarship, onSubmit, loading = false }) => {
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [dragActive, setDragActive] = useState(false);

  const { register, handleSubmit, formState: { errors }, watch } = useForm();

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFiles = (files) => {
    Array.from(files).forEach(file => {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        alert('File size must be less than 5MB');
        return;
      }
      
      const newFile = {
        id: Date.now() + Math.random(),
        file,
        name: file.name,
        size: file.size,
        type: file.type
      };
      
      setUploadedFiles(prev => [...prev, newFile]);
    });
  };

  const removeFile = (fileId) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const onFormSubmit = (data) => {
    const formData = {
      ...data,
      documents: uploadedFiles.map(f => f.file)
    };
    onSubmit(formData);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="card mb-6">
        <h2 className="text-xl font-bold text-academic-900 mb-2">
          Apply for {scholarship?.name}
        </h2>
        <div className="bg-academic-50 p-4 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="font-medium text-academic-700">Amount:</span>
              <p className="text-academic-900">${scholarship?.amount?.toLocaleString()}</p>
            </div>
            <div>
              <span className="font-medium text-academic-700">Deadline:</span>
              <p className="text-academic-900">
                {scholarship?.deadline ? new Date(scholarship.deadline).toLocaleDateString() : 'N/A'}
              </p>
            </div>
            <div>
              <span className="font-medium text-academic-700">Eligibility:</span>
              <p className="text-academic-900">{scholarship?.eligibility || 'All students'}</p>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
        {/* Personal Information */}
        <div className="card">
          <h3 className="text-lg font-semibold text-academic-900 mb-4">Personal Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-academic-700 mb-1">
                First Name *
              </label>
              <input
                {...register('firstName', { required: 'First name is required' })}
                type="text"
                className="input-field"
                placeholder="Enter your first name"
              />
              {errors.firstName && (
                <p className="mt-1 text-sm text-red-600">{errors.firstName.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-academic-700 mb-1">
                Last Name *
              </label>
              <input
                {...register('lastName', { required: 'Last name is required' })}
                type="text"
                className="input-field"
                placeholder="Enter your last name"
              />
              {errors.lastName && (
                <p className="mt-1 text-sm text-red-600">{errors.lastName.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-academic-700 mb-1">
                Email Address *
              </label>
              <input
                {...register('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email address'
                  }
                })}
                type="email"
                className="input-field"
                placeholder="Enter your email"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-academic-700 mb-1">
                Phone Number *
              </label>
              <input
                {...register('phone', { required: 'Phone number is required' })}
                type="tel"
                className="input-field"
                placeholder="Enter your phone number"
              />
              {errors.phone && (
                <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Academic Information */}
        <div className="card">
          <h3 className="text-lg font-semibold text-academic-900 mb-4">Academic Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-academic-700 mb-1">
                Student ID *
              </label>
              <input
                {...register('studentId', { required: 'Student ID is required' })}
                type="text"
                className="input-field"
                placeholder="Enter your student ID"
              />
              {errors.studentId && (
                <p className="mt-1 text-sm text-red-600">{errors.studentId.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-academic-700 mb-1">
                Current GPA *
              </label>
              <input
                {...register('gpa', {
                  required: 'GPA is required',
                  min: { value: 0, message: 'GPA must be between 0 and 4.0' },
                  max: { value: 4.0, message: 'GPA must be between 0 and 4.0' }
                })}
                type="number"
                step="0.01"
                className="input-field"
                placeholder="Enter your GPA"
              />
              {errors.gpa && (
                <p className="mt-1 text-sm text-red-600">{errors.gpa.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-academic-700 mb-1">
                Major/Department *
              </label>
              <select
                {...register('major', { required: 'Major is required' })}
                className="input-field"
              >
                <option value="">Select your major</option>
                <option value="computer-science">Computer Science</option>
                <option value="engineering">Engineering</option>
                <option value="business">Business Administration</option>
                <option value="medicine">Medicine</option>
                <option value="arts">Arts & Humanities</option>
                <option value="sciences">Natural Sciences</option>
              </select>
              {errors.major && (
                <p className="mt-1 text-sm text-red-600">{errors.major.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-academic-700 mb-1">
                Year of Study *
              </label>
              <select
                {...register('yearOfStudy', { required: 'Year of study is required' })}
                className="input-field"
              >
                <option value="">Select year</option>
                <option value="1">1st Year</option>
                <option value="2">2nd Year</option>
                <option value="3">3rd Year</option>
                <option value="4">4th Year</option>
                <option value="graduate">Graduate</option>
              </select>
              {errors.yearOfStudy && (
                <p className="mt-1 text-sm text-red-600">{errors.yearOfStudy.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Essay Questions */}
        <div className="card">
          <h3 className="text-lg font-semibold text-academic-900 mb-4">Essay Questions</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-academic-700 mb-1">
                Why do you deserve this scholarship? * (500 words max)
              </label>
              <textarea
                {...register('essay1', {
                  required: 'This essay is required',
                  maxLength: { value: 500, message: 'Essay must be 500 words or less' }
                })}
                rows={6}
                className="input-field"
                placeholder="Explain why you deserve this scholarship..."
              />
              {errors.essay1 && (
                <p className="mt-1 text-sm text-red-600">{errors.essay1.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-academic-700 mb-1">
                How will this scholarship help you achieve your goals? * (300 words max)
              </label>
              <textarea
                {...register('essay2', {
                  required: 'This essay is required',
                  maxLength: { value: 300, message: 'Essay must be 300 words or less' }
                })}
                rows={4}
                className="input-field"
                placeholder="Describe how this scholarship will help you..."
              />
              {errors.essay2 && (
                <p className="mt-1 text-sm text-red-600">{errors.essay2.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Document Upload */}
        <div className="card">
          <h3 className="text-lg font-semibold text-academic-900 mb-4">Required Documents</h3>
          
          <div
            className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
              dragActive 
                ? 'border-primary-500 bg-primary-50' 
                : 'border-academic-300 hover:border-academic-400'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <Upload className="w-12 h-12 text-academic-400 mx-auto mb-4" />
            <p className="text-academic-600 mb-2">
              Drag and drop files here, or{' '}
              <label className="text-primary-600 hover:text-primary-700 cursor-pointer">
                browse
                <input
                  type="file"
                  multiple
                  className="hidden"
                  onChange={(e) => handleFiles(e.target.files)}
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                />
              </label>
            </p>
            <p className="text-sm text-academic-500">
              Supported formats: PDF, DOC, DOCX, JPG, PNG (Max 5MB each)
            </p>
          </div>

          {uploadedFiles.length > 0 && (
            <div className="mt-4 space-y-2">
              <h4 className="font-medium text-academic-900">Uploaded Files:</h4>
              {uploadedFiles.map((file) => (
                <div key={file.id} className="flex items-center justify-between p-3 bg-academic-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <FileText className="w-5 h-5 text-academic-500" />
                    <div>
                      <p className="text-sm font-medium text-academic-900">{file.name}</p>
                      <p className="text-xs text-academic-500">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeFile(file.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start space-x-2">
              <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-yellow-800">Required Documents:</h4>
                <ul className="text-sm text-yellow-700 mt-1 list-disc list-inside">
                  <li>Official transcript</li>
                  <li>Letter of recommendation</li>
                  <li>Personal statement</li>
                  <li>Proof of enrollment</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            className="btn-secondary"
            onClick={() => window.history.back()}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="btn-primary flex items-center"
          >
            {loading ? (
              <>
                <LoadingSpinner size="sm" />
                <span className="ml-2">Submitting...</span>
              </>
            ) : (
              'Submit Application'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ScholarshipApplicationForm;