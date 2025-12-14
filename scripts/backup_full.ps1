# Full Backup Script (Database + Media)
# Usage: .\scripts\backup_full.ps1

$ErrorActionPreference = "Stop"

# Load environment variables
if (Test-Path ".env") {
    Get-Content ".env" | ForEach-Object {
        if ($_ -match '^\s*([^#][^=]*?)\s*=\s*(.*)$') {
            $name = $matches[1]
            $value = $matches[2]
            [Environment]::SetEnvironmentVariable($name, $value, "Process")
        }
    }
}

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Car Dealership Full Backup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Timestamp: $(Get-Date)" -ForegroundColor Cyan
Write-Host ""

# Configuration
$BACKUP_DIR = "backups/database"
$MEDIA_BACKUP_DIR = "backups/media"
$TIMESTAMP = Get-Date -Format "yyyyMMdd_HHmmss"
$BACKUP_FILE = "$BACKUP_DIR/car_dealership_$TIMESTAMP.sql"
$MEDIA_BACKUP_FILE = "$MEDIA_BACKUP_DIR/media_$TIMESTAMP.zip"
$RETENTION_DAYS = 30

# Create backup directories
New-Item -ItemType Directory -Force -Path $BACKUP_DIR | Out-Null
New-Item -ItemType Directory -Force -Path $MEDIA_BACKUP_DIR | Out-Null

# Check if database container is running
$container = docker ps --filter "name=car_dealership_db" --format "{{.Names}}"
if (-not $container) {
    Write-Host "[ERROR] Database container is not running" -ForegroundColor Red
    exit 1
}

# Perform database backup
Write-Host "[INFO] Creating database backup..." -ForegroundColor Yellow
docker exec car_dealership_db pg_dump -U postgres car_dealership > $BACKUP_FILE

if ($LASTEXITCODE -eq 0) {
    $fileInfo = Get-Item $BACKUP_FILE
    if ($fileInfo.Length -gt 0) {
        Write-Host "[SUCCESS] Database backup completed" -ForegroundColor Green
        Write-Host "Location: $BACKUP_FILE" -ForegroundColor Gray
        Write-Host "Size: $($fileInfo.Length) bytes" -ForegroundColor Gray
        Write-Host ""
        
        # Backup media files
        Write-Host "[INFO] Creating media files backup..." -ForegroundColor Yellow
        if (Test-Path "backend/media") {
            $mediaFiles = Get-ChildItem -Path "backend/media" -Recurse -File
            if ($mediaFiles.Count -gt 0) {
                Compress-Archive -Path "backend/media/*" -DestinationPath $MEDIA_BACKUP_FILE -Force
                $mediaInfo = Get-Item $MEDIA_BACKUP_FILE
                Write-Host "[SUCCESS] Media backup completed" -ForegroundColor Green
                Write-Host "Location: $MEDIA_BACKUP_FILE" -ForegroundColor Gray
                Write-Host "Size: $($mediaInfo.Length) bytes" -ForegroundColor Gray
                Write-Host "Files backed up: $($mediaFiles.Count)" -ForegroundColor Gray
            } else {
                Write-Host "[INFO] No media files found, skipping media backup" -ForegroundColor Yellow
            }
        } else {
            Write-Host "[WARNING] No media directory found, skipping media backup" -ForegroundColor Yellow
        }
        Write-Host ""
        
        # Clean up old backups
        Write-Host "[INFO] Cleaning up old backups (older than $RETENTION_DAYS days)..." -ForegroundColor Yellow
        $cutoffDate = (Get-Date).AddDays(-$RETENTION_DAYS)
        
        Get-ChildItem -Path $BACKUP_DIR -Filter "*.sql" | Where-Object { $_.LastWriteTime -lt $cutoffDate } | ForEach-Object {
            Remove-Item $_.FullName -Force
            Write-Host "  Deleted: $($_.Name)" -ForegroundColor Gray
        }
        
        Get-ChildItem -Path $MEDIA_BACKUP_DIR -Filter "*.zip" | Where-Object { $_.LastWriteTime -lt $cutoffDate } | ForEach-Object {
            Remove-Item $_.FullName -Force
            Write-Host "  Deleted: $($_.Name)" -ForegroundColor Gray
        }
        
        $dbCount = (Get-ChildItem -Path $BACKUP_DIR -Filter "*.sql").Count
        $mediaCount = (Get-ChildItem -Path $MEDIA_BACKUP_DIR -Filter "*.zip").Count
        Write-Host "[SUCCESS] Cleanup completed" -ForegroundColor Green
        Write-Host "Retained: $dbCount database backup(s), $mediaCount media backup(s)" -ForegroundColor Gray
        
        # Upload to AWS S3 if configured
        $awsKeyId = $env:AWS_ACCESS_KEY_ID
        $awsSecret = $env:AWS_SECRET_ACCESS_KEY
        $s3Bucket = $env:AWS_S3_BUCKET_NAME
        $awsRegion = $env:AWS_REGION
        
        if ($awsKeyId -and $awsSecret -and $s3Bucket) {
            Write-Host ""
            Write-Host "[INFO] Syncing backups to AWS S3..." -ForegroundColor Yellow
            
            # Check if AWS CLI is installed
            $awsInstalled = Get-Command aws -ErrorAction SilentlyContinue
            if ($awsInstalled) {
                # Configure AWS CLI
                aws configure set aws_access_key_id $awsKeyId 2>$null
                aws configure set aws_secret_access_key $awsSecret 2>$null
                aws configure set default.region $awsRegion 2>$null
                
                # Sync database backups
                Write-Host "  - Uploading database backup..." -ForegroundColor Gray
                aws s3 cp $BACKUP_FILE "s3://$s3Bucket/database/" 2>&1 | Out-Null
                
                if ($LASTEXITCODE -eq 0) {
                    Write-Host "  ✓ Database backup uploaded" -ForegroundColor Green
                    
                    # Sync media backups if exists
                    if (Test-Path $MEDIA_BACKUP_FILE) {
                        Write-Host "  - Uploading media backup..." -ForegroundColor Gray
                        aws s3 cp $MEDIA_BACKUP_FILE "s3://$s3Bucket/media/" 2>&1 | Out-Null
                        
                        if ($LASTEXITCODE -eq 0) {
                            Write-Host "  ✓ Media backup uploaded" -ForegroundColor Green
                        } else {
                            Write-Host "  ✗ Media backup upload failed" -ForegroundColor Yellow
                        }
                    }
                    
                    Write-Host "[SUCCESS] Cloud backup completed" -ForegroundColor Green
                    Write-Host "S3 Location: s3://$s3Bucket/" -ForegroundColor Gray
                } else {
                    Write-Host "[WARNING] Failed to upload to S3" -ForegroundColor Yellow
                    Write-Host "Local backup is safe in: $BACKUP_DIR" -ForegroundColor Gray
                }
            } else {
                Write-Host "[WARNING] AWS CLI not installed, skipping cloud backup" -ForegroundColor Yellow
                Write-Host "Install: https://awscli.amazonaws.com/AWSCLIV2.msi" -ForegroundColor Gray
            }
        } else {
            Write-Host ""
            Write-Host "[INFO] AWS S3 not configured, skipping cloud backup" -ForegroundColor Gray
            Write-Host "To enable: Add AWS credentials to .env file" -ForegroundColor Gray
        }
        
    } else {
        Write-Host "[ERROR] Backup file is empty" -ForegroundColor Red
        Remove-Item $BACKUP_FILE -Force
        exit 1
    }
} else {
    Write-Host "[ERROR] Backup failed" -ForegroundColor Red
    if (Test-Path $BACKUP_FILE) {
        Remove-Item $BACKUP_FILE -Force
    }
    exit 1
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "Backup Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
