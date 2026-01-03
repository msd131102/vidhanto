import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  FileText,
  Shield,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  Scale
} from 'lucide-react';

const Terms = () => {
  const sections = [
    {
      title: 'Acceptance of Terms',
      icon: <CheckCircle className="w-6 h-6 text-green-600" />,
      content: [
        'By accessing and using Vidhanto, you accept and agree to be bound by these Terms',
        'If you do not agree to these terms, you must not use our services',
        'These terms constitute a legally binding agreement between you and Vidhanto',
        'We reserve the right to update these terms at any time with reasonable notice'
      ]
    },
    {
      title: 'Services Description',
      icon: <Scale className="w-6 h-6 text-blue-600" />,
      content: [
        'AI-powered legal assistance and guidance',
        'Connection with verified lawyers for consultations',
        'Legal document drafting and review services',
        'Appointment scheduling and management',
        'Secure payment processing and invoicing',
        'Case tracking and communication tools'
      ]
    },
    {
      title: 'User Responsibilities',
      icon: <Shield className="w-6 h-6 text-purple-600" />,
      content: [
        'Provide accurate and complete information',
        'Maintain confidentiality of shared legal matters',
        'Pay for services in a timely manner',
        'Respect professional boundaries with lawyers',
        'Use services for lawful purposes only',
        'Report any issues or concerns promptly'
      ]
    },
    {
      title: 'Payment Terms',
      icon: <DollarSign className="w-6 h-6 text-orange-600" />,
      content: [
        'All payments are processed through secure Razorpay gateway',
        'Consultation fees vary by lawyer expertise and experience',
        'Document services have fixed pricing as displayed',
        'Refunds available as per our refund policy',
        'Taxes applicable as per Indian laws',
        'Payment disputes handled through established procedures'
      ]
    },
    {
      title: 'Limitations & Disclaimers',
      icon: <AlertTriangle className="w-6 h-6 text-red-600" />,
      content: [
        'AI assistance is for informational purposes only',
        'We are not a law firm and do not provide legal representation',
        'Consultations do not create lawyer-client relationship automatically',
        'We are not responsible for outcomes of legal proceedings',
        'Service availability may be limited by technical factors',
        'We do not guarantee specific legal outcomes'
      ]
    },
    {
      title: 'Intellectual Property',
      icon: <FileText className="w-6 h-6 text-indigo-600" />,
      content: [
        'Platform content and technology are owned by Vidhanto',
        'User-generated content remains property of respective users',
        'Limited license granted to use content for service purposes',
        'Reverse engineering or copying is prohibited',
        'Trademarks and brands are Vidhanto property',
        'User content may be used for service improvement'
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Terms of Service
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Legal guidelines for using Vidhanto's legal-tech platform
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Last updated: January 1, 2024
          </p>
        </div>

        {/* Terms Sections */}
        <div className="space-y-8">
          {sections.map((section, index) => (
            <Card key={index} className="border border-gray-200">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0">
                    {section.icon}
                  </div>
                  <CardTitle className="text-xl">{section.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {section.content.map((item, itemIndex) => (
                    <li key={itemIndex} className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-gray-700 leading-relaxed">
                        {item}
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Important Legal Notice */}
        <Card className="mt-12 bg-red-50 border-red-200">
          <CardContent className="py-8">
            <div className="text-center">
              <h3 className="text-xl font-semibold text-red-900 mb-4">
                Important Legal Notice
              </h3>
              <p className="text-red-800 mb-6 max-w-2xl mx-auto leading-relaxed">
                Vidhanto is a technology platform that connects users with legal professionals. 
                We are not a law firm and do not provide legal advice directly. 
                For serious legal matters, always consult with a qualified attorney.
              </p>
              <div className="bg-white p-6 rounded-lg border border-red-200">
                <p className="text-sm text-gray-700 font-medium">
                  ⚠️ No attorney-client relationship is formed by using this platform. 
                  All consultations are subject to separate engagement agreements between users and lawyers.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <div className="mt-12 text-center">
          <div className="max-w-3xl mx-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Questions About These Terms?
            </h3>
            <p className="text-gray-600 mb-6">
              If you have any questions about these Terms of Service, please contact our legal team.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-100 p-6 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">Legal Team</h4>
                <p className="text-gray-600">legal@vidhanto.com</p>
                <p className="text-gray-600">+91 22 1234 5678</p>
              </div>
              <div className="bg-gray-100 p-6 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">General Support</h4>
                <p className="text-gray-600">support@vidhanto.com</p>
                <p className="text-gray-600">+91 22 1234 5679</p>
              </div>
            </div>
          </div>
        </div>

        {/* Agreement Statement */}
        <div className="mt-12 p-8 bg-gray-900 text-white rounded-lg">
          <div className="text-center">
            <h3 className="text-xl font-semibold mb-4">
              Agreement to Terms
            </h3>
            <p className="text-gray-300 leading-relaxed max-w-2xl mx-auto">
              By creating an account, accessing our services, or using Vidhanto in any manner, 
              you acknowledge that you have read, understood, and agree to be bound by these 
              Terms of Service and our Privacy Policy. If you do not agree, you must not use our services.
            </p>
            <div className="mt-6">
              <p className="text-sm text-gray-400">
                © 2024 Vidhanto. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Terms;
