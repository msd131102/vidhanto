import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { usersAPI, utils } from '../services/api';
import { toast } from 'react-hot-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { User, Mail, Phone, MapPin, Loader, AlertCircle } from 'lucide-react';

const Profile = () => {
  const { user, isAuthenticated, updateUser } = useAuth();
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: {
      street: '',
      city: '',
      state: '',
      pinCode: ''
    },
    preferences: {
      emailNotifications: true,
      smsNotifications: false,
      twoFactorAuth: false
    }
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isAuthenticated && user) {
      setProfileData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || {
          street: '',
          city: '',
          state: '',
          pinCode: ''
        },
        preferences: user.preferences || {
          emailNotifications: true,
          smsNotifications: false,
          twoFactorAuth: false
        }
      });
    }
  }, [isAuthenticated, user]);

  const handleInputChange = (field, value) => {
    if (field.includes('.')) {
      // Handle nested fields like address.street
      const [parent, child] = field.split('.');
      setProfileData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setProfileData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handlePreferenceChange = (field, value) => {
    setProfileData(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        [field]: value
      }
    }));
  };

  const handleSavePersonalInfo = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await usersAPI.updateProfile({
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        email: profileData.email,
        phone: profileData.phone
      });
      
      if (response.success) {
        updateUser(response.data.user);
        toast.success('Personal information updated successfully');
      }
    } catch (err) {
      setError(err.message || 'Failed to update profile');
      utils.handleError(err, 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAddress = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await usersAPI.updateAddress(profileData.address);
      
      if (response.success) {
        updateUser(response.data.user);
        toast.success('Address updated successfully');
      }
    } catch (err) {
      setError(err.message || 'Failed to update address');
      utils.handleError(err, 'Failed to update address');
    } finally {
      setLoading(false);
    }
  };

  const handleSavePreferences = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await usersAPI.updatePreferences(profileData.preferences);
      
      if (response.success) {
        updateUser(response.data.user);
        toast.success('Preferences updated successfully');
      }
    } catch (err) {
      setError(err.message || 'Failed to update preferences');
      utils.handleError(err, 'Failed to update preferences');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    // This would typically open a modal or navigate to change password page
    toast.info('Password change functionality would be implemented here');
  };

  const handleDeleteAccount = async () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      try {
        const response = await usersAPI.deleteAccount();
        
        if (response.success) {
          toast.success('Account deleted successfully');
          // Redirect to login or home page
          window.location.href = '/login';
        }
      } catch (err) {
        setError(err.message || 'Failed to delete account');
        utils.handleError(err, 'Failed to delete account');
      }
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Login Required</h2>
          <p className="text-gray-600 mb-4">Please log in to access your profile</p>
          <button
            onClick={() => window.location.href = '/login'}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Profile</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">Profile Settings</h1>
        
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                  <User className="w-8 h-8 text-gray-500" />
                </div>
                <div>
                  <h3 className="font-medium">{profileData.firstName} {profileData.lastName}</h3>
                  <p className="text-sm text-gray-500">{profileData.email}</p>
                </div>
              </div>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700">First Name</label>
                  <Input 
                    value={profileData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Last Name</label>
                  <Input 
                    value={profileData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <Input 
                    value={profileData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Phone</label>
                  <Input 
                    value={profileData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                  />
                </div>
              </div>
              
              <Button 
                className="w-full" 
                onClick={handleSavePersonalInfo}
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </Button>
            </CardContent>
          </Card>
          
          {/* Address Information */}
          <Card>
            <CardHeader>
              <CardTitle>Address Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Street Address</label>
                  <Input 
                    value={profileData.address.street}
                    onChange={(e) => handleInputChange('address.street', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">City</label>
                  <Input 
                    value={profileData.address.city}
                    onChange={(e) => handleInputChange('address.city', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">State</label>
                  <Input 
                    value={profileData.address.state}
                    onChange={(e) => handleInputChange('address.state', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">PIN Code</label>
                  <Input 
                    value={profileData.address.pinCode}
                    onChange={(e) => handleInputChange('address.pinCode', e.target.value)}
                  />
                </div>
              </div>
              
              <Button 
                className="w-full" 
                onClick={handleSaveAddress}
                disabled={loading}
              >
                {loading ? 'Updating...' : 'Update Address'}
              </Button>
            </CardContent>
          </Card>
          
          {/* Account Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Account Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Email Notifications</h4>
                    <p className="text-sm text-gray-500">Receive email updates</p>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={profileData.preferences.emailNotifications}
                    onChange={(e) => handlePreferenceChange('emailNotifications', e.target.checked)}
                    className="h-4 w-4" 
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">SMS Notifications</h4>
                    <p className="text-sm text-gray-500">Receive SMS alerts</p>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={profileData.preferences.smsNotifications}
                    onChange={(e) => handlePreferenceChange('smsNotifications', e.target.checked)}
                    className="h-4 w-4" 
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Two-Factor Authentication</h4>
                    <p className="text-sm text-gray-500">Add extra security</p>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={profileData.preferences.twoFactorAuth}
                    onChange={(e) => handlePreferenceChange('twoFactorAuth', e.target.checked)}
                    className="h-4 w-4" 
                  />
                </div>
              </div>
              
              <div className="pt-4 space-y-2">
                <Button variant="outline" className="w-full">
                  Change Password
                </Button>
                <Button variant="destructive" className="w-full">
                  Delete Account
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Profile;
