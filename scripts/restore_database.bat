@echo off
REM ##########################################
REM Database Restore Script (Windows)
REM Restores database from backup file
REM Usage: restore_database.bat <backup_file>
REM ##########################################

setlocal enabledelayedexpansion

REM Load environment variables from .env file
for /f "tokens=1,2 delims==" %%a in (.env) do (
    if not "%%b"=="" set %%a=%%b
)

echo ========================================
echo Car Dealership Full Restore
echo ========================================
echo.

REM Check if backup file is provided
if "%~1"=="" (
    echo [ERROR] No backup file specified
    echo.
    echo Usage: restore_database.bat ^<backup_file^> [media_backup_file]
    echo Example: restore_database.bat backups\database\car_dealership_20251205_030000.sql backups\media\media_20251205_030000.zip
    echo.
    echo Available database backups:
    dir /b backups\database\*.sql 2>nul
    echo.
    echo Available media backups:
    dir /b backups\media\*.zip 2>nul
    exit /b 1
)

set BACKUP_FILE=%~1

REM Check if backup file exists
if not exist "%BACKUP_FILE%" (
    echo [ERROR] Backup file not found: %BACKUP_FILE%
    exit /b 1
)

REM Warning prompt
echo [WARNING] This will REPLACE the current database with the backup!
echo Backup file: %BACKUP_FILE%
echo Database: %DB_NAME%
echo.
set /p CONFIRM="Type 'yes' to continue: "

if /i not "%CONFIRM%"=="yes" (
    echo [CANCELLED] Restore cancelled by user
    exit /b 0
)

REM Check if database container is running
docker ps | findstr "car_dealership_db" >nul
if errorlevel 1 (
    echo [ERROR] Database container is not running
    echo Run: docker-compose up -d db
    exit /b 1
)

echo.
echo [INFO] Stopping backend container to prevent connections...
docker-compose stop backend

echo [INFO] Dropping existing database...
docker exec car_dealership_db psql -U %DB_USER% -c "DROP DATABASE IF EXISTS %DB_NAME%;"

echo [INFO] Creating fresh database...
docker exec car_dealership_db psql -U %DB_USER% -c "CREATE DATABASE %DB_NAME%;"

echo [INFO] Restoring database from backup...
type "%BACKUP_FILE%" | docker exec -i car_dealership_db psql -U %DB_USER% %DB_NAME%

if %errorlevel% equ 0 (
    echo.
    echo [SUCCESS] Database restored successfully!
    
    REM Restore media files if provided
    if not "%~2"=="" (
        set MEDIA_BACKUP_FILE=%~2
        if exist "!MEDIA_BACKUP_FILE!" (
            echo.
            echo [INFO] Restoring media files...
            if exist "backend\media" rmdir /s /q "backend\media"
            mkdir "backend\media"
            powershell -Command "Expand-Archive -Path '!MEDIA_BACKUP_FILE!' -DestinationPath 'backend\media' -Force"
            echo [SUCCESS] Media files restored
        ) else (
            echo [WARNING] Media backup file not found: !MEDIA_BACKUP_FILE!
        )
    ) else (
        echo [INFO] No media backup specified, skipping media restore
    )
    
    echo.
    echo [INFO] Starting backend container...
    docker-compose start backend
    echo.
    echo [SUCCESS] Restore complete!
    echo Database restored from: %BACKUP_FILE%
) else (
    echo.
    echo [ERROR] Restore failed!
    echo [INFO] Starting backend container...
    docker-compose start backend
    exit /b 1
)

endlocal
