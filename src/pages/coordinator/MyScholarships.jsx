import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Award,
  Plus,
  Search,
  Filter,
  Edit,
  Eye,
  Calendar,
  DollarSign,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { adminService } from '../../services/adminService';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Modal from '../../components/common/Modal';
import { toast } from 'react-hot-toast';

const MyScholarships = () => {
  const [scholarships, setScholarships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedScholarship, setSelectedScholarship] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => {
    fetchScholarships();
  }, []);

  const fetchScholarships = async () => {
    try {
      setLoading(true);
      const response = await adminService.getAllScholarshipsAdmin();
      // Filter to show only scholarships created by current coordinator
      setScholarships(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      toast.error('Failed to fetch scholarships');
      console.error('Error fetching scholarships:', error);
      setScholarships([]);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (scholarshipId, currentStatus) => {
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

  const filteredScholarships = scholarships.filter(scholarship => {
    const matchesSearch = 
      scholarship.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      scholarship.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || scholarship.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-50';
      case 'draft': return 'text-yellow-600 bg-yellow-50';
      case 'closed': return 'text-red-600 bg-red-50';
      case 'cancelled': return 'text-gray-600 bg-gray-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getDeadlineUrgency = (deadline) => {
    const daysLeft = Math.ceil((new Date(deadline) - new Date()) / (1000 * 60 * 60 * 24));
    if (daysLeft <= 7) return 'text-red-600';
    if (daysLeft <= 30) return 'text-yellow-600';
    return 'text-green-600';
  };

  if (loading) {
    return <LoadingSpinner text="Loading your scholarships..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-academic-900">My Scholarships</h1>
          <p className="text-academic-600 mt-1">Manage scholarships under your coordination</p>
        </div>
        <Link
          to="/admin/scholarships/create"
          className="btn btn-primary flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Create Scholarship</span>
        </Link>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Award className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-academic-600">Total Scholarships</p>
              <p className="text-2xl font-bold text-academic-900">{scholarships.length}</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-academic-600">Active</p>
              <p className="text-2xl font-bold text-academic-900">
                {scholarships.filter(s => s.status === 'active').length}
              </p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-academic-600">Total Applications</p>
              <p className="text-2xl font-bold text-academic-900">
                {scholarships.reduce((sum, s) => sum + (s.application_count || 0), 0)}
              </p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-academic-600">Total Funding</p>
              <p className="text-2xl font-bold text-academic-900">
                ${scholarships.reduce((sum, s) => sum + (s.total_funding || 0), 0).toLocaleString()}
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
          </div>
        </div>
      </div>

      {/* Scholarships Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredScholarships.map((scholarship) => (
          <div key={scholarship.id} className="card hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(scholarship.status)}`}>
                {scholarship.status}
              </div>
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => {
                    setSelectedScholarship(scholarship);
                    setShowDetailsModal(true);
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

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-orange-600" />
                  <span className={`text-sm ${getDeadlineUrgency(scholarship.application_deadline)}`}>
                    {new Date(scholarship.application_deadline).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <FileText className="w-4 h-4 text-purple-600" />
                  <span className="text-sm text-academic-600">
                    {scholarship.application_count || 0} apps
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-academic-200">
                <button
                  onClick={() => handleToggleStatus(scholarship.id, scholarship.status)}
                  className={`text-sm font-medium ${
                    scholarship.status === 'active' 
                      ? 'text-red-600 hover:text-red-700' 
                      : 'text-green-600 hover:text-green-700'
                  }`}
                >
                  {scholarship.status === 'active' ? 'Close' : 'Activate'}
                </button>
                <Link
                  to={`/admin/applications?scholarship=${scholarship.id}`}
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
            {searchTerm || statusFilter !== 'all'
              ? 'Try adjusting your search or filter criteria.'
              : 'Get started by creating your first scholarship.'}
          </p>
          <div className="mt-6">
            <Link
              to="/admin/scholarships/create"
              className="btn btn-primary"
            >
              Create Scholarship
            </Link>
          </div>
        </div>
      )}

      {/* Scholarship Details Modal */}
      <Modal
        isOpen={showDetailsModal}
        onClose={() => {
          setShowDetailsModal(false);
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
                <h4 className="font-medium text-academic-900 mb-3">Financial Details</h4>
                <div className="space-y-2">
                  <div>
                    <label className="block text-sm font-medium text-academic-700">Award Amount</label>
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
                </div>
              </div>

              <div>
                <h4 className="font-medium text-academic-900 mb-3">Application Stats</h4>
                <div className="space-y-2">
                  <div>
                    <label className="block text-sm font-medium text-academic-700">Total Applications</label>
                    <p className="text-sm text-academic-900">{selectedScholarship.application_count || 0}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-academic-700">Approved</label>
                    <p className="text-sm text-academic-900">{selectedScholarship.approved_count || 0}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-academic-700">Pending</label>
                    <p className="text-sm text-academic-900">{selectedScholarship.pending_count || 0}</p>
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

            <div className="flex justify-end space-x-3">
              <Link
                to={`/admin/scholarships/${selectedScholarship.id}/edit`}
                className="btn btn-secondary"
              >
                Edit Scholarship
              </Link>
              <Link
                to={`/admin/applications?scholarship=${selectedScholarship.id}`}
                className="btn btn-primary"
              >
                View Applications
              </Link>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default MyScholarships;