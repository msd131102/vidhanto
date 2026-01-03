#!/bin/bash

# Vidhanto Legal Tech Platform - Deployment Script
# This script deploys the complete platform to production

echo "🚀 Starting Vidhanto Platform Deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_step() {
    echo -e "${BLUE}[STEP]${NC} $1"
}

# Check if Node.js is installed
check_node() {
    print_step "Checking Node.js installation..."
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js 18+ first."
        exit 1
    fi
    NODE_VERSION=$(node -v | cut -d'v' -f2)
    print_status "Node.js version: $NODE_VERSION"
}

# Check if npm is installed
check_npm() {
    print_step "Checking npm installation..."
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed. Please install npm first."
        exit 1
    fi
    NPM_VERSION=$(npm -v)
    print_status "npm version: $NPM_VERSION"
}

# Install backend dependencies
install_backend() {
    print_step "Installing backend dependencies..."
    cd backend
    npm install --production
    if [ $? -eq 0 ]; then
        print_status "Backend dependencies installed successfully"
    else
        print_error "Failed to install backend dependencies"
        exit 1
    fi
    cd ..
}

# Install frontend dependencies
install_frontend() {
    print_step "Installing frontend dependencies..."
    cd frontend
    npm install
    if [ $? -eq 0 ]; then
        print_status "Frontend dependencies installed successfully"
    else
        print_error "Failed to install frontend dependencies"
        exit 1
    fi
    cd ..
}

# Install admin panel dependencies
install_admin() {
    print_step "Installing admin panel dependencies..."
    cd admin-panel
    npm install
    if [ $? -eq 0 ]; then
        print_status "Admin panel dependencies installed successfully"
    else
        print_error "Failed to install admin panel dependencies"
        exit 1
    fi
    cd ..
}

# Build frontend
build_frontend() {
    print_step "Building frontend application..."
    cd frontend
    npm run build
    if [ $? -eq 0 ]; then
        print_status "Frontend built successfully"
    else
        print_error "Failed to build frontend"
        exit 1
    fi
    cd ..
}

# Build admin panel
build_admin() {
    print_step "Building admin panel..."
    cd admin-panel
    npm run build
    if [ $? -eq 0 ]; then
        print_status "Admin panel built successfully"
    else
        print_error "Failed to build admin panel"
        exit 1
    fi
    cd ..
}

# Setup environment variables
setup_env() {
    print_step "Setting up environment variables..."
    
    if [ ! -f "backend/.env" ]; then
        print_warning "Backend .env file not found. Creating from example..."
        cp backend/.env.example backend/.env
        print_warning "Please update backend/.env with your actual values"
    fi
    
    if [ ! -f "frontend/.env" ]; then
        print_warning "Frontend .env file not found. Creating from example..."
        cp frontend/.env.example frontend/.env
        print_warning "Please update frontend/.env with your actual values"
    fi
}

# Create necessary directories
create_directories() {
    print_step "Creating necessary directories..."
    mkdir -p backend/uploads/blogs
    mkdir -p backend/uploads/documents
    mkdir -p backend/uploads/profiles
    mkdir -p logs
    print_status "Directories created successfully"
}

# Set permissions
set_permissions() {
    print_step "Setting file permissions..."
    chmod +x deploy.sh
    chmod -R 755 backend/uploads
    chmod -R 755 logs
    print_status "Permissions set successfully"
}

# Start services
start_services() {
    print_step "Starting services..."
    
    # Check if PM2 is installed
    if ! command -v pm2 &> /dev/null; then
        print_warning "PM2 not found. Installing PM2..."
        npm install -g pm2
    fi
    
    # Start backend
    cd backend
    pm2 start ecosystem.config.js --env production
    if [ $? -eq 0 ]; then
        print_status "Backend service started successfully"
    else
        print_error "Failed to start backend service"
        exit 1
    fi
    cd ..
    
    # Save PM2 configuration
    pm2 save
    pm2 startup
}

# Setup SSL (optional)
setup_ssl() {
    print_step "Setting up SSL certificate..."
    
    if command -v certbot &> /dev/null; then
        print_status "Certbot found. Setting up SSL..."
        # Add your domain setup here
        print_warning "Please configure your domain and run certbot manually"
    else
        print_warning "Certbot not found. SSL setup skipped"
    fi
}

# Health check
health_check() {
    print_step "Performing health check..."
    
    # Check if backend is running
    if curl -f http://localhost:5000/health &> /dev/null; then
        print_status "Backend health check passed"
    else
        print_error "Backend health check failed"
    fi
    
    # Check if frontend is accessible
    if [ -d "frontend/dist" ]; then
        print_status "Frontend build exists"
    else
        print_error "Frontend build not found"
    fi
}

# Main deployment function
main() {
    print_status "Starting Vidhanto Platform Deployment..."
    print_status "This will deploy the complete legal-tech platform"
    
    # Run checks
    check_node
    check_npm
    
    # Install dependencies
    install_backend
    install_frontend
    install_admin
    
    # Setup environment
    setup_env
    create_directories
    set_permissions
    
    # Build applications
    build_frontend
    build_admin
    
    # Start services
    start_services
    
    # Setup SSL (optional)
    setup_ssl
    
    # Health check
    health_check
    
    print_status "🎉 Deployment completed successfully!"
    print_status "Platform is now live and ready for users"
    print_status ""
    print_status "Next steps:"
    print_status "1. Update environment variables with your actual values"
    print_status "2. Configure your domain name"
    print_status "3. Setup SSL certificate"
    print_status "4. Monitor the application logs"
    print_status ""
    print_status "Useful commands:"
    print_status "- View logs: pm2 logs"
    print_status "- Restart services: pm2 restart all"
    print_status "- Monitor status: pm2 monit"
}

# Handle script arguments
case "$1" in
    --help|-h)
        echo "Vidhanto Platform Deployment Script"
        echo ""
        echo "Usage: ./deploy.sh [OPTION]"
        echo ""
        echo "Options:"
        echo "  --help, -h     Show this help message"
        echo "  --dev           Deploy in development mode"
        echo "  --prod          Deploy in production mode (default)"
        echo ""
        exit 0
        ;;
    --dev)
        print_warning "Deploying in development mode..."
        # Add dev-specific steps here
        main
        ;;
    --prod)
        print_status "Deploying in production mode..."
        main
        ;;
    *)
        main
        ;;
esac
