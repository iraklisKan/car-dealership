@echo off
REM ##########################################
REM Production Deployment Script (Windows)
REM Updates and restarts the application
REM Usage: deploy.bat
REM ##########################################

setlocal

echo ========================================
echo Car Dealership - Production Deployment
echo ========================================
echo Timestamp: %date% %time%
echo.

REM Step 1: Pull latest code
echo [1/6] Pulling latest code from Git...
git pull origin main
if errorlevel 1 (
    echo [ERROR] Git pull failed
    exit /b 1
)
echo [SUCCESS] Code updated
echo.

REM Step 2: Backup database before deployment
echo [2/6] Creating pre-deployment database backup...
call scripts\backup_database.bat
if errorlevel 1 (
    echo [WARNING] Backup failed - Continue anyway? (Ctrl+C to cancel)
    pause
)
echo.

REM Step 3: Stop containers
echo [3/6] Stopping containers...
docker-compose down
echo [SUCCESS] Containers stopped
echo.

REM Step 4: Rebuild containers
echo [4/6] Rebuilding containers...
docker-compose build --no-cache backend frontend
if errorlevel 1 (
    echo [ERROR] Build failed
    exit /b 1
)
echo [SUCCESS] Containers rebuilt
echo.

REM Step 5: Start containers
echo [5/6] Starting containers...
docker-compose up -d
if errorlevel 1 (
    echo [ERROR] Failed to start containers
    exit /b 1
)
echo [SUCCESS] Containers started
echo.

REM Step 6: Run migrations
echo [6/6] Running database migrations...
timeout /t 10 /nobreak >nul
docker-compose exec -T backend python manage.py migrate
if errorlevel 1 (
    echo [ERROR] Migrations failed
    exit /b 1
)
echo [SUCCESS] Migrations completed
echo.

REM Step 7: Collect static files (production only)
echo [OPTIONAL] Collecting static files...
docker-compose exec -T backend python manage.py collectstatic --noinput
echo.

REM Health check
echo ========================================
echo Verifying deployment...
echo ========================================
timeout /t 5 /nobreak >nul

docker-compose ps

echo.
echo Testing health endpoint...
curl -s http://localhost:8000/health/ || echo [WARNING] Health check endpoint not responding

echo.
echo ========================================
echo Deployment Complete!
echo ========================================
echo Frontend: http://localhost:3000
echo API: http://localhost:8000/api/
echo Admin: http://localhost:8000/secure-admin/
echo Health: http://localhost:8000/health/
echo ========================================

endlocal
