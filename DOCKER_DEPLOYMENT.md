# EcoPilot Frontend Docker Deployment

This directory contains the Docker configuration for deploying the EcoPilot React frontend to AWS EC2.

## 📋 Prerequisites

- Docker Engine installed
- docker-compose installed
- AWS EC2 instance with appropriate security groups
- Domain name configured (optional)

## 🚀 Quick Deployment

### Option 1: Using deployment script (Recommended)

**Linux/macOS:**

```bash
chmod +x deploy.sh
./deploy.sh
```

**Windows:**

```cmd
deploy.bat
```

### Option 2: Manual deployment

```bash
# Build the image
docker-compose build

# Start the application
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f
```

## 🔧 Configuration

### Environment Variables

The application uses the following environment variables (configured in `.env`):

- `REACT_APP_API_BASE_URL`: Backend API URL (currently: http://13.60.81.235:8000)
- `REACT_APP_AUTH_TOKEN_ENDPOINT`: Token endpoint path

### Port Configuration

- **HTTP**: Port 80 (default)
- **HTTPS**: Port 443 (if SSL is configured)

### SSL/HTTPS Configuration

To enable HTTPS:

1. Obtain SSL certificates for your domain
2. Place certificates in an `ssl/` directory
3. Uncomment the SSL volume mount in `docker-compose.yml`
4. Update nginx configuration for SSL

## 🏗️ Architecture

### Multi-stage Docker Build

1. **Build Stage**: Node.js container that builds the React application
2. **Production Stage**: Nginx Alpine container that serves the built application

### Features

- **Optimized for production**: Multi-stage build reduces image size
- **Health checks**: Built-in health monitoring
- **Caching**: Static assets are cached for better performance
- **Security headers**: XSS protection, content type sniffing protection
- **Client-side routing**: React Router support
- **Gzip compression**: Reduced bandwidth usage

## 🔧 AWS EC2 Deployment Steps

### 1. Prepare your EC2 instance

```bash
# Update system
sudo yum update -y

# Install Docker
sudo yum install -y docker
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -aG docker ec2-user

# Install docker-compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Logout and login again for group changes to take effect
```

### 2. Deploy the application

```bash
# Clone your repository
git clone <your-repo-url>
cd EcoPilot

# Deploy
./deploy.sh
```

### 3. Configure security groups

Ensure your EC2 security group allows:

- **Inbound HTTP (80)**: 0.0.0.0/0
- **Inbound HTTPS (443)**: 0.0.0.0/0 (if using SSL)
- **Inbound SSH (22)**: Your IP address

### 4. Optional: Configure domain and SSL

If you have a domain name:

1. Point your domain to the EC2 instance IP
2. Obtain SSL certificates (Let's Encrypt recommended)
3. Update docker-compose.yml with SSL configuration
4. Update nginx.conf for HTTPS

## 📊 Monitoring

### Health Check

The application includes a health check endpoint:

```bash
curl http://your-domain/health
```

### View Logs

```bash
# View all logs
docker-compose logs

# Follow logs in real-time
docker-compose logs -f

# View specific service logs
docker-compose logs ecopilot-frontend
```

### Container Status

```bash
# Check running containers
docker-compose ps

# Check resource usage
docker stats
```

## 🛠️ Maintenance

### Update Application

```bash
# Pull latest changes
git pull

# Rebuild and restart
./deploy.sh
```

### Restart Services

```bash
# Restart all services
docker-compose restart

# Restart specific service
docker-compose restart ecopilot-frontend
```

### Stop Application

```bash
docker-compose down
```

### Clean Up

```bash
# Remove stopped containers and unused images
docker system prune

# Remove all unused containers, networks, and images
docker system prune -a
```

## 🔍 Troubleshooting

### Common Issues

1. **Container won't start**

   ```bash
   docker-compose logs ecopilot-frontend
   ```

2. **Port already in use**

   ```bash
   # Check what's using the port
   sudo netstat -tlnp | grep :80

   # Stop the service or change port in docker-compose.yml
   ```

3. **Permission issues**

   ```bash
   # Ensure user is in docker group
   sudo usermod -aG docker $USER
   # Logout and login again
   ```

4. **Build failures**

   ```bash
   # Clean Docker cache
   docker builder prune

   # Rebuild without cache
   docker-compose build --no-cache
   ```

### Logs Analysis

```bash
# Check system logs
sudo journalctl -u docker

# Check container logs
docker-compose logs --timestamps

# Check nginx access logs (inside container)
docker-compose exec ecopilot-frontend tail -f /var/log/nginx/access.log
```

## 🔧 Customization

### Nginx Configuration

Edit `nginx.conf` to:

- Add custom headers
- Configure SSL
- Set up API proxying
- Adjust caching policies

### Docker Compose

Edit `docker-compose.yml` to:

- Change ports
- Add environment variables
- Configure volumes
- Set up networks

### Build Process

Edit `Dockerfile` to:

- Change Node.js version
- Add build-time variables
- Include additional tools
- Customize nginx setup

## 📈 Performance Optimization

- Static assets are cached for 1 year
- Gzip compression enabled
- Multi-stage build reduces image size
- Health checks prevent serving unhealthy containers
- Nginx is optimized for serving static files

## 🔐 Security Considerations

- Security headers are set by default
- No sensitive information in image layers
- Regular base image updates recommended
- SSL/HTTPS setup recommended for production
- API backend is separate and secured independently
