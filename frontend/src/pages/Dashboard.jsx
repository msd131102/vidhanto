import { useAuth } from '../contexts/AuthContext';
import UserDashboard from './UserDashboard';
import LawyerDashboard from './LawyerDashboard';
import { Loader, AlertCircle, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const { user, isAuthenticated, isLawyer } = useAuth();

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

  // Show loading state while user data is being fetched
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-8 h-8 animate-spin text-primary-600" />
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Route to appropriate dashboard based on user role
  if (isLawyer()) {
    return <LawyerDashboard />;
  } else {
    return <UserDashboard />;
  }
};

export default Dashboard;
