import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, User, Video, MessageSquare } from 'lucide-react';

const Appointments = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Appointments</h1>
          <Button>Book New Appointment</Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-4 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Calendar className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-2xl font-bold">12</p>
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
                  <p className="text-2xl font-bold">3</p>
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
                  <p className="text-2xl font-bold">8</p>
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
                  <p className="text-2xl font-bold">1</p>
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
            <div className="space-y-4">
              {[
                {
                  lawyer: "Adv. Rajesh Sharma",
                  date: "2024-01-20",
                  time: "10:00 AM",
                  type: "Video Call",
                  status: "Upcoming"
                },
                {
                  lawyer: "Adv. Priya Patel",
                  date: "2024-01-18",
                  time: "2:00 PM",
                  type: "Chat",
                  status: "Completed"
                },
                {
                  lawyer: "Adv. Amit Kumar",
                  date: "2024-01-15",
                  time: "4:00 PM",
                  type: "Video Call",
                  status: "Completed"
                }
              ].map((apt, index) => (
                <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                      <User className="h-6 w-6 text-gray-600" />
                    </div>
                    <div>
                      <p className="font-semibold">{apt.lawyer}</p>
                      <div className="flex items-center space-x-2 text-sm text-gray-500">
                        <Calendar className="h-4 w-4" />
                        <span>{apt.date}</span>
                        <Clock className="h-4 w-4 ml-2" />
                        <span>{apt.time}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-1">
                      {apt.type === "Video Call" ? (
                        <Video className="h-4 w-4 text-blue-600" />
                      ) : (
                        <MessageSquare className="h-4 w-4 text-green-600" />
                      )}
                      <span className="text-sm">{apt.type}</span>
                    </div>
                    
                    <span className={`px-3 py-1 text-xs rounded-full ${
                      apt.status === 'Upcoming' ? 'bg-blue-100 text-blue-800' :
                      apt.status === 'Completed' ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {apt.status}
                    </span>
                    
                    <Button variant="outline" size="sm">
                      {apt.status === 'Upcoming' ? 'Join' : 'View'}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Appointments;
