# AWS EC2 Deployment Guide

## Prerequisites

- EC2 instance running (IP: 54.90.91.72)
- SSH key (grocery.pem)
- GitHub repository with Docker files
- GitHub secrets configured
- All environment variables ready

## Step 1: Verify EC2 Instance is Running

```bash
# Check instance status in AWS Console
# Or SSH to verify
ssh -i ~/grocery.pem ubuntu@54.90.91.72

# You should see the Ubuntu prompt
ubuntu@ip-xxx-xxx-xxx-xxx:~$
```

If connection fails, check:
1. EC2 instance is running
2. Security group allows SSH (port 22)
3. Key pair is correct (grocery.pem)

## Step 2: Install Docker on EC2

```bash
# SSH into EC2
ssh -i ~/grocery.pem ubuntu@54.90.91.72

# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Add ubuntu to docker group
sudo usermod -aG docker ubuntu

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Verify installation
docker --version
docker-compose --version

# Exit and reconnect
exit
ssh -i ~/grocery.pem ubuntu@54.90.91.72
```

## Step 3: Clone Repository on EC2

```bash
# Create app directory
mkdir -p /home/ubuntu/apps
cd /home/ubuntu/apps

# Clone the repository
git clone https://github.com/MahparaAmil/GroceryStore.git
cd GroceryStore

# Checkout main branch
git checkout ror/main
```

## Step 4: Set Up Environment Variables

```bash
# Create .env file with your secrets
cat > .env << 'EOF'
# Rails Configuration
RAILS_ENV=production
RAILS_MASTER_KEY=845c6976edc3c377d300c706ad2c53cd9ca18ff9932caa926fa071df31ca8b363458cc7a8bd2c7bda49807339407a9672986dd8c6e32c94a9dad2ee195cf0c79

# Database (Supabase)
DATABASE_URL=postgresql://postgres:%23QDE4TnJW.hVNH9@db.ktqdfwludqkijgrnrfxm.supabase.co:5432/postgres?sslmode=require&ipv6=false

# JWT & Security
JWT_SECRET=supersecretkey

# Supabase Configuration
SUPABASE_URL=https://ktqdfwludqkijgrnrfxm.supabase.co
SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Frontend Configuration
VITE_API_URL=http://54.90.91.72/api
VITE_USE_MOCK=false
EOF

# Secure the .env file
chmod 600 .env
```

## Step 5: Deploy with Docker Compose

```bash
# Build and start all services
docker-compose up -d --build

# Check status
docker-compose ps

# View logs
docker-compose logs -f

# Run database migrations (if needed)
docker-compose exec backend bundle exec rake db:migrate
```

## Step 6: Configure Nginx for Domain (Optional)

If you have a domain, update nginx.conf:

```bash
# Edit nginx.conf
sudo nano /etc/nginx/sites-available/default

# Add SSL with Let's Encrypt
sudo apt install certbot python3-certbot-nginx -y
sudo certbot certonly --nginx -d yourdomain.com
```

## Step 7: Start on Boot

```bash
# Create systemd service
sudo cat > /etc/systemd/system/grocery-docker.service << 'EOF'
[Unit]
Description=GroceryStore Docker Compose
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
WorkingDirectory=/home/ubuntu/apps/GroceryStore
ExecStart=/usr/local/bin/docker-compose up -d
ExecStop=/usr/local/bin/docker-compose down
RemainAfterExit=yes
User=ubuntu

[Install]
WantedBy=multi-user.target
EOF

# Enable the service
sudo systemctl enable grocery-docker.service
sudo systemctl start grocery-docker.service

# Check status
sudo systemctl status grocery-docker.service
```

## Step 8: Monitor Deployment

```bash
# SSH into EC2
ssh -i ~/grocery.pem ubuntu@54.90.91.72

# Check running containers
docker-compose ps

# View logs
docker-compose logs -f nginx

# Check health
curl http://localhost/health
```

## Step 9: Access Application

- **Frontend:** http://54.90.91.72
- **API:** http://54.90.91.72/api
- **Backend Direct:** http://54.90.91.72:5000

## Troubleshooting

### Port Already in Use
```bash
# Find what's using the port
sudo lsof -i :80
sudo lsof -i :5000
sudo lsof -i :3000

# Kill the process
sudo kill -9 <PID>
```

### Database Connection Error
```bash
# Check DATABASE_URL in .env
# Verify Supabase is accessible
curl -I https://db.ktqdfwludqkijgrnrfxm.supabase.co

# Test connection
docker-compose exec backend bundle exec rails dbconsole
```

### Docker Compose Issues
```bash
# Rebuild from scratch
docker-compose down
docker system prune -a
docker-compose up -d --build

# Check logs
docker-compose logs --tail=100
```

## Backup & Maintenance

```bash
# Backup database
docker-compose exec -T backend bundle exec rake db:backup

# Update code
cd /home/ubuntu/apps/GroceryStore
git pull origin ror/main
docker-compose up -d --build

# View resource usage
docker stats
```

## Production Checklist

- ✅ Docker installed
- ✅ Docker Compose installed
- ✅ Repository cloned
- ✅ .env configured with secrets
- ✅ Services running
- ✅ Health check passing
- ✅ Systemd service enabled
- ✅ Firewall configured
- ✅ SSL configured (optional)
