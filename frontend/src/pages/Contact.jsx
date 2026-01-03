import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Mail, Phone, MapPin, Send } from 'lucide-react';

const Contact = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Contact Us</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Get in touch with our team for any questions or support
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="font-medium">Email</p>
                  <p className="text-gray-600">support@vidhanto.com</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-green-600" />
                <div>
                  <p className="font-medium">Phone</p>
                  <p className="text-gray-600">+91 22 1234 5678</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <MapPin className="h-5 w-5 text-red-600" />
                <div>
                  <p className="font-medium">Office</p>
                  <p className="text-gray-600">Mumbai, India</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Form */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Send us a Message</CardTitle>
            </CardHeader>
            <CardContent>
              <form className="space-y-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      First Name
                    </label>
                    <Input placeholder="John" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Last Name
                    </label>
                    <Input placeholder="Doe" />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <Input type="email" placeholder="john.doe@example.com" />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Subject
                  </label>
                  <Input placeholder="How can we help you?" />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Message
                  </label>
                  <textarea
                    rows={4}
                    className="w-full border rounded-lg p-3"
                    placeholder="Tell us more about your inquiry..."
                  />
                </div>
                
                <Button className="w-full">
                  <Send className="h-4 w-4 mr-2" />
                  Send Message
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Office Locations */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Office Locations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <div>
                <h3 className="font-semibold mb-2">Mumbai Office</h3>
                <p className="text-gray-600 text-sm">
                  123 Business Park, Andheri East<br />
                  Mumbai, Maharashtra 400069<br />
                  India
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">Delhi Office</h3>
                <p className="text-gray-600 text-sm">
                  456 Connaught Place<br />
                  New Delhi 110001<br />
                  India
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">Bangalore Office</h3>
                <p className="text-gray-600 text-sm">
                  789 Tech Park, Whitefield<br />
                  Bangalore, Karnataka 560066<br />
                  India
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Contact;
