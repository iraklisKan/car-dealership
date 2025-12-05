#!/bin/bash
#######################################
# Database Backup Script
# Creates timestamped backups of PostgreSQL database
# Usage: ./backup_database.sh
#######################################

# Load environment variables
set -a
source .env
set +a

# Configuration
BACKUP_DIR="backups/database"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="${BACKUP_DIR}/car_dealership_${TIMESTAMP}.sql"
RETENTION_DAYS=30

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== Car Dealership Database Backup ===${NC}"
echo "Timestamp: $(date)"

# Create backup directory if it doesn't exist
mkdir -p "${BACKUP_DIR}"

# Check if database container is running
if ! docker ps | grep -q car_dealership_db; then
    echo -e "${RED}Error: Database container is not running${NC}"
    exit 1
fi

# Perform backup
echo -e "${YELLOW}Creating backup...${NC}"
docker exec car_dealership_db pg_dump -U "${DB_USER}" "${DB_NAME}" > "${BACKUP_FILE}"

# Check if backup was successful
if [ $? -eq 0 ] && [ -s "${BACKUP_FILE}" ]; then
    # Compress backup
    echo -e "${YELLOW}Compressing backup...${NC}"
    gzip "${BACKUP_FILE}"
    BACKUP_FILE="${BACKUP_FILE}.gz"
    
    BACKUP_SIZE=$(du -h "${BACKUP_FILE}" | cut -f1)
    echo -e "${GREEN}✓ Backup completed successfully${NC}"
    echo "Location: ${BACKUP_FILE}"
    echo "Size: ${BACKUP_SIZE}"
    
    # Clean up old backups (older than RETENTION_DAYS)
    echo -e "${YELLOW}Cleaning up old backups (older than ${RETENTION_DAYS} days)...${NC}"
    find "${BACKUP_DIR}" -name "*.sql.gz" -mtime +${RETENTION_DAYS} -delete
    
    REMAINING_BACKUPS=$(ls -1 "${BACKUP_DIR}" | wc -l)
    echo -e "${GREEN}✓ Cleanup completed. ${REMAINING_BACKUPS} backup(s) retained${NC}"
else
    echo -e "${RED}✗ Backup failed${NC}"
    rm -f "${BACKUP_FILE}"
    exit 1
fi

echo -e "${GREEN}=== Backup Complete ===${NC}"
