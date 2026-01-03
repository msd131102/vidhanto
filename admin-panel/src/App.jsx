import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { HeroUIProvider } from '@heroui/react';
import { Toaster } from 'react-hot-toast';
import AdminDashboard from './pages/AdminDashboard';

function App() {
  return (
    <HeroUIProvider>
      <Router>
        <div className="min-h-screen bg-gray-100">
          <Routes>
            <Route path="/" element={<AdminDashboard />} />
            <Route path="/dashboard" element={<AdminDashboard />} />
            <Route path="/users" element={<div><h1>User Management</h1></div>} />
            <Route path="/lawyers" element={<div><h1>Lawyer Management</h1></div>} />
            <Route path="/analytics" element={<div><h1>Analytics</h1></div>} />
            <Route path="/settings" element={<div><h1>Settings</h1></div>} />
          </Routes>
        </div>
      </Router>
    </HeroUIProvider>
  );
}

export default App;
