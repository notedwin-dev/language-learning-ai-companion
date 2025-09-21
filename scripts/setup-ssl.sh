#!/bin/bash

# Script to generate self-signed SSL certificates for local testing
# Run this on your EC2 instance

echo "🔒 Generating self-signed SSL certificate for HTTPS..."

# Create SSL directory
sudo mkdir -p /etc/nginx/ssl

# Generate private key and certificate
sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout /etc/nginx/ssl/nginx-selfsigned.key \
    -out /etc/nginx/ssl/nginx-selfsigned.crt \
    -subj "/C=US/ST=State/L=City/O=Organization/OU=OrgUnit/CN=localhost"

# Set proper permissions
sudo chmod 600 /etc/nginx/ssl/nginx-selfsigned.key
sudo chmod 644 /etc/nginx/ssl/nginx-selfsigned.crt

echo "✅ SSL certificate generated!"
echo "📁 Certificate: /etc/nginx/ssl/nginx-selfsigned.crt"
echo "🔑 Private key: /etc/nginx/ssl/nginx-selfsigned.key"
echo ""
echo "⚠️  This is a self-signed certificate for testing only."
echo "   Browsers will show a security warning that you can bypass."
echo ""
echo "🔄 Next steps:"
echo "   1. Update docker-compose.yml to enable HTTPS"
echo "   2. Restart containers"
echo "   3. Access via https://your-ec2-ip"