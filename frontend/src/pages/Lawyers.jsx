import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { lawyersAPI } from '../services/api';

const Lawyers = () => {
  const { user, isAuthenticated } = useAuth();
  const [lawyers, setLawyers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLawyers();
  }, []);

  const loadLawyers = async () => {
    try {
      setLoading(true);
      const response = await lawyersAPI.getLawyers({ 
        limit: 50,
        verified: true 
      });
      
      console.log('Lawyers API response:', response);
      
      // Handle different response structures
      if (response.success && response.data?.lawyers) {
        setLawyers(response.data.lawyers);
      } else if (response.lawyers) {
        setLawyers(response.lawyers);
      } else if (response.data?.lawyers) {
        setLawyers(response.data.lawyers);
      } else {
        console.log('Unexpected response structure:', response);
        setLawyers([]);
      }
    } catch (error) {
      console.error('Lawyers API error:', error);
      setLawyers([]);
    } finally {
      setLoading(false);
    }
  };

  const getLawyerName = (lawyer) => {
    if (lawyer.userInfo?.firstName && lawyer.userInfo?.lastName) {
      return `${lawyer.userInfo.firstName} ${lawyer.userInfo.lastName}`;
    }
    return lawyer.name || 'Unknown Lawyer';
  };

  const getLawyerRating = (lawyer) => {
    return lawyer.rating?.average || lawyer.averageRating || 0;
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Login Required</h2>
            <p className="text-gray-600 mb-4">Please log in to browse and book consultations with verified lawyers.</p>
            <button
              onClick={() => (window.location.href = '/login')}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Go to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Verified Lawyers</h1>
            <p className="text-gray-600">Connect with experienced legal professionals</p>
          </div>
        </div>
      </div>

      {/* Lawyers Grid */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {loading ? (
          <div className="flex justify-center items-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : lawyers.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Lawyers Found</h3>
            <p className="text-gray-600">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {lawyers.map((lawyer) => (
              <div
                key={lawyer._id}
                className="bg-white rounded-xl shadow-lg border hover:shadow-xl transition-shadow p-6"
              >
                {/* Lawyer Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                      <span className="text-gray-600 font-semibold">
                        {getLawyerName(lawyer).charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{getLawyerName(lawyer)}</h3>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        {lawyer.isVerified && (
                          <span className="text-blue-600 font-medium">✓ Verified</span>
                        )}
                        <span>⭐ {getLawyerRating(lawyer).toFixed(1)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Specializations */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {lawyer.specialization.slice(0, 3).map((spec, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                    >
                      {spec}
                    </span>
                  ))}
                  {lawyer.specialization.length > 3 && (
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      +{lawyer.specialization.length - 3}
                    </span>
                  )}
                </div>

                {/* Quick Info */}
                <div className="grid grid-cols-2 gap-3 text-sm mb-4">
                  <div className="flex items-center gap-2 text-gray-600">
                    <span>📚</span>
                    <span>{lawyer.experience} years</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <span>📍</span>
                    <span>{lawyer.location.city}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <span>🎓</span>
                    <span>{lawyer.education[0]?.degree || 'Qualified'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <span>💬</span>
                    <span>{lawyer.languages.slice(0, 2).join(', ')}</span>
                  </div>
                </div>

                {/* Consultation Fees */}
                <div className="border-t pt-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-gray-900">Consultation Fees</h4>
                    <span className="text-gray-600">💰</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <div className="text-center p-2 bg-gray-50 rounded border">
                      <div className="text-blue-600 mb-1">💬</div>
                      <div className="font-medium">₹{lawyer.consultationFees.chat || 0}</div>
                      <div className="text-gray-600">Chat</div>
                    </div>
                    <div className="text-center p-2 bg-gray-50 rounded border">
                      <div className="text-green-600 mb-1">📞</div>
                      <div className="font-medium">₹{lawyer.consultationFees.voice || 0}</div>
                      <div className="text-gray-600">Voice</div>
                    </div>
                    <div className="text-center p-2 bg-gray-50 rounded border">
                      <div className="text-purple-600 mb-1">📹</div>
                      <div className="font-medium">₹{lawyer.consultationFees.video || 0}</div>
                      <div className="text-gray-600">Video</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Lawyers;
