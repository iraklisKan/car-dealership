@echo off
REM ##########################################
REM Database Backup Script (Windows)
REM Creates timestamped backups of PostgreSQL database
REM Usage: backup_database.bat
REM ##########################################

setlocal enabledelayedexpansion

REM Load environment variables from .env file
for /f "tokens=1,2 delims==" %%a in (.env) do (
    if not "%%b"=="" set %%a=%%b
)

REM Configuration
set BACKUP_DIR=backups\database
set TIMESTAMP=%date:~10,4%%date:~4,2%%date:~7,2%_%time:~0,2%%time:~3,2%%time:~6,2%
set TIMESTAMP=%TIMESTAMP: =0%
set BACKUP_FILE=%BACKUP_DIR%\car_dealership_%TIMESTAMP%.sql
set RETENTION_DAYS=30

echo ========================================
echo Car Dealership Database Backup
echo ========================================
echo Timestamp: %date% %time%
echo.

REM Create backup directory if it doesn't exist
if not exist "%BACKUP_DIR%" mkdir "%BACKUP_DIR%"

REM Check if database container is running
docker ps | findstr "car_dealership_db" >nul
if errorlevel 1 (
    echo [ERROR] Database container is not running
    exit /b 1
)

REM Perform backup
echo [INFO] Creating backup...
docker exec car_dealership_db pg_dump -U %DB_USER% %DB_NAME% > "%BACKUP_FILE%"

REM Check if backup was successful
if %errorlevel% equ 0 (
    REM Get file size
    for %%A in ("%BACKUP_FILE%") do set BACKUP_SIZE=%%~zA
    
    if !BACKUP_SIZE! gtr 0 (
        echo [SUCCESS] Backup completed successfully
        echo Location: %BACKUP_FILE%
        echo Size: !BACKUP_SIZE! bytes
        echo.
        
        REM Clean up old backups (older than RETENTION_DAYS)
        echo [INFO] Cleaning up old backups (older than %RETENTION_DAYS% days)...
        forfiles /p "%BACKUP_DIR%" /s /m *.sql /d -%RETENTION_DAYS% /c "cmd /c del @path" 2>nul
        
        REM Count remaining backups
        set COUNT=0
        for %%f in (%BACKUP_DIR%\*.sql) do set /a COUNT+=1
        echo [SUCCESS] Cleanup completed. !COUNT! backup(s) retained
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
