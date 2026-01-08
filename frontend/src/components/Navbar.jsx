import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  Menu,
  X,
  User,
  LogOut,
  Shield,
  Users,
  MessageSquare,
  Calendar,
  FileText,
  Home,
  DollarSign,
  Settings,
  Briefcase
} from 'lucide-react';

const Navbar = () => {
  const { user, isAuthenticated, logout, isLawyer } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsMenuOpen(false);
  };

  const handleNavigation = (path) => {
    navigate(path);
    setIsMenuOpen(false);
  };

  const isActivePath = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-r from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">Vidhanto</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {isAuthenticated ? (
              <>
                <Link
                  to="/dashboard"
                  className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActivePath('/dashboard')
                    ? 'text-primary-600 bg-primary-50'
                    : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50'
                    }`}
                >
                  <Home className="w-4 h-4" />
                  <span>Dashboard</span>
                </Link>

                <Link
                  to="/lawyers"
                  className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActivePath('/lawyers')
                    ? 'text-primary-600 bg-primary-50'
                    : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50'
                    }`}
                >
                  <Users className="w-4 h-4" />
                  <span>Lawyers</span>
                </Link>

                <Link
                  to="/ai-chat"
                  className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActivePath('/ai-chat')
                    ? 'text-primary-600 bg-primary-50'
                    : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50'
                    }`}
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>AI Assistant</span>
                </Link>

                <Link
                  to="/appointments"
                  className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActivePath('/appointments')
                    ? 'text-primary-600 bg-primary-50'
                    : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50'
                    }`}
                >
                  <Calendar className="w-4 h-4" />
                  <span>Appointments</span>
                </Link>

                <Link
                  to="/documents"
                  className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActivePath('/documents')
                    ? 'text-primary-600 bg-primary-50'
                    : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50'
                    }`}
                >
                  <FileText className="w-4 h-4" />
                  <span>Documents</span>
                </Link>

                {isLawyer() && (
                  <Link
                    to="/payments"
                    className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActivePath('/payments')
                      ? 'text-primary-600 bg-primary-50'
                      : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50'
                      }`}
                  >
                    <DollarSign className="w-4 h-4" />
                    <span>Earnings</span>
                  </Link>
                )}

                <div className="flex items-center space-x-3 pl-3">
                  <span className="text-sm text-gray-700">Welcome, {user?.firstName || user?.name?.split(' ')[0]}</span>
                  <button
                    onClick={handleLogout}
                    className="text-red-600 hover:text-red-700 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link
                  to="/"
                  className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActivePath('/')
                    ? 'text-primary-600 bg-primary-50'
                    : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50'
                    }`}
                >
                  <Home className="w-4 h-4" />
                  <span>Home</span>
                </Link>

                <div className="flex items-center space-x-3 pl-3">
                  <Link
                    to="/payments"
                    className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Payments
                  </Link>
                  <Link
                    to="/esignature"
                    className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    E-Signature
                  </Link>
                  <Link
                    to="/estamp"
                    className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    E-Stamp
                  </Link>
                  <Link
                    to="/register"
                    className="btn-gradient text-white px-4 py-2 rounded-md text-sm font-medium"
                  >
                    Sign Up
                  </Link>
                </div>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700 hover:text-primary-600 p-2 rounded-md"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-200">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {isAuthenticated ? (
                <>
                  <button
                    onClick={() => handleNavigation('/dashboard')}
                    className="w-full flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50"
                  >
                    <Home className="w-5 h-5" />
                    <span>Dashboard</span>
                  </button>

                  <button
                    onClick={() => handleNavigation('/lawyers')}
                    className="w-full flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50"
                  >
                    <Users className="w-5 h-5" />
                    <span>Lawyers</span>
                  </button>

                  <button
                    onClick={() => handleNavigation('/ai-chat')}
                    className="w-full flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50"
                  >
                    <MessageSquare className="w-5 h-5" />
                    <span>AI Assistant</span>
                  </button>

                  <button
                    onClick={() => handleNavigation('/appointments')}
                    className="w-full flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50"
                  >
                    <Calendar className="w-5 h-5" />
                    <span>Appointments</span>
                  </button>

                  <button
                    onClick={() => handleNavigation('/documents')}
                    className="w-full flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50"
                  >
                    <FileText className="w-5 h-5" />
                    <span>Documents</span>
                  </button>

                  <hr className="my-2 border-gray-200" />

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium text-red-600 hover:bg-red-50"
                  >
                    <LogOut className="w-5 h-5" />
                    <span>Logout</span>
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => handleNavigation('/')}
                    className="w-full flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50"
                  >
                    <Home className="w-5 h-5" />
                    <span>Home</span>
                  </button>

                  <button
                    onClick={() => handleNavigation('/login')}
                    className="w-full flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50"
                  >
                    <User className="w-5 h-5" />
                    <span>Login</span>
                  </button>

                  <button
                    onClick={() => handleNavigation('/register')}
                    className="w-full btn-gradient text-white px-3 py-2 rounded-md text-base font-medium"
                  >
                    Sign Up
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
