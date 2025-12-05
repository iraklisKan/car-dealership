# Automated Database Backup Setup

## Windows Task Scheduler (Windows)

### Create Scheduled Task:

1. Open **Task Scheduler** (`taskschd.msc`)
2. Click **Create Basic Task**
3. Configure:
   - **Name:** Car Dealership DB Backup
   - **Trigger:** Daily at 3:00 AM
   - **Action:** Start a program
   - **Program:** `C:\projects\car-dealership\scripts\backup_database.bat`
   - **Start in:** `C:\projects\car-dealership`

### PowerShell Command (run as Administrator):
```powershell
$action = New-ScheduledTaskAction -Execute "C:\projects\car-dealership\scripts\backup_database.bat" -WorkingDirectory "C:\projects\car-dealership"
$trigger = New-ScheduledTaskTrigger -Daily -At 3am
Register-ScheduledTask -Action $action -Trigger $trigger -TaskName "CarDealershipBackup" -Description "Daily database backup for car dealership"
```

---

## Linux Cron Job (Linux/Mac)

### Add to crontab:
```bash
# Edit crontab
crontab -e

# Add this line (runs daily at 3 AM)
0 3 * * * cd /path/to/car-dealership && ./scripts/backup_database.sh >> logs/backup.log 2>&1
```

### Make script executable:
```bash
chmod +x scripts/backup_database.sh
mkdir -p logs
```

---

## Manual Backup

### Windows:
```cmd
cd C:\projects\car-dealership
scripts\backup_database.bat
```

### Linux/Mac:
```bash
cd /path/to/car-dealership
./scripts/backup_database.sh
```

---

## Backup Retention

- **Default retention:** 30 days
- **Location:** `backups/database/`
- **Format:** `car_dealership_YYYYMMDD_HHMMSS.sql` (Linux: `.sql.gz`)
- **Old backups:** Automatically deleted after retention period

---

## Verify Backups

Check if backups are being created:

### Windows:
```cmd
dir backups\database
```

### Linux:
```bash
ls -lh backups/database/
```

---

## Important Notes

1. **Docker must be running** for backups to work
2. **Backups are local** - consider offsite storage for production
3. **Test restore process** regularly (see restore_database script)
4. For production, consider:
   - Amazon S3 / Google Cloud Storage
   - Automated offsite backup sync
   - Backup encryption
   - Monitoring/alerting on backup failures
