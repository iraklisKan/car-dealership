#!/bin/bash
#######################################
# Production Deployment Script (Linux/Mac)
# Updates and restarts the application
# Usage: ./deploy.sh
#######################################

set -e  # Exit on error

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Car Dealership - Production Deployment${NC}"
echo -e "${BLUE}========================================${NC}"
echo "Timestamp: $(date)"
echo ""

# Step 1: Pull latest code
echo -e "${YELLOW}[1/6] Pulling latest code from Git...${NC}"
git pull origin main
echo -e "${GREEN}✓ Code updated${NC}"
echo ""

# Step 2: Backup database
echo -e "${YELLOW}[2/6] Creating pre-deployment database backup...${NC}"
./scripts/backup_database.sh || {
    echo -e "${RED}WARNING: Backup failed${NC}"
    read -p "Continue anyway? (yes/no): " CONTINUE
    if [ "$CONTINUE" != "yes" ]; then
        echo "Deployment cancelled"
        exit 1
    fi
}
echo ""

# Step 3: Stop containers
echo -e "${YELLOW}[3/6] Stopping containers...${NC}"
docker-compose down
echo -e "${GREEN}✓ Containers stopped${NC}"
echo ""

# Step 4: Rebuild containers
echo -e "${YELLOW}[4/6] Rebuilding containers...${NC}"
docker-compose build --no-cache backend frontend
echo -e "${GREEN}✓ Containers rebuilt${NC}"
echo ""

# Step 5: Start containers
echo -e "${YELLOW}[5/6] Starting containers...${NC}"
docker-compose up -d
echo -e "${GREEN}✓ Containers started${NC}"
echo ""

# Step 6: Run migrations
echo -e "${YELLOW}[6/6] Running database migrations...${NC}"
sleep 10  # Wait for database to be ready
docker-compose exec -T backend python manage.py migrate
echo -e "${GREEN}✓ Migrations completed${NC}"
echo ""

# Step 7: Collect static files
echo -e "${YELLOW}[OPTIONAL] Collecting static files...${NC}"
docker-compose exec -T backend python manage.py collectstatic --noinput
echo ""

# Health check
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Verifying deployment...${NC}"
echo -e "${BLUE}========================================${NC}"
sleep 5

docker-compose ps

echo ""
echo "Testing health endpoint..."
curl -s http://localhost:8000/health/ | python3 -m json.tool || echo -e "${RED}WARNING: Health check endpoint not responding${NC}"

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Deployment Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo "Frontend: http://localhost:3000"
echo "API: http://localhost:8000/api/"
echo "Admin: http://localhost:8000/secure-admin/"
echo "Health: http://localhost:8000/health/"
echo -e "${GREEN}========================================${NC}"
