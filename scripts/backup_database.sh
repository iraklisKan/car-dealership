#!/bin/bash
#######################################
# Production-Ready Database Backup Script
# Creates timestamped backups of PostgreSQL database
# Supports AWS S3 upload for cloud backup
# Usage: ./backup_database.sh
#######################################

set -e  # Exit on error
set -u  # Exit on undefined variable

# Load environment variables
if [ -f .env ]; then
    set -a
    source .env
    set +a
else
    echo "Error: .env file not found"
    exit 1
fi

# Configuration
BACKUP_DIR="backups/database"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="${BACKUP_DIR}/car_dealership_${TIMESTAMP}.sql"
RETENTION_DAYS=30
MIN_BACKUP_SIZE=1024  # Minimum size in bytes (1KB)

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1"
}

log_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

log_error() {
    echo -e "${RED}✗ $1${NC}"
}

log_info() {
    echo -e "${YELLOW}ℹ $1${NC}"
}

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  Car Dealership Database Backup${NC}"
echo -e "${BLUE}========================================${NC}"
log "Starting backup process..."

# Create backup directory if it doesn't exist
mkdir -p "${BACKUP_DIR}"

# Check if database container is running
log_info "Checking database container status..."
if ! docker ps | grep -q car_dealership_db; then
    log_error "Database container is not running"
    exit 1
fi
log_success "Database container is running"

# Perform backup
log_info "Creating database backup..."
if docker exec car_dealership_db pg_dump -U "${DB_USER}" "${DB_NAME}" > "${BACKUP_FILE}" 2>/dev/null; then
    log_success "Database dump completed"
else
    log_error "Database dump failed"
    rm -f "${BACKUP_FILE}"
    exit 1
fi

# Verify backup file
if [ ! -s "${BACKUP_FILE}" ]; then
    log_error "Backup file is empty"
    rm -f "${BACKUP_FILE}"
    exit 1
fi

BACKUP_SIZE_BYTES=$(stat -f%z "${BACKUP_FILE}" 2>/dev/null || stat -c%s "${BACKUP_FILE}" 2>/dev/null)
if [ "${BACKUP_SIZE_BYTES}" -lt "${MIN_BACKUP_SIZE}" ]; then
    log_error "Backup file too small (${BACKUP_SIZE_BYTES} bytes). Something went wrong."
    rm -f "${BACKUP_FILE}"
    exit 1
fi
log_success "Backup verification passed (${BACKUP_SIZE_BYTES} bytes)"

# Compress backup
log_info "Compressing backup..."
gzip "${BACKUP_FILE}"
BACKUP_FILE="${BACKUP_FILE}.gz"

BACKUP_SIZE=$(du -h "${BACKUP_FILE}" | cut -f1)
log_success "Backup compressed successfully"
log "Location: ${BACKUP_FILE}"
log "Size: ${BACKUP_SIZE}"

# Upload to AWS S3 (if configured)
if [ -n "${AWS_ACCESS_KEY_ID:-}" ] && [ -n "${AWS_SECRET_ACCESS_KEY:-}" ] && [ -n "${AWS_S3_BUCKET_NAME:-}" ]; then
    log_info "AWS S3 credentials detected. Uploading to cloud..."
    
    # Check if AWS CLI is installed
    if command -v aws &> /dev/null; then
        S3_PATH="s3://${AWS_S3_BUCKET_NAME}/database/$(basename ${BACKUP_FILE})"
        
        if AWS_ACCESS_KEY_ID="${AWS_ACCESS_KEY_ID}" \
           AWS_SECRET_ACCESS_KEY="${AWS_SECRET_ACCESS_KEY}" \
           AWS_DEFAULT_REGION="${AWS_REGION:-us-east-1}" \
           aws s3 cp "${BACKUP_FILE}" "${S3_PATH}" --quiet; then
            log_success "Backup uploaded to S3: ${S3_PATH}"
        else
            log_error "S3 upload failed (backup saved locally)"
        fi
    else
        log_info "AWS CLI not installed. Skipping S3 upload."
        log_info "Install with: sudo apt-get install awscli"
    fi
else
    log_info "AWS S3 not configured. Backup saved locally only."
fi

# Clean up old backups (older than RETENTION_DAYS)
log_info "Cleaning up old backups (older than ${RETENTION_DAYS} days)..."
DELETED_COUNT=$(find "${BACKUP_DIR}" -name "*.sql.gz" -mtime +${RETENTION_DAYS} -delete -print | wc -l)
if [ "${DELETED_COUNT}" -gt 0 ]; then
    log_success "Deleted ${DELETED_COUNT} old backup(s)"
else
    log_info "No old backups to delete"
fi

REMAINING_BACKUPS=$(ls -1 "${BACKUP_DIR}" | wc -l)
log "Total backups retained: ${REMAINING_BACKUPS}"

echo -e "${BLUE}========================================${NC}"
log_success "Backup process completed successfully!"
echo -e "${BLUE}========================================${NC}"
