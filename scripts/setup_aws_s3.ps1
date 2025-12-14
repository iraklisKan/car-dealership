# AWS S3 Setup and Test Script
# Run this after creating AWS account and S3 bucket

$ErrorActionPreference = "Stop"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "AWS S3 Backup Setup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if AWS CLI is installed
$awsInstalled = Get-Command aws -ErrorAction SilentlyContinue
if (-not $awsInstalled) {
    Write-Host "[INFO] AWS CLI not found. Installing..." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Please install AWS CLI manually:" -ForegroundColor Yellow
    Write-Host "1. Download: https://awscli.amazonaws.com/AWSCLIV2.msi" -ForegroundColor White
    Write-Host "2. Run installer" -ForegroundColor White
    Write-Host "3. Restart PowerShell" -ForegroundColor White
    Write-Host "4. Run this script again" -ForegroundColor White
    Write-Host ""
    exit 1
}

Write-Host "[SUCCESS] AWS CLI is installed" -ForegroundColor Green
Write-Host "Version: $(aws --version)" -ForegroundColor Gray
Write-Host ""

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

# Check if credentials are configured
$awsKeyId = $env:AWS_ACCESS_KEY_ID
$awsSecret = $env:AWS_SECRET_ACCESS_KEY
$s3Bucket = $env:AWS_S3_BUCKET_NAME
$awsRegion = $env:AWS_REGION

if (-not $awsKeyId -or -not $awsSecret -or -not $s3Bucket) {
    Write-Host "[ERROR] AWS credentials not configured in .env file" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please add to your .env file:" -ForegroundColor Yellow
    Write-Host "AWS_ACCESS_KEY_ID=your_access_key_here" -ForegroundColor White
    Write-Host "AWS_SECRET_ACCESS_KEY=your_secret_key_here" -ForegroundColor White
    Write-Host "AWS_S3_BUCKET_NAME=your-bucket-name" -ForegroundColor White
    Write-Host "AWS_REGION=eu-central-1" -ForegroundColor White
    Write-Host ""
    exit 1
}

Write-Host "[INFO] Configuring AWS CLI..." -ForegroundColor Yellow
aws configure set aws_access_key_id $awsKeyId
aws configure set aws_secret_access_key $awsSecret
aws configure set default.region $awsRegion
aws configure set default.output json

Write-Host "[SUCCESS] AWS CLI configured" -ForegroundColor Green
Write-Host ""

# Test connection
Write-Host "[INFO] Testing connection to AWS..." -ForegroundColor Yellow
try {
    $identity = aws sts get-caller-identity 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "[SUCCESS] Successfully authenticated with AWS" -ForegroundColor Green
        Write-Host ""
    } else {
        Write-Host "[ERROR] Failed to authenticate with AWS" -ForegroundColor Red
        Write-Host $identity -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "[ERROR] Failed to connect to AWS: $_" -ForegroundColor Red
    exit 1
}

# Test S3 bucket access
Write-Host "[INFO] Testing S3 bucket access: $s3Bucket" -ForegroundColor Yellow
try {
    $bucketTest = aws s3 ls "s3://$s3Bucket" 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "[SUCCESS] Successfully accessed S3 bucket" -ForegroundColor Green
        Write-Host ""
    } else {
        Write-Host "[ERROR] Cannot access S3 bucket: $s3Bucket" -ForegroundColor Red
        Write-Host $bucketTest -ForegroundColor Red
        Write-Host ""
        Write-Host "Make sure:" -ForegroundColor Yellow
        Write-Host "1. Bucket exists in AWS Console" -ForegroundColor White
        Write-Host "2. Bucket name is correct in .env" -ForegroundColor White
        Write-Host "3. IAM user has S3 permissions" -ForegroundColor White
        exit 1
    }
} catch {
    Write-Host "[ERROR] Failed to access S3 bucket: $_" -ForegroundColor Red
    exit 1
}

# Create test file and upload
Write-Host "[INFO] Creating test backup file..." -ForegroundColor Yellow
$testFile = "test_backup_$(Get-Date -Format 'yyyyMMdd_HHmmss').txt"
"Test backup created at $(Get-Date)" | Out-File -FilePath $testFile

Write-Host "[INFO] Uploading test file to S3..." -ForegroundColor Yellow
aws s3 cp $testFile "s3://$s3Bucket/test/$testFile"

if ($LASTEXITCODE -eq 0) {
    Write-Host "[SUCCESS] Test file uploaded successfully!" -ForegroundColor Green
    Write-Host ""
    
    # Clean up test file
    Remove-Item $testFile -Force
    Write-Host "[INFO] Removing test file from S3..." -ForegroundColor Yellow
    aws s3 rm "s3://$s3Bucket/test/$testFile"
    
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "AWS S3 Setup Complete!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Your backups will now sync to:" -ForegroundColor White
    Write-Host "  Bucket: $s3Bucket" -ForegroundColor Cyan
    Write-Host "  Region: $awsRegion" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Yellow
    Write-Host "1. Run backup script: .\scripts\backup_full.ps1" -ForegroundColor White
    Write-Host "2. Verify in AWS Console: https://s3.console.aws.amazon.com/s3/buckets/$s3Bucket" -ForegroundColor White
    Write-Host ""
} else {
    Write-Host "[ERROR] Failed to upload test file" -ForegroundColor Red
    Remove-Item $testFile -Force -ErrorAction SilentlyContinue
    exit 1
}
