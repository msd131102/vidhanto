import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { dashboardAPI, appointmentsAPI, documentsAPI, utils } from '../services/api';
import {
  Users,
  FileText,
  MessageSquare,
  Calendar,
  CreditCard,
  TrendingUp,
  Clock,
  CheckCircle,
  Loader,
  AlertCircle,
  User,
  Star,
  Search
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';

const UserDashboard = () => {
  const { user, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState({
    appointments: [],
    documents: [],
    stats: {
      totalAppointments: 0,
      totalDocuments: 0,
      totalChats: 0,
      upcomingAppointments: 0
    },
    recommendedLawyers: []
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!isAuthenticated) return;
      
      setLoading(true);
      try {
        // Fetch user-specific data from APIs
        const [appointmentsRes, documentsRes, statsRes, lawyersRes] = await Promise.all([
          dashboardAPI.getRecentAppointments(5).catch(() => ({ data: { appointments: [] } })),
          dashboardAPI.getRecentDocuments(5).catch(() => ({ data: { documents: [] } })),
          dashboardAPI.getUserStats().catch((err) => {
            console.error('User Stats API error:', err);
            return { data: { stats: { totalAppointments: 0, totalDocuments: 0, totalChats: 0, upcomingAppointments: 0 } } };
          }),
          dashboardAPI.getRecommendedLawyers(3).catch(() => ({ data: { lawyers: [] } }))
        ]);

        console.log('User Dashboard API Responses:', {
          appointments: appointmentsRes.data,
          documents: documentsRes.data,
          stats: statsRes.data,
          lawyers: lawyersRes.data
        });

        setDashboardData({
          appointments: statsRes.data.data?.appointments || appointmentsRes.data.appointments || [],
          documents: statsRes.data.data?.documents || documentsRes.data.documents || [],
          stats: statsRes.data.data?.stats || statsRes.data.stats || {
            totalAppointments: 0,
            totalDocuments: 0,
            totalChats: 0,
            upcomingAppointments: 0
          },
          recommendedLawyers: lawyersRes.data.data?.lawyers || lawyersRes.data.lawyers || []
        });
      } catch (error) {
        console.error('User dashboard data fetch error:', error);
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [isAuthenticated]);

  const handleQuickAction = (action) => {
    console.log(`User quick action: ${action}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-8 h-8 animate-spin text-primary-600" />
          <p className="mt-4 text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Dashboard</h2>
          <p className="text-gray-600">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 btn-gradient text-white px-6 py-2 rounded-lg"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">
                Welcome back, {user?.firstName || 'User'}!
              </h1>
              <p className="text-sm text-gray-600">
                Manage your legal appointments and documents
              </p>
            </div>
            <Link
              to="/profile"
              className="btn-gradient text-white px-4 py-2 rounded-lg text-sm font-medium hover:shadow-lg transition-all"
              onClick={() => handleQuickAction('view_profile')}
            >
              View Profile
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* User Stats Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Appointments</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardData.stats.totalAppointments}</div>
              <p className="text-xs text-muted-foreground">
                All your appointments
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Upcoming</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardData.stats.upcomingAppointments}</div>
              <p className="text-xs text-muted-foreground">
                Scheduled appointments
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Documents</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardData.stats.totalDocuments}</div>
              <p className="text-xs text-muted-foreground">
                Your legal documents
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">AI Chats</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardData.stats.totalChats}</div>
              <p className="text-xs text-muted-foreground">
                AI assistant conversations
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="mt-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Button asChild className="h-20 flex-col space-y-2">
              <Link to="/appointments">
                <Calendar className="h-6 w-6" />
                Book Appointment
              </Link>
            </Button>

            <Button asChild variant="outline" className="h-20 flex-col space-y-2">
              <Link to="/ai-chat">
                <MessageSquare className="h-6 w-6" />
                AI Assistant
              </Link>
            </Button>

            <Button asChild variant="outline" className="h-20 flex-col space-y-2">
              <Link to="/documents">
                <FileText className="h-6 w-6" />
                New Document
              </Link>
            </Button>

            <Button asChild variant="outline" className="h-20 flex-col space-y-2">
              <Link to="/lawyers">
                <Search className="h-6 w-6" />
                Find Lawyers
              </Link>
            </Button>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Recent Appointments */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Appointments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dashboardData.appointments.length > 0 ? (
                  dashboardData.appointments.slice(0, 3).map((appointment, index) => (
                    <div key={appointment._id} className="flex items-center space-x-3">
                      <div className={`w-2 h-2 rounded-full ${appointment.status === 'completed' ? 'bg-green-500' :
                        appointment.status === 'scheduled' ? 'bg-blue-500' :
                          appointment.status === 'cancelled' ? 'bg-red-500' :
                            'bg-yellow-500'
                        }`}></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">
                          {appointment.lawyerId?.name ? `With ${appointment.lawyerId.name}` : 'Appointment'}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(appointment.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">No appointments yet</p>
                )}
              </div>

              <Button asChild variant="outline" className="w-full mt-4">
                <Link to="/appointments">View All</Link>
              </Button>
            </CardContent>
          </Card>

          {/* Recent Documents */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Documents</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dashboardData.documents.length > 0 ? (
                  dashboardData.documents.slice(0, 3).map((document) => (
                    <div key={document._id} className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">{document.title || document.fileName}</p>
                        <p className="text-xs text-gray-500">
                          Created {new Date(document.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      {document.status === 'completed' ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <Clock className="h-4 w-4 text-yellow-500" />
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">No documents yet</p>
                )}
              </div>

              <Button asChild variant="outline" className="w-full mt-4">
                <Link to="/documents">View All</Link>
              </Button>
            </CardContent>
          </Card>

          {/* Recommended Lawyers */}
          <Card>
            <CardHeader>
              <CardTitle>Recommended Lawyers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dashboardData.recommendedLawyers.length > 0 ? (
                  dashboardData.recommendedLawyers.slice(0, 3).map((lawyer) => (
                    <div key={lawyer._id} className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                        <User className="h-4 w-4 text-gray-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{lawyer.userId?.firstName} {lawyer.userId?.lastName}</p>
                        <div className="flex items-center space-x-2">
                          <div className="flex items-center">
                            <Star className="h-3 w-3 text-yellow-500 fill-current" />
                            <span className="text-xs text-gray-500 ml-1">{lawyer.rating?.average || '0.0'}</span>
                          </div>
                          <span className="text-xs text-gray-400">•</span>
                          <span className="text-xs text-gray-500">{lawyer.specialization?.[0] || 'General'}</span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">No recommendations yet</p>
                )}
              </div>

              <Button asChild variant="outline" className="w-full mt-4">
                <Link to="/lawyers">Browse Lawyers</Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* User Tips */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Getting Started</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-blue-600 font-semibold text-sm">1</span>
                </div>
                <div>
                  <p className="text-sm font-medium">Complete Your Profile</p>
                  <p className="text-xs text-gray-500">Add your personal information and preferences for better recommendations</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-green-600 font-semibold text-sm">2</span>
                </div>
                <div>
                  <p className="text-sm font-medium">Book Your First Consultation</p>
                  <p className="text-xs text-gray-500">Connect with experienced lawyers for your legal needs</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-purple-600 font-semibold text-sm">3</span>
                </div>
                <div>
                  <p className="text-sm font-medium">Try AI Legal Assistant</p>
                  <p className="text-xs text-gray-500">Get instant answers to your legal questions</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UserDashboard;
