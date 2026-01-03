import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageSquare, Users, FileText, CreditCard } from 'lucide-react';

const FAQ = () => {
  const faqs = [
    {
      category: "AI Legal Assistant",
      icon: <MessageSquare className="h-5 w-5 text-blue-600" />,
      questions: [
        {
          q: "How accurate is the AI legal assistant?",
          a: "Our AI assistant provides general legal information based on Indian laws and regulations. It's designed to give you helpful guidance, but for specific legal advice, always consult with a qualified lawyer."
        },
        {
          q: "Is my conversation with AI confidential?",
          a: "Yes, all AI conversations are encrypted and stored securely. We follow strict privacy policies to protect your data."
        }
      ]
    },
    {
      category: "Lawyer Consultation",
      icon: <Users className="h-5 w-5 text-green-600" />,
      questions: [
        {
          q: "How do I book a lawyer consultation?",
          a: "Simply browse our lawyer directory, select a lawyer based on specialization and availability, choose your preferred consultation type (chat, voice, or video), and book your slot."
        },
        {
          q: "What if I need to reschedule my appointment?",
          a: "You can reschedule your appointment up to 24 hours before the scheduled time through your dashboard or by contacting our support team."
        }
      ]
    },
    {
      category: "Document Services",
      icon: <FileText className="h-5 w-5 text-purple-600" />,
      questions: [
        {
          q: "What types of legal documents can I create?",
          a: "We offer templates for rental agreements, legal notices, power of attorney, employment contracts, and more. All documents are customizable as per your requirements."
        },
        {
          q: "Are the documents legally valid?",
          a: "Yes, our document templates are drafted by legal experts and comply with Indian laws. However, we recommend lawyer review for complex matters."
        }
      ]
    },
    {
      category: "Payments & Refunds",
      icon: <CreditCard className="h-5 w-5 text-orange-600" />,
      questions: [
        {
          q: "What payment methods do you accept?",
          a: "We accept all major credit cards, debit cards, UPI, net banking, and digital wallets through our secure payment gateway."
        },
        {
          q: "What is your refund policy?",
          a: "We offer full refunds for cancelled appointments up to 24 hours before the scheduled time. Document services are non-refundable once delivered."
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Find answers to common questions about our legal services
          </p>
        </div>

        {/* FAQ Categories */}
        <div className="space-y-8">
          {faqs.map((category, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle className="flex items-center">
                  {category.icon}
                  <span className="ml-2">{category.category}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {category.questions.map((item, qIndex) => (
                    <div key={qIndex} className="border-b last:border-b-0 pb-6 last:pb-0">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {item.q}
                      </h3>
                      <p className="text-gray-600 leading-relaxed">
                        {item.a}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Still Have Questions */}
        <Card className="mt-12 bg-blue-50 border-blue-200">
          <CardContent className="text-center py-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Still Have Questions?
            </h2>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Can't find the answer you're looking for? Our support team is here to help.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button>Contact Support</Button>
              <Button variant="outline">Browse Help Center</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FAQ;
