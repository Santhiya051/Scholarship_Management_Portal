import React, { useState, useEffect } from 'react';
import {
  DollarSign,
  Search,
  Filter,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  Download,
  CreditCard,
  Calendar,
  User,
  Award,
  Plus
} from 'lucide-react';
import { adminService } from '../../services/adminService';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Avatar from '../../components/common/Avatar';
import Modal from '../../components/common/Modal';
import { toast } from 'react-hot-toast';

const PaymentsManagement = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showProcessModal, setShowProcessModal] = useState(false);
  const [processData, setProcessData] = useState({
    payment_method: 'bank_transfer',
    reference_number: '',
    notes: ''
  });

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const response = await adminService.getAllPayments();
      setPayments(Array.isArray(response.data) ? response.data : response.payments || []);
    } catch (error) {
      toast.error('Failed to fetch payments');
      console.error('Error fetching payments:', error);
      setPayments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleProcessPayment = async () => {
    try {
      await adminService.processPayment(selectedPayment.id, processData);
      toast.success('Payment processed successfully');
      setShowProcessModal(false);
      setProcessData({ payment_method: 'bank_transfer', reference_number: '', notes: '' });
      fetchPayments();
    } catch (error) {
      toast.error('Failed to process payment');
      console.error('Error processing payment:', error);
    }
  };

  const handleExportPayments = () => {
    try {
      // Convert payments to CSV
      const headers = ['Student Name', 'Email', 'Scholarship', 'Amount', 'Status', 'Payment Method', 'Date'];
      const csvData = filteredPayments.map(payment => [
        `${payment.student?.first_name || ''} ${payment.student?.last_name || ''}`,
        payment.student?.email || '',
        payment.scholarship?.name || '',
        `$${payment.amount || 0}`,
        payment.status || '',
        payment.payment_method || '',
        payment.processed_at ? new Date(payment.processed_at).toLocaleDateString() : 'Pending'
      ]);

      const csvContent = [
        headers.join(','),
        ...csvData.map(row => row.map(cell => `"${cell}"`).join(','))
      ].join('\n');

      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `payments_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success('Payments exported successfully');
    } catch (error) {
      toast.error('Failed to export payments');
      console.error('Error exporting payments:', error);
    }
  };

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = 
      payment.student?.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.student?.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.scholarship?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.reference_number?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || payment.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'failed': return <XCircle className="w-4 h-4 text-red-600" />;
      case 'processing': return <Clock className="w-4 h-4 text-yellow-600" />;
      default: return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading payments..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-academic-900">Payments Management</h1>
          <p className="text-academic-600 mt-1">Manage scholarship payments and transactions</p>
        </div>
        <div className="flex space-x-3">
          <button 
            onClick={handleExportPayments}
            className="btn btn-secondary flex items-center space-x-2"
          >
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
          <button className="btn btn-primary flex items-center space-x-2">
            <Plus className="w-4 h-4" />
            <span>Process Payment</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-academic-600">Total Payments</p>
              <p className="text-2xl font-bold text-academic-900">{payments.length}</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-academic-600">Completed</p>
              <p className="text-2xl font-bold text-academic-900">
                {payments.filter(p => p.status === 'completed').length}
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
              <p className="text-sm font-medium text-academic-600">Pending</p>
              <p className="text-2xl font-bold text-academic-900">
                {payments.filter(p => p.status === 'pending' || p.status === 'processing').length}
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
              <p className="text-sm font-medium text-academic-600">Total Amount</p>
              <p className="text-2xl font-bold text-academic-900">
                ${payments.reduce((sum, p) => sum + (p.amount || 0), 0).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-academic-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search payments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input pl-10"
              />
            </div>
          </div>
          <div className="flex gap-4">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="completed">Completed</option>
              <option value="failed">Failed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Payments Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-academic-200">
            <thead className="bg-academic-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-academic-500 uppercase tracking-wider">
                  Student
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-academic-500 uppercase tracking-wider">
                  Scholarship
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-academic-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-academic-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-academic-500 uppercase tracking-wider">
                  Method
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-academic-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-academic-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-academic-200">
              {filteredPayments.map((payment) => (
                <tr key={payment.id} className="hover:bg-academic-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Avatar 
                        user={{
                          first_name: payment.student?.first_name,
                          last_name: payment.student?.last_name
                        }}
                        size="md"
                      />
                      <div className="ml-3">
                        <div className="text-sm font-medium text-academic-900">
                          {payment.student?.first_name} {payment.student?.last_name}
                        </div>
                        <div className="text-sm text-academic-500">
                          {payment.student?.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-academic-900">
                      {payment.scholarship?.name}
                    </div>
                    <div className="text-sm text-academic-500">
                      {payment.reference_number}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-academic-900">
                      ${payment.amount?.toLocaleString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(payment.status)}
                      <StatusBadge status={payment.status} size="sm" />
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <CreditCard className="w-4 h-4 text-academic-400" />
                      <span className="text-sm text-academic-900 capitalize">
                        {payment.payment_method?.replace('_', ' ')}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-academic-500">
                    {payment.processed_at ? (
                      <div className="flex items-center">
                        <Calendar className="w-3 h-3 mr-1" />
                        {new Date(payment.processed_at).toLocaleDateString()}
                      </div>
                    ) : (
                      payment.scheduled_date ? (
                        <div className="flex items-center">
                          <Calendar className="w-3 h-3 mr-1" />
                          Scheduled: {new Date(payment.scheduled_date).toLocaleDateString()}
                        </div>
                      ) : 'Not scheduled'
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => {
                          setSelectedPayment(payment);
                          setShowPaymentModal(true);
                        }}
                        className="text-academic-400 hover:text-academic-600"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      {payment.status === 'pending' && (
                        <button
                          onClick={() => {
                            setSelectedPayment(payment);
                            setShowProcessModal(true);
                          }}
                          className="text-primary-600 hover:text-primary-900"
                          title="Process Payment"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredPayments.length === 0 && (
          <div className="text-center py-12">
            <DollarSign className="mx-auto h-12 w-12 text-academic-400" />
            <h3 className="mt-2 text-sm font-medium text-academic-900">No payments found</h3>
            <p className="mt-1 text-sm text-academic-500">
              {searchTerm || statusFilter !== 'all'
                ? 'Try adjusting your search or filter criteria.'
                : 'No payments have been processed yet.'}
            </p>
          </div>
        )}
      </div>

      {/* Payment Details Modal */}
      <Modal
        isOpen={showPaymentModal}
        onClose={() => {
          setShowPaymentModal(false);
          setSelectedPayment(null);
        }}
        title="Payment Details"
        size="lg"
      >
        {selectedPayment && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-academic-900 mb-3">Payment Information</h4>
                <div className="space-y-2">
                  <div>
                    <label className="block text-sm font-medium text-academic-700">Amount</label>
                    <p className="text-sm text-academic-900">${selectedPayment.amount?.toLocaleString()}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-academic-700">Status</label>
                    <StatusBadge status={selectedPayment.status} size="sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-academic-700">Payment Method</label>
                    <p className="text-sm text-academic-900 capitalize">
                      {selectedPayment.payment_method?.replace('_', ' ')}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-academic-700">Reference Number</label>
                    <p className="text-sm text-academic-900">{selectedPayment.reference_number || 'Not assigned'}</p>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-medium text-academic-900 mb-3">Student & Scholarship</h4>
                <div className="space-y-2">
                  <div>
                    <label className="block text-sm font-medium text-academic-700">Student</label>
                    <p className="text-sm text-academic-900">
                      {selectedPayment.student?.first_name} {selectedPayment.student?.last_name}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-academic-700">Email</label>
                    <p className="text-sm text-academic-900">{selectedPayment.student?.email}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-academic-700">Scholarship</label>
                    <p className="text-sm text-academic-900">{selectedPayment.scholarship?.name}</p>
                  </div>
                </div>
              </div>
            </div>
            {selectedPayment.notes && (
              <div>
                <h4 className="font-medium text-academic-900 mb-3">Notes</h4>
                <p className="text-sm text-academic-600">{selectedPayment.notes}</p>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Process Payment Modal */}
      <Modal
        isOpen={showProcessModal}
        onClose={() => {
          setShowProcessModal(false);
          setProcessData({ payment_method: 'bank_transfer', reference_number: '', notes: '' });
        }}
        title="Process Payment"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-academic-700 mb-2">
              Payment Method
            </label>
            <select
              value={processData.payment_method}
              onChange={(e) => setProcessData({ ...processData, payment_method: e.target.value })}
              className="input"
            >
              <option value="bank_transfer">Bank Transfer</option>
              <option value="check">Check</option>
              <option value="direct_deposit">Direct Deposit</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-academic-700 mb-2">
              Reference Number
            </label>
            <input
              type="text"
              value={processData.reference_number}
              onChange={(e) => setProcessData({ ...processData, reference_number: e.target.value })}
              className="input"
              placeholder="Enter reference number..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-academic-700 mb-2">
              Notes
            </label>
            <textarea
              value={processData.notes}
              onChange={(e) => setProcessData({ ...processData, notes: e.target.value })}
              className="input"
              rows="3"
              placeholder="Enter processing notes..."
            />
          </div>
          <div className="flex justify-end space-x-3">
            <button
              onClick={() => {
                setShowProcessModal(false);
                setProcessData({ payment_method: 'bank_transfer', reference_number: '', notes: '' });
              }}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button
              onClick={handleProcessPayment}
              className="btn btn-primary"
            >
              Process Payment
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default PaymentsManagement;