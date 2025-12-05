#!/usr/bin/env python3
"""
Generate a secure SECRET_KEY for Django production use.
Saves to .env.production file.
"""

import secrets
import os

def generate_secret_key(length=50):
    """Generate a cryptographically secure secret key."""
    return secrets.token_urlsafe(length)

def generate_password(length=32):
    """Generate a strong password."""
    alphabet = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*'
    return ''.join(secrets.choice(alphabet) for _ in range(length))

if __name__ == '__main__':
    print("=" * 60)
    print("Production Secrets Generator")
    print("=" * 60)
    print()
    
    # Generate SECRET_KEY
    secret_key = generate_secret_key(50)
    print(f"SECRET_KEY (copy to .env.production):")
    print(f"{secret_key}")
    print()
    
    # Generate DB password
    db_password = generate_password(32)
    print(f"DB_PASSWORD (copy to .env.production):")
    print(f"{db_password}")
    print()
    
    # Generate pgAdmin password
    pgadmin_password = generate_password(24)
    print(f"PGADMIN_PASSWORD (copy to .env.production):")
    print(f"{pgadmin_password}")
    print()
    
    print("=" * 60)
    print("IMPORTANT:")
    print("1. Copy these values to your production .env file")
    print("2. NEVER commit these values to git")
    print("3. Store securely (password manager)")
    print("4. These values will not be shown again")
    print("=" * 60)
    
    # Optionally save to file
    save = input("\nSave to secrets.txt? (yes/no): ")
    if save.lower() == 'yes':
        with open('secrets.txt', 'w') as f:
            f.write("=" * 60 + "\n")
            f.write("PRODUCTION SECRETS - DELETE AFTER COPYING\n")
            f.write("=" * 60 + "\n\n")
            f.write(f"SECRET_KEY={secret_key}\n")
            f.write(f"DB_PASSWORD={db_password}\n")
            f.write(f"PGADMIN_PASSWORD={pgadmin_password}\n")
            f.write("\n" + "=" * 60 + "\n")
            f.write("DELETE THIS FILE AFTER COPYING TO .env\n")
            f.write("=" * 60 + "\n")
        print("\n✓ Saved to secrets.txt")
        print("⚠️  DELETE secrets.txt after copying to production .env file!")
