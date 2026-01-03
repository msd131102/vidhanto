import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Page imports
import Home from './pages/Home';
import About from './pages/About';
import Contact from './pages/Contact';
import FAQ from './pages/FAQ';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';

// Auth pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Protected pages
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Lawyers from './pages/Lawyers';
import AIChat from './pages/AIChat';
import Appointments from './pages/Appointments';
import Documents from './pages/Documents';
import Payments from './pages/Payments';
import ESignature from './pages/ESignature';
import EStamp from './pages/EStamp';

// Protected Route component
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" />;
};

// Public Route component (redirect if authenticated)
const PublicRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return !token ? children : <Navigate to="/dashboard" />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50 flex flex-col">
          <Navbar />
          
          <main className="flex-grow">
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/faq" element={<FAQ />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/terms" element={<Terms />} />
              
              {/* Auth routes - only for non-authenticated users */}
              <Route 
                path="/login" 
                element={
                  <PublicRoute>
                    <Login />
                  </PublicRoute>
                } 
              />
              <Route 
                path="/register" 
                element={
                  <PublicRoute>
                    <Register />
                  </PublicRoute>
                } 
              />
              
              {/* Protected routes - only for authenticated users */}
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/profile" 
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/lawyers" 
                element={
                  <ProtectedRoute>
                    <Lawyers />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/ai-chat" 
                element={
                  <ProtectedRoute>
                    <AIChat />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/appointments" 
                element={
                  <ProtectedRoute>
                    <Appointments />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/documents" 
                element={
                  <ProtectedRoute>
                    <Documents />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/payments" 
                element={
                  <ProtectedRoute>
                    <Payments />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/esignature" 
                element={
                  <ProtectedRoute>
                    <ESignature />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/estamp" 
                element={
                  <ProtectedRoute>
                    <EStamp />
                  </ProtectedRoute>
                } 
              />
              
              {/* Catch all route */}
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </main>
          
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
