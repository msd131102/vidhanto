import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { utils } from '../services/api';
import { toast } from 'react-hot-toast';
import {
  Bot, Users, FileText, Shield, Star, ChevronRight, ArrowRight,
  CheckCircle, TrendingUp, Award, Clock, MapPin, Phone,
  Mail, Play, MessageCircle, Video, Briefcase, Scale,
  Headphones, Zap, Lock, Globe, Heart
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Home = () => {
  const { user, isAuthenticated } = useAuth();
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [stats, setStats] = useState({
    users: 0,
    lawyers: 0,
    consultations: 0,
    satisfaction: 0
  });

  useEffect(() => {
    // Simulate stats loading
    const timer = setTimeout(() => {
      setStats({
        users: 15420,
        lawyers: 892,
        consultations: 45678,
        satisfaction: 98.5
      });
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const testimonials = [
    {
      name: "Rahul Sharma",
      role: "Startup Founder",
      content: "Vidhanto made company registration seamless. The AI assistant helped me understand requirements, and the lawyer consultation saved us weeks of paperwork.",
      rating: 5,
      avatar: "RS"
    },
    {
      name: "Priya Patel",
      role: "Small Business Owner",
      content: "The document drafting service is incredible. I got my partnership agreement reviewed and finalized within 24 hours at a fraction of traditional costs.",
      rating: 5,
      avatar: "PP"
    },
    {
      name: "Amit Kumar",
      role: "Individual",
      content: "AI legal assistant helped me understand my rights in a property dispute. The subsequent lawyer consultation was much more effective.",
      rating: 4.5,
      avatar: "AK"
    }
  ];

  const services = [
    {
      icon: <Bot className="w-8 h-8" />,
      title: "AI Legal Assistant",
      description: "Get instant legal guidance from our advanced AI, available 24/7 for your questions.",
      features: ["24/7 Availability", "Instant Responses", "Cost Effective", "Privacy Protected"],
      color: "from-blue-500 to-purple-600",
      cta: "Try AI Assistant",
      ctaAction: () => isAuthenticated ? window.location.href = '/ai-chat' : window.location.href = '/login'
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Expert Lawyers",
      description: "Connect with verified legal experts specializing in various fields of Indian law.",
      features: ["Verified Professionals", "Multiple Specializations", "Flexible Consultation", "Secure Platform"],
      color: "from-green-500 to-teal-600",
      cta: "Find Lawyers",
      ctaAction: () => window.location.href = '/lawyers'
    },
    {
      icon: <FileText className="w-8 h-8" />,
      title: "Legal Documents",
      description: "Professional document drafting and review services tailored to your specific needs.",
      features: ["Expert Drafting", "Quick Turnaround", "Legal Review", "Digital Signatures"],
      color: "from-orange-500 to-red-600",
      cta: "Create Documents",
      ctaAction: () => window.location.href = '/documents'
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Compliance Services",
      description: "Complete business registration and compliance solutions for Indian companies.",
      features: ["GST Registration", "Company Incorporation", "Trademark Filing", "Ongoing Support"],
      color: "from-purple-500 to-pink-600",
      cta: "Get Compliant",
      ctaAction: () => window.location.href = '/documents'
    }
  ];

  const howItWorks = [
    {
      step: 1,
      title: "Sign Up",
      description: "Create your free account in seconds with email verification",
      icon: <Users className="w-6 h-6" />
    },
    {
      step: 2,
      title: "Choose Service",
      description: "Select AI assistance, lawyer consultation, or document services",
      icon: <Briefcase className="w-6 h-6" />
    },
    {
      step: 3,
      title: "Get Help",
      description: "Receive instant AI guidance or connect with verified lawyers",
      icon: <Headphones className="w-6 h-6" />
    },
    {
      step: 4,
      title: "Resolve Issues",
      description: "Complete your legal matters with professional support and documentation",
      icon: <CheckCircle className="w-6 h-6" />
    }
  ];

  const faqs = [
    {
      question: "How does the AI Legal Assistant work?",
      answer: "Our AI is trained on Indian law and provides instant guidance on legal matters. It's available 24/7 and much more affordable than traditional consultations."
    },
    {
      question: "Are the lawyers verified?",
      answer: "Yes, all lawyers on our platform undergo rigorous verification including bar license checks and background verification."
    },
    {
      question: "What types of legal documents can you create?",
      answer: "We can draft various legal documents including NDAs, agreements, legal notices, affidavits, wills, and petitions."
    },
    {
      question: "How are consultations conducted?",
      answer: "We offer three modes: chat consultation, voice call, and video call. You can choose based on your preference and complexity."
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="relative max-w-7xl mx-auto px-4 py-20 lg:py-32">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-4xl md:text-6xl font-bold mb-6"
            >
              Legal Help Made
              <span className="text-yellow-300"> Simple & Affordable</span>
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-xl md:text-2xl mb-8 text-blue-100 max-w-3xl mx-auto"
            >
              Connect with AI-powered legal assistance and verified lawyers across India
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
              <button
                onClick={() => isAuthenticated ? window.location.href = '/ai-chat' : window.location.href = '/login'}
                className="group bg-white text-blue-600 px-8 py-4 rounded-full font-semibold text-lg hover:bg-blue-50 transition-all transform hover:scale-105 shadow-xl flex items-center gap-3"
              >
                <Bot className="w-5 h-5" />
                <span>Ask AI Legal Assistant</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              
              <button
                onClick={() => window.location.href = '/lawyers'}
                className="group bg-blue-500 text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-blue-400 transition-all transform hover:scale-105 shadow-xl flex items-center gap-3"
              >
                <Users className="w-5 h-5" />
                <span>Talk to a Lawyer</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </motion.div>
          </motion.div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-20 left-10 opacity-20">
          <Scale className="w-32 h-32 text-white" />
        </div>
        <div className="absolute bottom-20 right-10 opacity-20">
          <Shield className="w-24 h-24 text-white" />
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="py-12 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-3"
            >
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                <Users className="w-8 h-8 text-blue-600" />
              </div>
              <div className="text-3xl font-bold text-slate-900">{stats.users.toLocaleString()}+</div>
              <div className="text-slate-600">Happy Users</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="space-y-3"
            >
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <Users className="w-8 h-8 text-green-600" />
              </div>
              <div className="text-3xl font-bold text-slate-900">{stats.lawyers}+</div>
              <div className="text-slate-600">Verified Lawyers</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="space-y-3"
            >
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
                <MessageCircle className="w-8 h-8 text-purple-600" />
              </div>
              <div className="text-3xl font-bold text-slate-900">{stats.consultations.toLocaleString()}+</div>
              <div className="text-slate-600">Consultations</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="space-y-3"
            >
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto">
                <Star className="w-8 h-8 text-yellow-600" />
              </div>
              <div className="text-3xl font-bold text-slate-900">{stats.satisfaction}%</div>
              <div className="text-slate-600">Satisfaction Rate</div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Complete Legal Solutions
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Everything you need for legal assistance, from AI guidance to expert consultations
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <AnimatePresence>
              {services.map((service, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -30 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  whileHover={{ y: -5 }}
                  className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all cursor-pointer"
                  onClick={service.ctaAction}
                >
                  <div className={`p-8 bg-gradient-to-br ${service.color} rounded-t-2xl`}>
                    <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                      {service.icon}
                    </div>
                    <h3 className="text-xl font-bold text-white mb-3">{service.title}</h3>
                    <p className="text-blue-100 mb-6">{service.description}</p>
                  </div>
                  
                  <div className="p-6">
                    <ul className="space-y-2 mb-6">
                      {service.features.map((feature, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-slate-600">
                          <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                          <span className="text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    
                    <button className="w-full bg-slate-900 text-white py-3 px-6 rounded-lg hover:bg-slate-800 transition-colors font-medium group-hover:scale-105 flex items-center justify-center gap-2">
                      {service.cta}
                      <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Get legal help in 4 simple steps
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {howItWorks.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
                    {step.step}
                  </div>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{step.title}</h3>
                <p className="text-slate-600">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              What Our Users Say
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Trusted by thousands of users across India
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-2xl transition-shadow cursor-pointer"
                onClick={() => setActiveTestimonial(index)}
              >
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    {testimonial.avatar}
                  </div>
                  <div className="ml-4 flex-1">
                    <h4 className="font-semibold text-slate-900">{testimonial.name}</h4>
                    <p className="text-sm text-slate-600">{testimonial.role}</p>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: testimonial.rating }, (_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < testimonial.rating
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
                <p className="text-slate-600 italic">"{testimonial.content}"</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Preview Section */}
      <section className="py-20 bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto mb-12">
              Quick answers to common legal questions
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-slate-50 rounded-xl p-6 hover:bg-slate-100 transition-colors"
              >
                <h3 className="font-semibold text-slate-900 mb-3">{faq.question}</h3>
                <p className="text-slate-600">{faq.answer}</p>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-12">
            <button
              onClick={() => window.location.href = '/faq'}
              className="bg-blue-600 text-white px-8 py-4 rounded-lg hover:bg-blue-700 transition-colors font-semibold text-lg inline-flex items-center gap-3"
            >
              View All FAQs
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-blue-600 to-purple-700 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to Get Legal Help?
            </h2>
            <p className="text-xl mb-8 text-blue-100">
              Join thousands of satisfied users who trust Vidhanto for their legal needs
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => isAuthenticated ? window.location.href = '/ai-chat' : window.location.href = '/login'}
                className="bg-white text-blue-600 px-8 py-4 rounded-lg hover:bg-blue-50 transition-colors font-semibold text-lg flex items-center gap-3"
              >
                <Bot className="w-5 h-5" />
                Try AI Assistant
              </button>
              <button
                onClick={() => isAuthenticated ? window.location.href = '/lawyers' : window.location.href = '/login'}
                className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-lg hover:bg-white hover:text-blue-600 transition-colors font-semibold text-lg flex items-center gap-3"
              >
                <Users className="w-5 h-5" />
                Find Lawyers
              </button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Home;
