# 🚀 EC2 Docker Deployment Guide

This guide will help you deploy the Language Learning AI Companion on AWS EC2 using Docker.

## 📋 Prerequisites

### AWS Requirements
- **EC2 Instance**: t3.medium or larger (recommended: t3.large for better performance)
- **Operating System**: Amazon Linux 2 or Ubuntu 20.04+
- **Security Group**: Open ports 22 (SSH), 80 (HTTP), 443 (HTTPS), 3000 (Frontend), 5000 (Backend)
- **Storage**: At least 20GB EBS storage
- **AWS Services**: Bedrock, Polly, and Transcribe access configured

### Local Requirements
- Git installed on EC2 instance
- SSH access to your EC2 instance

## 🏗️ Quick Deployment

### 1. Connect to Your EC2 Instance
```bash
ssh -i your-key.pem ec2-user@your-ec2-public-ip
```

### 2. Run the Deployment Script
```bash
# Download and run the deployment script
curl -fsSL https://raw.githubusercontent.com/notedwin-dev/language-learning-ai-companion/main/scripts/deploy-ec2.sh | bash
```

Or manually:
```bash
# Clone the repository
git clone https://github.com/notedwin-dev/language-learning-ai-companion.git
cd language-learning-ai-companion

# Make scripts executable
chmod +x scripts/*.sh

# Run deployment
./scripts/deploy-ec2.sh
```

### 3. Configure Environment Variables
Edit the `.env` file with your AWS credentials:
```bash
nano .env
```

Required variables:
```bash
# AWS Configuration
AWS_ACCESS_KEY=your_aws_access_key
AWS_SECRET_KEY=your_aws_secret_key
AWS_REGION=us-east-1
AWS_S3_BUCKET=your_bucket_name

# Bedrock Configuration
BEDROCK_MODEL_ID=deepseek.r1-v1:0

# Server Configuration
PORT=5000
NODE_ENV=production
```

## 🐳 Docker Commands

### Build and Start (Production)
```bash
# Build the Docker image
docker-compose -f docker-compose.prod.yml build

# Start the application
docker-compose -f docker-compose.prod.yml up -d

# View logs
docker-compose -f docker-compose.prod.yml logs -f
```

### Development Mode
```bash
# For development with hot reload
docker-compose -f docker-compose.dev.yml up --build
```

### Management Commands
```bash
# Stop the application
docker-compose -f docker-compose.prod.yml down

# Restart services
docker-compose -f docker-compose.prod.yml restart

# View service status
docker-compose -f docker-compose.prod.yml ps

# Clean up unused images
docker system prune -f
```

## 📊 Monitoring and Maintenance

### Check Application Status
```bash
# Run the monitoring script
./scripts/monitor.sh

# View recent logs
./scripts/monitor.sh --logs
```

### Update the Application
```bash
# Pull latest changes and restart
./scripts/update-ec2.sh
```

### Health Checks
- **Frontend**: `http://your-ec2-ip:3000`
- **Backend API**: `http://your-ec2-ip:5000`
- **Health Endpoint**: `http://your-ec2-ip:5000/health`

## 🔧 Configuration Options

### Environment Variables
| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `AWS_ACCESS_KEY` | AWS IAM Access Key | - | ✅ |
| `AWS_SECRET_KEY` | AWS IAM Secret Key | - | ✅ |
| `AWS_REGION` | AWS Region | `us-east-1` | ✅ |
| `AWS_S3_BUCKET` | S3 Bucket for audio files | - | ❌ |
| `BEDROCK_MODEL_ID` | Bedrock model ID | `deepseek.r1-v1:0` | ✅ |
| `PORT` | Backend server port | `5000` | ❌ |
| `NODE_ENV` | Node environment | `production` | ❌ |

### AWS IAM Permissions
Your AWS user needs the following permissions:
```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "bedrock:InvokeModel",
                "polly:SynthesizeSpeech",
                "transcribe:StartTranscriptionJob",
                "transcribe:GetTranscriptionJob",
                "s3:GetObject",
                "s3:PutObject"
            ],
            "Resource": "*"
        }
    ]
}
```

## 🔒 Security Considerations

### EC2 Security Group
```bash
# Inbound Rules
SSH (22)      - Your IP only
HTTP (80)     - 0.0.0.0/0
HTTPS (443)   - 0.0.0.0/0
Custom (3000) - 0.0.0.0/0  # Frontend (consider restricting)
Custom (5000) - 0.0.0.0/0  # Backend API (consider restricting)
```

### Production Recommendations
1. **Use HTTPS**: Configure SSL certificates
2. **Restrict Ports**: Limit frontend/backend access to specific IPs if possible
3. **Regular Updates**: Keep the application and dependencies updated
4. **Monitor Logs**: Set up CloudWatch or similar for log monitoring
5. **Backup Strategy**: Regular backups of configuration and data

## 🚨 Troubleshooting

### Common Issues

#### Container Won't Start
```bash
# Check logs
docker-compose -f docker-compose.prod.yml logs

# Check Docker daemon
sudo systemctl status docker

# Restart Docker if needed
sudo systemctl restart docker
```

#### AWS Permission Errors
```bash
# Test AWS connectivity
aws bedrock list-foundation-models --region us-east-1

# Verify environment variables
docker-compose -f docker-compose.prod.yml exec language-learning-app env | grep AWS
```

#### Port Already in Use
```bash
# Find process using the port
sudo netstat -tlnp | grep :3000
sudo netstat -tlnp | grep :5000

# Kill the process if needed
sudo kill -9 <process_id>
```

#### Out of Memory
```bash
# Check memory usage
free -h
docker stats

# Consider upgrading EC2 instance type
# t3.medium → t3.large → t3.xlarge
```

### Performance Optimization

#### For High Traffic
1. **Scale EC2**: Use larger instance types (t3.large, c5.large)
2. **Load Balancer**: Use AWS Application Load Balancer
3. **Auto Scaling**: Set up Auto Scaling Groups
4. **CDN**: Use CloudFront for static assets

#### Memory Management
```bash
# Clean up Docker resources
docker system prune -a -f

# Monitor container memory usage
docker stats --no-stream
```

## 📈 Scaling Options

### Horizontal Scaling
```bash
# Use multiple EC2 instances with load balancer
# Update docker-compose.prod.yml to include multiple replicas
```

### Vertical Scaling
```bash
# Upgrade EC2 instance type
# Stop instance → Change instance type → Start instance
```

## 🆘 Support

If you encounter issues:

1. Check the [main README](../README.md) for general setup
2. Review logs: `docker-compose -f docker-compose.prod.yml logs`
3. Run monitoring script: `./scripts/monitor.sh`
4. Create an issue on GitHub with logs and error details

## 📝 Deployment Checklist

- [ ] EC2 instance launched with appropriate size
- [ ] Security groups configured
- [ ] SSH access established
- [ ] Docker and Docker Compose installed
- [ ] Repository cloned
- [ ] Environment variables configured
- [ ] AWS credentials tested
- [ ] Application built and started
- [ ] Health checks passing
- [ ] Frontend accessible via browser
- [ ] Backend API responding
- [ ] Audio recording/playback working
- [ ] AI services (Bedrock, Polly, Transcribe) functional

---

**Need help?** Contact the development team or create an issue on GitHub.