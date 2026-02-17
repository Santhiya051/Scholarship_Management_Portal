import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  Award,
  FileText,
  BarChart3,
  Settings,
  DollarSign,
  Bell,
  Shield,
  BookOpen,
  UserCheck
} from 'lucide-react';

const Sidebar = () => {
  const { user } = useAuth();
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const getNavigationItems = () => {
    const role = user?.role?.name;
    
    const commonItems = [
      {
        name: 'Dashboard',
        href: '/dashboard',
        icon: LayoutDashboard,
        roles: ['student', 'coordinator', 'committee', 'finance', 'admin']
      }
    ];

    const studentItems = [
      {
        name: 'My Profile',
        href: '/profile',
        icon: UserCheck,
        roles: ['student']
      },
      {
        name: 'Scholarships',
        href: '/scholarships',
        icon: Award,
        roles: ['student']
      },
      {
        name: 'My Applications',
        href: '/applications',
        icon: FileText,
        roles: ['student']
      }
    ];

    const coordinatorItems = [
      {
        name: 'My Scholarships',
        href: '/coordinator/scholarships',
        icon: Award,
        roles: ['coordinator']
      },
      {
        name: 'All Scholarships',
        href: '/admin/scholarships',
        icon: BookOpen,
        roles: ['coordinator']
      },
      {
        name: 'Applications',
        href: '/admin/applications',
        icon: FileText,
        roles: ['coordinator']
      },
      {
        name: 'Reports & Analytics',
        href: '/admin/reports',
        icon: BarChart3,
        roles: ['coordinator']
      },
      {
        name: 'Notifications',
        href: '/admin/notifications',
        icon: Bell,
        roles: ['coordinator']
      }
    ];

    const committeeItems = [
      {
        name: 'Application Review',
        href: '/committee/review',
        icon: FileText,
        roles: ['committee']
      },
      {
        name: 'All Applications',
        href: '/admin/applications',
        icon: BookOpen,
        roles: ['committee']
      },
      {
        name: 'Reports & Analytics',
        href: '/admin/reports',
        icon: BarChart3,
        roles: ['committee']
      }
    ];

    const adminItems = [
      {
        name: 'Users Management',
        href: '/admin/users',
        icon: Users,
        roles: ['admin']
      },
      {
        name: 'Scholarships',
        href: '/admin/scholarships',
        icon: Award,
        roles: ['admin', 'coordinator']
      },
      {
        name: 'Applications',
        href: '/admin/applications',
        icon: FileText,
        roles: ['admin', 'coordinator', 'committee']
      },
      {
        name: 'Reports & Analytics',
        href: '/admin/reports',
        icon: BarChart3,
        roles: ['admin', 'coordinator', 'committee', 'finance']
      },
      {
        name: 'Payments',
        href: '/admin/payments',
        icon: DollarSign,
        roles: ['admin', 'finance']
      },
      {
        name: 'Notifications',
        href: '/admin/notifications',
        icon: Bell,
        roles: ['admin', 'coordinator']
      },
      {
        name: 'System Settings',
        href: '/admin/settings',
        icon: Settings,
        roles: ['admin']
      }
    ];

    let items = [...commonItems];
    
    if (role === 'student') {
      items = [...items, ...studentItems];
    } else if (role === 'coordinator') {
      items = [...items, ...coordinatorItems];
    } else if (role === 'committee') {
      items = [...items, ...committeeItems];
    } else if (role === 'finance') {
      items = [...items, ...adminItems.filter(item => item.roles.includes('finance'))];
    } else if (role === 'admin') {
      items = [...items, ...adminItems];
    }

    return items.filter(item => item.roles.includes(role));
  };

  const navigationItems = getNavigationItems();

  return (
    <div className="w-64 bg-white shadow-sm border-r border-academic-200 h-full">
      <div className="p-4">
        <div className="space-y-1">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  isActive(item.href)
                    ? 'bg-primary-50 text-primary-700 border-r-2 border-primary-600'
                    : 'text-academic-600 hover:bg-academic-50 hover:text-academic-900'
                }`}
              >
                <Icon className={`mr-3 h-5 w-5 ${
                  isActive(item.href) ? 'text-primary-600' : 'text-academic-400'
                }`} />
                {item.name}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Role Badge */}
      <div className="absolute bottom-4 left-4 right-4">
        <div className="bg-academic-50 rounded-lg p-3">
          <div className="flex items-center space-x-2">
            <Shield className="w-4 h-4 text-academic-500" />
            <div>
              <p className="text-xs font-medium text-academic-900">
                {user?.first_name} {user?.last_name}
              </p>
              <p className="text-xs text-academic-500">
                {user?.role?.display_name || user?.role?.name}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;