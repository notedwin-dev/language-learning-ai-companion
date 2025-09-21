#!/bin/bash

# Monitoring script for Language Learning AI Companion
# Shows logs, status, and resource usage

# Detect the current user and home directory
CURRENT_USER=$(whoami)
HOME_DIR=$(eval echo ~$CURRENT_USER)
APP_DIR="$HOME_DIR/language-learning-ai-companion"

if [ ! -d "$APP_DIR" ]; then
    echo "❌ Application directory not found."
    exit 1
fi

cd "$APP_DIR"

echo "🔍 Language Learning AI Companion Status"
echo "========================================"

# Service status
echo ""
echo "📊 Service Status:"
docker-compose -f docker-compose.prod.yml ps

# Resource usage
echo ""
echo "💻 Resource Usage:"
docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.MemPerc}}\t{{.NetIO}}"

# Health check
echo ""
echo "🏥 Health Check:"
if curl -s http://localhost:5000/health > /dev/null; then
    echo "✅ Backend is healthy"
else
    echo "❌ Backend health check failed"
fi

if curl -s http://localhost:3000 > /dev/null; then
    echo "✅ Frontend is accessible"
else
    echo "❌ Frontend is not accessible"
fi

# Disk usage
echo ""
echo "💾 Disk Usage:"
docker system df

# Show recent logs if requested
if [ "$1" = "--logs" ]; then
    echo ""
    echo "📝 Recent Logs (last 50 lines):"
    docker-compose -f docker-compose.prod.yml logs --tail=50
fi

echo ""
echo "Commands:"
echo "  View live logs: docker-compose -f docker-compose.prod.yml logs -f"
echo "  Restart app: docker-compose -f docker-compose.prod.yml restart"
echo "  Stop app: docker-compose -f docker-compose.prod.yml down"
echo "  Clean up: docker system prune -f"