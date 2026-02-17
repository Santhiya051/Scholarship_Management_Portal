import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { scholarshipService } from '../../services/scholarshipService';
import { applicationService } from '../../services/applicationService';
import { useAuth } from '../../context/AuthContext';
import { 
  ArrowLeft, 
  DollarSign, 
  Calendar, 
  Users, 
  Award, 
  FileText, 
  CheckCircle,
  AlertCircle,
  Clock,
  GraduationCap,
  Building
} from 'lucide-react';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import StatusBadge from '../../components/common/StatusBadge';

const ScholarshipDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [scholarship, setScholarship] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [existingApplication, setExistingApplication] = useState(null);

  useEffect(() => {
    fetchScholarshipDetails();
    checkExistingApplication();
  }, [id]);

  const fetchScholarshipDetails = async () => {
    try {
      const response = await scholarshipService.getScholarship(id);
      setScholarship(response.data.scholarship);
    } catch (error) {
      console.error('Error fetching scholarship details:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkExistingApplication = async () => {
    try {
      const response = await applicationService.getMyApplications({
        scholarship_id: id
      });
      if (response.data.applications.length > 0) {
        setExistingApplication(response.data.applications[0]);
      }
    } catch (error) {
      console.error('Error checking existing application:', error);
    }
  };

  const handleApply = async () => {
    setApplying(true);
    try {
      const response = await applicationService.createApplication({
        scholarship_id: id,
        personal_info: {
          first_name: user.first_name,
          last_name: user.last_name,
          email: user.email,
          phone: user.phone || ''
        },
        academic_info: {
          student_id: user.student?.student_id || '',
          gpa: user.student?.gpa || 0,
          major: user.student?.major || '',
          year_of_study: user.student?.year_of_study || 1
        }
      });
      
      navigate(`/applications/${response.data.application.id}/edit`);
    } catch (error) {
      console.error('Error creating application:', error);
    } finally {
      setApplying(false);
    }
  };

  const getDaysUntilDeadline = (deadline) => {
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const isEligible = () => {
    if (!scholarship || !user?.student) return false;
    
    // Check GPA requirement
    if (scholarship.min_gpa && user.student.gpa < scholarship.min_gpa) {
      return false;
    }
    
    // Check department requirement
    if (scholarship.department !== 'all' && scholarship.department !== user.student.department) {
      return false;
    }
    
    // Check year of study requirement
    if (scholarship.year_of_study && scholarship.year_of_study.length > 0) {
      if (!scholarship.year_of_study.includes(user.student.year_of_study)) {
        return false;
      }
    }
    
    return true;
  };

  if (loading) {
    return <LoadingSpinner text="Loading scholarship details..." />;
  }

  if (!scholarship) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-16 h-16 text-red-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-academic-900 mb-2">Scholarship not found</h3>
        <p className="text-academic-600 mb-4">The scholarship you're looking for doesn't exist or has been removed.</p>
        <Link to="/scholarships" className="btn-primary">
          Back to Scholarships
        </Link>
      </div>
    );
  }

  const daysLeft = getDaysUntilDeadline(scholarship.application_deadline);
  const eligible = isEligible();
  const canApply = eligible && daysLeft > 0 && scholarship.status === 'active' && !existingApplication;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center text-academic-600 hover:text-academic-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Scholarships
      </button>

      {/* Header */}
      <div className="card">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between">
          <div className="flex-1">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold text-academic-900 mb-2">
                  {scholarship.name}
                </h1>
                <StatusBadge 
                  status={scholarship.status}
                  text={scholarship.status.charAt(0).toUpperCase() + scholarship.status.slice(1)}
                />
              </div>
              <div className="text-right">
                <div className="flex items-center text-2xl font-bold text-green-600 mb-1">
                  <DollarSign className="w-6 h-6" />
                  <span>{scholarship.amount.toLocaleString()}</span>
                </div>
                {daysLeft > 0 ? (
                  <div className={`text-sm flex items-center ${
                    daysLeft <= 7 ? 'text-red-600' : 'text-academic-600'
                  }`}>
                    <Clock className="w-4 h-4 mr-1" />
                    <span>{daysLeft} days left</span>
                  </div>
                ) : (
                  <div className="text-sm text-red-600 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    <span>Deadline passed</span>
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="flex items-center text-academic-600">
                <Calendar className="w-5 h-5 mr-2" />
                <div>
                  <p className="text-sm font-medium">Application Deadline</p>
                  <p className="text-sm">{new Date(scholarship.application_deadline).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="flex items-center text-academic-600">
                <Users className="w-5 h-5 mr-2" />
                <div>
                  <p className="text-sm font-medium">Recipients</p>
                  <p className="text-sm">{scholarship.current_recipients} / {scholarship.max_recipients}</p>
                </div>
              </div>
              {scholarship.min_gpa && (
                <div className="flex items-center text-academic-600">
                  <Award className="w-5 h-5 mr-2" />
                  <div>
                    <p className="text-sm font-medium">Minimum GPA</p>
                    <p className="text-sm">{scholarship.min_gpa}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Eligibility Status */}
            <div className="mb-6">
              {eligible ? (
                <div className="flex items-center text-green-600 bg-green-50 border border-green-200 rounded-lg p-3">
                  <CheckCircle className="w-5 h-5 mr-2" />
                  <span className="font-medium">You are eligible for this scholarship</span>
                </div>
              ) : (
                <div className="flex items-center text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
                  <AlertCircle className="w-5 h-5 mr-2" />
                  <span className="font-medium">You are not eligible for this scholarship</span>
                </div>
              )}
            </div>

            {/* Application Status */}
            {existingApplication && (
              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-blue-900">You have already applied for this scholarship</p>
                    <p className="text-sm text-blue-700">
                      Application Status: <StatusBadge status={existingApplication.status} />
                    </p>
                  </div>
                  <Link
                    to={`/applications/${existingApplication.id}`}
                    className="btn-secondary text-sm"
                  >
                    View Application
                  </Link>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex space-x-4">
              {canApply && (
                <button
                  onClick={handleApply}
                  disabled={applying}
                  className="btn-primary flex items-center space-x-2"
                >
                  <FileText className="w-4 h-4" />
                  <span>{applying ? 'Creating Application...' : 'Apply Now'}</span>
                </button>
              )}
              {existingApplication && existingApplication.status === 'draft' && (
                <Link
                  to={`/applications/${existingApplication.id}/edit`}
                  className="btn-primary flex items-center space-x-2"
                >
                  <FileText className="w-4 h-4" />
                  <span>Continue Application</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <div className="card">
            <h2 className="text-lg font-semibold text-academic-900 mb-4">Description</h2>
            <div className="prose prose-academic max-w-none">
              <p className="text-academic-700 leading-relaxed">
                {scholarship.description}
              </p>
            </div>
          </div>

          {/* Requirements */}
          {scholarship.requirements && scholarship.requirements.length > 0 && (
            <div className="card">
              <h2 className="text-lg font-semibold text-academic-900 mb-4">Requirements</h2>
              <ul className="space-y-2">
                {scholarship.requirements.map((requirement, index) => (
                  <li key={index} className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-academic-700">{requirement}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Evaluation Criteria */}
          {scholarship.criteria && Object.keys(scholarship.criteria).length > 0 && (
            <div className="card">
              <h2 className="text-lg font-semibold text-academic-900 mb-4">Evaluation Criteria</h2>
              <div className="space-y-3">
                {Object.entries(scholarship.criteria).map(([criterion, weight]) => (
                  <div key={criterion} className="flex items-center justify-between">
                    <span className="text-academic-700 capitalize">{criterion.replace('_', ' ')}</span>
                    <span className="text-sm text-academic-600">{weight}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Info */}
          <div className="card">
            <h3 className="text-lg font-semibold text-academic-900 mb-4">Quick Information</h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm font-medium text-academic-700">Academic Year</p>
                <p className="text-academic-900">{scholarship.academic_year}</p>
              </div>
              {scholarship.department !== 'all' && (
                <div>
                  <p className="text-sm font-medium text-academic-700 flex items-center">
                    <Building className="w-4 h-4 mr-1" />
                    Department
                  </p>
                  <p className="text-academic-900 capitalize">
                    {scholarship.department.replace('-', ' ')}
                  </p>
                </div>
              )}
              {scholarship.year_of_study && scholarship.year_of_study.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-academic-700 flex items-center">
                    <GraduationCap className="w-4 h-4 mr-1" />
                    Eligible Years
                  </p>
                  <p className="text-academic-900">
                    Year {scholarship.year_of_study.join(', ')}
                  </p>
                </div>
              )}
              <div>
                <p className="text-sm font-medium text-academic-700">Total Funding</p>
                <p className="text-academic-900">${scholarship.total_funding.toLocaleString()}</p>
              </div>
              {scholarship.is_renewable && (
                <div>
                  <p className="text-sm font-medium text-academic-700">Renewable</p>
                  <p className="text-green-600">Yes</p>
                </div>
              )}
            </div>
          </div>

          {/* Application Progress */}
          <div className="card">
            <h3 className="text-lg font-semibold text-academic-900 mb-4">Application Progress</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-academic-600">Applications Received</span>
                <span className="font-medium text-academic-900">
                  {scholarship.current_recipients} / {scholarship.max_recipients}
                </span>
              </div>
              <div className="w-full bg-academic-200 rounded-full h-2">
                <div
                  className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${Math.min((scholarship.current_recipients / scholarship.max_recipients) * 100, 100)}%`
                  }}
                ></div>
              </div>
              <p className="text-xs text-academic-600">
                {scholarship.max_recipients - scholarship.current_recipients} spots remaining
              </p>
            </div>
          </div>

          {/* Important Dates */}
          <div className="card">
            <h3 className="text-lg font-semibold text-academic-900 mb-4">Important Dates</h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm font-medium text-academic-700">Application Deadline</p>
                <p className="text-academic-900">
                  {new Date(scholarship.application_deadline).toLocaleDateString()}
                </p>
              </div>
              {scholarship.award_date && (
                <div>
                  <p className="text-sm font-medium text-academic-700">Award Date</p>
                  <p className="text-academic-900">
                    {new Date(scholarship.award_date).toLocaleDateString()}
                  </p>
                </div>
              )}
              <div>
                <p className="text-sm font-medium text-academic-700">Created</p>
                <p className="text-academic-900">
                  {new Date(scholarship.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScholarshipDetailPage;