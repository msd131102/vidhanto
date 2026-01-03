import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Eye, Lock, Database } from 'lucide-react';

const Privacy = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Privacy Policy</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            How we protect and handle your personal information
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Last updated: January 1, 2024
          </p>
        </div>

        {/* Privacy Sections */}
        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Eye className="h-6 w-6 text-blue-600 mr-2" />
                Information We Collect
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Personal Information</h3>
                  <p className="text-gray-600">
                    Name, email address, phone number, and professional details when you register or use our services.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Usage Data</h3>
                  <p className="text-gray-600">
                    Information about how you interact with our platform, including pages visited, features used, and time spent.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Legal Information</h3>
                  <p className="text-gray-600">
                    Details about your legal matters and consultations, kept strictly confidential.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Lock className="h-6 w-6 text-green-600 mr-2" />
                How We Protect Your Data
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Encryption</h3>
                  <p className="text-gray-600">
                    All data is encrypted using industry-standard SSL/TLS protocols during transmission.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Secure Storage</h3>
                  <p className="text-gray-600">
                    Your information is stored on secure servers with regular security updates and monitoring.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Access Control</h3>
                  <p className="text-gray-600">
                    Strict access controls and authentication mechanisms prevent unauthorized access to your data.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Database className="h-6 w-6 text-purple-600 mr-2" />
                Data Usage and Sharing
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Service Delivery</h3>
                  <p className="text-gray-600">
                    We use your information to provide legal services, connect you with lawyers, and manage appointments.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Lawyer Matching</h3>
                  <p className="text-gray-600">
                    Your case details are shared only with assigned lawyers for consultation purposes.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">No Third-Party Sharing</h3>
                  <p className="text-gray-600">
                    We never sell your personal information to third parties for marketing purposes.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-red-50 border-red-200">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="h-6 w-6 text-red-600 mr-2" />
                Your Rights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-red-900 mb-2">Access and Correction</h3>
                  <p className="text-red-800">
                    You can access, update, or delete your personal information at any time through your account settings.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-red-900 mb-2">Data Portability</h3>
                  <p className="text-red-800">
                    Request a copy of your data in a machine-readable format at any time.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-red-900 mb-2">Complaint Rights</h3>
                  <p className="text-red-800">
                    File complaints about data handling with our privacy officer or relevant authorities.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Contact Privacy Team */}
        <Card className="mt-12">
          <CardHeader>
            <CardTitle>Privacy Questions?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <p className="text-gray-600 mb-6">
                If you have questions about this privacy policy or how we handle your data,
                please contact our privacy team.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-100 p-6 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">Privacy Officer</h4>
                  <p className="text-gray-600">privacy@vidhanto.com</p>
                  <p className="text-gray-600">+91 22 1234 5678</p>
                </div>
                <div className="bg-gray-100 p-6 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">Data Protection</h4>
                  <p className="text-gray-600">dpo@vidhanto.com</p>
                  <p className="text-gray-600">+91 22 1234 5679</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Privacy;
