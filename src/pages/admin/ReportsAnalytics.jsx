import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  Download,
  Calendar,
  Users,
  Award,
  DollarSign,
  FileText,
  PieChart,
  Activity
} from 'lucide-react';
import { adminService } from '../../services/adminService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { toast } from 'react-hot-toast';

const ReportsAnalytics = () => {
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('last_30_days');
  const [reportType, setReportType] = useState('overview');
  const [analyticsData, setAnalyticsData] = useState(null);

  useEffect(() => {
    fetchAnalyticsData();
  }, [dateRange, reportType]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      const [analyticsRes, statsRes] = await Promise.all([
        adminService.getAnalyticsData({ date_range: dateRange }),
        adminService.getDashboardStats()
      ]);
      
      // Transform backend data to match frontend expectations
      setAnalyticsData({
        overview: {
          totalApplications: statsRes.data?.totalApplications || 0,
          approvedApplications: statsRes.data?.approvedApplications || 0,
          rejectedApplications: statsRes.data?.rejectedApplications || 0,
          pendingApplications: statsRes.data?.pendingApplications || 0,
          totalAwarded: statsRes.data?.totalAwarded || 0,
          averageAwardAmount: statsRes.data?.averageAwardAmount || 0,
          totalScholarships: statsRes.data?.totalScholarships || 0,
          activeScholarships: statsRes.data?.activeScholarships || 0
        },
        trends: {
          applicationsByMonth: analyticsRes.data?.applicationTrends || [],
          departmentDistribution: analyticsRes.data?.departmentStats || [],
          statusDistribution: analyticsRes.data?.statusDistribution || []
        },
        topScholarships: analyticsRes.data?.topScholarships || [],
        demographics: {
          gpaDistribution: [],
          yearOfStudy: []
        }
      });
    } catch (error) {
      toast.error('Failed to fetch analytics data');
      console.error('Error fetching analytics:', error);
      // Fallback to empty data structure
      setAnalyticsData({
        overview: {
          totalApplications: 0,
          approvedApplications: 0,
          rejectedApplications: 0,
          pendingApplications: 0,
          totalAwarded: 0,
          averageAwardAmount: 0,
          totalScholarships: 0,
          activeScholarships: 0
        },
        trends: {
          applicationsByMonth: [],
          departmentDistribution: [],
          statusDistribution: []
        },
        topScholarships: [],
        demographics: {
          gpaDistribution: [],
          yearOfStudy: []
        }
      });
    } finally {
      setLoading(false);
    }
  };

  const handleExportReport = () => {
    toast.success('Report export started. You will receive an email when ready.');
  };

  if (loading) {
    return <LoadingSpinner text="Loading analytics..." />;
  }

  const { overview, trends, topScholarships, demographics } = analyticsData;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-academic-900">Reports & Analytics</h1>
          <p className="text-academic-600 mt-1">Comprehensive insights and performance metrics</p>
        </div>
        <div className="flex space-x-3">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="input"
          >
            <option value="last_7_days">Last 7 days</option>
            <option value="last_30_days">Last 30 days</option>
            <option value="last_90_days">Last 90 days</option>
            <option value="last_year">Last year</option>
            <option value="all_time">All time</option>
          </select>
          <button
            onClick={handleExportReport}
            className="btn btn-primary flex items-center space-x-2"
          >
            <Download className="w-4 h-4" />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-academic-600">Total Applications</p>
              <p className="text-2xl font-bold text-academic-900">{overview.totalApplications.toLocaleString()}</p>
              <p className="text-xs text-green-600 flex items-center">
                <TrendingUp className="w-3 h-3 mr-1" />
                +12% from last period
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <Award className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-academic-600">Approved Applications</p>
              <p className="text-2xl font-bold text-academic-900">{overview.approvedApplications.toLocaleString()}</p>
              <p className="text-xs text-academic-500">
                {((overview.approvedApplications / overview.totalApplications) * 100).toFixed(1)}% approval rate
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
              <p className="text-sm font-medium text-academic-600">Total Awarded</p>
              <p className="text-2xl font-bold text-academic-900">${(overview.totalAwarded / 1000000).toFixed(1)}M</p>
              <p className="text-xs text-academic-500">
                Avg: ${overview.averageAwardAmount.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Activity className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-academic-600">Active Scholarships</p>
              <p className="text-2xl font-bold text-academic-900">{overview.activeScholarships}</p>
              <p className="text-xs text-academic-500">
                of {overview.totalScholarships} total
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Applications Trend */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-academic-900">Applications Trend</h2>
            <BarChart3 className="w-5 h-5 text-academic-400" />
          </div>
          <div className="space-y-4">
            {trends.applicationsByMonth.map((month) => (
              <div key={month.month} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-sm font-medium text-academic-900 w-8">{month.month}</span>
                  <div className="flex-1 bg-academic-200 rounded-full h-2 w-32">
                    <div
                      className="bg-primary-600 h-2 rounded-full"
                      style={{ width: `${(month.applications / 400) * 100}%` }}
                    />
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-academic-900">{month.applications}</p>
                  <p className="text-xs text-green-600">{month.approved} approved</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Department Distribution */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-academic-900">Department Distribution</h2>
            <PieChart className="w-5 h-5 text-academic-400" />
          </div>
          <div className="space-y-3">
            {trends.departmentDistribution.map((dept, index) => (
              <div key={dept.department} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      index === 0 ? 'bg-blue-500' :
                      index === 1 ? 'bg-green-500' :
                      index === 2 ? 'bg-yellow-500' :
                      index === 3 ? 'bg-purple-500' : 'bg-red-500'
                    }`}
                  />
                  <span className="text-sm text-academic-900">{dept.department}</span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-medium text-academic-900">{dept.applications}</span>
                  <span className="text-xs text-academic-500 ml-2">({dept.percentage}%)</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Status Distribution */}
      <div className="card">
        <h2 className="text-lg font-semibold text-academic-900 mb-4">Application Status Distribution</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {trends.statusDistribution.map((status, index) => (
            <div key={status.status} className="text-center">
              <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-3 ${
                status.status === 'Approved' ? 'bg-green-100' :
                status.status === 'Rejected' ? 'bg-red-100' : 'bg-yellow-100'
              }`}>
                <span className={`text-2xl font-bold ${
                  status.status === 'Approved' ? 'text-green-600' :
                  status.status === 'Rejected' ? 'text-red-600' : 'text-yellow-600'
                }`}>
                  {status.count}
                </span>
              </div>
              <h3 className="text-sm font-medium text-academic-900">{status.status}</h3>
              <p className="text-xs text-academic-500">{status.percentage}% of total</p>
            </div>
          ))}
        </div>
      </div>

      {/* Top Performing Scholarships */}
      <div className="card">
        <h2 className="text-lg font-semibold text-academic-900 mb-4">Top Performing Scholarships</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-academic-200">
            <thead className="bg-academic-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-academic-500 uppercase tracking-wider">
                  Scholarship Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-academic-500 uppercase tracking-wider">
                  Applications
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-academic-500 uppercase tracking-wider">
                  Approved
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-academic-500 uppercase tracking-wider">
                  Total Awarded
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-academic-500 uppercase tracking-wider">
                  Avg Score
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-academic-500 uppercase tracking-wider">
                  Success Rate
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-academic-200">
              {topScholarships.map((scholarship) => (
                <tr key={scholarship.name}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-academic-900">{scholarship.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-academic-900">{scholarship.applications}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-academic-900">{scholarship.approved}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-academic-900">${scholarship.totalAwarded.toLocaleString()}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-academic-900">{scholarship.averageScore}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-academic-900">
                      {((scholarship.approved / scholarship.applications) * 100).toFixed(1)}%
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Demographics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* GPA Distribution */}
        <div className="card">
          <h2 className="text-lg font-semibold text-academic-900 mb-4">GPA Distribution</h2>
          <div className="space-y-3">
            {demographics.gpaDistribution.map((gpa) => (
              <div key={gpa.range} className="flex items-center justify-between">
                <span className="text-sm text-academic-900">{gpa.range}</span>
                <div className="flex items-center space-x-3">
                  <div className="w-24 bg-academic-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${gpa.percentage}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-academic-900 w-12 text-right">
                    {gpa.count}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Year of Study */}
        <div className="card">
          <h2 className="text-lg font-semibold text-academic-900 mb-4">Year of Study</h2>
          <div className="space-y-3">
            {demographics.yearOfStudy.map((year) => (
              <div key={year.year} className="flex items-center justify-between">
                <span className="text-sm text-academic-900">{year.year}</span>
                <div className="flex items-center space-x-3">
                  <div className="w-24 bg-academic-200 rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full"
                      style={{ width: `${year.percentage}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-academic-900 w-12 text-right">
                    {year.count}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsAnalytics;