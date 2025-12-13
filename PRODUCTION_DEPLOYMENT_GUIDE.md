# Production Deployment Guide

**Complete step-by-step instructions for deploying the Car Dealership application to production.**

---

## 🚀 **Phase 1: Server Setup**

### Initial Server Configuration
- Log into server via SSH
- Update system packages:
  ```bash
  sudo apt update && sudo apt upgrade -y
  ```
- Install Docker:
  ```bash
  curl -fsSL https://get.docker.com | sh
  ```
- Install Docker Compose:
  ```bash
  sudo apt install docker-compose-plugin -y
  ```
- Add user to docker group:
  ```bash
  sudo usermod -aG docker $USER
  ```
  (Log out and back in for changes to take effect)

### Firewall Configuration
```bash
# Allow SSH
sudo ufw allow 22

# Allow HTTP
sudo ufw allow 80

# Allow HTTPS
sudo ufw allow 443

# Enable firewall
sudo ufw enable

# Check status
sudo ufw status
```

---

## 🌐 **Phase 2: Domain & DNS**

### DNS Configuration
- Log into your domain registrar (Namecheap, GoDaddy, etc.)
- Add DNS records:
  - **A Record**: `@` → Your server IP address
  - **A Record**: `www` → Your server IP address
  - Or **CNAME Record**: `www` → `yourdomain.com`

### Verify DNS Propagation
```bash
# Check DNS resolution
nslookup yourdomain.com

# Or use online tools:
# - https://dnschecker.org/
# - https://www.whatsmydns.net/
```

**Note:** DNS propagation can take 1-24 hours.

---

## 📦 **Phase 3: Deploy Application**

### Clone Repository
```bash
# Navigate to deployment directory
cd /home/yourusername

# Clone repository
git clone https://github.com/your-username/car-dealership.git

# Enter project directory
cd car-dealership
```

### Configure Environment Variables
```bash
# Copy production template
cp .env.production.example .env

# Edit the file
nano .env
```

### Required `.env` Configuration

**Generate secrets:**
```bash
# Generate SECRET_KEY
python3 scripts/generate_secrets.py
```

**Update these values in `.env`:**
```env
# Django - Use generated values
SECRET_KEY=<paste-generated-50-char-key>
DEBUG=False
DJANGO_SETTINGS_MODULE=car_dealership.settings.production

# Domain - Replace with your actual domain
ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com
CORS_ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

# Database - Use strong passwords
DB_NAME=car_dealership
DB_USER=postgres
DB_PASSWORD=<generate-strong-password-20+-chars>
DB_HOST=db
DB_PORT=5432

# Email - Configure your SMTP
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=<your-app-specific-password>
DEFAULT_FROM_EMAIL=noreply@yourdomain.com
ADMIN_EMAIL=admin@yourdomain.com

# pgAdmin - Use strong password
PGADMIN_EMAIL=admin@yourdomain.com
PGADMIN_PASSWORD=<generate-strong-password>

# Frontend API - Your production domain
VITE_API_URL=https://yourdomain.com
```

**Save and exit:** `Ctrl+X`, then `Y`, then `Enter`

---

## 🔒 **Phase 4: SSL Certificate**

### Install Certbot
```bash
sudo apt install certbot python3-certbot-nginx -y
```

### Obtain SSL Certificate
```bash
# Get certificate for your domain
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Follow prompts:
# - Enter email address
# - Agree to terms
# - Choose redirect option (2 - redirect HTTP to HTTPS)
```

### Test Auto-Renewal
```bash
sudo certbot renew --dry-run
```

**Certificate auto-renews automatically via cron job.**

---

## 🚀 **Phase 5: Launch Application**

### Start Containers
```bash
# Start all services (use production compose file)
docker-compose -f docker-compose.prod.yml up -d

# Check containers are running
docker-compose -f docker-compose.prod.yml ps
```

### Run Database Migrations
```bash
docker-compose -f docker-compose.prod.yml exec backend python manage.py migrate
```

### Create Superuser
```bash
docker-compose -f docker-compose.prod.yml exec backend python manage.py createsuperuser

# Enter username, email, and password when prompted
```

### Collect Static Files
```bash
docker-compose -f docker-compose.prod.yml exec backend python manage.py collectstatic --noinput
```

### Load Initial Data (Optional)
```bash
# If you have initial car data to load
docker-compose -f docker-compose.prod.yml exec backend python manage.py loaddata cars/fixtures/initial_cars.json
```

---

## ✅ **Phase 6: Verify Deployment**

### Test All Endpoints

**Frontend:**
- Visit: `https://yourdomain.com`
- Should load the car dealership homepage
- Check that all pages work (Home, Car List, Contact)

**API:**
- Visit: `https://yourdomain.com/api/cars/`
- Should return JSON list of cars

**Health Check:**
- Visit: `https://yourdomain.com/health/`
- Should return: `{"status": "healthy", ...}`

**Admin Panel:**
- Visit: `https://yourdomain.com/secure-admin/`
- Login with superuser credentials
- Verify you can add/edit cars

**Security:**
- Visit: `http://yourdomain.com` (HTTP)
- Should automatically redirect to HTTPS
- Check for padlock icon in browser

### Test Functionality
- [ ] Browse car listings   
- [ ] Search/filter cars
- [ ] View car details
- [ ] Submit contact form
- [ ] Verify email notification (if configured)
- [ ] Upload car images in admin
- [ ] Test on mobile device

---

## 📊 **Phase 7: Setup Monitoring & Backups**

### Setup Uptime Monitoring

**1. Sign up for UptimeRobot (Free):**
- Visit: https://uptimerobot.com
- Create free account (50 monitors included)

**2. Add Monitor:**
- Monitor Type: HTTP(s)
- URL: `https://yourdomain.com/health/`
- Monitoring Interval: 5 minutes
- Alert Contacts: Your email

### Setup Automated Backups

**Daily Database Backup (Linux cron):**
```bash
# Open crontab editor
crontab -e

# Add this line (runs daily at 2 AM)
0 2 * * * /home/yourusername/car-dealership/scripts/backup_database.sh

# Save and exit
```

**Backup Storage:**
- Local backups stored in `backend/backups/`
- Configure offsite backup (S3, Google Drive, Dropbox)
- Keep at least 7 days of backups

**Test Backup Restore:**
```bash
# Test that you can restore from backup
cd scripts
./restore_database.sh

# Select a recent backup to test
```

---

## 🔐 **Phase 8: Security Hardening**

### Disable Password SSH (Key-Only)
```bash
# Edit SSH config
sudo nano /etc/ssh/sshd_config

# Change these lines:
PasswordAuthentication no
PubkeyAuthentication yes

# Restart SSH
sudo systemctl restart sshd
```

### Install Fail2Ban
```bash
# Install
sudo apt install fail2ban -y

# Start service
sudo systemctl start fail2ban
sudo systemctl enable fail2ban

# Check status
sudo fail2ban-client status
```

### Run Django Security Check
```bash
docker-compose -f docker-compose.prod.yml exec backend python manage.py check --deploy
```

**Should show:** "System check identified no issues"

### Review Security Headers
- Visit: https://securityheaders.com
- Enter your domain
- Should score A or A+

### Review SSL Configuration
- Visit: https://www.ssllabs.com/ssltest/
- Enter your domain
- Should score A or A+

---

## 📝 **Useful Commands**

### View Logs
```bash
# All services
docker-compose -f docker-compose.prod.yml logs -f

# Specific service
docker-compose -f docker-compose.prod.yml logs -f backend
docker-compose -f docker-compose.prod.yml logs -f frontend
docker-compose -f docker-compose.prod.yml logs -f db
```

### Restart Services
```bash
# Restart all
docker-compose -f docker-compose.prod.yml restart

# Restart specific service
docker-compose -f docker-compose.prod.yml restart backend
```

### Stop Everything
```bash
docker-compose -f docker-compose.prod.yml down
```

### Update Deployment
```bash
# Pull latest code
git pull origin main

# Rebuild and restart
docker-compose -f docker-compose.prod.yml up -d --build

# Run migrations (if any)
docker-compose -f docker-compose.prod.yml exec backend python manage.py migrate

# Collect static files
docker-compose -f docker-compose.prod.yml exec backend python manage.py collectstatic --noinput
```

### Database Management
```bash
# Create backup manually
cd scripts
./backup_database.sh

# Restore from backup
./restore_database.sh

# Access database directly
docker-compose -f docker-compose.prod.yml exec db psql -U postgres -d car_dealership
```

### Django Management Commands
```bash
# Create new admin user
docker-compose -f docker-compose.prod.yml exec backend python manage.py createsuperuser

# Django shell
docker-compose -f docker-compose.prod.yml exec backend python manage.py shell

# Check for problems
docker-compose -f docker-compose.prod.yml exec backend python manage.py check
```

---

## 🆘 **Troubleshooting**

### Site Not Loading
```bash
# Check containers are running
docker-compose -f docker-compose.prod.yml ps

# Check logs for errors
docker-compose -f docker-compose.prod.yml logs backend
docker-compose -f docker-compose.prod.yml logs frontend

# Restart services
docker-compose -f docker-compose.prod.yml restart
```

### Database Connection Issues
```bash
# Check database is running
docker-compose -f docker-compose.prod.yml ps db

# Check database logs
docker-compose -f docker-compose.prod.yml logs db

# Verify credentials in .env match
cat .env | grep DB_
```

### SSL Certificate Issues
```bash
# Check certificate status
sudo certbot certificates

# Renew manually
sudo certbot renew

# Check nginx configuration
sudo nginx -t
```

### High Memory Usage
```bash
# Check resource usage
docker stats

# Restart specific service
docker-compose -f docker-compose.prod.yml restart backend
```

### Need to Restore from Backup
```bash
# Stop application
docker-compose -f docker-compose.prod.yml down

# Restore database
cd scripts
./restore_database.sh

# Start application
docker-compose -f docker-compose.prod.yml up -d
```

---

## 📈 **Post-Launch Checklist**

### Week 1
- [ ] Monitor uptime (UptimeRobot)
- [ ] Check error logs daily
- [ ] Verify backups are running
- [ ] Test backup restoration
- [ ] Review security scan results

### Month 1
- [ ] Review traffic/usage patterns
- [ ] Optimize performance if needed
- [ ] Update dependencies
- [ ] Review and rotate backups

### Quarterly
- [ ] Update Django and packages
- [ ] Security audit
- [ ] Performance review
- [ ] Backup strategy review

---

## 📚 **Additional Resources**

- [Django Deployment Checklist](https://docs.djangoproject.com/en/stable/howto/deployment/checklist/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Let's Encrypt SSL](https://letsencrypt.org/)
- [UptimeRobot](https://uptimerobot.com)
- [Security Headers](https://securityheaders.com)
- [SSL Labs Test](https://www.ssllabs.com/ssltest/)

---

## 🎯 **Quick Reference Checklist**

Before going live, ensure:
- [ ] Server configured with Docker
- [ ] Domain DNS pointing to server
- [ ] SSL certificate installed
- [ ] `.env` file configured with production values
- [ ] All services running
- [ ] Database migrated
- [ ] Superuser created
- [ ] Static files collected
- [ ] HTTPS working and redirecting
- [ ] All pages loading correctly
- [ ] Contact form working
- [ ] Admin panel accessible
- [ ] Backups scheduled
- [ ] Uptime monitoring active
- [ ] Firewall configured
- [ ] SSH hardened

**Good luck with your deployment! 🚀**
