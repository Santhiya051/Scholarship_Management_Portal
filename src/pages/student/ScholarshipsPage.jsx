import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { scholarshipService } from '../../services/scholarshipService';
import { Search, Filter, Calendar, DollarSign, Users, Award, Clock } from 'lucide-react';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import StatusBadge from '../../components/common/StatusBadge';

const ScholarshipsPage = () => {
  const [scholarships, setScholarships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    department: '',
    minAmount: '',
    maxAmount: '',
    status: 'active'
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchScholarships();
  }, [filters]);

  const fetchScholarships = async () => {
    try {
      setLoading(true);
      const response = await scholarshipService.getScholarships({
        search: searchTerm,
        ...filters,
        page: 1,
        limit: 20
      });
      setScholarships(response.data.scholarships);
    } catch (error) {
      console.error('Error fetching scholarships:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchScholarships();
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      department: '',
      minAmount: '',
      maxAmount: '',
      status: 'active'
    });
    setSearchTerm('');
  };

  const isEligible = (scholarship) => {
    // This would normally check against user's profile
    // For now, we'll assume all active scholarships are eligible
    return scholarship.status === 'active';
  };

  const getDaysUntilDeadline = (deadline) => {
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const filteredScholarships = scholarships.filter(scholarship =>
    scholarship.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    scholarship.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <LoadingSpinner text="Loading scholarships..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-academic-900">Available Scholarships</h1>
          <p className="text-academic-600">Discover and apply for scholarship opportunities</p>
        </div>
        <div className="mt-4 sm:mt-0">
          <span className="text-sm text-academic-600">
            {filteredScholarships.length} scholarships available
          </span>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="card">
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-academic-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search scholarships..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input-field pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowFilters(!showFilters)}
                className="btn-secondary flex items-center space-x-2"
              >
                <Filter className="w-4 h-4" />
                <span>Filters</span>
              </button>
              <button type="submit" className="btn-primary">
                Search
              </button>
            </div>
          </div>

          {showFilters && (
            <div className="border-t border-academic-200 pt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-academic-700 mb-1">
                    Department
                  </label>
                  <select
                    value={filters.department}
                    onChange={(e) => handleFilterChange('department', e.target.value)}
                    className="input-field"
                  >
                    <option value="">All Departments</option>
                    <option value="computer-science">Computer Science</option>
                    <option value="engineering">Engineering</option>
                    <option value="business">Business</option>
                    <option value="medicine">Medicine</option>
                    <option value="arts">Arts</option>
                    <option value="sciences">Sciences</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-academic-700 mb-1">
                    Min Amount
                  </label>
                  <input
                    type="number"
                    placeholder="$0"
                    value={filters.minAmount}
                    onChange={(e) => handleFilterChange('minAmount', e.target.value)}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-academic-700 mb-1">
                    Max Amount
                  </label>
                  <input
                    type="number"
                    placeholder="$50000"
                    value={filters.maxAmount}
                    onChange={(e) => handleFilterChange('maxAmount', e.target.value)}
                    className="input-field"
                  />
                </div>
                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="btn-secondary w-full"
                  >
                    Clear Filters
                  </button>
                </div>
              </div>
            </div>
          )}
        </form>
      </div>

      {/* Scholarships Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredScholarships.map((scholarship) => {
          const daysLeft = getDaysUntilDeadline(scholarship.application_deadline);
          const eligible = isEligible(scholarship);
          
          return (
            <div key={scholarship.id} className="card hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-academic-900 mb-2">
                    {scholarship.name}
                  </h3>
                  <StatusBadge 
                    status={scholarship.status}
                    text={scholarship.status.charAt(0).toUpperCase() + scholarship.status.slice(1)}
                  />
                </div>
                <div className="text-right">
                  <div className="flex items-center text-green-600 font-semibold">
                    <DollarSign className="w-4 h-4" />
                    <span>{scholarship.amount.toLocaleString()}</span>
                  </div>
                  {daysLeft > 0 && (
                    <div className={`text-xs mt-1 flex items-center ${
                      daysLeft <= 7 ? 'text-red-600' : 'text-academic-600'
                    }`}>
                      <Clock className="w-3 h-3 mr-1" />
                      <span>{daysLeft} days left</span>
                    </div>
                  )}
                </div>
              </div>

              <p className="text-academic-600 text-sm mb-4 line-clamp-3">
                {scholarship.description}
              </p>

              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm text-academic-600">
                  <Calendar className="w-4 h-4 mr-2" />
                  <span>Deadline: {new Date(scholarship.application_deadline).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center text-sm text-academic-600">
                  <Users className="w-4 h-4 mr-2" />
                  <span>Max Recipients: {scholarship.max_recipients}</span>
                </div>
                {scholarship.min_gpa && (
                  <div className="flex items-center text-sm text-academic-600">
                    <Award className="w-4 h-4 mr-2" />
                    <span>Min GPA: {scholarship.min_gpa}</span>
                  </div>
                )}
                {scholarship.department !== 'all' && (
                  <div className="flex items-center text-sm text-academic-600">
                    <span className="w-4 h-4 mr-2">🎓</span>
                    <span className="capitalize">{scholarship.department.replace('-', ' ')}</span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-academic-200">
                <div className="text-sm text-academic-600">
                  {scholarship.current_recipients} / {scholarship.max_recipients} awarded
                </div>
                <div className="flex space-x-2">
                  <Link
                    to={`/scholarships/${scholarship.id}`}
                    className="btn-secondary text-sm px-3 py-1"
                  >
                    View Details
                  </Link>
                  {eligible && daysLeft > 0 && (
                    <Link
                      to={`/scholarships/${scholarship.id}/apply`}
                      className="btn-primary text-sm px-3 py-1"
                    >
                      Apply Now
                    </Link>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredScholarships.length === 0 && (
        <div className="text-center py-12">
          <Award className="w-16 h-16 text-academic-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-academic-900 mb-2">No scholarships found</h3>
          <p className="text-academic-600">
            Try adjusting your search criteria or check back later for new opportunities.
          </p>
        </div>
      )}
    </div>
  );
};

export default ScholarshipsPage;