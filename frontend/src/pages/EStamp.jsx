import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { toast } from 'react-hot-toast';
import {
  FileText, Upload, Download, CheckCircle, Clock,
  AlertCircle, Shield, X, IndianRupee
} from 'lucide-react';

const EStamp = () => {
  const { user, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState('requests');
  const [eStamps, setEStamps] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      fetchEStamps();
    }
  }, [isAuthenticated]);

  const fetchEStamps = async () => {
    try {
      setLoading(true);
      const response = await api.get('/estamp/my-requests');
      if (response.data.success) {
        setEStamps(response.data.data.eStamps);
      }
    } catch (error) {
      toast.error('Failed to fetch e-stamp requests');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'draft': return 'text-gray-600';
      case 'payment_pending': return 'text-yellow-600';
      case 'stamped': return 'text-blue-600';
      case 'completed': return 'text-green-600';
      case 'cancelled': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'draft': return <FileText className="w-4 h-4" />;
      case 'payment_pending': return <Clock className="w-4 h-4" />;
      case 'stamped': return <Shield className="w-4 h-4" />;
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'cancelled': return <AlertCircle className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">E-Stamp Services</h1>
          <p className="text-gray-600">Create and manage electronic stamps for your legal documents</p>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('requests')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'requests'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              My Requests
            </button>
            <button
              onClick={() => setActiveTab('verify')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'verify'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Verify Certificate
            </button>
          </nav>
        </div>

        {/* My Requests Tab */}
        {activeTab === 'requests' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">My E-Stamp Requests</h2>
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
              >
                <FileText className="w-4 h-4" />
                Create Request
              </button>
            </div>

            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {eStamps.map((eStamp) => (
                  <div key={eStamp._id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(eStamp.status)}
                        <span className={`font-medium ${getStatusColor(eStamp.status)}`}>
                          {eStamp.status.replace('_', ' ').toUpperCase()}
                        </span>
                      </div>
                      <Shield className="w-4 h-4 text-gray-400" />
                    </div>

                    <h3 className="font-semibold text-gray-900 mb-2">
                      {eStamp.instrumentType?.replace('_', ' ').toUpperCase() || 'Instrument'}
                    </h3>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <IndianRupee className="w-4 h-4" />
                        <span>{eStamp.stampValue || 0}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <FileText className="w-4 h-4" />
                        <span>{eStamp.state}</span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      {eStamp.status === 'draft' && (
                        <button
                          className="flex-1 bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700 flex items-center justify-center gap-1"
                        >
                          Pay Now
                        </button>
                      )}
                      {(eStamp.status === 'completed' || eStamp.status === 'stamped') && (
                        <button
                          className="flex-1 bg-green-600 text-white px-3 py-2 rounded hover:bg-green-700 flex items-center justify-center gap-1"
                        >
                          <Download className="w-4 h-4" />
                          Download
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {eStamps.length === 0 && !loading && (
              <div className="text-center py-12">
                <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No e-stamp requests</h3>
                <p className="text-gray-600 mb-4">Create your first e-stamp request to get started</p>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                >
                  Create Request
                </button>
              </div>
            )}
          </div>
        )}

        {/* Verify Tab */}
        {activeTab === 'verify' && (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Verify E-Stamp Certificate</h2>
            <div className="bg-white rounded-lg shadow-md p-8 max-w-2xl mx-auto">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
                <h3 className="font-semibold text-blue-900 mb-2">E-Stamp Verification</h3>
                <ul className="space-y-2 text-blue-800">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-blue-600" />
                    <span>Enter certificate number to verify authenticity</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-blue-600" />
                    <span>Check expiry date and validity</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-blue-600" />
                    <span>View stamp details and parties information</span>
                  </li>
                </ul>
              </div>

              <div className="text-center">
                <p className="text-gray-600">E-stamp verification functionality will be available soon.</p>
                <p className="text-sm text-gray-500 mt-2">This feature is currently under development.</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">Create E-Stamp Request</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-blue-900 mb-2">E-Stamp Features</h3>
                <ul className="space-y-2 text-blue-800">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-blue-600" />
                    <span>All Indian states covered</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-blue-600" />
                    <span>Judicial and non-judicial stamps</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-blue-600" />
                    <span>Instant certificate generation</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-blue-600" />
                    <span>Online verification system</span>
                  </li>
                </ul>
              </div>

              <div className="text-center">
                <p className="text-gray-600">E-stamp creation functionality will be available soon.</p>
                <p className="text-sm text-gray-500 mt-2">This feature is currently under development.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EStamp;
