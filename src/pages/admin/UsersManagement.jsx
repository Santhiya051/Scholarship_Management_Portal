import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  UserCheck,
  UserX,
  Mail,
  Phone,
  Calendar
} from 'lucide-react';
import { adminService } from '../../services/adminService';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Modal from '../../components/common/Modal';
import { toast } from 'react-hot-toast';

const UsersManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await adminService.getAllUsers();
      // Ensure we always have an array
      setUsers(Array.isArray(response.data) ? response.data : response.users || []);
    } catch (error) {
      toast.error('Failed to fetch users');
      console.error('Error fetching users:', error);
      setUsers([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const handleToggleUserStatus = async (userId, currentStatus) => {
    try {
      await adminService.updateUser(userId, { is_active: !currentStatus });
      toast.success(`User ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
      fetchUsers();
    } catch (error) {
      toast.error('Failed to update user status');
      console.error('Error updating user status:', error);
    }
  };

  const handleDeleteUser = async () => {
    try {
      await adminService.deleteUser(userToDelete.id);
      toast.success('User deleted successfully');
      setShowDeleteModal(false);
      setUserToDelete(null);
      fetchUsers();
    } catch (error) {
      toast.error('Failed to delete user');
      console.error('Error deleting user:', error);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = roleFilter === 'all' || user.role?.name === roleFilter;
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'active' && user.is_active) ||
      (statusFilter === 'inactive' && !user.is_active);

    return matchesSearch && matchesRole && matchesStatus;
  });

  if (loading) {
    return <LoadingSpinner text="Loading users..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-academic-900">Users Management</h1>
          <p className="text-academic-600 mt-1">Manage system users and their permissions</p>
        </div>
        <Link
          to="/admin/users/create"
          className="btn btn-primary flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add User</span>
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
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input pl-10"
              />
            </div>
          </div>
          <div className="flex gap-4">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="input"
            >
              <option value="all">All Roles</option>
              <option value="student">Students</option>
              <option value="coordinator">Coordinators</option>
              <option value="committee">Committee</option>
              <option value="finance">Finance</option>
              <option value="admin">Admins</option>
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-academic-200">
            <thead className="bg-academic-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-academic-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-academic-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-academic-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-academic-500 uppercase tracking-wider">
                  Last Login
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-academic-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-academic-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-academic-200">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-academic-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                          <span className="text-sm font-medium text-primary-700">
                            {user.first_name?.[0]}{user.last_name?.[0]}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-academic-900">
                          {user.first_name} {user.last_name}
                        </div>
                        <div className="text-sm text-academic-500 flex items-center">
                          <Mail className="w-3 h-3 mr-1" />
                          {user.email}
                        </div>
                        {user.phone && (
                          <div className="text-sm text-academic-500 flex items-center">
                            <Phone className="w-3 h-3 mr-1" />
                            {user.phone}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {user.role?.display_name || user.role?.name}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge 
                      status={user.is_active ? 'active' : 'inactive'} 
                      size="sm" 
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-academic-500">
                    {user.last_login ? (
                      <div className="flex items-center">
                        <Calendar className="w-3 h-3 mr-1" />
                        {new Date(user.last_login).toLocaleDateString()}
                      </div>
                    ) : (
                      'Never'
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-academic-500">
                    {new Date(user.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => {
                          setSelectedUser(user);
                          setShowUserModal(true);
                        }}
                        className="text-academic-400 hover:text-academic-600"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <Link
                        to={`/admin/users/${user.id}/edit`}
                        className="text-primary-600 hover:text-primary-900"
                        title="Edit User"
                      >
                        <Edit className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => handleToggleUserStatus(user.id, user.is_active)}
                        className={`${user.is_active ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'}`}
                        title={user.is_active ? 'Deactivate User' : 'Activate User'}
                      >
                        {user.is_active ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => {
                          setUserToDelete(user);
                          setShowDeleteModal(true);
                        }}
                        className="text-red-600 hover:text-red-900"
                        title="Delete User"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <Users className="mx-auto h-12 w-12 text-academic-400" />
            <h3 className="mt-2 text-sm font-medium text-academic-900">No users found</h3>
            <p className="mt-1 text-sm text-academic-500">
              {searchTerm || roleFilter !== 'all' || statusFilter !== 'all'
                ? 'Try adjusting your search or filter criteria.'
                : 'Get started by creating a new user.'}
            </p>
          </div>
        )}
      </div>

      {/* User Details Modal */}
      <Modal
        isOpen={showUserModal}
        onClose={() => {
          setShowUserModal(false);
          setSelectedUser(null);
        }}
        title="User Details"
      >
        {selectedUser && (
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <div className="h-16 w-16 rounded-full bg-primary-100 flex items-center justify-center">
                <span className="text-xl font-medium text-primary-700">
                  {selectedUser.first_name?.[0]}{selectedUser.last_name?.[0]}
                </span>
              </div>
              <div>
                <h3 className="text-lg font-medium text-academic-900">
                  {selectedUser.first_name} {selectedUser.last_name}
                </h3>
                <p className="text-academic-600">{selectedUser.role?.display_name}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-academic-700">Email</label>
                <p className="text-sm text-academic-900">{selectedUser.email}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-academic-700">Phone</label>
                <p className="text-sm text-academic-900">{selectedUser.phone || 'Not provided'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-academic-700">Status</label>
                <StatusBadge status={selectedUser.is_active ? 'active' : 'inactive'} size="sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-academic-700">Email Verified</label>
                <StatusBadge status={selectedUser.email_verified ? 'verified' : 'pending'} size="sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-academic-700">Last Login</label>
                <p className="text-sm text-academic-900">
                  {selectedUser.last_login ? new Date(selectedUser.last_login).toLocaleString() : 'Never'}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-academic-700">Created</label>
                <p className="text-sm text-academic-900">
                  {new Date(selectedUser.created_at).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setUserToDelete(null);
        }}
        title="Delete User"
      >
        {userToDelete && (
          <div className="space-y-4">
            <p className="text-academic-600">
              Are you sure you want to delete <strong>{userToDelete.first_name} {userToDelete.last_name}</strong>? 
              This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setUserToDelete(null);
                }}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteUser}
                className="btn btn-danger"
              >
                Delete User
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default UsersManagement;