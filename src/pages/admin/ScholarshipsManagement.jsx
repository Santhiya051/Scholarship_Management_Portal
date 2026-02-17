import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Award,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  Calendar,
  DollarSign,
  Users,
  Clock,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { adminService } from '../../services/adminService';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Modal from '../../components/common/Modal';
import { toast } from 'react-hot-toast';

const ScholarshipsManagement = () => {
  const [scholarships, setScholarships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [selectedScholarship, setSelectedScholarship] = useState(null);
  const [showScholarshipModal, setShowScholarshipModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [scholarshipToDelete, setScholarshipToDelete] = useState(null);

  useEffect(() => {
    fetchScholarships();
  }, []);

  const fetchScholarships = async () => {
    try {
      setLoading(true);
      const response = await adminService.getAllScholarshipsAdmin();
      // Ensure we always have an array
      setScholarships(Array.isArray(response.data) ? response.data : response.scholarships || []);
    } catch (error) {
      toast.error('Failed to fetch scholarships');
      console.error('Error fetching scholarships:', error);
      setScholarships([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const handleToggleScholarshipStatus = async (scholarshipId, currentStatus) => {
    try {
      const newStatus = currentStatus === 'active' ? 'closed' : 'active';
      await adminService.updateScholarship(scholarshipId, { status: newStatus });
      toast.success(`Scholarship ${newStatus === 'active' ? 'activated' : 'closed'} successfully`);
      fetchScholarships();
    } catch (error) {
      toast.error('Failed to update scholarship status');
      console.error('Error updating scholarship status:', error);
    }
  };

  const handleDeleteScholarship = async () => {
    try {
      await adminService.deleteScholarship(scholarshipToDelete.id);
      toast.success('Scholarship deleted successfully');
      setShowDeleteModal(false);
      setScholarshipToDelete(null);
      fetchScholarships();
    } catch (error) {
      toast.error('Failed to delete scholarship');
      console.error('Error deleting scholarship:', error);
    }
  };

  const filteredScholarships = scholarships.filter(scholarship => {
    const matchesSearch = 
      scholarship.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      scholarship.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || scholarship.status === statusFilter;
    const matchesDepartment = departmentFilter === 'all' || scholarship.department === departmentFilter;

    return matchesSearch && matchesStatus && matchesDepartment;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'text-green-600';
      case 'draft': return 'text-yellow-600';
      case 'closed': return 'text-red-600';
      case 'cancelled': return 'text-gray-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active': return <CheckCircle className="w-4 h-4" />;
      case 'draft': return <Clock className="w-4 h-4" />;
      case 'closed': return <XCircle className="w-4 h-4" />;
      case 'cancelled': return <XCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading scholarships..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-academic-900">Scholarships Management</h1>
          <p className="text-academic-600 mt-1">Manage scholarship programs and their details</p>
        </div>
        <Link
          to="/admin/scholarships/create"
          className="btn btn-primary flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Create Scholarship</span>
        </Link>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-academic-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search scholarships..."
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
              <option value="active">Active</option>
              <option value="closed">Closed</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="input"
            >
              <option value="all">All Departments</option>
              <option value="all">All Departments</option>
              <option value="Computer Science">Computer Science</option>
              <option value="Engineering">Engineering</option>
              <option value="Business">Business</option>
              <option value="Medicine">Medicine</option>
              <option value="Arts">Arts</option>
            </select>
          </div>
        </div>
      </div>

      {/* Scholarships Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredScholarships.map((scholarship) => (
          <div key={scholarship.id} className="card hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-2">
                <div className={`p-2 rounded-lg ${getStatusColor(scholarship.status)} bg-opacity-10`}>
                  <Award className={`w-5 h-5 ${getStatusColor(scholarship.status)}`} />
                </div>
                <div className={`flex items-center space-x-1 ${getStatusColor(scholarship.status)}`}>
                  {getStatusIcon(scholarship.status)}
                  <span className="text-sm font-medium capitalize">{scholarship.status}</span>
                </div>
              </div>
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => {
                    setSelectedScholarship(scholarship);
                    setShowScholarshipModal(true);
                  }}
                  className="text-academic-400 hover:text-academic-600"
                  title="View Details"
                >
                  <Eye className="w-4 h-4" />
                </button>
                <Link
                  to={`/admin/scholarships/${scholarship.id}/edit`}
                  className="text-primary-600 hover:text-primary-900"
                  title="Edit Scholarship"
                >
                  <Edit className="w-4 h-4" />
                </Link>
                <button
                  onClick={() => {
                    setScholarshipToDelete(scholarship);
                    setShowDeleteModal(true);
                  }}
                  className="text-red-600 hover:text-red-900"
                  title="Delete Scholarship"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <h3 className="text-lg font-semibold text-academic-900 mb-2 line-clamp-2">
              {scholarship.name}
            </h3>
            
            <p className="text-academic-600 text-sm mb-4 line-clamp-3">
              {scholarship.description}
            </p>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <DollarSign className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium text-academic-900">
                    ${scholarship.amount?.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4 text-blue-600" />
                  <span className="text-sm text-academic-600">
                    {scholarship.current_recipients || 0}/{scholarship.max_recipients}
                  </span>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-orange-600" />
                <span className="text-sm text-academic-600">
                  Deadline: {new Date(scholarship.application_deadline).toLocaleDateString()}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {scholarship.department === 'all' ? 'All Departments' : scholarship.department}
                </span>
                <span className="text-xs text-academic-500">
                  {scholarship.academic_year}
                </span>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-academic-200">
                <button
                  onClick={() => handleToggleScholarshipStatus(scholarship.id, scholarship.status)}
                  className={`text-sm font-medium ${
                    scholarship.status === 'active' 
                      ? 'text-red-600 hover:text-red-700' 
                      : 'text-green-600 hover:text-green-700'
                  }`}
                >
                  {scholarship.status === 'active' ? 'Close' : 'Activate'}
                </button>
                <Link
                  to={`/admin/scholarships/${scholarship.id}/applications`}
                  className="text-sm font-medium text-primary-600 hover:text-primary-700"
                >
                  View Applications
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredScholarships.length === 0 && (
        <div className="text-center py-12">
          <Award className="mx-auto h-12 w-12 text-academic-400" />
          <h3 className="mt-2 text-sm font-medium text-academic-900">No scholarships found</h3>
          <p className="mt-1 text-sm text-academic-500">
            {searchTerm || statusFilter !== 'all' || departmentFilter !== 'all'
              ? 'Try adjusting your search or filter criteria.'
              : 'Get started by creating a new scholarship.'}
          </p>
        </div>
      )}

      {/* Scholarship Details Modal */}
      <Modal
        isOpen={showScholarshipModal}
        onClose={() => {
          setShowScholarshipModal(false);
          setSelectedScholarship(null);
        }}
        title="Scholarship Details"
        size="lg"
      >
        {selectedScholarship && (
          <div className="space-y-6">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-xl font-semibold text-academic-900">
                  {selectedScholarship.name}
                </h3>
                <div className="flex items-center space-x-2 mt-2">
                  <StatusBadge status={selectedScholarship.status} size="sm" />
                  <span className="text-sm text-academic-500">
                    {selectedScholarship.academic_year}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-academic-900 mb-3">Basic Information</h4>
                <div className="space-y-2">
                  <div>
                    <label className="block text-sm font-medium text-academic-700">Amount</label>
                    <p className="text-sm text-academic-900">${selectedScholarship.amount?.toLocaleString()}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-academic-700">Total Funding</label>
                    <p className="text-sm text-academic-900">${selectedScholarship.total_funding?.toLocaleString()}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-academic-700">Recipients</label>
                    <p className="text-sm text-academic-900">
                      {selectedScholarship.current_recipients || 0} / {selectedScholarship.max_recipients}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-academic-700">Department</label>
                    <p className="text-sm text-academic-900">
                      {selectedScholarship.department === 'all' ? 'All Departments' : selectedScholarship.department}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-academic-900 mb-3">Dates & Requirements</h4>
                <div className="space-y-2">
                  <div>
                    <label className="block text-sm font-medium text-academic-700">Application Deadline</label>
                    <p className="text-sm text-academic-900">
                      {new Date(selectedScholarship.application_deadline).toLocaleDateString()}
                    </p>
                  </div>
                  {selectedScholarship.award_date && (
                    <div>
                      <label className="block text-sm font-medium text-academic-700">Award Date</label>
                      <p className="text-sm text-academic-900">
                        {new Date(selectedScholarship.award_date).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-academic-700">Minimum GPA</label>
                    <p className="text-sm text-academic-900">
                      {selectedScholarship.min_gpa || 'Not specified'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-academic-700">Renewable</label>
                    <p className="text-sm text-academic-900">
                      {selectedScholarship.is_renewable ? 'Yes' : 'No'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-academic-900 mb-3">Description</h4>
              <p className="text-sm text-academic-600 leading-relaxed">
                {selectedScholarship.description}
              </p>
            </div>

            {selectedScholarship.requirements && selectedScholarship.requirements.length > 0 && (
              <div>
                <h4 className="font-medium text-academic-900 mb-3">Requirements</h4>
                <ul className="list-disc list-inside space-y-1">
                  {selectedScholarship.requirements.map((requirement, index) => (
                    <li key={index} className="text-sm text-academic-600">
                      {requirement}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setScholarshipToDelete(null);
        }}
        title="Delete Scholarship"
      >
        {scholarshipToDelete && (
          <div className="space-y-4">
            <p className="text-academic-600">
              Are you sure you want to delete <strong>{scholarshipToDelete.name}</strong>? 
              This action cannot be undone and will also delete all associated applications.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setScholarshipToDelete(null);
                }}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteScholarship}
                className="btn btn-danger"
              >
                Delete Scholarship
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ScholarshipsManagement;