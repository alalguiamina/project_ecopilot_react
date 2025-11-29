#!/bin/bash

# EcoPilot Frontend Deployment Script for AWS EC2

set -e

echo "🚀 Starting EcoPilot Frontend Deployment..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker and try again."
    exit 1
fi

# Check if docker-compose is available
if ! command -v docker-compose &> /dev/null; then
    echo "❌ docker-compose not found. Please install docker-compose."
    exit 1
fi

# Build and deploy
echo "📦 Building Docker image..."
docker-compose build

echo "🔄 Stopping existing containers..."
docker-compose down

echo "🚀 Starting new containers..."
docker-compose up -d

echo "⏳ Waiting for containers to be healthy..."
sleep 10

# Check if container is running
if docker-compose ps | grep -q "Up"; then
    echo "✅ Deployment successful!"
    echo "🌐 Application is running on:"
    echo "   - HTTP: http://localhost"
    echo "   - Health check: http://localhost/health"
    
    # Show container status
    echo ""
    echo "📋 Container Status:"
    docker-compose ps
    
    # Show logs
    echo ""
    echo "📝 Recent logs:"
    docker-compose logs --tail=20
else
    echo "❌ Deployment failed. Container is not running."
    echo "📝 Checking logs..."
    docker-compose logs
    exit 1
fi

echo ""
echo "🎉 Deployment completed successfully!"
echo "💡 Useful commands:"
echo "   - View logs: docker-compose logs -f"
echo "   - Stop application: docker-compose down"
echo "   - Restart: docker-compose restart"
echo "   - Update: ./deploy.sh"