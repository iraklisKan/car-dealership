# Automated Backups Setup Guide for Digital Ocean

## 📋 Overview

This guide shows you how to set up automated daily backups on your Digital Ocean server using cron jobs.

**What This Does:**
- ✅ Automatic daily database backups
- ✅ Automatic media file backups
- ✅ Upload to AWS S3 (if configured)
- ✅ Old backup cleanup (30-day retention)
- ✅ Email notifications on failures (optional)

---

## 🚀 Quick Setup (10 minutes)

### Step 1: SSH into Your Digital Ocean Droplet

```bash
ssh root@your-server-ip
```

### Step 2: Navigate to Your Project

```bash
cd /var/www/car-dealership
# Or wherever you deployed your project
```

### Step 3: Make Backup Scripts Executable

```bash
chmod +x scripts/backup_database.sh
chmod +x scripts/backup_full.ps1  # If using PowerShell
```

### Step 4: Test the Backup Script

```bash
# Test database backup
./scripts/backup_database.sh

# Or test full backup (database + media)
# If you have PowerShell installed: pwsh scripts/backup_full.ps1
```

**Expected Output:**
```
========================================
  Car Dealership Database Backup
========================================
[2025-12-16 10:30:15] Starting backup process...
✓ Database container is running
✓ Database dump completed
✓ Backup verification passed
✓ Backup compressed successfully
ℹ AWS S3 not configured. Backup saved locally only.
✓ Backup process completed successfully!
```

---

## ⏰ Setup Automated Daily Backups

### Option 1: Using Cron (Recommended for Linux)

1. **Open crontab editor:**
```bash
crontab -e
```

2. **Add backup schedule:** (choose one)

```bash
# Run daily at 2:00 AM (recommended - low traffic time)
0 2 * * * cd /var/www/car-dealership && ./scripts/backup_database.sh >> /var/log/car-dealership-backup.log 2>&1

# Run every 12 hours (2 AM and 2 PM)
0 2,14 * * * cd /var/www/car-dealership && ./scripts/backup_database.sh >> /var/log/car-dealership-backup.log 2>&1

# Run weekly on Sunday at 3 AM (less frequent)
0 3 * * 0 cd /var/www/car-dealership && ./scripts/backup_database.sh >> /var/log/car-dealership-backup.log 2>&1
```

3. **Save and exit:**
   - Press `Ctrl + X`
   - Press `Y` to confirm
   - Press `Enter`

4. **Verify cron job is set:**
```bash
crontab -l
```

---

### Option 2: Using Systemd Timer (Alternative)

1. **Create backup service:**
```bash
sudo nano /etc/systemd/system/car-dealership-backup.service
```

2. **Add this content:**
```ini
[Unit]
Description=Car Dealership Database Backup
After=docker.service

[Service]
Type=oneshot
User=root
WorkingDirectory=/var/www/car-dealership
ExecStart=/var/www/car-dealership/scripts/backup_database.sh
StandardOutput=journal
StandardError=journal
```

3. **Create backup timer:**
```bash
sudo nano /etc/systemd/system/car-dealership-backup.timer
```

4. **Add this content:**
```ini
[Unit]
Description=Run Car Dealership Backup Daily
Requires=car-dealership-backup.service

[Timer]
OnCalendar=daily
OnCalendar=02:00
Persistent=true

[Install]
WantedBy=timers.target
```

5. **Enable and start timer:**
```bash
sudo systemctl daemon-reload
sudo systemctl enable car-dealership-backup.timer
sudo systemctl start car-dealership-backup.timer
```

6. **Check timer status:**
```bash
sudo systemctl status car-dealership-backup.timer
sudo systemctl list-timers car-dealership-backup.timer
```

---

## 📧 Setup Email Notifications (Optional)

Get notified when backups fail:

### 1. Install mailutils:
```bash
sudo apt-get update
sudo apt-get install mailutils postfix -y
```

### 2. Create notification wrapper script:
```bash
nano scripts/backup_with_notification.sh
```

### 3. Add this content:
```bash
#!/bin/bash

ADMIN_EMAIL="your-email@example.com"
LOG_FILE="/var/log/car-dealership-backup.log"

# Run backup
/var/www/car-dealership/scripts/backup_database.sh >> "$LOG_FILE" 2>&1

# Check if backup succeeded
if [ $? -eq 0 ]; then
    echo "Backup completed successfully at $(date)" | mail -s "✓ Car Dealership Backup Success" "$ADMIN_EMAIL"
else
    echo "Backup failed at $(date). Check logs: $LOG_FILE" | mail -s "✗ Car Dealership Backup FAILED" "$ADMIN_EMAIL"
fi
```

### 4. Make it executable:
```bash
chmod +x scripts/backup_with_notification.sh
```

### 5. Update cron to use notification script:
```bash
crontab -e
```

```bash
# Replace your existing backup cron with:
0 2 * * * /var/www/car-dealership/scripts/backup_with_notification.sh
```

---

## 🔍 Monitor Backups

### View Backup Logs:
```bash
# View recent backup activity
tail -f /var/log/car-dealership-backup.log

# View last 50 lines
tail -n 50 /var/log/car-dealership-backup.log

# Search for errors
grep -i error /var/log/car-dealership-backup.log
```

### Check Backup Files:
```bash
# List database backups
ls -lh /var/www/car-dealership/backups/database/

# Check disk usage
du -sh /var/www/car-dealership/backups/
```

### Verify Latest Backup:
```bash
# Check if backup exists from today
ls -lh /var/www/car-dealership/backups/database/*$(date +%Y%m%d)*.sql.gz
```

---

## 📁 Understanding Cron Schedule Format

```
* * * * * command
│ │ │ │ │
│ │ │ │ └─── Day of week (0-7, Sunday=0 or 7)
│ │ │ └───── Month (1-12)
│ │ └─────── Day of month (1-31)
│ └───────── Hour (0-23)
└─────────── Minute (0-59)
```

**Common Examples:**
```bash
0 2 * * *       # Daily at 2:00 AM
0 */6 * * *     # Every 6 hours
30 3 * * 0      # Sundays at 3:30 AM
0 0 1 * *       # First day of every month at midnight
0 2,14 * * *    # Daily at 2 AM and 2 PM
```

---

## ☁️ AWS S3 Cloud Backup (Optional)

If you want backups automatically uploaded to AWS S3:

### 1. Install AWS CLI on server:
```bash
# Ubuntu/Debian
sudo apt-get install awscli -y

# Verify installation
aws --version
```

### 2. Configure AWS credentials in .env:
```bash
nano .env
```

Add your credentials:
```env
AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCY
AWS_S3_BUCKET_NAME=car-dealership-backups-yourname
AWS_REGION=eu-central-1
```

### 3. Test S3 upload:
```bash
./scripts/backup_database.sh
```

You should see:
```
✓ Backup uploaded to S3: s3://your-bucket/database/car_dealership_20251216_103045.sql.gz
```

---

## 🔧 Troubleshooting

### Backup Script Not Running?

**Check cron logs:**
```bash
grep CRON /var/log/syslog
```

**Check script permissions:**
```bash
ls -l scripts/backup_database.sh
# Should show: -rwxr-xr-x (executable)
```

**Test script manually:**
```bash
cd /var/www/car-dealership
./scripts/backup_database.sh
```

### S3 Upload Failing?

**Check AWS CLI:**
```bash
aws --version
aws s3 ls s3://your-bucket-name
```

**Test credentials:**
```bash
aws sts get-caller-identity
```

### Disk Space Issues?

**Check available space:**
```bash
df -h
```

**Clean up old backups manually:**
```bash
# Delete backups older than 30 days
find /var/www/car-dealership/backups/database -name "*.sql.gz" -mtime +30 -delete
```

---

## 📊 Best Practices

### Recommended Backup Strategy:

**For Production:**
```
✓ Daily automated backups (2 AM)
✓ 30-day retention locally
✓ Upload to S3 for off-site storage
✓ Weekly full backups (database + media)
✓ Monthly backup downloads for verification
```

**Backup Storage:**
```
Local:    30 days of daily backups
S3:       90 days (or unlimited with lifecycle rules)
```

### Security:
- ✅ Keep `.env` file secure (never commit to git)
- ✅ Use AWS IAM user with limited S3-only permissions
- ✅ Encrypt backups at rest (S3 does this automatically)
- ✅ Restrict backup directory access: `chmod 700 backups/`

---

## ✅ Quick Checklist

After setup, verify:

- [ ] Backup script executes successfully
- [ ] Cron job is scheduled (check with `crontab -l`)
- [ ] Backup files are created in `backups/database/`
- [ ] Old backups are cleaned up (check after 30 days)
- [ ] S3 upload works (if configured)
- [ ] Email notifications work (if configured)
- [ ] Logs are being written to `/var/log/`

---

## 🆘 Need Help?

**Check script logs:**
```bash
tail -100 /var/log/car-dealership-backup.log
```

**Test backup manually:**
```bash
./scripts/backup_database.sh
```

**Verify Docker is running:**
```bash
docker ps | grep car_dealership_db
```

---

## 🎯 Next Steps

1. ✅ Set up daily automated backups
2. ✅ Configure AWS S3 for cloud storage
3. ✅ Test backup restoration (see BACKUP_RESTORATION_GUIDE.md)
4. ✅ Document your backup schedule
5. ✅ Set calendar reminder to verify backups monthly
