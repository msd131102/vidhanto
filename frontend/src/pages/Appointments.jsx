import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { appointmentsAPI, lawyersAPI, utils } from '../services/api';
import { toast } from 'react-hot-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, User, Video, MessageSquare, Loader, AlertCircle } from 'lucide-react';

const Appointments = () => {
  const { user, isAuthenticated } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    upcoming: 0,
    completed: 0,
    pending: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isAuthenticated) {
      loadAppointments();
    }
  }, [isAuthenticated]);

  const loadAppointments = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await appointmentsAPI.getAppointments();
      
      if (response.success) {
        const appointmentsData = response.data.appointments || [];
        setAppointments(appointmentsData);
        
        // Calculate stats
        const stats = {
          total: appointmentsData.length,
          upcoming: appointmentsData.filter(apt => apt.status === 'scheduled').length,
          completed: appointmentsData.filter(apt => apt.status === 'completed').length,
          pending: appointmentsData.filter(apt => apt.status === 'pending').length
        };
        setStats(stats);
      }
    } catch (err) {
      setError(err.message || 'Failed to load appointments');
      utils.handleError(err, 'Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinAppointment = async (appointmentId) => {
    try {
      const response = await appointmentsAPI.joinAppointment(appointmentId);
      if (response.success) {
        toast.success('Joining appointment...');
        // In a real app, this would open a video/chat interface
        window.open(response.data.meetingUrl, '_blank');
      }
    } catch (err) {
      utils.handleError(err, 'Failed to join appointment');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Login Required</h2>
          <p className="text-gray-600 mb-4">Please log in to view your appointments</p>
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
          <p className="text-gray-600">Loading appointments...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Appointments</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={loadAppointments}
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
          <h1 className="text-3xl font-bold text-gray-900">Appointments</h1>
          <Link to="/lawyers">
            <Button>Book New Appointment</Button>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-4 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Calendar className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-2xl font-bold">{stats.total}</p>
                  <p className="text-sm text-gray-500">Total Appointments</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Clock className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-2xl font-bold">{stats.upcoming}</p>
                  <p className="text-sm text-gray-500">Upcoming</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <User className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-2xl font-bold">{stats.completed}</p>
                  <p className="text-sm text-gray-500">Completed</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <MessageSquare className="h-8 w-8 text-orange-600" />
                <div className="ml-4">
                  <p className="text-2xl font-bold">{stats.pending}</p>
                  <p className="text-sm text-gray-500">Pending</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Appointments List */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Appointments</CardTitle>
          </CardHeader>
          <CardContent>
            {appointments.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Appointments Yet</h3>
                <p className="text-gray-600 mb-4">Book your first appointment with a verified lawyer</p>
                <Link to="/lawyers">
                  <Button>Browse Lawyers</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {appointments.map((appointment) => (
                  <div key={appointment._id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                        <User className="h-6 w-6 text-gray-600" />
                      </div>
                      <div>
                        <p className="font-semibold">
                          {appointment.lawyerId?.name || 'Lawyer'}
                        </p>
                        <div className="flex items-center space-x-2 text-sm text-gray-500">
                          <Calendar className="h-4 w-4" />
                          <span>{new Date(appointment.date).toLocaleDateString()}</span>
                          <Clock className="h-4 w-4 ml-2" />
                          <span>{appointment.time}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-1">
                        {appointment.type === "video" ? (
                          <Video className="h-4 w-4 text-blue-600" />
                        ) : (
                          <MessageSquare className="h-4 w-4 text-green-600" />
                        )}
                        <span className="text-sm capitalize">{appointment.type}</span>
                      </div>
                      
                      <span className={`px-3 py-1 text-xs rounded-full capitalize ${getStatusColor(appointment.status)}`}>
                        {appointment.status}
                      </span>
                      
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => appointment.status === 'scheduled' ? handleJoinAppointment(appointment._id) : null}
                      >
                        {appointment.status === 'scheduled' ? 'Join' : 'View'}
                      </Button>
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

export default Appointments;
