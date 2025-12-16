# Complete Deployment Guide - Start to Finish
## Car Dealership Application - Live Production Deployment

**Time Required:** ~2 hours  
**Cost:** ~$14.50/month (Domain: $10/year, Hosting: $12/month, Backups: $2.40/month, S3: $0.05/month)

---

## 📋 Pre-Deployment Checklist

Before starting, make sure you have:
- ✅ Purchased domain from Namecheap (e.g., `yourcardealer.com`)
- ✅ Credit/debit card for DigitalOcean account
- ✅ Credit/debit card for AWS account (optional for S3 backups)
- ✅ Gmail account (for email notifications)
- ✅ This project code on your local machine

---

## 🌐 PART 1: Domain Setup (Namecheap)

### Step 1.1: Purchase Domain (15 minutes)

1. Go to [https://www.namecheap.com](https://www.namecheap.com)
2. Search for your desired domain name
3. Add to cart (should be ~$8-12/year)
4. **UNCHECK all add-ons:**
   - ❌ SSL Certificate (you'll use FREE Let's Encrypt)
   - ❌ Email hosting
   - ❌ Website builder
   - ✅ Keep WhoisGuard FREE privacy protection enabled
5. Complete checkout
6. Verify your email address (check inbox/spam)

### Step 1.2: Leave DNS as Default (For Now)

- Don't change DNS settings yet
- We'll update them after setting up DigitalOcean
- Keep Namecheap's default nameservers for now

---

## 🖥️ PART 2: DigitalOcean Server Setup (30 minutes)

### Step 2.1: Create DigitalOcean Account (5 minutes)

1. Go to [https://www.digitalocean.com](https://www.digitalocean.com)
2. Click "Sign Up"
3. Use email or GitHub to sign up
4. Add payment method (credit/debit card)
5. You may get $200 credit for 60 days (check for promo codes)

### Step 2.2: Create a Droplet (10 minutes)

1. Click **"Create"** → **"Droplets"**

2. **Choose Region:**
   - Select closest to your target audience
   - Recommended: Frankfurt, Amsterdam, or New York

3. **Choose Image:**
   - Click **"Marketplace"** tab
   - Search for **"Docker"**
   - Select **"Docker on Ubuntu 22.04"**

4. **Choose Size:**
   - Select **"Basic"** plan
   - Choose **$12/month** option:
     - 2 GB RAM / 2 vCPU / 60 GB SSD / 3 TB transfer

5. **Authentication:**
   - Choose **"Password"** (simpler for beginners)
   - Create a strong root password (save it securely!)
   - Alternative: Use SSH keys (more secure, but requires setup)

6. **Hostname:**
   - Name it: `car-dealership-prod` or similar

7. **Additional Options:**
   - ✅ Enable **"Backups"** (+$2.40/month) - HIGHLY RECOMMENDED
   - ❌ Skip monitoring for now

8. Click **"Create Droplet"**

9. **Wait 1-2 minutes** for droplet to be created

10. **Copy the IP address** (e.g., `167.99.123.45`)
    - Save this IP address - you'll need it multiple times

### Step 2.3: Initial Server Setup (15 minutes)

1. **Connect to your server via SSH**

   **Windows (PowerShell):**
   ```powershell
   ssh root@YOUR_DROPLET_IP
   ```

   **When prompted:**
   - Type `yes` to accept fingerprint
   - Enter the root password you created

2. **Update system packages:**
   ```bash
   apt update && apt upgrade -y
   ```
   (This takes 2-3 minutes)

3. **Install essential tools:**
   ```bash
   apt install -y git nano certbot python3-certbot-nginx ufw curl
   ```

4. **Configure firewall:**
   ```bash
   # Allow SSH
   ufw allow 22/tcp
   
   # Allow HTTP
   ufw allow 80/tcp
   
   # Allow HTTPS
   ufw allow 443/tcp
   
   # Enable firewall
   ufw --force enable
   
   # Check status
   ufw status
   ```

5. **Verify Docker is installed:**
   ```bash
   docker --version
   docker-compose --version
   ```
   You should see version numbers.

---

## 🔗 PART 3: Connect Domain to Server (10 minutes)

### Step 3.1: Update DNS Records on Namecheap

1. Log into [Namecheap.com](https://www.namecheap.com)
2. Go to **"Domain List"**
3. Click **"Manage"** next to your domain
4. Click **"Advanced DNS"** tab
5. **Delete any existing A Records, CNAME Records for @ and www**
6. **Add new records:**

   **Record 1:**
   - Type: `A Record`
   - Host: `@`
   - Value: `YOUR_DROPLET_IP` (e.g., 167.99.123.45)
   - TTL: `Automatic`

   **Record 2:**
   - Type: `A Record`
   - Host: `www`
   - Value: `YOUR_DROPLET_IP` (same IP)
   - TTL: `Automatic`

7. Click **"Save All Changes"**

### Step 3.2: Wait for DNS Propagation (5-60 minutes)

1. **Test DNS resolution:**
   ```bash
   # On your local computer (PowerShell or terminal)
   nslookup yourdomain.com
   ```
   You should see your DigitalOcean IP address.

2. **If it doesn't work immediately:**
   - DNS can take 5-60 minutes to propagate
   - Check at [https://dnschecker.org/](https://dnschecker.org/)
   - Continue with next steps while waiting

---

## 📦 PART 4: Deploy Application (30 minutes)

### Step 4.1: Clone Your Project (5 minutes)

**On your DigitalOcean server (via SSH):**

```bash
# Navigate to home directory
cd /root

# Clone your repository
git clone https://github.com/YOUR-USERNAME/car-dealership.git

# Enter project directory
cd car-dealership

# Verify files are there
ls -la
```

### Step 4.2: Generate Security Keys (2 minutes)

```bash
# Generate Django SECRET_KEY
python3 scripts/generate_secrets.py
```

**Copy the generated key** - you'll need it in the next step.

### Step 4.3: Create Production Environment File (10 minutes)

```bash
# Create .env file
nano .env
```

**Copy and paste this template, then modify with your actual values:**

```env
# ===================================
# DJANGO CONFIGURATION
# ===================================
# Use the key generated from scripts/generate_secrets.py
SECRET_KEY=paste-your-50-character-generated-key-here

# CRITICAL: Must be False in production
DEBUG=False

# Use production settings
DJANGO_SETTINGS_MODULE=car_dealership.settings.production

# ===================================
# DOMAIN CONFIGURATION
# ===================================
# Replace with your actual domain (NO http:// or https://)
ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com,YOUR_DROPLET_IP

# Replace with your actual domain (WITH https://)
CORS_ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

# ===================================
# DATABASE CONFIGURATION
# ===================================
DB_NAME=car_dealership
DB_USER=postgres
# Generate strong password: https://passwordsgenerator.net/ (20+ characters)
DB_PASSWORD=YourSuperStrongDatabasePassword123!@#
DB_HOST=db
DB_PORT=5432

# ===================================
# EMAIL CONFIGURATION (Gmail SMTP)
# ===================================
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True

# Your Gmail address
EMAIL_HOST_USER=youremail@gmail.com

# Gmail App Password (NOT your regular password)
# Generate at: https://myaccount.google.com/apppasswords
EMAIL_HOST_PASSWORD=your-16-character-app-password

# Email addresses for notifications
DEFAULT_FROM_EMAIL=noreply@yourdomain.com
ADMIN_EMAIL=admin@yourdomain.com

# ===================================
# PGADMIN CONFIGURATION
# ===================================
PGADMIN_EMAIL=admin@yourdomain.com
# Generate strong password
PGADMIN_PASSWORD=YourStrongPgAdminPassword123!

# ===================================
# FRONTEND CONFIGURATION
# ===================================
# Your actual domain with https://
VITE_API_URL=https://yourdomain.com

# ===================================
# AWS S3 BACKUP (Optional - Add Later)
# ===================================
# Leave empty for now, add after setting up S3
# AWS_ACCESS_KEY_ID=
# AWS_SECRET_ACCESS_KEY=
# AWS_S3_BUCKET_NAME=
# AWS_REGION=eu-central-1
```

**Save and exit:**
- Press `Ctrl + X`
- Press `Y` to confirm
- Press `Enter` to save

### Step 4.4: Set Up Gmail App Password (5 minutes)

Your `.env` needs a Gmail App Password (not your regular Gmail password):

1. Go to [https://myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
2. Sign in with your Gmail account
3. If prompted to enable 2-Step Verification, do that first
4. App name: `Car Dealership`
5. Click **"Create"**
6. **Copy the 16-character password** (e.g., `abcd efgh ijkl mnop`)
7. Paste this into `.env` as `EMAIL_HOST_PASSWORD` (remove spaces)

**Go back and update `.env` with this password:**
```bash
nano .env
# Find EMAIL_HOST_PASSWORD and update it
# Save: Ctrl+X, Y, Enter
```

### Step 4.5: Update Production Docker Compose (5 minutes)

Your project uses `docker-compose.yml` - we need to ensure it's production-ready:

```bash
# Check if docker-compose.yml exists
cat docker-compose.yml
```

The file should already be configured correctly. **Verify these critical settings:**

```yaml
backend:
  command: sh -c "python manage.py collectstatic --noinput && python manage.py migrate && gunicorn car_dealership.wsgi:application --bind 0.0.0.0:8000 --workers 3"
  environment:
    - DEBUG=${DEBUG}
    - DJANGO_SETTINGS_MODULE=${DJANGO_SETTINGS_MODULE}
```

### Step 4.6: Build and Start Containers (5 minutes)

```bash
# Make sure you're in the project directory
cd /root/car-dealership

# Start all services
docker-compose up -d --build

# This will:
# - Build frontend and backend images
# - Start PostgreSQL database
# - Run migrations
# - Start Gunicorn (Django)
# - Start Nginx (React)
# Takes 3-5 minutes for first build
```

**Check if containers are running:**
```bash
docker-compose ps
```

You should see:
- ✅ car_dealership_backend (running)
- ✅ car_dealership_frontend (running)
- ✅ car_dealership_db (running)
- ✅ car-dealership-pgadmin (running)

**View logs if needed:**
```bash
# Check backend logs
docker-compose logs backend

# Check frontend logs
docker-compose logs frontend

# Follow logs in real-time
docker-compose logs -f
```

### Step 4.7: Create Django Superuser (3 minutes)

```bash
# Create admin user for Django admin panel
docker-compose exec backend python manage.py createsuperuser

# You'll be prompted for:
# - Username: admin (or your choice)
# - Email: your@email.com
# - Password: (strong password - won't show as you type)
# - Password confirmation
```

**Save these credentials securely!**

---

## 🔒 PART 5: SSL Certificate Setup (10 minutes)

### Step 5.1: Stop Containers Temporarily (1 minute)

```bash
# Stop containers to free port 80 for Certbot
docker-compose down
```

### Step 5.2: Install SSL Certificate (5 minutes)

```bash
# Get FREE SSL certificate from Let's Encrypt
certbot certonly --standalone -d yourdomain.com -d www.yourdomain.com

# Follow prompts:
# - Enter email: your@email.com (for renewal notifications)
# - Agree to terms: Y
# - Share email with EFF: N (optional)
```

**You should see:**
```
Successfully received certificate.
Certificate is saved at: /etc/letsencrypt/live/yourdomain.com/fullchain.pem
Key is saved at: /etc/letsencrypt/live/yourdomain.com/privkey.pem
```

### Step 5.3: Configure Nginx for SSL (10 minutes)

Create a production Nginx configuration:

```bash
# Create nginx SSL config directory
mkdir -p /root/car-dealership/nginx

# Create production nginx config
nano /root/car-dealership/nginx/production.conf
```

**Paste this configuration (replace `yourdomain.com` with your actual domain):**

```nginx
# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    
    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }
    
    location / {
        return 301 https://$host$request_uri;
    }
}

# HTTPS Server
server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    
    # SSL Security Settings
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    
    # Security Headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Frontend (React)
    location / {
        proxy_pass http://frontend:80;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Backend API
    location /api {
        proxy_pass http://backend:8000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        client_max_body_size 50M;
    }

    # Django Admin
    location /secure-admin {
        proxy_pass http://backend:8000/secure-admin;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Static Files
    location /static/ {
        proxy_pass http://backend:8000/static/;
    }

    # Media Files
    location /media/ {
        proxy_pass http://backend:8000/media/;
        client_max_body_size 50M;
    }
}
```

**Save:** Ctrl+X, Y, Enter

### Step 5.4: Update Docker Compose for SSL (5 minutes)

```bash
nano /root/car-dealership/docker-compose.yml
```

**Add an Nginx reverse proxy service.** Add this to the end of the services section:

```yaml
  # Nginx Reverse Proxy with SSL
  nginx-proxy:
    image: nginx:alpine
    container_name: car_dealership_nginx_proxy
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/production.conf:/etc/nginx/conf.d/default.conf
      - /etc/letsencrypt:/etc/letsencrypt:ro
      - /var/www/certbot:/var/www/certbot
    depends_on:
      - frontend
      - backend
    networks:
      - car_dealership_network
    restart: unless-stopped
```

**Also update the frontend and backend port exposure** - comment them out since nginx-proxy will handle external access:

```yaml
  backend:
    # ... existing config ...
    # ports:
    #   - "8000:8000"  # Comment this out

  frontend:
    # ... existing config ...
    # ports:
    #   - "3000:80"  # Comment this out
```

**Save:** Ctrl+X, Y, Enter

### Step 5.5: Restart with SSL (2 minutes)

```bash
# Start everything with SSL
docker-compose up -d --build

# Check all containers are running
docker-compose ps

# Check nginx proxy logs
docker-compose logs nginx-proxy
```

### Step 5.6: Set Up Auto-Renewal (2 minutes)

```bash
# Test renewal process (dry run)
certbot renew --dry-run

# Set up automatic renewal (runs daily at 2 AM)
crontab -e

# If prompted, choose nano (option 1)
# Add this line at the end:
0 2 * * * certbot renew --quiet --post-hook "docker-compose -f /root/car-dealership/docker-compose.yml restart nginx-proxy"

# Save: Ctrl+X, Y, Enter
```

---

## ✅ PART 6: Verify Deployment (10 minutes)

### Step 6.1: Test Your Website

**Open your browser and test:**

1. **Frontend:** https://yourdomain.com
   - Should show your car dealership homepage
   - Check for green padlock (SSL working)

2. **API:** https://yourdomain.com/api/cars/
   - Should show JSON list of cars

3. **Admin Panel:** https://yourdomain.com/secure-admin/
   - Login with superuser credentials you created
   - Should be able to add/edit cars

4. **HTTP Redirect:** http://yourdomain.com
   - Should automatically redirect to https://

### Step 6.2: Check Container Health

```bash
# See all running containers
docker-compose ps

# Check disk usage
df -h

# Check memory usage
free -h

# Check Docker stats
docker stats --no-stream
```

### Step 6.3: Test Contact Form

1. Go to https://yourdomain.com/contact
2. Fill out and submit the form
3. Check your admin email for notification
4. Check Django admin at https://yourdomain.com/secure-admin/contact/contactmessage/

---

## 💾 PART 7: Set Up Backups (30 minutes)

### Option A: DigitalOcean Backups (Simple) ✅

**Already enabled if you checked "Backups" during droplet creation!**

- **Automatic weekly backups**
- **Retains 4 backups**
- **Cost:** $2.40/month (already included)
- **Restore:** One-click from DigitalOcean dashboard

**To verify:**
1. Go to DigitalOcean dashboard
2. Click on your droplet
3. Click "Backups" tab
4. You should see backup schedule

**Manual snapshot (one-time backup):**
```bash
# From DigitalOcean dashboard:
# Droplet → Snapshots → Take Snapshot
```

### Option B: AWS S3 Backups (Advanced) 🔧

**For extra redundancy, set up automatic S3 backups:**

#### Step 7B.1: Create AWS Account (10 minutes)

1. Go to [https://aws.amazon.com](https://aws.amazon.com)
2. Click **"Create an AWS Account"**
3. Fill in email, password, account name
4. Add payment method
5. Verify phone number
6. Select **"Basic Support (Free)"**

#### Step 7B.2: Create S3 Bucket (5 minutes)

1. Login to [AWS Console](https://console.aws.amazon.com)
2. Search for **"S3"** → Click **S3**
3. Click **"Create bucket"**
4. **Bucket name:** `car-dealership-backups-yourname` (must be globally unique)
5. **Region:** Select **EU (Frankfurt) eu-central-1** or closest to you
6. **Block Public Access:** Keep ALL boxes checked ✅
7. **Bucket Versioning:** Enable ✅
8. **Default encryption:** Enable (SSE-S3) ✅
9. Click **"Create bucket"**

#### Step 7B.3: Create IAM User (5 minutes)

1. AWS Console → Search **"IAM"** → Click **IAM**
2. Left sidebar → **"Users"** → **"Create user"**
3. **User name:** `car-dealership-backup`
4. Click **"Next"**
5. Select **"Attach policies directly"**
6. Search and check: **"AmazonS3FullAccess"**
7. Click **"Next"** → **"Create user"**

#### Step 7B.4: Generate Access Keys (3 minutes)

1. Click on the **car-dealership-backup** user
2. Click **"Security credentials"** tab
3. Scroll to **"Access keys"** section
4. Click **"Create access key"**
5. Select **"Application running outside AWS"**
6. Click **"Next"** → **"Create access key"**

**⚠️ SAVE THESE IMMEDIATELY (you can't see them again):**
```
Access Key ID: AKIAIOSFODNN7EXAMPLE
Secret Access Key: wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
```

#### Step 7B.5: Configure S3 on Server (10 minutes)

**On your DigitalOcean server:**

```bash
# Install AWS CLI
apt install awscli -y

# Configure AWS credentials
aws configure
# AWS Access Key ID: [paste your key]
# AWS Secret Access Key: [paste your secret]
# Default region: eu-central-1
# Default output format: json

# Update .env file
nano /root/car-dealership/.env
```

**Add these lines to .env:**
```env
# AWS S3 Backup Configuration
AWS_ACCESS_KEY_ID=your-access-key-id
AWS_SECRET_ACCESS_KEY=your-secret-access-key
AWS_S3_BUCKET_NAME=car-dealership-backups-yourname
AWS_REGION=eu-central-1
```

**Save:** Ctrl+X, Y, Enter

#### Step 7B.6: Create Backup Script (5 minutes)

```bash
# Create backup script
nano /root/car-dealership/scripts/backup_to_s3.sh
```

**Paste this script:**

```bash
#!/bin/bash

# Configuration
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_DIR="/root/car-dealership-backups"
PROJECT_DIR="/root/car-dealership"

# Source environment variables
source $PROJECT_DIR/.env

# Create backup directory
mkdir -p $BACKUP_DIR

# Backup PostgreSQL Database
echo "Backing up database..."
docker-compose -f $PROJECT_DIR/docker-compose.yml exec -T db pg_dump -U $DB_USER $DB_NAME > $BACKUP_DIR/database_$TIMESTAMP.sql

# Backup Media Files
echo "Backing up media files..."
tar -czf $BACKUP_DIR/media_$TIMESTAMP.tar.gz -C $PROJECT_DIR/backend media/

# Upload to S3
echo "Uploading to S3..."
aws s3 cp $BACKUP_DIR/database_$TIMESTAMP.sql s3://$AWS_S3_BUCKET_NAME/backups/database/
aws s3 cp $BACKUP_DIR/media_$TIMESTAMP.tar.gz s3://$AWS_S3_BUCKET_NAME/backups/media/

# Clean up local backups older than 7 days
echo "Cleaning up old local backups..."
find $BACKUP_DIR -name "database_*.sql" -mtime +7 -delete
find $BACKUP_DIR -name "media_*.tar.gz" -mtime +7 -delete

# Delete old S3 backups (keep last 30 days)
aws s3 ls s3://$AWS_S3_BUCKET_NAME/backups/database/ | while read -r line; do
    createDate=$(echo $line|awk {'print $1" "$2'})
    createDate=$(date -d "$createDate" +%s)
    olderThan=$(date --date "30 days ago" +%s)
    if [[ $createDate -lt $olderThan ]]; then
        fileName=$(echo $line|awk {'print $4'})
        if [[ $fileName != "" ]]; then
            aws s3 rm s3://$AWS_S3_BUCKET_NAME/backups/database/$fileName
        fi
    fi
done

echo "Backup completed: $TIMESTAMP"
```

**Save:** Ctrl+X, Y, Enter

**Make script executable:**
```bash
chmod +x /root/car-dealership/scripts/backup_to_s3.sh
```

#### Step 7B.7: Test Backup Manually (2 minutes)

```bash
# Run backup script manually
/root/car-dealership/scripts/backup_to_s3.sh

# Check S3 bucket
aws s3 ls s3://car-dealership-backups-yourname/backups/database/
aws s3 ls s3://car-dealership-backups-yourname/backups/media/
```

You should see your backup files listed!

#### Step 7B.8: Schedule Automatic Backups (3 minutes)

```bash
# Edit crontab
crontab -e

# Add daily backup at 3 AM (after SSL renewal at 2 AM)
0 3 * * * /root/car-dealership/scripts/backup_to_s3.sh >> /var/log/s3-backup.log 2>&1

# Save: Ctrl+X, Y, Enter
```

**View current cron jobs:**
```bash
crontab -l
```

---

## 📊 PART 8: Monitoring & Maintenance (10 minutes)

### Step 8.1: Set Up Log Monitoring

```bash
# View real-time logs
docker-compose -f /root/car-dealership/docker-compose.yml logs -f

# View specific service logs
docker-compose logs backend
docker-compose logs frontend
docker-compose logs db

# View last 100 lines
docker-compose logs --tail=100

# Save logs to file
docker-compose logs > /root/application-logs-$(date +%Y%m%d).txt
```

### Step 8.2: Monitor Resource Usage

```bash
# Check disk space
df -h

# Check memory usage
free -h

# Check Docker container stats
docker stats

# Check running containers
docker-compose ps
```

### Step 8.3: Create Health Check Script

```bash
nano /root/health_check.sh
```

**Paste this script:**

```bash
#!/bin/bash

echo "=== Car Dealership Health Check ==="
echo "Date: $(date)"
echo ""

echo "--- Container Status ---"
docker-compose -f /root/car-dealership/docker-compose.yml ps

echo ""
echo "--- Disk Usage ---"
df -h | grep -E 'Filesystem|/dev/vda'

echo ""
echo "--- Memory Usage ---"
free -h

echo ""
echo "--- SSL Certificate Expiry ---"
certbot certificates

echo ""
echo "--- Website Response ---"
curl -I https://yourdomain.com

echo ""
echo "--- API Response ---"
curl -I https://yourdomain.com/api/cars/
```

**Make executable and run:**
```bash
chmod +x /root/health_check.sh
/root/health_check.sh
```

### Step 8.4: Set Up Email Alerts (Optional)

Create a monitoring script that emails you if the site goes down:

```bash
nano /root/monitor_site.sh
```

```bash
#!/bin/bash

SITE="https://yourdomain.com"
ADMIN_EMAIL="your@email.com"

if ! curl -f -s $SITE > /dev/null; then
    echo "Website is down!" | mail -s "ALERT: Car Dealership Website Down" $ADMIN_EMAIL
fi
```

**Make executable:**
```bash
chmod +x /root/monitor_site.sh
```

**Add to crontab (check every 15 minutes):**
```bash
crontab -e

# Add this line:
*/15 * * * * /root/monitor_site.sh
```

---

## 🚀 PART 9: Post-Deployment Tasks (15 minutes)

### Step 9.1: Test All Functionality

**Checklist:**
- ✅ Homepage loads: https://yourdomain.com
- ✅ Car listing page works
- ✅ Car detail page shows images
- ✅ Search and filters work
- ✅ Contact form submits successfully
- ✅ Contact form email notification received
- ✅ Admin panel accessible: https://yourdomain.com/secure-admin/
- ✅ Can add new car in admin
- ✅ Uploaded images appear on frontend
- ✅ SSL certificate shows (green padlock)
- ✅ HTTP redirects to HTTPS
- ✅ Mobile responsive design works

### Step 9.2: Add Initial Car Data

**Option 1: Via Django Admin**
1. Go to https://yourdomain.com/secure-admin/
2. Click "Cars" → "Add Car"
3. Fill in details and upload images
4. Click "Save"

**Option 2: Load Fixtures (if you have data)**
```bash
docker-compose exec backend python manage.py loaddata cars/fixtures/initial_cars.json
```

### Step 9.3: Configure Google Search Console (SEO)

1. Go to [Google Search Console](https://search.google.com/search-console)
2. Add your property: https://yourdomain.com
3. Verify ownership (HTML file upload or DNS)
4. Submit sitemap (if you have one)

### Step 9.4: Set Up Analytics (Optional)

**Google Analytics:**
1. Go to [analytics.google.com](https://analytics.google.com)
2. Create account and property
3. Get tracking ID
4. Add to your React app in `frontend/public/index.html`

### Step 9.5: Document Your Credentials

**Save these securely (password manager like Bitwarden or LastPass):**

```
=== Car Dealership Production Credentials ===

DOMAIN: yourdomain.com
DROPLET IP: 167.99.123.45

--- DigitalOcean ---
Email: your@email.com
Droplet Name: car-dealership-prod
Root Password: [your-root-password]

--- Django Admin ---
URL: https://yourdomain.com/secure-admin/
Username: admin
Password: [your-admin-password]

--- Database (PostgreSQL) ---
Host: localhost (in container: db)
Port: 5432
Database: car_dealership
User: postgres
Password: [your-db-password]

--- pgAdmin ---
URL: http://YOUR_DROPLET_IP:5050
Email: admin@yourdomain.com
Password: [your-pgadmin-password]

--- AWS S3 (if enabled) ---
Access Key ID: [your-access-key]
Secret Access Key: [your-secret-key]
Bucket: car-dealership-backups-yourname

--- Email (Gmail) ---
SMTP Host: smtp.gmail.com
User: youremail@gmail.com
App Password: [16-char-app-password]

--- SSL Certificate ---
Provider: Let's Encrypt
Renewal: Automatic (every 90 days)
Cron: 0 2 * * * certbot renew
```

---

## 🎉 PART 10: You're Live!

### Your Live URLs:

- **🌐 Website:** https://yourdomain.com
- **🔧 Admin Panel:** https://yourdomain.com/secure-admin/
- **📊 Database Admin:** http://YOUR_DROPLET_IP:5050
- **🔌 API:** https://yourdomain.com/api/cars/

### Monthly Costs:

| Service | Cost |
|---------|------|
| Domain (Namecheap) | $0.83/month ($10/year) |
| DigitalOcean Droplet | $12.00/month |
| DigitalOcean Backups | $2.40/month |
| AWS S3 Backups | $0.05/month |
| **Total** | **~$15.28/month** |

---

## 🛠️ Common Maintenance Tasks

### Restart Application
```bash
cd /root/car-dealership
docker-compose restart
```

### Update Application Code
```bash
cd /root/car-dealership
git pull origin main
docker-compose up -d --build
```

### View Logs
```bash
docker-compose logs -f backend
```

### Backup Database Manually
```bash
/root/car-dealership/scripts/backup_to_s3.sh
```

### Check SSL Certificate Status
```bash
certbot certificates
```

### Renew SSL Certificate Manually
```bash
certbot renew
docker-compose restart nginx-proxy
```

### Connect to Database
```bash
docker-compose exec db psql -U postgres -d car_dealership
```

### Run Django Management Commands
```bash
# Create superuser
docker-compose exec backend python manage.py createsuperuser

# Run migrations
docker-compose exec backend python manage.py migrate

# Collect static files
docker-compose exec backend python manage.py collectstatic --noinput
```

---

## 🆘 Troubleshooting

### Website Not Loading

**Check if containers are running:**
```bash
docker-compose ps
```

**Restart containers:**
```bash
docker-compose restart
```

**Check logs:**
```bash
docker-compose logs backend
docker-compose logs frontend
docker-compose logs nginx-proxy
```

### SSL Certificate Issues

**Check certificate status:**
```bash
certbot certificates
```

**Renew certificate:**
```bash
certbot renew --force-renewal
docker-compose restart nginx-proxy
```

### Database Connection Issues

**Check database container:**
```bash
docker-compose logs db
```

**Restart database:**
```bash
docker-compose restart db
```

**Verify credentials in .env file:**
```bash
cat /root/car-dealership/.env | grep DB_
```

### Email Not Sending

**Test SMTP connection:**
```bash
docker-compose exec backend python manage.py shell

>>> from django.core.mail import send_mail
>>> send_mail('Test', 'Test message', 'noreply@yourdomain.com', ['your@email.com'])
```

**Check Gmail App Password:**
- Make sure you're using App Password, not regular password
- Verify 2-Step Verification is enabled on Gmail

### Out of Disk Space

**Check disk usage:**
```bash
df -h
```

**Clean Docker:**
```bash
docker system prune -a --volumes
```

**Remove old backups:**
```bash
rm -rf /root/car-dealership-backups/*
```

### High Memory Usage

**Check what's using memory:**
```bash
docker stats
```

**Restart containers:**
```bash
docker-compose restart
```

**Upgrade droplet if consistently high:**
- Go to DigitalOcean dashboard
- Resize droplet to $24/month (4GB RAM)

---

## 📞 Support Resources

- **DigitalOcean Docs:** https://docs.digitalocean.com
- **Docker Docs:** https://docs.docker.com
- **Django Docs:** https://docs.djangoproject.com
- **Let's Encrypt:** https://letsencrypt.org/docs/
- **AWS S3 Docs:** https://docs.aws.amazon.com/s3/

---

## ✅ Deployment Complete!

Your car dealership application is now live on the internet! 🎉

**What you've accomplished:**
- ✅ Purchased and configured domain
- ✅ Set up production server on DigitalOcean
- ✅ Deployed full-stack application with Docker
- ✅ Configured SSL certificate (HTTPS)
- ✅ Set up automatic backups
- ✅ Configured email notifications
- ✅ Implemented security best practices
- ✅ Set up monitoring and maintenance

**Next steps:**
- Add your car inventory via admin panel
- Share your website with customers
- Monitor traffic and performance
- Scale up if needed

**Questions or issues?** Check the troubleshooting section or refer to your project's other documentation files.

---

*Last updated: December 15, 2025*
