import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import apiService from '../services/api';
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
  Shield
} from 'lucide-react';

const Dashboard = () => {
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
      activeLawyers: 0
    }
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!isAuthenticated) return;

      try {
        setLoading(true);
        setError(null);

        // Fetch all dashboard data in parallel
        const [appointmentsRes, documentsRes, statsRes] = await Promise.all([
          apiService.getAppointments(),
          apiService.getDocuments(),
          apiService.getDashboardStats()
        ]);

        setDashboardData({
          appointments: appointmentsRes.appointments || [],
          documents: documentsRes.documents || [],
          stats: statsRes.stats || {
            totalAppointments: 0,
            totalDocuments: 0,
            totalChats: 0,
            activeLawyers: 0
          }
        });
      } catch (err) {
        setError(err.message || 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [isAuthenticated]);

  const handleQuickAction = (action) => {
    // Track quick actions for analytics
    console.log(`Quick action: ${action}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-8 h-8 animate-spin text-primary-600" />
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
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

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-4">Please log in to access your dashboard</p>
          <Link
            to="/login"
            className="btn-gradient text-white px-6 py-3 rounded-lg inline-flex items-center"
          >
            Go to Login
          </Link>
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
                Welcome back, {user?.name?.split(' ')[0] || 'User'}!
              </h1>
              <p className="text-sm text-gray-600">
                Here's what's happening with your legal services
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
        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Appointments</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12</div>
              <p className="text-xs text-muted-foreground">
                +2 from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Documents Created</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">8</div>
              <p className="text-xs text-muted-foreground">
                +3 from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">AI Chats</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">24</div>
              <p className="text-xs text-muted-foreground">
                +7 from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Lawyers</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">156</div>
              <p className="text-xs text-muted-foreground">
                +12 from last month
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
                <Users className="h-6 w-6" />
                Find Lawyers
              </Link>
            </Button>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Recent Appointments */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Appointments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Consultation with Adv. Sharma</p>
                    <p className="text-xs text-gray-500">2 hours ago</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Document Review</p>
                    <p className="text-xs text-gray-500">Yesterday</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Legal Consultation</p>
                    <p className="text-xs text-gray-500">3 days ago</p>
                  </div>
                </div>
              </div>

              <Button asChild variant="outline" className="w-full mt-4">
                <Link to="/appointments">View All Appointments</Link>
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
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Rental Agreement.pdf</p>
                    <p className="text-xs text-gray-500">Created 2 days ago</p>
                  </div>
                  <CheckCircle className="h-4 w-4 text-green-500" />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Legal Notice.docx</p>
                    <p className="text-xs text-gray-500">Created 5 days ago</p>
                  </div>
                  <Clock className="h-4 w-4 text-yellow-500" />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Power of Attorney.pdf</p>
                    <p className="text-xs text-gray-500">Created 1 week ago</p>
                  </div>
                  <CheckCircle className="h-4 w-4 text-green-500" />
                </div>
              </div>

              <Button asChild variant="outline" className="w-full mt-4">
                <Link to="/documents">View All Documents</Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Upcoming Features */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Platform Updates</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <TrendingUp className="h-5 w-5 text-green-500 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">New AI Features Released</p>
                  <p className="text-xs text-gray-500">Enhanced legal document analysis and smart recommendations</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <CreditCard className="h-5 w-5 text-blue-500 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Payment Methods Expanded</p>
                  <p className="text-xs text-gray-500">Now supporting UPI, credit cards, and net banking</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Users className="h-5 w-5 text-purple-500 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">25+ New Lawyers Joined</p>
                  <p className="text-xs text-gray-500">Specializing in corporate and family law</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
