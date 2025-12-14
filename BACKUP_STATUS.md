# Automated Backup Setup

## ✅ Backup System Status

### What's Working:
- ✅ **Database backup** - Tested and working
- ✅ **Media backup** - Ready (will backup when images exist)
- ✅ **Auto-cleanup** - Keeps last 30 days of backups
- ✅ **PowerShell script** - `scripts/backup_full.ps1`

### Current Backup:
- **Location:** `backups/database/car_dealership_20251214_150311.sql`
- **Size:** 77,506 bytes (77 KB)
- **Created:** December 14, 2025 at 3:03 PM

---

## 🔧 Setup Automated Daily Backups

### Option 1: Run PowerShell Command (Requires Admin)

Open **PowerShell as Administrator** and run:

```powershell
cd C:\Users\ikanarkotis\projects\car-dealership

$action = New-ScheduledTaskAction -Execute "powershell.exe" -Argument "-NoProfile -ExecutionPolicy Bypass -File `"$PWD\scripts\backup_full.ps1`"" -WorkingDirectory "$PWD"
$trigger = New-ScheduledTaskTrigger -Daily -At 3am
$principal = New-ScheduledTaskPrincipal -UserId "$env:USERNAME" -LogonType S4U -RunLevel Highest
Register-ScheduledTask -Action $action -Trigger $trigger -Principal $principal -TaskName "CarDealershipBackup" -Description "Daily full backup for car dealership" -Force
```

### Option 2: Task Scheduler GUI

1. Press `Win + R`, type `taskschd.msc`, press Enter
2. Click **Create Basic Task**
3. Configure:
   - **Name:** Car Dealership Backup
   - **Description:** Daily backup of database and media files
   - **Trigger:** Daily at 3:00 AM
   - **Action:** Start a program
   - **Program:** `powershell.exe`
   - **Arguments:** `-NoProfile -ExecutionPolicy Bypass -File "C:\Users\ikanarkotis\projects\car-dealership\scripts\backup_full.ps1"`
   - **Start in:** `C:\Users\ikanarkotis\projects\car-dealership`
4. Check "Run with highest privileges"

---

## 📝 Manual Backup Anytime

```powershell
cd C:\Users\ikanarkotis\projects\car-dealership
.\scripts\backup_full.ps1
```

---

## 🔄 Restore from Backup

### Database Only:
```powershell
docker compose stop backend
docker exec car_dealership_db psql -U postgres -c "DROP DATABASE IF EXISTS car_dealership;"
docker exec car_dealership_db psql -U postgres -c "CREATE DATABASE car_dealership;"
Get-Content backups/database/car_dealership_20251214_150311.sql | docker exec -i car_dealership_db psql -U postgres car_dealership
docker compose start backend
```

### Media Files:
```powershell
Remove-Item -Recurse -Force backend/media
New-Item -ItemType Directory backend/media
Expand-Archive -Path backups/media/media_TIMESTAMP.zip -DestinationPath backend/media -Force
```

---

## 📊 Verify Scheduled Task

Check if task is created:
```powershell
Get-ScheduledTask -TaskName "CarDealershipBackup"
```

Test run manually:
```powershell
Start-ScheduledTask -TaskName "CarDealershipBackup"
```

---

## 🎯 What Gets Backed Up

✅ **Database:**
- All cars
- Car images metadata
- Contact messages
- Admin users
- All configurations

✅ **Media Files:**
- Uploaded car images
- Profile photos
- Any other uploaded content

---

## ⚠️ Important Notes

1. **Docker must be running** for backups
2. **30-day retention** - older backups auto-delete
3. **Local backups only** - consider cloud storage for production
4. **Test restore regularly** to ensure backups work

---

## 🚀 Next Steps (Production)

For production deployment, consider:
- **Cloud backup sync** (AWS S3, Google Cloud Storage, Azure Blob)
- **Off-site backup storage**
- **Backup monitoring/alerts**
- **Encrypted backups**
- **Database replication**
