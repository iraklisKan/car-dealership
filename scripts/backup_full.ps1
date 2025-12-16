# Production-Ready Full Backup Script (Database + Media)
# Usage: .\scripts\backup_full.ps1

$ErrorActionPreference = "Stop"
$MIN_BACKUP_SIZE = 1024  # Minimum backup size in bytes (1KB)

# Logging function
function Write-Log {
    param($Message, $Color = "White")
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    Write-Host "[$timestamp] $Message" -ForegroundColor $Color
}

function Write-Success {
    param($Message)
    Write-Log "✓ $Message" -Color Green
}

function Write-Error-Log {
    param($Message)
    Write-Log "✗ $Message" -Color Red
}

function Write-Info {
    param($Message)
    Write-Log "ℹ $Message" -Color Yellow
}

# Load environment variables
if (-not (Test-Path ".env")) {
    Write-Error-Log ".env file not found"
    exit 1
}

Get-Content ".env" | ForEach-Object {
    if ($_ -match '^\s*([^#][^=]*?)\s*=\s*(.*)$') {
        $name = $matches[1].Trim()
        $value = $matches[2].Trim()
        [Environment]::SetEnvironmentVariable($name, $value, "Process")
    }
}

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Car Dealership Full Backup (Production)" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Log "Starting backup process..."

# Configuration
$BACKUP_DIR = "backups/database"
$MEDIA_BACKUP_DIR = "backups/media"
$TIMESTAMP = Get-Date -Format "yyyyMMdd_HHmmss"
$BACKUP_FILE = "$BACKUP_DIR/car_dealership_$TIMESTAMP.sql"
$MEDIA_BACKUP_FILE = "$MEDIA_BACKUP_DIR/media_$TIMESTAMP.zip"
$RETENTION_DAYS = 30

# Get environment variables
$DB_USER = $env:DB_USER
$DB_NAME = $env:DB_NAME

if (-not $DB_USER -or -not $DB_NAME) {
    Write-Error-Log "DB_USER or DB_NAME not set in .env"
    exit 1
}

# Create backup directories
New-Item -ItemType Directory -Force -Path $BACKUP_DIR | Out-Null
New-Item -ItemType Directory -Force -Path $MEDIA_BACKUP_DIR | Out-Null

# Check if database container is running
Write-Info "Checking database container status..."
$container = docker ps --filter "name=car_dealership_db" --format "{{.Names}}"
if (-not $container) {
    Write-Error-Log "Database container is not running"
    exit 1
}
Write-Success "Database container is running"

# Perform database backup
Write-Info "Creating database backup..."
docker exec car_dealership_db pg_dump -U $DB_USER $DB_NAME > $BACKUP_FILE 2>&1

if ($LASTEXITCODE -ne 0) {
    Write-Error-Log "Database dump failed"
    if (Test-Path $BACKUP_FILE) {
        Remove-Item $BACKUP_FILE -Force
    }
    exit 1
}

# Verify backup
$fileInfo = Get-Item $BACKUP_FILE
if ($fileInfo.Length -lt $MIN_BACKUP_SIZE) {
    Write-Error-Log "Backup file too small ($($fileInfo.Length) bytes). Something went wrong."
    Remove-Item $BACKUP_FILE -Force
    exit 1
}

Write-Success "Database backup completed"
Write-Log "Location: $BACKUP_FILE"
Write-Log "Size: $($fileInfo.Length) bytes"
Write-Host ""

# Backup media files
Write-Info "Creating media files backup..."
if (Test-Path "backend/media") {
    $mediaFiles = Get-ChildItem -Path "backend/media" -Recurse -File
    if ($mediaFiles.Count -gt 0) {
        Compress-Archive -Path "backend/media/*" -DestinationPath $MEDIA_BACKUP_FILE -Force
        $mediaInfo = Get-Item $MEDIA_BACKUP_FILE
        Write-Success "Media backup completed"
        Write-Log "Location: $MEDIA_BACKUP_FILE"
        Write-Log "Size: $($mediaInfo.Length) bytes"
        Write-Log "Files backed up: $($mediaFiles.Count)"
    } else {
        Write-Info "No media files found, skipping media backup"
    }
} else {
    Write-Info "No media directory found, skipping media backup"
}
Write-Host ""

# Upload to AWS S3 if configured
$awsKeyId = $env:AWS_ACCESS_KEY_ID
$awsSecret = $env:AWS_SECRET_ACCESS_KEY
$s3Bucket = $env:AWS_S3_BUCKET_NAME
$awsRegion = if ($env:AWS_REGION) { $env:AWS_REGION } else { "us-east-1" }

if ($awsKeyId -and $awsSecret -and $s3Bucket) {
    Write-Info "AWS S3 credentials detected. Uploading to cloud..."
    
    # Check if AWS CLI is installed
    $awsInstalled = Get-Command aws -ErrorAction SilentlyContinue
    if ($awsInstalled) {
        # Set AWS environment variables for this session
        $env:AWS_ACCESS_KEY_ID = $awsKeyId
        $env:AWS_SECRET_ACCESS_KEY = $awsSecret
        $env:AWS_DEFAULT_REGION = $awsRegion
        
        # Upload database backup
        Write-Host "  - Uploading database backup..." -ForegroundColor Gray
        $s3DbPath = "s3://$s3Bucket/database/$(Split-Path $BACKUP_FILE -Leaf)"
        aws s3 cp $BACKUP_FILE $s3DbPath --quiet 2>&1 | Out-Null
        
        if ($LASTEXITCODE -eq 0) {
            Write-Success "Database backup uploaded to S3: $s3DbPath"
            
            # Upload media backup if exists
            if (Test-Path $MEDIA_BACKUP_FILE) {
                Write-Host "  - Uploading media backup..." -ForegroundColor Gray
                $s3MediaPath = "s3://$s3Bucket/media/$(Split-Path $MEDIA_BACKUP_FILE -Leaf)"
                aws s3 cp $MEDIA_BACKUP_FILE $s3MediaPath --quiet 2>&1 | Out-Null
                
                if ($LASTEXITCODE -eq 0) {
                    Write-Success "Media backup uploaded to S3: $s3MediaPath"
                } else {
                    Write-Info "Media backup upload failed (saved locally)"
                }
            }
        } else {
            Write-Info "S3 upload failed (backup saved locally)"
        }
    } else {
        Write-Info "AWS CLI not installed. Skipping S3 upload."
        Write-Log "Install from: https://awscli.amazonaws.com/AWSCLIV2.msi"
    }
} else {
    Write-Info "AWS S3 not configured. Backup saved locally only."
}
Write-Host ""

# Clean up old backups
Write-Info "Cleaning up old backups (older than $RETENTION_DAYS days)..."
$cutoffDate = (Get-Date).AddDays(-$RETENTION_DAYS)

$dbDeleted = 0
Get-ChildItem -Path $BACKUP_DIR -Filter "*.sql" | Where-Object { $_.LastWriteTime -lt $cutoffDate } | ForEach-Object {
    Remove-Item $_.FullName -Force
    $dbDeleted++
}

$mediaDeleted = 0
Get-ChildItem -Path $MEDIA_BACKUP_DIR -Filter "*.zip" | Where-Object { $_.LastWriteTime -lt $cutoffDate } | ForEach-Object {
    Remove-Item $_.FullName -Force
    $mediaDeleted++
}

if ($dbDeleted -gt 0 -or $mediaDeleted -gt 0) {
    Write-Success "Deleted $dbDeleted database backup(s) and $mediaDeleted media backup(s)"
} else {
    Write-Info "No old backups to delete"
}

$dbCount = (Get-ChildItem -Path $BACKUP_DIR -Filter "*.sql").Count
$mediaCount = (Get-ChildItem -Path $MEDIA_BACKUP_DIR -Filter "*.zip").Count
Write-Log "Total backups retained: $dbCount database, $mediaCount media"

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Success "Backup process completed successfully!"
Write-Host "========================================" -ForegroundColor Green
