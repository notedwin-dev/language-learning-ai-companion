#!/bin/bash

# Update script for Language Learning AI Companion on EC2
# Run this script to update your deployed application

set -e

echo "🔄 Updating Language Learning AI Companion..."

APP_DIR="/home/ec2-user/language-learning-ai-companion"

if [ ! -d "$APP_DIR" ]; then
    echo "❌ Application directory not found. Please run deploy-ec2.sh first."
    exit 1
fi

cd "$APP_DIR"

# Pull latest changes
echo "📦 Pulling latest changes..."
git pull origin main

# Rebuild and restart
echo "🔨 Rebuilding Docker images..."
docker-compose -f docker-compose.prod.yml build --no-cache

echo "🛑 Stopping current services..."
docker-compose -f docker-compose.prod.yml down

echo "🚀 Starting updated services..."
docker-compose -f docker-compose.prod.yml up -d

# Wait for services to be healthy
echo "⏳ Waiting for services to start..."
sleep 30

# Check if services are running
if docker-compose -f docker-compose.prod.yml ps | grep -q "Up"; then
    echo "✅ Application updated successfully!"
    echo ""
    echo "🌐 Your application is running:"
    echo "   Frontend: http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4):3000"
    echo "   Backend API: http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4):5000"
else
    echo "❌ Update failed. Checking logs..."
    docker-compose -f docker-compose.prod.yml logs
    exit 1
fi