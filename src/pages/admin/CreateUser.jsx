import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, User, Mail, Phone, Shield } from 'lucide-react';
import { adminService } from '../../services/adminService';
import { toast } from 'react-hot-toast';

const CreateUser = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [roles, setRoles] = useState([]);
  const [loadingRoles, setLoadingRoles] = useState(true);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    password: '',
    confirm_password: '',
    role_id: '',
    is_active: true,
    email_verified: false
  });

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      const response = await adminService.getAllRoles();
      setRoles(response.data || []);
    } catch (error) {
      console.error('Error fetching roles:', error);
      toast.error('Failed to load roles');
      // Fallback to empty array
      setRoles([]);
    } finally {
      setLoadingRoles(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirm_password) {
      toast.error('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    try {
      setLoading(true);
      const userData = { ...formData };
      delete userData.confirm_password;
      
      await adminService.createUser(userData);
      toast.success('User created successfully');
      navigate('/admin/users');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create user');
      console.error('Error creating user:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <button
          onClick={() => navigate('/admin/users')}
          className="p-2 text-academic-600 hover:text-academic-900 hover:bg-academic-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-academic-900">Create New User</h1>
          <p className="text-academic-600 mt-1">Add a new user to the system</p>
        </div>
      </div>

      {/* Form */}
      <div className="card max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information */}
          <div>
            <h3 className="text-lg font-medium text-academic-900 mb-4 flex items-center">
              <User className="w-5 h-5 mr-2" />
              Personal Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-academic-700 mb-2">
                  First Name *
                </label>
                <input
                  type="text"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleInputChange}
                  className="input"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-academic-700 mb-2">
                  Last Name *
                </label>
                <input
                  type="text"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleInputChange}
                  className="input"
                  required
                />
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div>
            <h3 className="text-lg font-medium text-academic-900 mb-4 flex items-center">
              <Mail className="w-5 h-5 mr-2" />
              Contact Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-academic-700 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="input"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-academic-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="input"
                />
              </div>
            </div>
          </div>

          {/* Security */}
          <div>
            <h3 className="text-lg font-medium text-academic-900 mb-4 flex items-center">
              <Shield className="w-5 h-5 mr-2" />
              Security & Access
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-academic-700 mb-2">
                  Password *
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="input"
                  minLength="6"
                  required
                />
                <p className="text-xs text-academic-500 mt-1">
                  Minimum 6 characters
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-academic-700 mb-2">
                  Confirm Password *
                </label>
                <input
                  type="password"
                  name="confirm_password"
                  value={formData.confirm_password}
                  onChange={handleInputChange}
                  className="input"
                  required
                />
              </div>
            </div>
            
            <div className="mt-4">
              <label className="block text-sm font-medium text-academic-700 mb-2">
                Role *
              </label>
              <select
                name="role_id"
                value={formData.role_id}
                onChange={handleInputChange}
                className="input"
                required
              >
                <option value="">Select a role...</option>
                {roles.map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.display_name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Account Settings */}
          <div>
            <h3 className="text-lg font-medium text-academic-900 mb-4">
              Account Settings
            </h3>
            <div className="space-y-3">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="is_active"
                  checked={formData.is_active}
                  onChange={handleInputChange}
                  className="rounded border-academic-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="ml-2 text-sm text-academic-700">
                  Account is active
                </span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="email_verified"
                  checked={formData.email_verified}
                  onChange={handleInputChange}
                  className="rounded border-academic-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="ml-2 text-sm text-academic-700">
                  Email is verified
                </span>
              </label>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-academic-200">
            <button
              type="button"
              onClick={() => navigate('/admin/users')}
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
              <span>{loading ? 'Creating...' : 'Create User'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateUser;