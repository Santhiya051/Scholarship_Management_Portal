import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  Bell, 
  User, 
  LogOut, 
  Settings, 
  Menu, 
  X,
  GraduationCap 
} from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getRoleDisplayName = (role) => {
    const roleNames = {
      student: 'Student',
      coordinator: 'Department Coordinator',
      committee: 'Scholarship Committee',
      finance: 'Finance Officer',
      admin: 'Administrator'
    };
    return roleNames[role] || role;
  };

  return (
    <nav className="bg-white shadow-sm border-b border-academic-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <GraduationCap className="w-8 h-8 text-primary-600" />
              <span className="text-xl font-bold text-academic-900">
                ScholarPortal
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Notifications */}
            <button className="relative p-2 text-academic-600 hover:text-primary-600 transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-2 p-2 rounded-lg hover:bg-academic-50 transition-colors"
              >
                <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-primary-600" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium text-academic-900">
                    {user?.first_name} {user?.last_name}
                  </p>
                  <p className="text-xs text-academic-500">
                    {getRoleDisplayName(user?.role?.name)}
                  </p>
                </div>
              </button>

              {/* User Dropdown */}
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-academic-200 py-1 z-50">
                  <Link
                    to="/profile"
                    className="flex items-center px-4 py-2 text-sm text-academic-700 hover:bg-academic-50"
                    onClick={() => setShowUserMenu(false)}
                  >
                    <User className="w-4 h-4 mr-2" />
                    Profile
                  </Link>
                  <Link
                    to="/settings"
                    className="flex items-center px-4 py-2 text-sm text-academic-700 hover:bg-academic-50"
                    onClick={() => setShowUserMenu(false)}
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Settings
                  </Link>
                  <hr className="my-1 border-academic-200" />
                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="p-2 text-academic-600 hover:text-primary-600"
            >
              {showMobileMenu ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {showMobileMenu && (
        <div className="md:hidden bg-white border-t border-academic-200">
          <div className="px-4 py-2 space-y-2">
            <div className="flex items-center space-x-2 p-2">
              <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-primary-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-academic-900">
                  {user?.first_name} {user?.last_name}
                </p>
                <p className="text-xs text-academic-500">
                  {getRoleDisplayName(user?.role?.name)}
                </p>
              </div>
            </div>
            <Link
              to="/profile"
              className="block px-4 py-2 text-sm text-academic-700 hover:bg-academic-50 rounded"
              onClick={() => setShowMobileMenu(false)}
            >
              Profile
            </Link>
            <Link
              to="/settings"
              className="block px-4 py-2 text-sm text-academic-700 hover:bg-academic-50 rounded"
              onClick={() => setShowMobileMenu(false)}
            >
              Settings
            </Link>
            <button
              onClick={handleLogout}
              className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded"
            >
              Sign Out
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;