# AWS S3 Backup Setup Guide

## 📋 Overview

This guide helps you set up automatic cloud backups to AWS S3 for disaster recovery.

**Cost:** ~$0.69/month for typical car dealership data (600MB)

---

## 🚀 Quick Setup (15 minutes)

### Step 1: Create AWS Account

1. Go to https://aws.amazon.com/
2. Click **Create an AWS Account**
3. Fill in:
   - Email address
   - Password
   - Account name: "Car Dealership"
4. Add payment method (credit/debit card)
5. Verify identity (automated phone call)
6. Select **Basic Support Plan** (Free)

---

### Step 2: Create S3 Bucket

1. Login to AWS Console: https://console.aws.amazon.com/
2. Search for "S3" in top search bar → Click **S3**
3. Click **Create bucket**
4. Configure:
   - **Bucket name:** `car-dealership-backups-yourname` (must be globally unique)
   - **Region:** Select **EU (Frankfurt) eu-central-1** or **EU (Ireland) eu-west-1**
   - **Block Public Access:** Keep all ✅ (keep private!)
   - **Bucket Versioning:** **Enable** (keeps old versions for 90 days)
   - **Default encryption:** **Enable** (SSE-S3)
5. Click **Create bucket**

---

### Step 3: Create IAM User with S3 Access

1. AWS Console → Search "IAM" → Click **IAM**
2. Left sidebar → Click **Users**
3. Click **Create user**
4. **User name:** `car-dealership-backup`
5. Click **Next**
6. Select **Attach policies directly**
7. Search for `AmazonS3FullAccess` → Check the box
8. Click **Next** → **Create user**

---

### Step 4: Generate Access Keys

1. Click on the **car-dealership-backup** user you just created
2. Click **Security credentials** tab
3. Scroll to **Access keys** section
4. Click **Create access key**
5. Select **Application running outside AWS**
6. Click **Next** → **Create access key**

**⚠️ CRITICAL - SAVE THESE NOW (You can't see them again!):**

```
Access Key ID: AKIAIOSFODNN7EXAMPLE
Secret Access Key: wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
```

---

### Step 5: Configure Your Project

1. Open `.env` file in your project
2. Add your AWS credentials:

```env
# AWS S3 Backup Configuration
AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
AWS_S3_BUCKET_NAME=car-dealership-backups-yourname
AWS_REGION=eu-central-1
```

3. Save the file

---

### Step 6: Install AWS CLI

**Windows:**
1. Download: https://awscli.amazonaws.com/AWSCLIV2.msi
2. Run installer (Next → Next → Install)
3. Restart PowerShell

**Linux:**
```bash
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install
```

---

### Step 7: Test AWS Connection

```powershell
cd C:\Users\ikanarkotis\projects\car-dealership
.\scripts\setup_aws_s3.ps1
```

Expected output:
```
[SUCCESS] AWS CLI is installed
[SUCCESS] Successfully authenticated with AWS
[SUCCESS] Successfully accessed S3 bucket
[SUCCESS] Test file uploaded successfully!
AWS S3 Setup Complete!
```

---

### Step 8: Run First Backup with Cloud Sync

```powershell
.\scripts\backup_full.ps1
```

You should see:
```
[INFO] Creating database backup...
[SUCCESS] Database backup completed
[INFO] Syncing backups to AWS S3...
  ✓ Database backup uploaded
[SUCCESS] Cloud backup completed
```

---

## ✅ Verify in AWS Console

1. Go to https://s3.console.aws.amazon.com/s3/
2. Click your bucket name
3. You should see:
   - `database/car_dealership_YYYYMMDD_HHMMSS.sql`
   - `media/media_YYYYMMDD_HHMMSS.zip`

---

## 🔄 Automatic Daily Backups

Your scheduled task (3 AM daily) will now automatically:
1. Create local backup
2. Upload to AWS S3
3. Clean up old local backups (30 days)
4. S3 versioning keeps 90 days

---

## 💰 Cost Breakdown

Assuming:
- 100 MB database
- 500 MB media files
- 30 days retention = ~600 MB

**Monthly Cost:**
- S3 Storage: 0.6 GB × $0.023 = $0.014
- S3 Requests: ~30 uploads/month = $0.00015
- **Total: ~$0.69/month** ☕

---

## 🆘 Restore from S3 (Disaster Recovery)

### If your server crashes:

1. **New server setup with project**

2. **Install AWS CLI** (see Step 6)

3. **Configure AWS credentials** (from .env)

4. **Download latest backup:**
```powershell
# List available backups
aws s3 ls s3://car-dealership-backups-yourname/database/

# Download specific backup
aws s3 cp s3://car-dealership-backups-yourname/database/car_dealership_20251214_150311.sql ./backup.sql

# Download media
aws s3 cp s3://car-dealership-backups-yourname/media/media_20251214_150311.zip ./media.zip
```

5. **Restore:**
```powershell
# Restore database
docker compose stop backend
Get-Content backup.sql | docker exec -i car_dealership_db psql -U postgres car_dealership
docker compose start backend

# Restore media
Expand-Archive -Path media.zip -DestinationPath backend/media -Force
```

---

## 🔒 Security Best Practices

✅ **Never commit .env to git** (already in .gitignore)  
✅ **Use IAM user with minimal permissions** (only S3 access)  
✅ **Enable S3 versioning** (protects against accidental deletion)  
✅ **Enable MFA for AWS account** (optional but recommended)  
✅ **Rotate access keys yearly** (create new, delete old)  

---

## ❓ Troubleshooting

### "Access Denied" error:
- Check IAM user has `AmazonS3FullAccess` policy
- Verify access keys are correct in .env

### "Bucket does not exist":
- Check bucket name in .env matches AWS exactly
- Verify region is correct

### "AWS CLI not found":
- Install AWS CLI (see Step 6)
- Restart PowerShell after installation

### Upload fails but no error:
- Check internet connection
- Verify AWS credentials haven't expired
- Check S3 bucket permissions

---

## 📞 Support

- AWS Free Tier: https://aws.amazon.com/free/
- AWS S3 Documentation: https://docs.aws.amazon.com/s3/
- AWS Support: https://console.aws.amazon.com/support/

---

## 🎯 Summary Checklist

- [ ] AWS account created
- [ ] S3 bucket created (eu-central-1 region)
- [ ] IAM user created with S3 access
- [ ] Access keys generated and saved
- [ ] Credentials added to .env file
- [ ] AWS CLI installed
- [ ] Test script run successfully
- [ ] First backup uploaded to S3
- [ ] Verified backup in AWS Console
- [ ] Scheduled daily backups configured

**All done? Your data is now safe!** 🎉🔒
