@echo off
REM ##########################################
REM Database Backup Script (Windows)
REM Creates timestamped backups of PostgreSQL database
REM Usage: backup_database.bat
REM ##########################################

setlocal enabledelayedexpansion

REM Load environment variables from .env file
if exist .env (
    for /f "usebackq tokens=1,2 delims==" %%a in (".env") do (
        if not "%%b"=="" (
            set "%%a=%%b"
        )
    )
) else (
    echo [ERROR] .env file not found
    exit /b 1
)

REM Configuration
set BACKUP_DIR=backups\database
set MEDIA_BACKUP_DIR=backups\media
set TIMESTAMP=%date:~10,4%%date:~4,2%%date:~7,2%_%time:~0,2%%time:~3,2%%time:~6,2%
set TIMESTAMP=%TIMESTAMP: =0%
set BACKUP_FILE=%BACKUP_DIR%\car_dealership_%TIMESTAMP%.sql
set MEDIA_BACKUP_FILE=%MEDIA_BACKUP_DIR%\media_%TIMESTAMP%.zip
set RETENTION_DAYS=30

echo ========================================
echo Car Dealership Full Backup
echo ========================================
echo Timestamp: %date% %time%
echo.

REM Create backup directories if they don't exist
if not exist "%BACKUP_DIR%" mkdir "%BACKUP_DIR%"
if not exist "%MEDIA_BACKUP_DIR%" mkdir "%MEDIA_BACKUP_DIR%"

REM Check if database container is running
docker ps | findstr "car_dealership_db" >nul
if errorlevel 1 (
    echo [ERROR] Database container is not running
    exit /b 1
)

REM Perform database backup
echo [INFO] Creating database backup...
docker exec car_dealership_db pg_dump -U "%DB_USER%" "%DB_NAME%" > "%BACKUP_FILE%"

REM Check if database backup was successful
if %errorlevel% equ 0 (
    REM Get file size
    for %%A in ("%BACKUP_FILE%") do set BACKUP_SIZE=%%~zA
    
    if !BACKUP_SIZE! gtr 0 (
        echo [SUCCESS] Database backup completed
        echo Location: %BACKUP_FILE%
        echo Size: !BACKUP_SIZE! bytes
        echo.
        
        REM Backup media files
        echo [INFO] Creating media files backup...
        if exist "backend\media" (
            powershell -Command "Compress-Archive -Path 'backend\media\*' -DestinationPath '%MEDIA_BACKUP_FILE%' -Force"
            if exist "%MEDIA_BACKUP_FILE%" (
                for %%A in ("%MEDIA_BACKUP_FILE%") do set MEDIA_SIZE=%%~zA
                echo [SUCCESS] Media backup completed
                echo Location: %MEDIA_BACKUP_FILE%
                echo Size: !MEDIA_SIZE! bytes
            ) else (
                echo [WARNING] Media backup failed or no media files found
            )
        ) else (
            echo [WARNING] No media directory found, skipping media backup
        )
        echo.
        
        REM Clean up old backups (older than RETENTION_DAYS)
        echo [INFO] Cleaning up old backups (older than %RETENTION_DAYS% days)...
        forfiles /p "%BACKUP_DIR%" /s /m *.sql /d -%RETENTION_DAYS% /c "cmd /c del @path" 2>nul
        forfiles /p "%MEDIA_BACKUP_DIR%" /s /m *.zip /d -%RETENTION_DAYS% /c "cmd /c del @path" 2>nul
        
        REM Count remaining backups
        set COUNT=0
        for %%f in (%BACKUP_DIR%\*.sql) do set /a COUNT+=1
        echo [SUCCESS] Cleanup completed. !COUNT! database backup(s) retained
    ) else (
        echo [ERROR] Backup file is empty
        del "%BACKUP_FILE%"
        exit /b 1
    )
) else (
    echo [ERROR] Backup failed
    if exist "%BACKUP_FILE%" del "%BACKUP_FILE%"
    exit /b 1
)

echo.
echo ========================================
echo Backup Complete
echo ========================================
endlocal
