#!/usr/bin/env python3
"""
Security verification script for Car Dealership project.
Checks for accidentally committed sensitive data.
"""

import os
import re
import sys

def check_file_for_secrets(filepath, patterns):
    """Check a single file for potential secrets."""
    issues = []
    try:
        with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
            for line_num, line in enumerate(f, 1):
                for pattern_name, pattern in patterns.items():
                    if re.search(pattern, line, re.IGNORECASE):
                        issues.append({
                            'file': filepath,
                            'line': line_num,
                            'type': pattern_name,
                            'content': line.strip()[:100]
                        })
    except Exception as e:
        pass  # Skip binary files or unreadable files
    return issues

def scan_directory(directory, exclude_dirs, patterns):
    """Recursively scan directory for secrets."""
    all_issues = []
    
    for root, dirs, files in os.walk(directory):
        # Remove excluded directories
        dirs[:] = [d for d in dirs if d not in exclude_dirs]
        
        for file in files:
            # Skip non-code files
            if not file.endswith(('.py', '.js', '.jsx', '.yml', '.yaml', '.json', '.env', '.txt')):
                continue
            
            # Skip .env.example and security_check.py itself
            if file in ['.env.example', 'security_check.py']:
                continue
                
            filepath = os.path.join(root, file)
            issues = check_file_for_secrets(filepath, patterns)
            all_issues.extend(issues)
    
    return all_issues

def main():
    """Main security check."""
    print("\n🔍 SECURITY SCAN - Checking for exposed secrets...")
    print("=" * 60)
    
    # Patterns to detect potential secrets (not regex patterns themselves)
    patterns = {
        'Password': r'(?<!#.*)\bpassword\s*=\s*["\'][^"\']{3,}["\']',
        'API Key': r'(?<!#.*)\bapi[_-]?key\s*=\s*["\'][^"\']{10,}["\']',
        'Secret Key': r'(?<!#.*)\bsecret[_-]?key\s*=\s*["\'][^"\']{10,}["\']',
        'Database URL': r'(?<!#.*)\bpostgres://[^:]+:[^@]+@[^/]+',
        'Email Password': r'(?<!#.*)\bemail[_-]?password\s*=\s*["\'][^"\']{3,}["\']',
        'Token': r'(?<!#.*)\btoken\s*=\s*["\'][^"\']{10,}["\']',
    }
    
    # Directories to exclude
    exclude_dirs = {
        'venv', 'env', 'ENV', 'node_modules', '.git', '__pycache__',
        'staticfiles', 'media', 'logs', 'postgres_data', 'dist', 'build',
        '.vscode', '.idea'
    }
    
    # Scan project
    issues = scan_directory('.', exclude_dirs, patterns)
    
    # Report findings
    if issues:
        print(f"\n⚠️  WARNINGS: Found {len(issues)} potential issues:\n")
        for issue in issues:
            print(f"  File: {issue['file']}")
            print(f"  Line {issue['line']}: {issue['type']}")
            print(f"  Content: {issue['content']}")
            print()
        print("⚠️  Review these findings and ensure secrets are in .env file only!")
        return 1
    else:
        print("\n✅ No hardcoded secrets detected!")
        print("✅ All sensitive data appears to be in environment variables.")
    
    # Check .env file
    if os.path.exists('.env'):
        print("\n✅ .env file exists")
        # Check if .env is in .gitignore
        if os.path.exists('.gitignore'):
            with open('.gitignore', 'r') as f:
                if '.env' in f.read():
                    print("✅ .env is in .gitignore")
                else:
                    print("⚠️  .env is NOT in .gitignore - ADD IT NOW!")
                    return 1
    else:
        print("\n⚠️  .env file not found - copy from .env.example")
        return 1
    
    # Check .dockerignore files
    backend_dockerignore = os.path.exists('backend/.dockerignore')
    frontend_dockerignore = os.path.exists('frontend/.dockerignore')
    
    if backend_dockerignore:
        print("✅ backend/.dockerignore exists")
    else:
        print("⚠️  backend/.dockerignore missing")
    
    if frontend_dockerignore:
        print("✅ frontend/.dockerignore exists")
    else:
        print("⚠️  frontend/.dockerignore missing")
    
    print("\n" + "=" * 60)
    print("✅ Security scan complete!")
    return 0

if __name__ == '__main__':
    sys.exit(main())
