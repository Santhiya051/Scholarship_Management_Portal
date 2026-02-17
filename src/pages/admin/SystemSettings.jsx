import React, { useState, useEffect } from 'react';
import {
  Settings,
  Save,
  Database,
  Mail,
  Shield,
  Globe,
  Upload,
  FileText,
  Users,
  Bell,
  Palette,
  Server
} from 'lucide-react';
import { adminService } from '../../services/adminService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { toast } from 'react-hot-toast';

const SystemSettings = () => {
  const [settings, setSettings] = useState({
    general: {
      site_name: '',
      site_description: '',
      admin_email: '',
      support_email: '',
      timezone: 'UTC',
      language: 'en'
    },
    application: {
      max_file_size: 10,
      allowed_file_types: ['pdf', 'doc', 'docx', 'jpg', 'png'],
      auto_approve_threshold: 85,
      require_email_verification: true,
      enable_notifications: true
    },
    email: {
      smtp_host: '',
      smtp_port: 587,
      smtp_username: '',
      smtp_password: '',
      from_email: '',
      from_name: ''
    },
    security: {
      session_timeout: 30,
      password_min_length: 8,
      require_strong_passwords: true,
      enable_two_factor: false,
      login_attempts_limit: 5
    }
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('general');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await adminService.getSystemSettings();
      setSettings(response.data || settings);
    } catch (error) {
      toast.error('Failed to fetch settings');
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await adminService.updateSystemSettings(settings);
      toast.success('Settings saved successfully');
    } catch (error) {
      toast.error('Failed to save settings');
      console.error('Error saving settings:', error);
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = (category, key, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }));
  };

  const tabs = [
    { id: 'general', name: 'General', icon: Globe },
    { id: 'application', name: 'Application', icon: FileText },
    { id: 'email', name: 'Email', icon: Mail },
    { id: 'security', name: 'Security', icon: Shield }
  ];

  if (loading) {
    return <LoadingSpinner text="Loading settings..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-academic-900">System Settings</h1>
          <p className="text-academic-600 mt-1">Configure system-wide settings and preferences</p>
        </div>
        <button 
          onClick={handleSave} 
          disabled={saving}
          className="btn btn-primary flex items-center space-x-2"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'Saving...' : 'Save Changes'}</span>
        </button>
      </div>

      <div className="flex space-x-6">
        {/* Sidebar Navigation */}
        <div className="w-64 space-y-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  activeTab === tab.id
                    ? 'bg-primary-50 text-primary-700 border-r-2 border-primary-600'
                    : 'text-academic-600 hover:bg-academic-50 hover:text-academic-900'
                }`}
              >
                <Icon className={`mr-3 h-5 w-5 ${
                  activeTab === tab.id ? 'text-primary-600' : 'text-academic-400'
                }`} />
                {tab.name}
              </button>
            );
          })}
        </div>

        {/* Settings Content */}
        <div className="flex-1">
          {activeTab === 'general' && (
            <div className="card">
              <h3 className="text-lg font-medium text-academic-900 mb-6 flex items-center">
                <Globe className="w-5 h-5 mr-2" />
                General Settings
              </h3>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-academic-700 mb-2">
                      Site Name
                    </label>
                    <input
                      type="text"
                      value={settings.general.site_name}
                      onChange={(e) => updateSetting('general', 'site_name', e.target.value)}
                      className="input"
                      placeholder="ScholarPortal"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-academic-700 mb-2">
                      Admin Email
                    </label>
                    <input
                      type="email"
                      value={settings.general.admin_email}
                      onChange={(e) => updateSetting('general', 'admin_email', e.target.value)}
                      className="input"
                      placeholder="admin@scholarportal.com"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-academic-700 mb-2">
                    Site Description
                  </label>
                  <textarea
                    value={settings.general.site_description}
                    onChange={(e) => updateSetting('general', 'site_description', e.target.value)}
                    className="input"
                    rows="3"
                    placeholder="Scholarship Management System"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-academic-700 mb-2">
                      Support Email
                    </label>
                    <input
                      type="email"
                      value={settings.general.support_email}
                      onChange={(e) => updateSetting('general', 'support_email', e.target.value)}
                      className="input"
                      placeholder="support@scholarportal.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-academic-700 mb-2">
                      Timezone
                    </label>
                    <select
                      value={settings.general.timezone}
                      onChange={(e) => updateSetting('general', 'timezone', e.target.value)}
                      className="input"
                    >
                      <option value="UTC">UTC</option>
                      <option value="America/New_York">Eastern Time</option>
                      <option value="America/Chicago">Central Time</option>
                      <option value="America/Denver">Mountain Time</option>
                      <option value="America/Los_Angeles">Pacific Time</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'application' && (
            <div className="card">
              <h3 className="text-lg font-medium text-academic-900 mb-6 flex items-center">
                <FileText className="w-5 h-5 mr-2" />
                Application Settings
              </h3>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-academic-700 mb-2">
                      Max File Size (MB)
                    </label>
                    <input
                      type="number"
                      value={settings.application.max_file_size}
                      onChange={(e) => updateSetting('application', 'max_file_size', parseInt(e.target.value))}
                      className="input"
                      min="1"
                      max="100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-academic-700 mb-2">
                      Auto-Approve Threshold (Score)
                    </label>
                    <input
                      type="number"
                      value={settings.application.auto_approve_threshold}
                      onChange={(e) => updateSetting('application', 'auto_approve_threshold', parseInt(e.target.value))}
                      className="input"
                      min="0"
                      max="100"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-academic-700 mb-2">
                    Allowed File Types
                  </label>
                  <div className="flex flex-wrap gap-3">
                    {['pdf', 'doc', 'docx', 'jpg', 'png', 'txt', 'rtf'].map((type) => (
                      <label key={type} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={settings.application.allowed_file_types.includes(type)}
                          onChange={(e) => {
                            const types = settings.application.allowed_file_types;
                            if (e.target.checked) {
                              updateSetting('application', 'allowed_file_types', [...types, type]);
                            } else {
                              updateSetting('application', 'allowed_file_types', types.filter(t => t !== type));
                            }
                          }}
                          className="rounded border-academic-300 text-primary-600 focus:ring-primary-500"
                        />
                        <span className="ml-2 text-sm text-academic-700 uppercase">{type}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div className="space-y-3">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={settings.application.require_email_verification}
                      onChange={(e) => updateSetting('application', 'require_email_verification', e.target.checked)}
                      className="rounded border-academic-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="ml-2 text-sm text-academic-700">
                      Require email verification for new accounts
                    </span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={settings.application.enable_notifications}
                      onChange={(e) => updateSetting('application', 'enable_notifications', e.target.checked)}
                      className="rounded border-academic-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="ml-2 text-sm text-academic-700">
                      Enable system notifications
                    </span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'email' && (
            <div className="card">
              <h3 className="text-lg font-medium text-academic-900 mb-6 flex items-center">
                <Mail className="w-5 h-5 mr-2" />
                Email Settings
              </h3>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-academic-700 mb-2">
                      SMTP Host
                    </label>
                    <input
                      type="text"
                      value={settings.email.smtp_host}
                      onChange={(e) => updateSetting('email', 'smtp_host', e.target.value)}
                      className="input"
                      placeholder="smtp.gmail.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-academic-700 mb-2">
                      SMTP Port
                    </label>
                    <input
                      type="number"
                      value={settings.email.smtp_port}
                      onChange={(e) => updateSetting('email', 'smtp_port', parseInt(e.target.value))}
                      className="input"
                      placeholder="587"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-academic-700 mb-2">
                      SMTP Username
                    </label>
                    <input
                      type="text"
                      value={settings.email.smtp_username}
                      onChange={(e) => updateSetting('email', 'smtp_username', e.target.value)}
                      className="input"
                      placeholder="your-email@gmail.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-academic-700 mb-2">
                      SMTP Password
                    </label>
                    <input
                      type="password"
                      value={settings.email.smtp_password}
                      onChange={(e) => updateSetting('email', 'smtp_password', e.target.value)}
                      className="input"
                      placeholder="••••••••"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-academic-700 mb-2">
                      From Email
                    </label>
                    <input
                      type="email"
                      value={settings.email.from_email}
                      onChange={(e) => updateSetting('email', 'from_email', e.target.value)}
                      className="input"
                      placeholder="noreply@scholarportal.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-academic-700 mb-2">
                      From Name
                    </label>
                    <input
                      type="text"
                      value={settings.email.from_name}
                      onChange={(e) => updateSetting('email', 'from_name', e.target.value)}
                      className="input"
                      placeholder="ScholarPortal"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="card">
              <h3 className="text-lg font-medium text-academic-900 mb-6 flex items-center">
                <Shield className="w-5 h-5 mr-2" />
                Security Settings
              </h3>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-academic-700 mb-2">
                      Session Timeout (minutes)
                    </label>
                    <input
                      type="number"
                      value={settings.security.session_timeout}
                      onChange={(e) => updateSetting('security', 'session_timeout', parseInt(e.target.value))}
                      className="input"
                      min="5"
                      max="480"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-academic-700 mb-2">
                      Password Minimum Length
                    </label>
                    <input
                      type="number"
                      value={settings.security.password_min_length}
                      onChange={(e) => updateSetting('security', 'password_min_length', parseInt(e.target.value))}
                      className="input"
                      min="6"
                      max="32"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-academic-700 mb-2">
                    Login Attempts Limit
                  </label>
                  <input
                    type="number"
                    value={settings.security.login_attempts_limit}
                    onChange={(e) => updateSetting('security', 'login_attempts_limit', parseInt(e.target.value))}
                    className="input"
                    min="3"
                    max="10"
                  />
                </div>
                <div className="space-y-3">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={settings.security.require_strong_passwords}
                      onChange={(e) => updateSetting('security', 'require_strong_passwords', e.target.checked)}
                      className="rounded border-academic-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="ml-2 text-sm text-academic-700">
                      Require strong passwords (uppercase, lowercase, numbers, symbols)
                    </span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={settings.security.enable_two_factor}
                      onChange={(e) => updateSetting('security', 'enable_two_factor', e.target.checked)}
                      className="rounded border-academic-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="ml-2 text-sm text-academic-700">
                      Enable two-factor authentication
                    </span>
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SystemSettings;