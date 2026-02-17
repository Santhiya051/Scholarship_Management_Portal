import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, User, Mail, Phone, Shield } from 'lucide-react';
import { adminService } from '../../services/adminService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { toast } from 'react-hot-toast';

const EditUser = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [roles, setRoles] = useState([]);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    role_id: '',
    is_active: true,
    email_verified: false
  });

  useEffect(() => {
    fetchUserAndRoles();
  }, [id]);

  const fetchUserAndRoles = async () => {
    try {
      const [userRes, rolesRes] = await Promise.all([
        adminService.getUserById(id),
        adminService.getAllRoles()
      ]);
      
      const user = userRes.data;
      setFormData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
        phone: user.phone || '',
        role_id: user.role_id || '',
        is_active: user.is_active !== undefined ? user.is_active : true,
        email_verified: user.email_verified || false
      });
      
      setRoles(rolesRes.data || []);
    } catch (error) {
      toast.error('Failed to load user data');
      console.error('Error fetching user:', error);
      navigate('/admin/users');
    } finally {
      setLoading(false);
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
    
    try {
      setSaving(true);
      await adminService.updateUser(id, formData);
      toast.success('User updated successfully');
      navigate('/admin/users');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update user');
      console.error('Error updating user:', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading user data..." />;
  }

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
          <h1 className="text-2xl font-bold text-academic-900">Edit User</h1>
          <p className="text-academic-600 mt-1">Update user information</p>
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
                  className="input-field w-full"
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
                  className="input-field w-full"
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
                  className="input-field w-full bg-academic-50"
                  disabled
                />
                <p className="text-xs text-academic-500 mt-1">Email cannot be changed</p>
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
                  className="input-field w-full"
                  placeholder="+15551234567"
                />
              </div>
            </div>
          </div>

          {/* Role & Access */}
          <div>
            <h3 className="text-lg font-medium text-academic-900 mb-4 flex items-center">
              <Shield className="w-5 h-5 mr-2" />
              Role & Access
            </h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-academic-700 mb-2">
                Role *
              </label>
              <select
                name="role_id"
                value={formData.role_id}
                onChange={handleInputChange}
                className="input-field w-full"
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
              className="px-4 py-2 text-academic-700 bg-white border border-academic-300 rounded-lg hover:bg-academic-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center space-x-2 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditUser;
