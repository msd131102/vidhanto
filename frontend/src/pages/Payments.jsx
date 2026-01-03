import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CreditCard, Download, TrendingUp, Clock } from 'lucide-react';

const Payments = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Payment History</h1>
          <Button>Download Statement</Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-4 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <CreditCard className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-2xl font-bold">₹12,500</p>
                  <p className="text-sm text-gray-500">Total Spent</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <TrendingUp className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-2xl font-bold">8</p>
                  <p className="text-sm text-gray-500">Transactions</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Clock className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-2xl font-bold">2</p>
                  <p className="text-sm text-gray-500">Pending</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Download className="h-8 w-8 text-orange-600" />
                <div className="ml-4">
                  <p className="text-2xl font-bold">6</p>
                  <p className="text-sm text-gray-500">Invoices</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Payment History */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                {
                  id: "PAY001",
                  description: "Consultation with Adv. Rajesh Sharma",
                  date: "2024-01-20",
                  amount: "₹2000",
                  status: "Completed"
                },
                {
                  id: "PAY002",
                  description: "Document Review - Rental Agreement",
                  date: "2024-01-18",
                  amount: "₹1500",
                  status: "Completed"
                },
                {
                  id: "PAY003",
                  description: "Legal Consultation - Family Law",
                  date: "2024-01-15",
                  amount: "₹3000",
                  status: "Processing"
                },
                {
                  id: "PAY004",
                  description: "Power of Attorney Document",
                  date: "2024-01-12",
                  amount: "₹1000",
                  status: "Completed"
                }
              ].map((payment, index) => (
                <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-semibold">{payment.description}</p>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>ID: {payment.id}</span>
                      <span>{payment.date}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <span className="text-lg font-semibold">{payment.amount}</span>
                    <span className={`px-3 py-1 text-xs rounded-full ${
                      payment.status === 'Completed' ? 'bg-green-100 text-green-800' :
                      payment.status === 'Processing' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {payment.status}
                    </span>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4" />
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

export default Payments;
