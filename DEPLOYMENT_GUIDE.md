# 🚀 Vidhanto Legal-Tech Platform - Deployment Guide

## 📋 Overview
Vidhanto is a comprehensive legal-tech platform built with MERN stack that provides AI-powered legal assistance, lawyer consultations, document services, and more.

## 🏗️ Architecture

### **Backend (Node.js/Express)**
- **Models**: User, Lawyer, Appointment, Chat, Payment, Document
- **API Routes**: Complete RESTful APIs for all features
- **Authentication**: JWT with refresh tokens
- **AI Integration**: Google Gemini 2.0 Flash Lite
- **Payment**: Razorpay integration
- **Real-time**: Socket.io for live features

### **Frontend (React/HeroUI)**
- **UI Framework**: React 19 + HeroUI + Tailwind CSS
- **State Management**: React Query (TanStack Query)
- **Routing**: React Router v7
- **Forms**: React Hook Form + Zod validation
- **Real-time**: Socket.io client

### **Admin Panel (React)**
- **Dashboard**: Comprehensive admin interface
- **User Management**: User and lawyer management
- **Analytics**: Platform insights and metrics
- **Settings**: System configuration

## 🛠️ Technology Stack

### **Frontend Dependencies**
- React 19.2.0
- HeroUI 2.8.7 (UI Components)
- Tailwind CSS (Styling)
- React Router 7.11.0 (Routing)
- React Query 5.90.16 (State Management)
- React Hook Form 7.69.0 (Forms)
- Zod 4.3.2 (Validation)
- Socket.io Client 4.8.3 (Real-time)
- Axios 1.13.2 (HTTP Client)
- React Hot Toast 2.4.1 (Notifications)

### **Backend Dependencies**
- Node.js + Express.js
- MongoDB with Mongoose
- JWT (Authentication)
- Socket.io (Real-time)
- Google Gemini AI
- Razorpay (Payments)
- bcrypt (Password Hashing)
- dotenv (Environment Variables)

## 🚀 Deployment Steps

### **1. Backend Deployment**

#### **Environment Setup**
```bash
# Clone repository
git clone <repository-url>
cd vidhanto/backend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Update .env with your values
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://your-connection-string
JWT_SECRET=your-jwt-secret
JWT_REFRESH_SECRET=your-refresh-secret
GOOGLE_AI_API_KEY=your-gemini-api-key
RAZORPAY_KEY_ID=your-razorpay-key
RAZORPAY_KEY_SECRET=your-razorpay-secret
```

#### **Database Setup**
```bash
# MongoDB Atlas Setup
1. Create MongoDB Atlas cluster
2. Get connection string
3. Update MONGODB_URI in .env
```

#### **Start Backend**
```bash
# Production start
npm start

# For development
npm run dev
```

### **2. Frontend Deployment**

#### **Build Frontend**
```bash
cd frontend
npm install
npm run build
```

#### **Deploy to Vercel (Recommended)**
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
cd frontend
vercel --prod
```

#### **Environment Variables for Frontend**
```bash
VITE_API_URL=https://your-backend-url.com
VITE_SOCKET_URL=https://your-backend-url.com
```

### **3. Admin Panel Deployment**

#### **Build Admin Panel**
```bash
cd admin-panel
npm install
npm run build
```

#### **Deploy Admin Panel**
```bash
# Deploy to separate subdomain
vercel --prod --subdomain=admin
```

## 🔧 Configuration

### **Payment Gateway (Razorpay)**
1. Create Razorpay account
2. Get Key ID and Key Secret
3. Update environment variables
4. Configure webhook endpoints

### **AI Service (Google Gemini)**
1. Get Google AI API key
2. Enable Gemini 2.0 Flash Lite
3. Update environment variables
4. Configure rate limits and usage

### **File Storage (AWS S3)**
1. Create S3 bucket
2. Configure CORS
3. Update environment variables
4. Set up CDN if needed

## 🌐 Domain Setup

### **Main Application**
- Frontend: `https://vidhanto.com`
- Backend API: `https://api.vidhanto.com`
- Admin Panel: `https://admin.vidhanto.com`

### **SSL Configuration**
- Install SSL certificates for all domains
- Configure HTTPS redirects
- Update CORS settings

## 🔒 Security Considerations

### **Production Security**
1. **Environment Variables**: Never commit .env files
2. **API Security**: Rate limiting, input validation
3. **Database Security**: MongoDB Atlas security settings
4. **Authentication**: Secure JWT implementation
5. **HTTPS**: Force HTTPS everywhere
6. **CORS**: Proper CORS configuration

### **Security Headers**
```javascript
// Add these security headers
helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
})
```

## 📊 Monitoring & Analytics

### **Application Monitoring**
1. **Error Tracking**: Sentry or similar
2. **Performance**: Vercel Analytics
3. **Uptime**: Uptime monitoring service
4. **Logs**: Structured logging

### **Database Monitoring**
1. **MongoDB Atlas**: Built-in monitoring
2. **Query Performance**: Slow query analysis
3. **Backup**: Automated backups

## 🚀 Performance Optimization

### **Frontend Optimization**
1. **Code Splitting**: Dynamic imports
2. **Image Optimization**: WebP format
3. **Caching**: Proper cache headers
4. **Bundle Size**: Tree shaking, minification

### **Backend Optimization**
1. **Database Indexing**: Proper indexes
2. **Caching**: Redis for frequent queries
3. **Compression**: Gzip compression
4. **CDN**: Static asset CDN

## 🔄 CI/CD Pipeline

### **GitHub Actions Example**
```yaml
name: Deploy Vidhanto
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
      - name: Deploy Backend
        run: |
          cd backend
          npm install
          npm run build
      - name: Deploy Frontend
        run: |
          cd frontend
          npm install
          npm run build
          vercel --prod
```

## 🧪 Testing

### **Before Production**
1. **Unit Tests**: Jest for components
2. **Integration Tests**: API testing
3. **E2E Tests**: Cypress for user flows
4. **Load Testing**: Performance under load

### **Post-Deployment**
1. **Smoke Tests**: Basic functionality
2. **Health Checks**: API endpoints
3. **User Testing**: Real user scenarios

## 📞 Support & Maintenance

### **Monitoring Alerts**
1. **Downtime Alerts**: SMS/Email
2. **Error Rate Alerts**: Threshold-based
3. **Performance Alerts**: Slow response times

### **Regular Maintenance**
1. **Database Optimization**: Monthly
2. **Security Updates**: Weekly
3. **Dependency Updates**: Monthly
4. **Backup Verification**: Weekly

## 🎯 Success Metrics

### **Key Performance Indicators**
1. **User Registration**: Daily/Weekly signups
2. **Active Users**: DAU/MAU
3. **Revenue**: MRR/ARR
4. **AI Usage**: Token consumption
5. **Lawyer Engagement**: Active consultants

### **Analytics Setup**
1. **Google Analytics 4**: User behavior
2. **Mixpanel/Amplitude**:
