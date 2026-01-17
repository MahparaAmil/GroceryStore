# AWS EC2 Quick Deploy

## Option 1: Automated Deployment (Recommended)

```bash
# Make script executable
chmod +x deploy.sh

# Run deployment
./deploy.sh ~/grocery.pem 54.90.91.72
```

This script will:
1. ✅ Verify EC2 connectivity
2. ✅ Install Docker & Docker Compose
3. ✅ Clone GroceryStore repository
4. ✅ Set up environment variables
5. ✅ Deploy with docker-compose
6. ✅ Run database migrations
7. ✅ Set up auto-restart on boot
8. ✅ Verify health

## Option 2: Manual Deployment

Follow the step-by-step guide in [AWS_DEPLOYMENT.md](AWS_DEPLOYMENT.md)

## Option 3: GitHub Actions (CI/CD)

If you want automatic deployment on every push:

1. Ensure `.github/workflows/deploy.yml` is configured
2. Update with your EC2 details
3. Push to `ror/main` branch
4. GitHub Actions will automatically deploy

## Pre-Deployment Checklist

- ✅ EC2 instance is running
- ✅ SSH key is available at `~/grocery.pem`
- ✅ `.env` file is configured (or will be from `.env.example`)
- ✅ GitHub repository is public/accessible
- ✅ All GitHub secrets are added

## What Gets Deployed

```
┌─────────────────────────────────────┐
│   Your EC2 Instance (54.90.91.72)   │
├─────────────────────────────────────┤
│  ┌───────────────────────────────┐  │
│  │    Nginx Reverse Proxy        │  │
│  │    (Port 80 → Routes Traffic) │  │
│  └───────────────────────────────┘  │
│          ↓           ↓               │
│  ┌──────────────┐  ┌──────────────┐ │
│  │   Frontend   │  │   Backend    │ │
│  │   React/Vite│  │  Rails API   │ │
│  │ (Port 3000) │  │ (Port 5000)  │ │
│  └──────────────┘  └──────────────┘ │
│          ↓                   ↓       │
│  ┌────────────────────────────────┐ │
│  │   Supabase PostgreSQL           │ │
│  │   (Database in Cloud)           │ │
│  └────────────────────────────────┘ │
└─────────────────────────────────────┘
```

## Access After Deployment

| Service | URL | Port |
|---------|-----|------|
| Frontend | http://54.90.91.72 | 80 |
| API | http://54.90.91.72/api | 80 |
| Backend Direct | http://54.90.91.72:5000 | 5000 |

## Monitoring Deployment

```bash
# SSH into EC2
ssh -i ~/grocery.pem ubuntu@54.90.91.72

# Check container status
docker-compose ps

# View logs
docker-compose logs -f

# Check resource usage
docker stats

# Restart services
docker-compose restart

# Stop services
docker-compose down
```

## Troubleshooting

### Connection Refused
- Check EC2 is running
- Check security group allows SSH (port 22)
- Check SSH key path is correct

### Port Already in Use
```bash
sudo lsof -i :80
sudo lsof -i :5000
sudo kill -9 <PID>
```

### Database Connection Error
- Verify Supabase credentials in .env
- Check DATABASE_URL format
- Verify ipv6=false parameter is present

### Docker Compose Fails
```bash
# Clear and restart
docker-compose down
docker system prune -a
docker-compose up -d --build
docker-compose logs
```

## Next Steps

1. **Deploy:** Run `./deploy.sh ~/grocery.pem 54.90.91.72`
2. **Monitor:** Check logs and health
3. **Test:** Access http://54.90.91.72
4. **Configure:** Set up SSL/domain (optional)
5. **Maintain:** Regular backups and updates

## Support

For detailed information, see:
- [AWS_DEPLOYMENT.md](AWS_DEPLOYMENT.md) - Full deployment guide
- [docker-compose.yml](docker-compose.yml) - Service configuration
- [nginx.conf](nginx.conf) - Reverse proxy setup
