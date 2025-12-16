# Backup Restoration Guide

## 📋 Overview

This guide shows you how to restore your Car Dealership application from backups.

**When to use this:**
- 🔧 Recovering from data corruption
- 💥 Server crashed and need to rebuild
- ⏮️ Rolling back to a previous state
- 🧪 Creating a staging/testing environment
- 🔄 Migrating to a new server

---

## 🚨 Before You Restore

### ⚠️ Important Warnings

1. **Restoring will OVERWRITE current data** - Make a backup first!
2. **Stop your application** before restoring
3. **Verify backup file integrity** before proceeding
4. **Test restore on staging first** (if possible)

---

## 🔍 Step 1: Find Your Backup

### List Available Backups:

```bash
# Local backups
ls -lh backups/database/

# Example output:
# car_dealership_20251216_020000.sql.gz  (2.3MB)
# car_dealership_20251215_020000.sql.gz  (2.1MB)
# car_dealership_20251214_020000.sql.gz  (2.0MB)
```

### Download from S3 (if using cloud backup):

```bash
# List S3 backups
aws s3 ls s3://your-bucket-name/database/

# Download specific backup
aws s3 cp s3://your-bucket-name/database/car_dealership_20251216_020000.sql.gz backups/database/
```

---

## 🛑 Step 2: Stop the Application

### Using Docker Compose:

```bash
cd /var/www/car-dealership
docker-compose down
```

**Expected output:**
```
[+] Running 4/4
 ✔ Container car_dealership_frontend  Removed
 ✔ Container car_dealership_backend   Removed
 ✔ Container car_dealership_db        Removed
 ✔ Network car-dealership_default     Removed
```

---

## 📦 Step 3: Restore Database

### Option A: Using Restore Script (Recommended)

1. **Run the restore script:**
```bash
./scripts/restore_database.sh backups/database/car_dealership_20251216_020000.sql.gz
```

**Expected output:**
```
========================================
  Car Dealership Database Restore
========================================
[2025-12-16 10:45:12] Starting restore process...
✓ Backup file exists and is valid
✓ Database container is running
ℹ Dropping existing database...
ℹ Creating fresh database...
ℹ Restoring backup...
✓ Database restore completed successfully!
✓ Verification: Database has 156 tables
```

### Option B: Manual Restore

1. **Start only the database container:**
```bash
docker-compose up -d db
```

2. **Decompress backup:**
```bash
gunzip -k backups/database/car_dealership_20251216_020000.sql.gz
# This creates: car_dealership_20251216_020000.sql
```

3. **Drop existing database:**
```bash
docker exec -it car_dealership_db psql -U postgres -c "DROP DATABASE IF EXISTS car_dealership;"
```

4. **Create fresh database:**
```bash
docker exec -it car_dealership_db psql -U postgres -c "CREATE DATABASE car_dealership;"
```

5. **Restore from backup:**
```bash
docker exec -i car_dealership_db psql -U postgres car_dealership < backups/database/car_dealership_20251216_020000.sql
```

6. **Verify restoration:**
```bash
docker exec -it car_dealership_db psql -U postgres car_dealership -c "\dt"
# Should list all your database tables
```

---

## 📂 Step 4: Restore Media Files (If Needed)

### Option A: From Local Backup

```bash
# Extract media backup
unzip backups/media/media_20251216_020000.zip -d temp_media/

# Remove old media files
rm -rf backend/media/*

# Copy restored media files
cp -r temp_media/* backend/media/

# Set correct permissions
chmod -R 755 backend/media/

# Clean up
rm -rf temp_media/
```

### Option B: From S3

```bash
# Download media backup from S3
aws s3 cp s3://your-bucket-name/media/media_20251216_020000.zip backups/media/

# Then follow Option A steps above
```

---

## 🚀 Step 5: Start the Application

```bash
# Start all containers
docker-compose up -d

# Wait for containers to be healthy (30 seconds)
sleep 30

# Check status
docker-compose ps
```

**Expected output:**
```
NAME                       STATUS          PORTS
car_dealership_backend     Up (healthy)    8000/tcp
car_dealership_db          Up (healthy)    5432/tcp
car_dealership_frontend    Up              0.0.0.0:3000->80/tcp
```

---

## ✅ Step 6: Verify Restoration

### 1. Check Database Connection:
```bash
docker exec car_dealership_backend python manage.py check --database default
```

### 2. Check Car Count:
```bash
docker exec car_dealership_db psql -U postgres car_dealership -c "SELECT COUNT(*) FROM cars_car;"
```

### 3. Visit Your Website:
```
http://your-server-ip:3000
```

### 4. Test Admin Panel:
```
http://your-server-ip:8000/secure-admin/
```

### 5. Verify Media Files:
```bash
ls -lh backend/media/cars/
# Should show your car images
```

---

## 🔧 Troubleshooting

### Problem: "Database container not running"

**Solution:**
```bash
# Start database container
docker-compose up -d db

# Check logs
docker-compose logs db
```

### Problem: "Restore fails with permission denied"

**Solution:**
```bash
# Make restore script executable
chmod +x scripts/restore_database.sh

# Or run with bash explicitly
bash scripts/restore_database.sh backup.sql.gz
```

### Problem: "Media files not showing"

**Solution:**
```bash
# Check permissions
ls -l backend/media/

# Fix permissions
chmod -R 755 backend/media/
chown -R www-data:www-data backend/media/

# Restart containers
docker-compose restart
```

### Problem: "Database restore succeeded but site shows no data"

**Solution:**
```bash
# Clear Django cache
docker exec car_dealership_backend python manage.py clear_cache

# Run migrations (in case of version mismatch)
docker exec car_dealership_backend python manage.py migrate

# Restart backend
docker-compose restart backend
```

### Problem: "Backup file is corrupted"

**Solution:**
```bash
# Test if .gz file is valid
gunzip -t backups/database/car_dealership_20251216_020000.sql.gz

# If corrupted, try downloading from S3 again
aws s3 cp s3://your-bucket-name/database/car_dealership_20251216_020000.sql.gz backups/database/ --force
```

---

## 🔄 Migrating to a New Server

### Full Migration Process:

1. **On OLD server - Create fresh backups:**
```bash
./scripts/backup_full.ps1  # Database + Media
```

2. **Transfer backups to NEW server:**
```bash
# From old server
scp backups/database/car_dealership_latest.sql.gz root@new-server:/tmp/
scp backups/media/media_latest.zip root@new-server:/tmp/

# Or download from S3 on new server
aws s3 cp s3://your-bucket/database/latest.sql.gz /tmp/
```

3. **On NEW server - Setup project:**
```bash
# Clone repository
git clone https://github.com/yourusername/car-dealership.git
cd car-dealership

# Copy .env file from old server
scp root@old-server:/var/www/car-dealership/.env .

# Build containers
docker-compose build
```

4. **Restore data:**
```bash
# Copy backups to proper location
cp /tmp/car_dealership_latest.sql.gz backups/database/
cp /tmp/media_latest.zip backups/media/

# Restore database
./scripts/restore_database.sh backups/database/car_dealership_latest.sql.gz

# Restore media
unzip backups/media/media_latest.zip -d backend/media/
```

5. **Start application:**
```bash
docker-compose up -d
```

6. **Update DNS:**
```
Point your domain to new server IP
```

---

## 🧪 Test Restore in Staging

**Best practice:** Always test your restore process!

### Create Test Environment:

1. **Create test directory:**
```bash
mkdir -p ~/car-dealership-test
cd ~/car-dealership-test
```

2. **Clone project:**
```bash
git clone https://github.com/yourusername/car-dealership.git .
```

3. **Copy latest backup:**
```bash
cp ~/car-dealership/backups/database/car_dealership_latest.sql.gz backups/database/
```

4. **Modify .env for testing:**
```bash
cp ~/car-dealership/.env .
nano .env
```

Change ports to avoid conflicts:
```env
# Change from 3000 to 3001, 8000 to 8001
```

5. **Restore and test:**
```bash
./scripts/restore_database.sh backups/database/car_dealership_latest.sql.gz
docker-compose up -d
```

6. **Verify:**
```
http://localhost:3001  # Should show exact copy of production
```

7. **Cleanup:**
```bash
cd ~
docker-compose -f ~/car-dealership-test/docker-compose.yml down -v
rm -rf ~/car-dealership-test
```

---

## 📝 Restoration Checklist

After restoring, verify:

- [ ] Database restored successfully
- [ ] All tables exist
- [ ] Car listings show correctly
- [ ] Images display properly
- [ ] Admin panel accessible
- [ ] Contact form works
- [ ] Analytics data present
- [ ] Search functionality works
- [ ] No error logs in backend
- [ ] Frontend loads without errors

---

## ⏱️ Recovery Time Estimates

| Scenario | Time Required |
|----------|---------------|
| Database restore (local) | 2-5 minutes |
| Database restore (from S3) | 5-10 minutes |
| Media files restore | 10-20 minutes |
| Full server migration | 30-60 minutes |
| Clean install + restore | 45-90 minutes |

---

## 🎯 Best Practices

### Regular Restore Testing:
```
✓ Test restore monthly
✓ Document restore time
✓ Keep restore scripts updated
✓ Verify backup integrity weekly
```

### Backup Verification:
```bash
# Weekly backup verification script
./scripts/verify_backup.sh

# Should check:
# - Backup files exist
# - File sizes are reasonable
# - .gz files are valid
# - S3 uploads succeeded
```

---

## 🆘 Emergency Contacts

**If restore fails:**

1. Check logs: `docker-compose logs`
2. Verify backup: `gunzip -t backup.sql.gz`
3. Try older backup
4. Contact your hosting support
5. Review this guide's troubleshooting section

---

## 📚 Related Documentation

- `AUTOMATED_BACKUPS_GUIDE.md` - Setup automated backups
- `AWS_S3_SETUP.md` - Configure cloud backup
- `BACKUP_STATUS.md` - Current backup status
- `PRODUCTION_DEPLOYMENT_GUIDE.md` - Production deployment

---

## ✅ Summary

**Quick Restore Steps:**
1. Stop application
2. Run restore script with backup file
3. Restore media files (if needed)
4. Start application
5. Verify everything works

**Emergency Restore Command:**
```bash
docker-compose down && \
./scripts/restore_database.sh backups/database/latest.sql.gz && \
docker-compose up -d
```

🎯 **Remember:** Test your restore process regularly - a backup is only good if you can restore from it!
