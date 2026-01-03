import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { lawyersAPI, appointmentsAPI, paymentsAPI, utils } from '../services/api';
import { toast } from 'react-hot-toast';
import {
  Search, Filter, Star, MapPin, Phone, Mail, Calendar,
  Clock, DollarSign, User, Briefcase, Award, ChevronDown,
  Video, MessageCircle, PhoneCall, Check, X, Heart, Shield
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Lawyers = () => {
  const { user, isAuthenticated } = useAuth();
  const [lawyers, setLawyers] = useState([]);
  const [filteredLawyers, setFilteredLawyers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLawyer, setSelectedLawyer] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [bookingData, setBookingData] = useState({
    date: '',
    time: '',
    type: 'chat',
    message: ''
  });
  const [filters, setFilters] = useState({
    specialization: '',
    experience: '',
    location: '',
    language: '',
    priceRange: '',
    rating: ''
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('rating');
  const [loadingBooking, setLoadingBooking] = useState(false);

  useEffect(() => {
    loadLawyers();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [lawyers, filters, searchTerm, sortBy]);

  const loadLawyers = async () => {
    try {
      setLoading(true);
      const response = await lawyersAPI.getLawyers({ 
        limit: 50,
        verified: true 
      });
      
      if (response.success) {
        setLawyers(response.data.lawyers);
      }
    } catch (error) {
      utils.handleError(error, 'Failed to load lawyers');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...lawyers];

    // Apply search
    if (searchTerm) {
      filtered = filtered.filter(lawyer => 
        lawyer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lawyer.specialization.some(spec => 
          spec.toLowerCase().includes(searchTerm.toLowerCase())
        ) ||
        lawyer.location.city.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply filters
    if (filters.specialization) {
      filtered = filtered.filter(lawyer => 
        lawyer.specialization.includes(filters.specialization)
      );
    }

    if (filters.experience) {
      filtered = filtered.filter(lawyer => 
        lawyer.experience >= parseInt(filters.experience)
      );
    }

    if (filters.location) {
      filtered = filtered.filter(lawyer => 
        lawyer.location.city.toLowerCase().includes(filters.location.toLowerCase()) ||
        lawyer.location.state.toLowerCase().includes(filters.location.toLowerCase())
      );
    }

    if (filters.language) {
      filtered = filtered.filter(lawyer => 
        lawyer.languages.includes(filters.language)
      );
    }

    if (filters.priceRange) {
      const [min, max] = filters.priceRange.split('-').map(Number);
      filtered = filtered.filter(lawyer => 
        lawyer.consultationFees.chat >= min && lawyer.consultationFees.chat <= max
      );
    }

    if (filters.rating) {
      filtered = filtered.filter(lawyer => 
        lawyer.averageRating >= parseFloat(filters.rating)
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return b.averageRating - a.averageRating;
        case 'experience':
          return b.experience - a.experience;
        case 'price-low':
          return a.consultationFees.chat - b.consultationFees.chat;
        case 'price-high':
          return b.consultationFees.chat - a.consultationFees.chat;
        case 'reviews':
          return b.totalReviews - a.totalReviews;
        default:
          return 0;
      }
    });

    setFilteredLawyers(filtered);
  };

  const handleBooking = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to book an appointment');
      return;
    }

    try {
      setLoadingBooking(true);
      
      // Create payment order first
      const paymentResponse = await paymentsAPI.createOrder({
        amount: selectedLawyer.consultationFees[bookingData.type],
        serviceType: 'lawyer_consultation',
        serviceId: selectedLawyer._id,
        description: `Consultation with ${selectedLawyer.name} - ${bookingData.type}`
      });

      if (!paymentResponse.success) {
        throw new Error(paymentResponse.message);
      }

      // Create appointment
      const appointmentData = {
        lawyerId: selectedLawyer._id,
        date: bookingData.date,
        time: bookingData.time,
        type: bookingData.type,
        message: bookingData.message,
        paymentId: paymentResponse.data.order.id,
        amount: selectedLawyer.consultationFees[bookingData.type]
      };

      const appointmentResponse = await appointmentsAPI.createAppointment(appointmentData);
      
      if (appointmentResponse.success) {
        toast.success('Appointment booked successfully!');
        setShowBookingModal(false);
        setBookingData({ date: '', time: '', type: 'chat', message: '' });
        setSelectedLawyer(null);
        
        // Redirect to payment (in real app, would open Razorpay)
        setTimeout(() => {
          window.location.href = `/appointments/${appointmentResponse.data.appointment._id}`;
        }, 1000);
      }
    } catch (error) {
      utils.handleError(error, 'Failed to book appointment');
    } finally {
      setLoadingBooking(false);
    }
  };

  const getConsultationFee = (lawyer, type) => {
    return lawyer.consultationFees[type] || 0;
  };

  const getSpecializationColor = (spec) => {
    const colors = {
      'Criminal': 'bg-red-100 text-red-800',
      'Civil': 'bg-blue-100 text-blue-800',
      'Corporate': 'bg-purple-100 text-purple-800',
      'Family': 'bg-pink-100 text-pink-800',
      'GST': 'bg-green-100 text-green-800',
      'Property': 'bg-orange-100 text-orange-800',
      'Intellectual Property': 'bg-indigo-100 text-indigo-800'
    };
    return colors[spec] || 'bg-gray-100 text-gray-800';
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />);
    }
    
    if (hasHalfStar) {
      stars.push(<Star key="half" className="w-4 h-4 fill-yellow-200 text-yellow-400" />);
    }
    
    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Star key={`empty-${i}`} className="w-4 h-4 text-gray-300" />);
    }
    
    return stars;
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="bg-white rounded-2xl shadow-2xl p-8 border border-slate-200">
            <User className="w-16 h-16 text-blue-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Login Required</h2>
            <p className="text-slate-600 mb-6">Please log in to browse and book consultations with verified lawyers.</p>
            <button
              onClick={() => window.location.href = '/login'}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Go to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Verified Lawyers</h1>
              <p className="text-slate-600">Connect with experienced legal professionals</p>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search lawyers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
                />
              </div>
              
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
              >
                <Filter className="w-4 h-4" />
                Filters
              </button>
            </div>
          </div>

          {/* Filters */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="border-t border-slate-200 pt-4 mt-4"
              >
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Specialization</label>
                    <select
                      value={filters.specialization}
                      onChange={(e) => setFilters({...filters, specialization: e.target.value})}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">All Specializations</option>
                      <option value="Criminal">Criminal Law</option>
                      <option value="Civil">Civil Law</option>
                      <option value="Corporate">Corporate Law</option>
                      <option value="Family">Family Law</option>
                      <option value="GST">GST Law</option>
                      <option value="Property">Property Law</option>
                      <option value="Intellectual Property">Intellectual Property</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Min Experience</label>
                    <select
                      value={filters.experience}
                      onChange={(e) => setFilters({...filters, experience: e.target.value})}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Any Experience</option>
                      <option value="1">1+ Years</option>
                      <option value="3">3+ Years</option>
                      <option value="5">5+ Years</option>
                      <option value="10">10+ Years</option>
                      <option value="15">15+ Years</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Location</label>
                    <input
                      type="text"
                      placeholder="City or State"
                      value={filters.location}
                      onChange={(e) => setFilters({...filters, location: e.target.value})}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Language</label>
                    <select
                      value={filters.language}
                      onChange={(e) => setFilters({...filters, language: e.target.value})}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Any Language</option>
                      <option value="English">English</option>
                      <option value="Hindi">Hindi</option>
                      <option value="Bengali">Bengali</option>
                      <option value="Tamil">Tamil</option>
                      <option value="Telugu">Telugu</option>
                      <option value="Marathi">Marathi</option>
                      <option value="Gujarati">Gujarati</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Price Range</label>
                    <select
                      value={filters.priceRange}
                      onChange={(e) => setFilters({...filters, priceRange: e.target.value})}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Any Price</option>
                      <option value="0-500">₹0 - ₹500</option>
                      <option value="500-1000">₹500 - ₹1000</option>
                      <option value="1000-2000">₹1000 - ₹2000</option>
                      <option value="2000-5000">₹2000 - ₹5000</option>
                      <option value="5000-10000">₹5000+</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Min Rating</label>
                    <select
                      value={filters.rating}
                      onChange={(e) => setFilters({...filters, rating: e.target.value})}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Any Rating</option>
                      <option value="4.5">4.5+ Stars</option>
                      <option value="4">4+ Stars</option>
                      <option value="3.5">3.5+ Stars</option>
                      <option value="3">3+ Stars</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-4">
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-slate-600">
                      {filteredLawyers.length} lawyers found
                    </span>
                    
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="px-3 py-1 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    >
                      <option value="rating">Sort by Rating</option>
                      <option value="experience">Sort by Experience</option>
                      <option value="price-low">Price: Low to High</option>
                      <option value="price-high">Price: High to Low</option>
                      <option value="reviews">Sort by Reviews</option>
                    </select>
                  </div>

                  <button
                    onClick={() => setFilters({
                      specialization: '',
                      experience: '',
                      location: '',
                      language: '',
                      priceRange: '',
                      rating: ''
                    })}
                    className="text-sm text-blue-600 hover:text-blue-700 transition-colors"
                  >
                    Clear Filters
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Lawyers Grid */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {loading ? (
          <div className="flex justify-center items-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredLawyers.length === 0 ? (
          <div className="text-center py-12">
            <User className="w-16 h-16 text-slate-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-900 mb-2">No Lawyers Found</h3>
            <p className="text-slate-600">Try adjusting your filters or search terms</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {filteredLawyers.map((lawyer) => (
                <motion.div
                  key={lawyer._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden hover:shadow-xl transition-shadow"
                >
                  {/* Lawyer Header */}
                  <div className="p-6 border-b border-slate-200">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-slate-200 rounded-full flex items-center justify-center">
                          <User className="w-6 h-6 text-slate-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-slate-900">{lawyer.name}</h3>
                          <div className="flex items-center gap-2 text-sm text-slate-600">
                            {lawyer.isVerified && (
                              <div className="flex items-center gap-1 text-blue-600">
                                <Shield className="w-3 h-3" />
                                <span>Verified</span>
                              </div>
                            )}
                            <div className="flex items-center gap-1">
                              {renderStars(lawyer.averageRating)}
                              <span className="ml-1">({lawyer.totalReviews})</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <button
                        onClick={() => setSelectedLawyer(lawyer)}
                        className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                      >
                        <ChevronDown className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Specializations */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {lawyer.specialization.slice(0, 3).map((spec, index) => (
                        <span
                          key={index}
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getSpecializationColor(spec)}`}
                        >
                          {spec}
                        </span>
                      ))}
                      {lawyer.specialization.length > 3 && (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                          +{lawyer.specialization.length - 3}
                        </span>
                      )}
                    </div>

                    {/* Quick Info */}
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="flex items-center gap-2 text-slate-600">
                        <Briefcase className="w-4 h-4" />
                        <span>{lawyer.experience} years</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-600">
                        <MapPin className="w-4 h-4" />
                        <span className="truncate">{lawyer.location.city}</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-600">
                        <Award className="w-4 h-4" />
                        <span>{lawyer.education[0]?.degree || 'Qualified'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-600">
                        <MessageCircle className="w-4 h-4" />
                        <span>{lawyer.languages.slice(0, 2).join(', ')}</span>
                      </div>
                    </div>
                  </div>

                  {/* Consultation Fees */}
                  <div className="p-4 bg-slate-50 border-t border-slate-200">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-slate-900">Consultation Fees</h4>
                      <DollarSign className="w-4 h-4 text-slate-600" />
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-sm">
                      <div className="text-center p-2 bg-white rounded-lg border border-slate-200">
                        <MessageCircle className="w-4 h-4 mx-auto mb-1 text-blue-600" />
                        <div className="font-medium">₹{getConsultationFee(lawyer, 'chat')}</div>
                        <div className="text-xs text-slate-600">Chat</div>
                      </div>
                      <div className="text-center p-2 bg-white rounded-lg border border-slate-200">
                        <PhoneCall className="w-4 h-4 mx-auto mb-1 text-green-600" />
                        <div className="font-medium">₹{getConsultationFee(lawyer, 'voice')}</div>
                        <div className="text-xs text-slate-600">Voice</div>
                      </div>
                      <div className="text-center p-2 bg-white rounded-lg border border-slate-200">
                        <Video className="w-4 h-4 mx-auto mb-1 text-purple-600" />
                        <div className="font-medium">₹{getConsultationFee(lawyer, 'video')}</div>
                        <div className="text-xs text-slate-600">Video</div>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="p-4 border-t border-slate-200">
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setSelectedLawyer(lawyer);
                          setBookingData({ ...bookingData, type: 'chat' });
                          setShowBookingModal(true);
                        }}
                        className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
                      >
                        Book Chat
                      </button>
                      <button
                        onClick={() => {
                          setSelectedLawyer(lawyer);
                          setBookingData({ ...bookingData, type: 'voice' });
                          setShowBookingModal(true);
                        }}
                        className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors font-medium text-sm"
                      >
                        Book Call
                      </button>
                      <button
                        onClick={() => {
                          setSelectedLawyer(lawyer);
                          setBookingData({ ...bookingData, type: 'video' });
                          setShowBookingModal(true);
                        }}
                        className="flex-1 bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors font-medium text-sm"
                      >
                        Book Video
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Booking Modal */}
      <AnimatePresence>
        {showBookingModal && selectedLawyer && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6 border-b border-slate-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-slate-900">Book Consultation</h3>
                  <button
                    onClick={() => setShowBookingModal(false)}
                    className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="p-6">
                {/* Lawyer Info */}
                <div className="flex items-center gap-3 mb-6 p-4 bg-slate-50 rounded-lg">
                  <div className="w-12 h-12 bg-slate-200 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-slate-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900">{selectedLawyer.name}</h4>
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <span>{selectedLawyer.specialization[0]}</span>
                      <span>•</span>
                      <span>{selectedLawyer.experience} years experience</span>
                    </div>
                  </div>
                </div>

                {/* Booking Form */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Consultation Type</label>
                    <select
                      value={bookingData.type}
                      onChange={(e) => setBookingData({ ...bookingData, type: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="chat">Chat Consultation - ₹{getConsultationFee(selectedLawyer, 'chat')}</option>
                      <option value="voice">Voice Call - ₹{getConsultationFee(selectedLawyer, 'voice')}</option>
                      <option value="video">Video Call - ₹{getConsultationFee(selectedLawyer, 'video')}</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Date</label>
                    <input
                      type="date"
                      value={bookingData.date}
                      onChange={(e) => setBookingData({ ...bookingData, date: e.target.value })}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Time</label>
                    <select
                      value={bookingData.time}
                      onChange={(e) => setBookingData({ ...bookingData, time: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select a time</option>
                      <option value="09:00">9:00 AM</option>
                      <option value="10:00">10:00 AM</option>
                      <option value="11:00">11:00 AM</option>
                      <option value="12:00">12:00 PM</option>
                      <option value="13:00">1:00 PM</option>
                      <option value="14:00">2:00 PM</option>
                      <option value="15:00">3:00 PM</option>
                      <option value="16:00">4:00 PM</option>
                      <option value="17:00">5:00 PM</option>
                      <option value="18:00">6:00 PM</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Message (Optional)</label>
                    <textarea
                      value={bookingData.message}
                      onChange={(e) => setBookingData({ ...bookingData, message: e.target.value })}
                      placeholder="Describe your legal issue..."
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                      rows={3}
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => setShowBookingModal(false)}
                    className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleBooking}
                    disabled={loadingBooking || !bookingData.date || !bookingData.time}
                    className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                  >
                    {loadingBooking ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent animate-spin" />
                        <span>Processing...</span>
                      </div>
                    ) : (
                      `Pay ₹${getConsultationFee(selectedLawyer, bookingData.type)}`
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Lawyers;
