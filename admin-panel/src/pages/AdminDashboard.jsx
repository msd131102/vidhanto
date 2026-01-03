import React, { useState } from 'react';
import { 
  Card, 
  CardBody, 
  CardHeader, 
  Button, 
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Chip,
  Progress
} from '@heroui/react';
import { 
  UserGroupIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  CalendarIcon,
  ChatBubbleLeftRightIcon,
  TrendingUpIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

const AdminDashboard = () => {
  const [timeRange, setTimeRange] = useState('7d');

  const stats = [
    {
      title: 'Total Users',
      value: '12,543',
      change: '+523',
      changeType: 'increase',
      icon: <UserGroupIcon className="w-6 h-6 text-blue-600" />,
      color: 'blue'
    },
    {
      title: 'Total Revenue',
      value: '₹8,45,230',
      change: '+12.5%',
      changeType: 'increase',
      icon: <CurrencyDollarIcon className="w-6 h-6 text-green-600" />,
      color: 'green'
    },
    {
      title: 'Active Lawyers',
      value: '523',
      change: '+45',
      changeType: 'increase',
      icon: <ShieldCheckIcon className="w-6 h-6 text-purple-600" />,
      color: 'purple'
    },
    {
      title: 'Total Documents',
      value: '3,456',
      change: '+234',
      changeType: 'increase',
      icon: <DocumentTextIcon className="w-6 h-6 text-orange-600" />,
      color: 'orange'
    },
    {
      title: 'Appointments Today',
      value: '156',
      change: '+12',
      changeType: 'increase',
      icon: <CalendarIcon className="w-6 h-6 text-red-600" />,
      color: 'red'
    },
    {
      title: 'AI Conversations',
      value: '2,345',
      change: '+189',
      changeType: 'increase',
      icon: <ChatBubbleLeftRightIcon className="w-6 h-6 text-indigo-600" />,
      color: 'indigo'
    }
  ];

  const recentActivities = [
    {
      id: 1,
      type: 'user_registration',
      description: 'New user registration: John Doe',
      time: '2 minutes ago',
      status: 'success'
    },
    {
      id: 2,
      type: 'payment_completed',
      description: 'Payment received: ₹2,500 for consultation',
      time: '5 minutes ago',
      status: 'success'
    },
    {
      id: 3,
      type: 'lawyer_verification',
      description: 'New lawyer verification request: Adv. Priya Sharma',
      time: '10 minutes ago',
      status: 'pending'
    },
    {
      id: 4,
      type: 'ai_usage',
      description: 'High AI usage detected: 150+ tokens used',
      time: '15 minutes ago',
      status: 'warning'
    },
    {
      id: 5,
      type: 'document_created',
      description: 'Document drafted: Rental Agreement',
      time: '20 minutes ago',
      status: 'success'
    }
  ];

  const quickActions = [
    {
      title: 'Manage Users',
      description: 'View and manage user accounts',
      icon: <UserGroupIcon className="w-8 h-8" />,
      color: 'blue',
      href: '/admin/users'
    },
    {
      title: 'Verify Lawyers',
      description: 'Review and approve lawyer applications',
      icon: <ShieldCheckIcon className="w-8 h-8" />,
      color: 'purple',
      href: '/admin/lawyers'
    },
    {
      title: 'View Analytics',
      description: 'Detailed platform analytics and insights',
      icon: <TrendingUpIcon className="w-8 h-8" />,
      color: 'green',
      href: '/admin/analytics'
    },
    {
      title: 'System Settings',
      description: 'Configure platform settings and features',
      icon: <DocumentTextIcon className="w-8 h-8" />,
      color: 'orange',
      href: '/admin/settings'
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'success':
        return 'success';
      case 'warning':
        return 'warning';
      case 'error':
        return 'danger';
      default:
        return 'default';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Admin Dashboard
          </h1>
          <p className="text-gray-600">
            Manage your legal-tech platform with comprehensive insights and controls
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
          {stats.map((stat, index) => (
            <Card key={index} className="border border-gray-200">
              <CardBody>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className={`p-2 rounded-lg bg-${stat.color}-100`}>
                      {stat.icon}
                    </div>
                    <h3 className="text-sm font-medium text-gray-600">
                      {stat.title}
                    </h3>
                  </div>
                  <Chip
                    size="sm"
                    color={stat.changeType === 'increase' ? 'success' : 'danger'}
                    variant="flat"
                    className="text-xs"
                  >
                    {stat.change}
                  </Chip>
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  {stat.value}
                </div>
              </CardBody>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardBody className="text-center p-6">
                  <div className={`inline-flex p-3 rounded-lg bg-${action.color}-100 mb-4`}>
                    <div className={`text-${action.color}-600`}>
                      {action.icon}
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {action.title}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {action.description}
                  </p>
                </CardBody>
              </Card>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Activities */}
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold text-gray-900">
                Recent Activities
              </h2>
            </CardHeader>
            <CardBody>
              <div className="space-y-4">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg bg-gray-50">
                    <Chip
                      size="sm"
                      color={getStatusColor(activity.status)}
                      variant="flat"
                      className="mt-1"
                    >
                      {activity.status}
                    </Chip>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {activity.description}
                      </p>
                      <p className="text-xs text-gray-500">
                        {activity.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>

          {/* System Health */}
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold text-gray-900">
                System Health
              </h2>
            </CardHeader>
            <CardBody>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">API Response Time</span>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-semibold text-gray-900">124ms</span>
                    <Chip size="sm" color="success" variant="flat">
                      Healthy
                    </Chip>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Database Status</span>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-semibold text-gray-900">Normal</span>
                    <Chip size="sm" color="success" variant="flat">
                      Online
                    </Chip>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">AI Service</span>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-semibold text-gray-900">Active</span>
                    <Chip size="sm" color="success" variant="flat">
                      Operational
                    </Chip>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Payment Gateway</span>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-semibold text-gray-900">Connected</span>
                    <Chip size="sm" color="success" variant="flat">
                      Razorpay
                    </Chip>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Storage Usage</span>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-semibold text-gray-900">68%</span>
                    <Progress 
                      value={68} 
                      size="sm"
                      color="warning"
                      className="w-20"
                    />
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Alerts */}
        <Card className="mt-8 border-red-200 bg-red-50">
          <CardBody>
            <div className="flex items-start gap-3">
              <ExclamationTriangleIcon className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-lg font-semibold text-red-900 mb-2">
                  Action Required: Pending Lawyer Verifications
                </h3>
                <p className="text-red-800 mb-4">
                  You have 8 lawyer verification requests pending review. 
                  Please review and approve or reject them within 48 hours.
                </p>
                <Button color="danger" size="sm">
                  Review Verifications
                </Button>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
