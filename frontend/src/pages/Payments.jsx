import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { paymentsAPI, utils } from '../services/api';
import { toast } from 'react-hot-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CreditCard, Download, TrendingUp, Clock, Loader, AlertCircle } from 'lucide-react';

const Payments = () => {
  const { user, isAuthenticated } = useAuth();
  const [payments, setPayments] = useState([]);
  const [stats, setStats] = useState({
    totalSpent: 0,
    totalTransactions: 0,
    pendingPayments: 0,
    totalInvoices: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isAuthenticated) {
      loadPayments();
    }
  }, [isAuthenticated]);

  const loadPayments = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await paymentsAPI.getPayments();
      
      if (response.success) {
        const paymentsData = response.data.payments || [];
        setPayments(paymentsData);
        
        // Calculate stats
        const stats = {
          totalSpent: paymentsData
            .filter(p => p.status === 'completed')
            .reduce((sum, p) => sum + (p.amount || 0), 0),
          totalTransactions: paymentsData.length,
          pendingPayments: paymentsData.filter(p => p.status === 'pending').length,
          totalInvoices: paymentsData.filter(p => p.type === 'invoice').length
        };
        setStats(stats);
      }
    } catch (err) {
      setError(err.message || 'Failed to load payments');
      utils.handleError(err, 'Failed to load payments');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadInvoice = async (paymentId) => {
    try {
      const response = await paymentsAPI.downloadInvoice(paymentId);
      if (response.success) {
        // Create download link
        const link = document.createElement('a');
        link.href = response.data.downloadUrl;
        link.download = response.data.fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success('Invoice downloaded successfully');
      }
    } catch (err) {
      utils.handleError(err, 'Failed to download invoice');
    }
  };

  const handleDownloadStatement = async () => {
    try {
      const response = await paymentsAPI.downloadStatement();
      if (response.success) {
        // Create download link
        const link = document.createElement('a');
        link.href = response.data.downloadUrl;
        link.download = response.data.fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success('Statement downloaded successfully');
      }
    } catch (err) {
      utils.handleError(err, 'Failed to download statement');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'refunded':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <CreditCard className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Login Required</h2>
          <p className="text-gray-600 mb-4">Please log in to view your payment history</p>
          <Link
            to="/login"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading payments...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Payments</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={loadPayments}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Payment History</h1>
          <Button onClick={handleDownloadStatement}>
            Download Statement
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-4 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <CreditCard className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-2xl font-bold">₹{stats.totalSpent.toLocaleString('en-IN')}</p>
                  <p className="text-sm text-gray-500">Total Spent</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <TrendingUp className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-2xl font-bold">{stats.totalTransactions}</p>
                  <p className="text-sm text-gray-500">Transactions</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Clock className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-2xl font-bold">{stats.pendingPayments}</p>
                  <p className="text-sm text-gray-500">Pending</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Download className="h-8 w-8 text-orange-600" />
                <div className="ml-4">
                  <p className="text-2xl font-bold">{stats.totalInvoices}</p>
                  <p className="text-sm text-gray-500">Invoices</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Payment History */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            {payments.length === 0 ? (
              <div className="text-center py-8">
                <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Payments Yet</h3>
                <p className="text-gray-600 mb-4">Your payment history will appear here once you make transactions</p>
                <Link to="/lawyers">
                  <Button>Browse Lawyers</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {payments.map((payment) => (
                  <div key={payment._id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-semibold">{payment.description}</p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>ID: {payment._id}</span>
                        <span>{new Date(payment.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <span className="text-lg font-semibold">₹{(payment.amount || 0).toLocaleString('en-IN')}</span>
                      <span className={`px-3 py-1 text-xs rounded-full capitalize ${getStatusColor(payment.status)}`}>
                        {payment.status}
                      </span>
                      {payment.type === 'invoice' && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleDownloadInvoice(payment._id)}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Payments;
