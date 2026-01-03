# Vidhanto - AI-Powered Legal Tech Platform

A comprehensive legal-tech platform for India that combines AI-powered legal assistance with expert lawyer consultations, document services, and compliance solutions.

## 🚀 Features

### Core Features
- **AI Legal Assistant**: 24/7 AI-powered legal guidance using Google Gemini
- **Lawyer Consultations**: Connect with verified lawyers via chat, voice, and video
- **Document Services**: Draft, review, and e-sign legal documents
- **Online Payments**: Secure payment processing with Razorpay
- **Role-Based Access**: Separate dashboards for users, lawyers, and admins

### Technical Features
- **MERN Stack**: MongoDB, Express.js, React, Node.js
- **Real-time Communication**: Socket.io for live chat and video calls
- **Secure Authentication**: JWT-based auth with refresh tokens
- **File Upload**: AWS S3 integration for document storage
- **Responsive Design**: Mobile-first UI with HeroUI components
- **SEO Optimized**: Search engine friendly with meta tags and sitemaps

## 🏗️ Project Structure

```
vidhanto/
├── backend/                 # Node.js/Express API server
│   ├── src/
│   │   ├── models/        # MongoDB models (User, Lawyer, Appointment, etc.)
│   │   ├── routes/        # API routes (auth, users, lawyers, etc.)
│   │   ├── middleware/     # Authentication and validation middleware
│   │   └── app.js        # Main Express application
│   ├── .env.example       # Environment variables template
│   └── package.json       # Backend dependencies
├── frontend/               # React.js client application
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Page components
│   │   └── App.jsx       # Main React application
│   └── package.json       # Frontend dependencies
├── admin-panel/           # React admin dashboard
└── README.md
```

## 🛠️ Technology Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database with Mongoose ODM
- **Socket.io** - Real-time communication
- **JWT** - Authentication
- **Razorpay** - Payment processing
- **AWS S3** - File storage
- **Google Gemini AI** - AI legal assistant

### Frontend
- **React** - UI framework
- **React Router** - Client-side routing
- **HeroUI** - UI component library
- **Tailwind CSS** - Styling
- **React Query** - Data fetching and caching
- **React Hot Toast** - Notifications

### Development Tools
- **Vite** - Build tool and dev server
- **ESLint** - Code linting
- **Prettier** - Code formatting

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local or Atlas)
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd vidhanto
   ```

2. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd ../frontend
   npm install
   ```

4. **Install admin panel dependencies**
   ```bash
   cd ../admin-panel
   npm install
   ```

### Environment Setup

1. **Backend Environment**
   ```bash
   cd backend
   cp .env.example .env
   ```
   
   Edit `.env` with your configuration:
   ```env
   # Database
   MONGODB_URI=mongodb://localhost:27017/vidhanto
   
   # JWT
   JWT_SECRET=your-super-secret-jwt-key
   JWT_REFRESH_SECRET=your-refresh-secret
   
   # AI
   GEMINI_API_KEY=your-gemini-api-key
   GEMINI_MODEL=gemini-2.0-flash-lite
   
   # Payments
   RAZORPAY_KEY_ID=your-razorpay-key-id
   RAZORPAY_KEY_SECRET=your-razorpay-secret
   
   # File Storage
   AWS_ACCESS_KEY_ID=your-aws-access-key
   AWS_SECRET_ACCESS_KEY=your-aws-secret-key
   AWS_REGION=ap-south-1
   AWS_S3_BUCKET=vidhanto-documents
   
   # Frontend URL
   FRONTEND_URL=http://localhost:3000
   ```

2. **Frontend Environment**
   ```bash
   cd frontend
   cp .env.example .env
   ```
   
   Edit `.env`:
   ```env
   VITE_API_URL=http://localhost:5000/api
   VITE_RAZORPAY_KEY=your-razorpay-key-id
   ```

### Running the Application

1. **Start MongoDB**
   ```bash
   # If using local MongoDB
   mongod
   ```

2. **Start Backend Server**
   ```bash
   cd backend
   npm run dev
   ```
   Backend will run on `http://localhost:5000`

3. **Start Frontend Development Server**
   ```bash
   cd frontend
   npm run dev
   ```
   Frontend will run on `http://localhost:5173`

4. **Start Admin Panel (Optional)**
   ```bash
   cd admin-panel
   npm run dev
   ```
   Admin panel will run on `http://localhost:5174`

## 📋 Available Scripts

### Backend
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm start           # Start production server
npm test            # Run tests
```

### Frontend
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

### Admin Panel
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/refresh` - Refresh JWT token

### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `GET /api/users/dashboard` - Get dashboard data

### Lawyers
- `GET /api/lawyers` - Get lawyer listings
- `GET /api/lawyers/:id` - Get lawyer details
- `POST /api/lawyers/register` - Lawyer registration

### Appointments
- `GET /api/appointments` - Get user appointments
- `POST /api/appointments` - Book appointment
- `PUT /api/appointments/:id` - Update appointment

### AI Chat
- `POST /api/ai/chat` - Send message to AI
- `GET /api/ai/history` - Get chat history
- `GET /api/ai/chat/:id` - Get specific chat

### Documents
- `GET /api/documents` - Get user documents
- `POST /api/documents` - Create document
- `PUT /api/documents/:id` - Update document
- `POST /api/documents/:id/sign` - Sign document

### Payments
- `POST /api/payments/create` - Create payment order
- `POST /api/payments/verify` - Verify payment
- `GET /api/payments/history` - Get payment history

## 🏢 User Roles

### Regular User
- Access to AI legal assistant
- Book lawyer consultations
- Create and manage documents
- View dashboard and history

### Lawyer/Expert
- Manage profile and availability
- Accept/reject appointments
- Conduct consultations
- Review documents
- View earnings dashboard

### Admin
- User and lawyer management
- KYC verification
- Service and pricing management
- Payment monitoring
- Platform configuration

## 🔐 Security Features

- JWT-based authentication with refresh tokens
- Password hashing with bcrypt
- Rate limiting on API endpoints
- Input validation and sanitization
- CORS configuration
- HTTPS enforcement in production
- File upload security

## 📱 Responsive Design

- Mobile-first approach
- Responsive layouts for all screen sizes
- Touch-friendly interfaces
- Progressive Web App (PWA) support
- Optimized for performance

## 🌐 SEO & Performance

- Meta tags optimization
- Open Graph tags
- Structured data markup
- XML sitemap generation
- robots.txt configuration
- Image optimization
- Code splitting and lazy loading

## 🧪 Testing

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

## 📦 Deployment

### Backend Deployment
1. Set production environment variables
2. Build the application: `npm run build`
3. Start production server: `npm start`

### Frontend Deployment
1. Build the application: `npm run build`
2. Deploy the `dist` folder to your hosting service
3. Configure environment variables

### Environment Variables for Production
- Set all required environment variables
- Configure MongoDB connection string
- Set up AWS S3 credentials
- Configure payment gateway keys
- Set CORS origins

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes and commit them
4. Push to the branch: `git push origin feature-name`
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Email: support@vidhanto.com
- Phone: +91 80000-12345
- Website: https://vidhanto.com

## 🗺 Roadmap

- [ ] Mobile apps (iOS/Android)
- [ ] Advanced AI features
- [ ] Video consultation improvements
- [ ] Blockchain-based document verification
- [ ] Multi-language support
- [ ] Advanced analytics dashboard
- [ ] API for third-party integration

## 📊 Analytics & Monitoring

- User behavior tracking
- Performance monitoring
- Error tracking
- Usage analytics
- A/B testing framework

## 🔄 CI/CD

- Automated testing on pull requests
- Automated deployment on merge
- Environment-specific configurations
- Rollback mechanisms

---

**Built with ❤️ in India for Indian legal system**
