import React from 'react';
import { User } from 'lucide-react';

const Avatar = ({ user, size = 'md', showName = false, className = '' }) => {
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-lg'
  };

  const getInitials = () => {
    if (!user) return '?';
    const firstName = user.first_name || user.firstName || '';
    const lastName = user.last_name || user.lastName || '';
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || '?';
  };

  const getColorFromName = () => {
    if (!user) return 'bg-academic-400';
    const name = `${user.first_name || ''}${user.last_name || ''}`;
    const colors = [
      'bg-blue-500',
      'bg-green-500',
      'bg-yellow-500',
      'bg-purple-500',
      'bg-pink-500',
      'bg-indigo-500',
      'bg-red-500',
      'bg-orange-500'
    ];
    const index = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
    return colors[index];
  };

  const fullName = user ? `${user.first_name || ''} ${user.last_name || ''}`.trim() : 'Unknown';

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <div
        className={`${sizeClasses[size]} ${getColorFromName()} rounded-full flex items-center justify-center text-white font-medium flex-shrink-0`}
        title={fullName}
      >
        {user?.avatar_url ? (
          <img
            src={user.avatar_url}
            alt={fullName}
            className="w-full h-full rounded-full object-cover"
          />
        ) : (
          <span>{getInitials()}</span>
        )}
      </div>
      {showName && (
        <span className="text-academic-900 font-medium truncate">{fullName}</span>
      )}
    </div>
  );
};

export default Avatar;
