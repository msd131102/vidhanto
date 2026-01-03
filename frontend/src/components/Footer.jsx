import { Link } from 'react-router-dom';
import {
  Shield,
  Mail,
  Phone,
  MapPin,
  Facebook,
  Twitter,
  Linkedin,
  Instagram,
  Youtube,
  ChevronRight
} from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    services: [
      { name: 'AI Legal Assistant', path: '/ai-chat' },
      { name: 'Lawyer Consultation', path: '/lawyers' },
      { name: 'Document Services', path: '/documents' },
      { name: 'Compliance Services', path: '/compliance' },
    ],
    company: [
      { name: 'About Us', path: '/about' },
      { name: 'Careers', path: '/careers' },
      { name: 'Press', path: '/press' },
      { name: 'Blog', path: '/blog' },
    ],
    support: [
      { name: 'Help Center', path: '/help' },
      { name: 'Contact Us', path: '/contact' },
      { name: 'FAQ', path: '/faq' },
      { name: 'Status', path: '/status' },
    ],
    legal: [
      { name: 'Privacy Policy', path: '/privacy' },
      { name: 'Terms of Service', path: '/terms' },
      { name: 'Cookie Policy', path: '/cookies' },
      { name: 'Disclaimer', path: '/disclaimer' },
    ]
  };

  const socialLinks = [
    { icon: Facebook, href: '#', label: 'Facebook' },
    { icon: Twitter, href: '#', label: 'Twitter' },
    { icon: Linkedin, href: '#', label: 'LinkedIn' },
    { icon: Instagram, href: '#', label: 'Instagram' },
    { icon: Youtube, href: '#', label: 'YouTube' },
  ];

  return (
    <footer className="bg-gray-900 text-white">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-2 mb-6">
              <div className="w-10 h-10 bg-gradient-to-r from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold">Vidhanto</span>
            </div>
            
            <p className="text-gray-300 mb-6 leading-relaxed max-w-sm">
              Making legal services accessible to everyone. Get instant AI-powered legal help or connect with expert lawyers anytime, anywhere.
            </p>
            
            {/* Contact Info */}
            <div className="space-y-3">
              <div className="flex items-center text-gray-300 hover:text-white transition-colors">
                <Mail className="w-5 h-5 mr-3 text-primary-400" />
                <span>support@vidhanto.com</span>
              </div>
              <div className="flex items-center text-gray-300 hover:text-white transition-colors">
                <Phone className="w-5 h-5 mr-3 text-primary-400" />
                <span>+91 98765 43210</span>
              </div>
              <div className="flex items-center text-gray-300 hover:text-white transition-colors">
                <MapPin className="w-5 h-5 mr-3 text-primary-400" />
                <span>Mumbai, Maharashtra, India</span>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex space-x-3 mt-6">
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  aria-label={social.label}
                  className="w-10 h-10 bg-gray-800 hover:bg-primary-600 rounded-lg flex items-center justify-center transition-colors duration-200"
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Services Links */}
          <div>
            <h3 className="text-lg font-semibold mb-6">Services</h3>
            <ul className="space-y-3">
              {footerLinks.services.map((link, index) => (
                <li key={index}>
                  <Link
                    to={link.path}
                    className="flex items-center text-gray-300 hover:text-primary-400 transition-colors duration-200"
                  >
                    <ChevronRight className="w-4 h-4 mr-2" />
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="text-lg font-semibold mb-6">Company</h3>
            <ul className="space-y-3">
              {footerLinks.company.map((link, index) => (
                <li key={index}>
                  <Link
                    to={link.path}
                    className="flex items-center text-gray-300 hover:text-primary-400 transition-colors duration-200"
                  >
                    <ChevronRight className="w-4 h-4 mr-2" />
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support & Legal Links */}
          <div>
            <h3 className="text-lg font-semibold mb-6">Support & Legal</h3>
            <div className="grid grid-cols-1 gap-6">
              <div>
                <h4 className="text-sm font-medium text-gray-400 mb-3">Support</h4>
                <ul className="space-y-2">
                  {footerLinks.support.slice(0, 2).map((link, index) => (
                    <li key={index}>
                      <Link
                        to={link.path}
                        className="flex items-center text-gray-300 hover:text-primary-400 transition-colors duration-200 text-sm"
                      >
                        <ChevronRight className="w-3 h-3 mr-2" />
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-400 mb-3">Legal</h4>
                <ul className="space-y-2">
                  {footerLinks.legal.slice(0, 2).map((link, index) => (
                    <li key={index}>
                      <Link
                        to={link.path}
                        className="flex items-center text-gray-300 hover:text-primary-400 transition-colors duration-200 text-sm"
                      >
                        <ChevronRight className="w-3 h-3 mr-2" />
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-gray-400 text-sm mb-4 md:mb-0">
              © {currentYear} Vidhanto. All rights reserved.
            </div>
            
            <div className="flex flex-wrap items-center space-x-6 text-sm">
              <Link
                to="/privacy"
                className="text-gray-400 hover:text-primary-400 transition-colors duration-200"
              >
                Privacy
              </Link>
              <Link
                to="/terms"
                className="text-gray-400 hover:text-primary-400 transition-colors duration-200"
              >
                Terms
              </Link>
              <Link
                to="/cookies"
                className="text-gray-400 hover:text-primary-400 transition-colors duration-200"
              >
                Cookies
              </Link>
              <Link
                to="/disclaimer"
                className="text-gray-400 hover:text-primary-400 transition-colors duration-200"
              >
                Disclaimer
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Trust Badge */}
      <div className="bg-gray-950 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-4 text-sm text-gray-400 mb-2 md:mb-0">
              <Shield className="w-4 h-4 text-green-400" />
              <span>SSL Secured • ISO 27001 Certified • GDPR Compliant</span>
            </div>
            <div className="flex items-center space-x-6 text-sm text-gray-400">
              <span>Payment Partners:</span>
              <div className="flex items-center space-x-2">
                <span className="font-medium text-white">Visa</span>
                <span>•</span>
                <span className="font-medium text-white">Mastercard</span>
                <span>•</span>
                <span className="font-medium text-white">Razorpay</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
