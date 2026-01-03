import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, Users, Target, Award } from 'lucide-react';

const About = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">About Vidhanto</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Revolutionizing legal services with AI-powered technology and expert legal professionals
          </p>
        </div>

        {/* Mission & Vision */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 mb-12">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Target className="h-6 w-6 text-blue-600 mr-2" />
                Our Mission
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 leading-relaxed">
                To make legal services accessible, affordable, and efficient for everyone through 
                innovative technology and a network of verified legal professionals.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Award className="h-6 w-6 text-purple-600 mr-2" />
                Our Vision
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 leading-relaxed">
                To become India's most trusted legal-tech platform, bridging the gap between 
                legal services and those who need them most.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Values */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle>Our Core Values</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <div className="text-center">
                <Shield className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Trust & Security</h3>
                <p className="text-gray-600">
                  Your data and legal matters are protected with enterprise-grade security.
                </p>
              </div>

              <div className="text-center">
                <Users className="h-12 w-12 text-green-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Expert Network</h3>
                <p className="text-gray-600">
                  Access to verified legal professionals across all practice areas.
                </p>
              </div>

              <div className="text-center">
                <Target className="h-12 w-12 text-purple-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Innovation</h3>
                <p className="text-gray-600">
                  Cutting-edge AI technology to streamline legal processes.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-4 mb-12">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">10,000+</div>
            <p className="text-gray-600">Happy Clients</p>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">500+</div>
            <p className="text-gray-600">Expert Lawyers</p>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">98%</div>
            <p className="text-gray-600">Success Rate</p>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-orange-600 mb-2">24/7</div>
            <p className="text-gray-600">AI Support</p>
          </div>
        </div>

        {/* CTA */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="text-center py-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Ready to Experience the Future of Legal Services?
            </h2>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Join thousands of Indians who trust Vidhanto for their legal needs.
            </p>
            <Button size="lg">Get Started Today</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default About;
