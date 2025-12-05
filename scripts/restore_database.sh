#!/bin/bash
#######################################
# Database Restore Script (Linux/Mac)
# Restores database from backup file
# Usage: ./restore_database.sh <backup_file>
#######################################

# Load environment variables
set -a
source .env
set +a

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== Car Dealership Database Restore ===${NC}"

# Check if backup file is provided
if [ -z "$1" ]; then
    echo -e "${RED}Error: No backup file specified${NC}"
    echo ""
    echo "Usage: ./restore_database.sh <backup_file>"
    echo "Example: ./restore_database.sh backups/database/car_dealership_20251205_030000.sql.gz"
    echo ""
    echo "Available backups:"
    ls -lh backups/database/*.sql.gz 2>/dev/null || echo "No backups found"
    exit 1
fi

BACKUP_FILE="$1"

# Check if backup file exists
if [ ! -f "$BACKUP_FILE" ]; then
    echo -e "${RED}Error: Backup file not found: $BACKUP_FILE${NC}"
    exit 1
fi

# Warning prompt
echo -e "${YELLOW}WARNING: This will REPLACE the current database with the backup!${NC}"
echo "Backup file: $BACKUP_FILE"
echo "Database: $DB_NAME"
echo ""
read -p "Type 'yes' to continue: " CONFIRM

if [ "$CONFIRM" != "yes" ]; then
    echo -e "${YELLOW}Restore cancelled${NC}"
    exit 0
fi

# Check if database container is running
if ! docker ps | grep -q car_dealership_db; then
    echo -e "${RED}Error: Database container is not running${NC}"
    echo "Run: docker-compose up -d db"
    exit 1
fi

echo ""
echo -e "${YELLOW}Stopping backend container to prevent connections...${NC}"
docker-compose stop backend

echo -e "${YELLOW}Dropping existing database...${NC}"
docker exec car_dealership_db psql -U "${DB_USER}" -c "DROP DATABASE IF EXISTS ${DB_NAME};"

echo -e "${YELLOW}Creating fresh database...${NC}"
docker exec car_dealership_db psql -U "${DB_USER}" -c "CREATE DATABASE ${DB_NAME};"

echo -e "${YELLOW}Restoring database from backup...${NC}"

# Check if backup is compressed
if [[ "$BACKUP_FILE" == *.gz ]]; then
    gunzip -c "$BACKUP_FILE" | docker exec -i car_dealership_db psql -U "${DB_USER}" "${DB_NAME}"
else
    cat "$BACKUP_FILE" | docker exec -i car_dealership_db psql -U "${DB_USER}" "${DB_NAME}"
fi

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✓ Database restored successfully!${NC}"
    echo ""
    echo -e "${YELLOW}Starting backend container...${NC}"
    docker-compose start backend
    echo ""
    echo -e "${GREEN}✓ Restore complete!${NC}"
    echo "Database is now restored from: $BACKUP_FILE"
else
    echo ""
    echo -e "${RED}✗ Restore failed!${NC}"
    echo -e "${YELLOW}Starting backend container...${NC}"
    docker-compose start backend
    exit 1
fi
