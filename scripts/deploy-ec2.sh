#!/bin/bash

# EC2 Deployment Script for Language Learning AI Companion
# Run this script on your EC2 instance

set -e

echo "🚀 Starting deployment of Language Learning AI Companion..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "📦 Installing Docker..."
    sudo yum update -y
    sudo yum install -y docker
    sudo systemctl start docker
    sudo systemctl enable docker
    sudo usermod -a -G docker ec2-user
    echo "✅ Docker installed successfully!"
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "📦 Installing Docker Compose..."
    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
    echo "✅ Docker Compose installed successfully!"
fi

# Create application directory
APP_DIR="/home/ec2-user/language-learning-ai-companion"
echo "📁 Setting up application directory at $APP_DIR"

# If directory exists, ask for confirmation to continue
if [ -d "$APP_DIR" ]; then
    echo "⚠️  Directory $APP_DIR already exists."
    read -p "Do you want to continue? This will pull the latest changes. (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "❌ Deployment cancelled."
        exit 1
    fi
    cd "$APP_DIR"
    git pull origin main
else
    git clone https://github.com/notedwin-dev/language-learning-ai-companion.git "$APP_DIR"
    cd "$APP_DIR"
fi

# Copy environment file template
if [ ! -f .env ]; then
    echo "📝 Creating environment file..."
    cp .env.example .env
    echo "⚠️  Please edit .env file with your AWS credentials and configuration:"
    echo "    nano .env"
    echo ""
    echo "Required environment variables:"
    echo "  - AWS_ACCESS_KEY"
    echo "  - AWS_SECRET_KEY"
    echo "  - AWS_REGION"
    echo "  - BEDROCK_MODEL_ID"
    echo ""
    read -p "Press Enter after you've configured the .env file..."
fi

# Build and start the application
echo "🔨 Building Docker images..."
docker-compose -f docker-compose.prod.yml build

echo "🚀 Starting the application..."
docker-compose -f docker-compose.prod.yml up -d

# Wait for services to be healthy
echo "⏳ Waiting for services to start..."
sleep 30

# Check if services are running
if docker-compose -f docker-compose.prod.yml ps | grep -q "Up"; then
    echo "✅ Application deployed successfully!"
    echo ""
    echo "🌐 Your application is now running:"
    echo "   Frontend: http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4):3000"
    echo "   Backend API: http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4):5000"
    echo "   Health Check: http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4):5000/health"
    echo ""
    echo "📊 To view logs: docker-compose -f docker-compose.prod.yml logs -f"
    echo "🛑 To stop: docker-compose -f docker-compose.prod.yml down"
    echo "🔄 To restart: docker-compose -f docker-compose.prod.yml restart"
else
    echo "❌ Deployment failed. Checking logs..."
    docker-compose -f docker-compose.prod.yml logs
    exit 1
fi