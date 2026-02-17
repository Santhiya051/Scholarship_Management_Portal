import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { userService } from '../../services/userService';
import { User, Mail, Phone, GraduationCap, Calendar, MapPin, Edit2, Save, X } from 'lucide-react';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import StatusBadge from '../../components/common/StatusBadge';

const ProfilePage = () => {
  const { user, updateUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await userService.getProfile();
      const userData = response.data.user;
      setProfile(userData);
      setFormData({
        first_name: userData?.first_name || '',
        last_name: userData?.last_name || '',
        phone: userData?.phone || '',
        gpa: userData?.student?.gpa || ''
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await userService.updateProfile(formData);
      setProfile(response.data.user);
      updateUser(response.data.user);
      setEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      first_name: profile.first_name,
      last_name: profile.last_name,
      phone: profile.phone || '',
      gpa: profile.student?.gpa || ''
    });
    setEditing(false);
  };

  if (loading) {
    return <LoadingSpinner text="Loading profile..." />;
  }

  if (!profile) {
    return (
      <div className="text-center py-12">
        <p className="text-academic-600">Unable to load profile. Please try again.</p>
      </div>
    );
  }

  const roleDisplayName = profile.role?.display_name || 'User';

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-academic-900">{roleDisplayName} Profile</h1>
          <p className="text-academic-600">Manage your personal information</p>
        </div>
        {!editing ? (
          <button
            onClick={() => setEditing(true)}
            className="btn-secondary flex items-center space-x-2"
          >
            <Edit2 className="w-4 h-4" />
            <span>Edit Profile</span>
          </button>
        ) : (
          <div className="flex space-x-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className="btn-primary flex items-center space-x-2"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving...' : 'Save'}</span>
            </button>
            <button
              onClick={handleCancel}
              className="btn-secondary flex items-center space-x-2"
            >
              <X className="w-4 h-4" />
              <span>Cancel</span>
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="lg:col-span-1">
          <div className="card text-center">
            <div className="w-24 h-24 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="w-12 h-12 text-primary-600" />
            </div>
            <h2 className="text-xl font-semibold text-academic-900">
              {profile.first_name} {profile.last_name}
            </h2>
            <p className="text-academic-600 mb-2">{profile.email}</p>
            <StatusBadge 
              status={profile.is_active ? 'active' : 'inactive'} 
              text={profile.is_active ? 'Active' : 'Inactive'}
            />
            {profile.student && (
              <div className="mt-4 pt-4 border-t border-academic-200">
                <p className="text-sm text-academic-600">Student ID</p>
                <p className="font-medium text-academic-900">{profile.student.student_id}</p>
              </div>
            )}
          </div>
        </div>

        {/* Profile Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Information */}
          <div className="card">
            <h3 className="text-lg font-semibold text-academic-900 mb-4 flex items-center">
              <User className="w-5 h-5 mr-2" />
              Personal Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-academic-700 mb-1">
                  First Name
                </label>
                {editing ? (
                  <input
                    type="text"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleInputChange}
                    className="input-field"
                  />
                ) : (
                  <p className="text-academic-900">{profile.first_name}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-academic-700 mb-1">
                  Last Name
                </label>
                {editing ? (
                  <input
                    type="text"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleInputChange}
                    className="input-field"
                  />
                ) : (
                  <p className="text-academic-900">{profile.last_name}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-academic-700 mb-1 flex items-center">
                  <Mail className="w-4 h-4 mr-1" />
                  Email
                </label>
                <p className="text-academic-900">{profile.email}</p>
                <p className="text-xs text-academic-500">Email cannot be changed</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-academic-700 mb-1 flex items-center">
                  <Phone className="w-4 h-4 mr-1" />
                  Phone
                </label>
                {editing ? (
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="input-field"
                    placeholder="Enter phone number"
                  />
                ) : (
                  <p className="text-academic-900">{profile.phone || 'Not provided'}</p>
                )}
              </div>
            </div>
          </div>

          {/* Academic Information */}
          {profile.student && (
            <div className="card">
              <h3 className="text-lg font-semibold text-academic-900 mb-4 flex items-center">
                <GraduationCap className="w-5 h-5 mr-2" />
                Academic Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-academic-700 mb-1">
                    Department
                  </label>
                  <p className="text-academic-900 capitalize">
                    {profile.student.department.replace('-', ' ')}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-academic-700 mb-1">
                    Major
                  </label>
                  <p className="text-academic-900">{profile.student.major}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-academic-700 mb-1">
                    Year of Study
                  </label>
                  <p className="text-academic-900">Year {profile.student.year_of_study}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-academic-700 mb-1">
                    GPA
                  </label>
                  {editing ? (
                    <input
                      type="number"
                      name="gpa"
                      value={formData.gpa}
                      onChange={handleInputChange}
                      className="input-field"
                      min="0"
                      max="4"
                      step="0.01"
                      placeholder="Enter GPA"
                    />
                  ) : (
                    <p className="text-academic-900">
                      {profile.student.gpa ? profile.student.gpa.toFixed(2) : 'Not provided'}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-academic-700 mb-1 flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    Enrollment Date
                  </label>
                  <p className="text-academic-900">
                    {new Date(profile.student.enrollment_date).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-academic-700 mb-1">
                    Status
                  </label>
                  <StatusBadge 
                    status={profile.student.is_active ? 'active' : 'inactive'}
                    text={profile.student.is_active ? 'Enrolled' : 'Not Enrolled'}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Account Information */}
          <div className="card">
            <h3 className="text-lg font-semibold text-academic-900 mb-4">
              Account Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-academic-700 mb-1">
                  Account Created
                </label>
                <p className="text-academic-900">
                  {new Date(profile.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-academic-700 mb-1">
                  Last Updated
                </label>
                <p className="text-academic-900">
                  {new Date(profile.updatedAt).toLocaleDateString()}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-academic-700 mb-1">
                  Email Verified
                </label>
                <StatusBadge 
                  status={profile.email_verified ? 'verified' : 'pending'}
                  text={profile.email_verified ? 'Verified' : 'Not Verified'}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-academic-700 mb-1">
                  Last Login
                </label>
                <p className="text-academic-900">
                  {profile.last_login 
                    ? new Date(profile.last_login).toLocaleDateString()
                    : 'Never'
                  }
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;