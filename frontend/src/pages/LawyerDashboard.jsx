import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { lawyersAPI, utils } from '../services/api';
import {
  Users,
  Calendar,
  DollarSign,
  Star,
  Settings,
  Eye,
  User,
  Award,
  Briefcase,
  Loader,
  AlertCircle
} from 'lucide-react';

import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';

const LawyerDashboard = () => {
  const { user, isAuthenticated } = useAuth();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [dashboardData, setDashboardData] = useState({
    appointments: [],
    stats: {
      totalAppointments: 0,
      todayAppointments: 0,
      weeklyEarnings: 0,
      totalEarnings: 0,
      averageRating: 0,
      totalClients: 0,
      completedConsultations: 0
    },
    profileCompletion: 0,
    kycStatus: 'pending',
    recentClients: []
  });

  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchDashboardData = async () => {
      setLoading(true);
      setError(null);

      try {
        const currentUser = utils.getCurrentUser();
        const userId = currentUser?.id;

        if (!userId) {
          throw new Error('User not found');
        }

        // First get the lawyer profile by userId
        const lawyersListRes = await lawyersAPI.getLawyers({ userId: userId });
        const lawyerProfile = lawyersListRes?.data?.lawyers?.[0];
        
        if (!lawyerProfile) {
          throw new Error('Lawyer profile not found');
        }

        const lawyerId = lawyerProfile._id;

        const [appointmentsRes, statsRes, lawyerRes] = await Promise.all([
          lawyersAPI.getLawyerAppointments(lawyerId, { limit: 5 }).catch(() => ({ data: {} })),
          lawyersAPI.getLawyerStats(lawyerId).catch(() => ({ data: {} })),
          lawyersAPI.getLawyer(lawyerId).catch(() => ({ data: {} }))
        ]);

        const appointments =
          appointmentsRes?.data?.data?.appointments ||
          appointmentsRes?.data?.appointments ||
          [];

        const stats =
          statsRes?.data?.data?.stats ||
          statsRes?.data?.stats ||
          dashboardData.stats;

        const lawyer =
          lawyerRes?.data?.data?.lawyer ||
          lawyerRes?.data?.lawyer ||
          null;

        setDashboardData({
          appointments,
          stats,
          profileCompletion: lawyer ? 100 : 0,
          kycStatus: lawyer?.kycStatus || 'pending',
          recentClients: []
        });

      } catch (err) {
        console.error('Dashboard error:', err);
        if (err.message === 'Lawyer profile not found') {
          setError('Please complete your lawyer profile to access the dashboard. You can create your profile in the Profile section.');
        } else {
          setError('Failed to load dashboard data');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [isAuthenticated]);

  const getProfileCompletionColor = (value) => {
    if (value >= 80) return 'text-green-600';
    if (value >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getKycStatusColor = (status) => {
    switch (status) {
      case 'verified':
        return 'text-green-600 bg-green-100';
      case 'pending':
        return 'text-yellow-600 bg-yellow-100';
      case 'rejected':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  /* -------------------- LOADING -------------------- */
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  /* -------------------- ERROR -------------------- */
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-auto p-6">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">{error}</p>
          {error.includes('complete your lawyer profile') && (
            <div className="text-left">
              <p className="text-sm text-gray-600 mb-4">
                To access your lawyer dashboard, you need to complete your lawyer profile first.
              </p>
              <Link to="/profile">
                <Button className="w-full">
                  Complete Lawyer Profile
                </Button>
              </Link>
            </div>
          )}
          <Button className="mt-4" onClick={() => window.location.reload()}>
            Retry
          </Button>
        </div>
      </div>
    );
  }

  const { stats } = dashboardData;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* HEADER */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-semibold">
              Welcome, {user?.firstName || 'Lawyer'}
            </h1>
            <p className="text-sm text-gray-600">
              Manage your practice & consultations
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className={`px-3 py-1 text-xs rounded-full font-medium ${getKycStatusColor(dashboardData.kycStatus)}`}>
              KYC: {dashboardData.kycStatus.toUpperCase()}
            </span>
            <Link to="/profile">
              <Button>View Profile</Button>
            </Link>
          </div>
        </div>
      </div>

      {/* STATS */}
      <div className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Today's Appointments" value={stats.todayAppointments} icon={Calendar} />
        <StatCard title="Weekly Earnings" value={`₹${stats.weeklyEarnings}`} icon={DollarSign} />
        <StatCard title="Total Clients" value={stats.totalClients} icon={Users} />
        <StatCard title="Rating" value={stats.averageRating.toFixed(1)} icon={Star} />
      </div>

      {/* PROFILE COMPLETION */}
      <div className="max-w-7xl mx-auto px-6 pb-8">
        <Card>
          <CardHeader>
            <CardTitle>Profile Completion</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between mb-2">
              <span>Completion</span>
              <span className={getProfileCompletionColor(dashboardData.profileCompletion)}>
                {dashboardData.profileCompletion}%
              </span>
            </div>
            <div className="w-full bg-gray-200 h-2 rounded">
              <div
                className="bg-green-500 h-2 rounded"
                style={{ width: `${dashboardData.profileCompletion}%` }}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

/* -------------------- STAT CARD -------------------- */
const StatCard = ({ title, value, icon: Icon }) => (
  <Card>
    <CardHeader className="flex flex-row justify-between items-center pb-2">
      <CardTitle className="text-sm">{title}</CardTitle>
      <Icon className="w-4 h-4 text-gray-400" />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
    </CardContent>
  </Card>
);

export default LawyerDashboard;
