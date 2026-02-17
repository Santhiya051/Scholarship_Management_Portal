import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  CreditCard,
  Calendar,
  BarChart3,
  AlertCircle,
  FileText,
  Users,
  Award
} from 'lucide-react';
import { adminService } from '../../services/adminService';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { toast } from 'react-hot-toast';

const FinanceDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await adminService.getDashboardStats();
      
      // Finance-specific data structure
      setDashboardData({
        stats: {
          totalPayments: 156,
          pendingPayments: 23,
          completedPayments: 133,
          totalDisbursed: 1250000,
          monthlyBudget: 200000,
          budgetUtilized: 78.5,
          averagePayment: 8012,
          paymentErrors: 2
        },
        recentPayments: [
          {
            id: 1,
            studentName: 'Alice Johnson',
            scholarshipName: 'Merit Excellence Scholarship',
            amount: 5000,
            status: 'pending',
            scheduledDate: '2024-02-05',
            paymentMethod: 'bank_transfer'
          },
          {
            id: 2,
            studentName: 'Bob Smith',
            scholarshipName: 'STEM Innovation Grant',
            amount: 7500,
            status: 'completed',
            processedDate: '2024-02-01',
            paymentMethod: 'direct_deposit'
          },
          {
            id: 3,
            studentName: 'Carol Davis',
            scholarshipName: 'Leadership Award',
            amount: 6000,
            status: 'processing',
            scheduledDate: '2024-02-03',
            paymentMethod: 'check'
          }
        ],
        budgetBreakdown: [
          {
            category: 'Merit-Based Scholarships',
            allocated: 800000,
            spent: 650000,
            remaining: 150000,
            percentage: 81.25
          },
          {
            category: 'Need-Based Scholarships',
            allocated: 600000,
            spent: 420000,
            remaining: 180000,
            percentage: 70
          },
          {
            category: 'Research Grants',
            allocated: 400000,
            spent: 180000,
            remaining: 220000,
            percentage: 45
          }
        ],
        upcomingPayments: [
          {
            id: 1,
            dueDate: '2024-02-05',
            count: 12,
            totalAmount: 84000,
            priority: 'high'
          },
          {
            id: 2,
            dueDate: '2024-02-08',
            count: 8,
            totalAmount: 56000,
            priority: 'medium'
          },
          {
            id: 3,
            dueDate: '2024-02-12',
            count: 15,
            totalAmount: 105000,
            priority: 'low'
          }
        ],
        monthlyTrends: [
          { month: 'Oct', disbursed: 180000, budget: 200000 },
          { month: 'Nov', disbursed: 195000, budget: 200000 },
          { month: 'Dec', disbursed: 175000, budget: 200000 },
          { month: 'Jan', disbursed: 210000, budget: 220000 },
          { month: 'Feb', disbursed: 157000, budget: 200000 }
        ]
      });
    } catch (error) {
      toast.error('Failed to fetch dashboard data');
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading finance dashboard..." />;
  }

  const { stats, recentPayments, budgetBreakdown, upcomingPayments, monthlyTrends } = dashboardData;

  const getBudgetColor = (percentage) => {
    if (percentage >= 90) return 'text-red-600 bg-red-50';
    if (percentage >= 75) return 'text-yellow-600 bg-yellow-50';
    return 'text-green-600 bg-green-50';
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-lg p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">Finance Dashboard</h1>
        <p className="text-green-100">
          Manage scholarship payments and financial operations
        </p>
      </div>

      {/* Financial Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-academic-600">Total Disbursed</p>
              <p className="text-2xl font-bold text-academic-900">${(stats.totalDisbursed / 1000000).toFixed(1)}M</p>
              <p className="text-xs text-green-600 flex items-center">
                <TrendingUp className="w-3 h-3 mr-1" />
                +12% from last month
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <CreditCard className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-academic-600">Total Payments</p>
              <p className="text-2xl font-bold text-academic-900">{stats.totalPayments}</p>
              <p className="text-xs text-academic-500">
                Avg: ${stats.averagePayment.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-academic-600">Pending Payments</p>
              <p className="text-2xl font-bold text-academic-900">{stats.pendingPayments}</p>
              <p className="text-xs text-green-600">
                {stats.completedPayments} completed
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <BarChart3 className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-academic-600">Budget Utilized</p>
              <p className="text-2xl font-bold text-academic-900">{stats.budgetUtilized}%</p>
              <p className="text-xs text-red-600 flex items-center">
                <AlertCircle className="w-3 h-3 mr-1" />
                {stats.paymentErrors} errors
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Budget Overview */}
      <div className="card">
        <h2 className="text-lg font-semibold text-academic-900 mb-4">Budget Breakdown</h2>
        <div className="space-y-4">
          {budgetBreakdown.map((budget, index) => (
            <div key={index} className="border border-academic-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium text-academic-900">{budget.category}</h3>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getBudgetColor(budget.percentage)}`}>
                  {budget.percentage}% used
                </span>
              </div>
              <div className="grid grid-cols-3 gap-4 mb-3">
                <div>
                  <p className="text-xs text-academic-500">Allocated</p>
                  <p className="text-sm font-medium text-academic-900">${budget.allocated.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-academic-500">Spent</p>
                  <p className="text-sm font-medium text-academic-900">${budget.spent.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-academic-500">Remaining</p>
                  <p className="text-sm font-medium text-academic-900">${budget.remaining.toLocaleString()}</p>
                </div>
              </div>
              <div className="w-full bg-academic-200 rounded-full h-2">
                <div
                  className="bg-green-600 h-2 rounded-full"
                  style={{ width: `${budget.percentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Payments */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-academic-900">Recent Payments</h2>
            <Link to="/admin/payments" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
              View All
            </Link>
          </div>
          <div className="space-y-4">
            {recentPayments.map((payment) => (
              <div key={payment.id} className="border border-academic-200 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-medium text-academic-900 mb-1">{payment.studentName}</h3>
                    <p className="text-sm text-academic-600 mb-2">{payment.scholarshipName}</p>
                    <div className="flex items-center space-x-4 text-xs text-academic-500">
                      <span className="flex items-center">
                        <DollarSign className="w-3 h-3 mr-1" />
                        ${payment.amount.toLocaleString()}
                      </span>
                      <span className="flex items-center">
                        <CreditCard className="w-3 h-3 mr-1" />
                        {payment.paymentMethod.replace('_', ' ')}
                      </span>
                      <span className="flex items-center">
                        <Calendar className="w-3 h-3 mr-1" />
                        {payment.processedDate ? 
                          new Date(payment.processedDate).toLocaleDateString() :
                          new Date(payment.scheduledDate).toLocaleDateString()
                        }
                      </span>
                    </div>
                  </div>
                  <StatusBadge status={payment.status} size="sm" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Payment Batches */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-academic-900">Upcoming Payment Batches</h2>
            <Link to="/admin/payments?status=pending" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
              Process Payments
            </Link>
          </div>
          <div className="space-y-4">
            {upcomingPayments.map((batch) => (
              <div key={batch.id} className="border border-academic-200 rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-medium text-academic-900">
                      {batch.count} payments due
                    </h3>
                    <p className="text-sm text-academic-600">
                      Total: ${batch.totalAmount.toLocaleString()}
                    </p>
                  </div>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(batch.priority)}`}>
                    {batch.priority}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-academic-500 flex items-center">
                    <Calendar className="w-3 h-3 mr-1" />
                    Due: {new Date(batch.dueDate).toLocaleDateString()}
                  </span>
                  <Link
                    to={`/admin/payments?due_date=${batch.dueDate}`}
                    className="text-xs text-primary-600 hover:text-primary-800 font-medium"
                  >
                    Process →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Monthly Trends */}
      <div className="card">
        <h2 className="text-lg font-semibold text-academic-900 mb-4">Monthly Disbursement Trends</h2>
        <div className="space-y-4">
          {monthlyTrends.map((month) => (
            <div key={month.month} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="text-sm font-medium text-academic-900 w-8">{month.month}</span>
                <div className="flex-1 bg-academic-200 rounded-full h-2 w-32">
                  <div
                    className="bg-green-600 h-2 rounded-full"
                    style={{ width: `${(month.disbursed / month.budget) * 100}%` }}
                  />
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-academic-900">
                  ${(month.disbursed / 1000).toFixed(0)}K
                </p>
                <p className="text-xs text-academic-500">
                  of ${(month.budget / 1000).toFixed(0)}K
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card">
        <h2 className="text-lg font-semibold text-academic-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            to="/admin/payments?status=pending"
            className="flex items-center p-4 border border-academic-200 rounded-lg hover:bg-academic-50 transition-colors"
          >
            <Clock className="w-8 h-8 text-primary-600 mr-3" />
            <div>
              <p className="font-medium text-academic-900">Process Payments</p>
              <p className="text-sm text-academic-600">Review pending</p>
            </div>
          </Link>

          <Link
            to="/admin/reports"
            className="flex items-center p-4 border border-academic-200 rounded-lg hover:bg-academic-50 transition-colors"
          >
            <BarChart3 className="w-8 h-8 text-primary-600 mr-3" />
            <div>
              <p className="font-medium text-academic-900">Financial Reports</p>
              <p className="text-sm text-academic-600">View analytics</p>
            </div>
          </Link>

          <Link
            to="/admin/payments?status=failed"
            className="flex items-center p-4 border border-academic-200 rounded-lg hover:bg-academic-50 transition-colors"
          >
            <AlertCircle className="w-8 h-8 text-primary-600 mr-3" />
            <div>
              <p className="font-medium text-academic-900">Payment Issues</p>
              <p className="text-sm text-academic-600">Resolve errors</p>
            </div>
          </Link>

          <Link
            to="/admin/applications?status=approved"
            className="flex items-center p-4 border border-academic-200 rounded-lg hover:bg-academic-50 transition-colors"
          >
            <Award className="w-8 h-8 text-primary-600 mr-3" />
            <div>
              <p className="font-medium text-academic-900">Approved Awards</p>
              <p className="text-sm text-academic-600">Setup payments</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default FinanceDashboard;