# Security Configuration Guide

## 🔒 Critical Security Principles

### 1. No Hardcoded Credentials
- ❌ **NEVER** hardcode passwords, API keys, or secrets in code
- ❌ **NEVER** commit `.env` file to version control
- ✅ All sensitive data in `.env` file only
- ✅ Use `.env.example` as template (safe to commit)

### 2. Environment Variables Flow

```
┌─────────────┐
│  .env file  │ ← Your actual secrets (NEVER commit)
└──────┬──────┘
       │
       ├─→ docker-compose.yml (reads via env_file)
       ├─→ config.yml (references ${VARIABLES})
       └─→ Django settings (via python-decouple)
```

### 3. File Responsibilities

| File | Purpose | Commit to Git? |
|------|---------|----------------|
| `.env` | Actual secrets | ❌ NEVER |
| `.env.example` | Template with placeholder values | ✅ Yes |
| `config.yml` | Variable references (${VAR}) | ✅ Yes |
| `docker-compose.yml` | Uses env_file: .env | ✅ Yes |
| `settings/base.py` | No defaults, requires env vars | ✅ Yes |

## 🛡️ Security Features Implemented

### 1. Custom Admin URL
- Default `/admin/` changed to `/secure-admin/`
- Prevents automated attacks on admin panel
- Reduces brute force attempts

### 2. API Rate Limiting
```python
- Anonymous users: 100 requests/hour
- Authenticated users: 1000 requests/hour
- Contact form: 5 submissions/hour
```

### 3. CORS Protection
- Development: Localhost only
- Production: Specific domains from .env
- No wildcard (*) origins

### 4. Database Security
- All credentials from environment
- No default passwords
- PostgreSQL with strong authentication

### 5. Email Security
- Credentials from environment
- No exposed SMTP passwords
- Console backend for development

### 6. Input Validation
- Brand/Model: Alphanumeric + allowed chars
- Color: Letters, spaces, hyphens
- VIN: 17 characters (proper format)
- Email: RFC compliant
- Phone: Digits and standard separators
- File uploads: 5MB limit

### 7. Django Security Headers
Production settings include:
- `SECURE_SSL_REDIRECT = True`
- `SESSION_COOKIE_SECURE = True`
- `CSRF_COOKIE_SECURE = True`
- `SECURE_BROWSER_XSS_FILTER = True`
- `SECURE_CONTENT_TYPE_NOSNIFF = True`
- `X_FRAME_OPTIONS = 'DENY'`
- `SECURE_HSTS_SECONDS = 31536000`

## 🚀 Production Deployment Checklist

### Before Deploying to Production:

1. **Generate Strong SECRET_KEY**
   ```bash
   python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
   ```

2. **Update .env for Production**
   ```env
   SECRET_KEY=<generated-50+-char-key>
   DEBUG=False
   DJANGO_SETTINGS_MODULE=car_dealership.settings.production
   ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com
   CORS_ALLOWED_ORIGINS=https://yourdomain.com
   DB_PASSWORD=<very-strong-password>
   PGADMIN_PASSWORD=<very-strong-password>
   ```

3. **Use Strong Passwords**
   - Database: 20+ characters, mixed case, numbers, symbols
   - pgAdmin: 16+ characters
   - Email app password: Use app-specific passwords

4. **Enable HTTPS**
   - Get SSL certificate (Let's Encrypt recommended)
   - Configure Nginx for SSL
   - All URLs should use https://

5. **Configure Email (Production)**
   ```env
   EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
   EMAIL_HOST=smtp.gmail.com
   EMAIL_HOST_USER=your-real-email@gmail.com
   EMAIL_HOST_PASSWORD=your-app-specific-password
   ```

6. **Database Backup**
   - Set up automated backups
   - Store backups securely (encrypted)
   - Test restore procedure

7. **Firewall Configuration**
   - Open only: 80 (HTTP), 443 (HTTPS)
   - Close: 8000 (Django), 5432 (PostgreSQL), 5050 (pgAdmin)
   - Use reverse proxy (Nginx)

8. **Change Admin URL**
   - Current: `/secure-admin/`
   - Consider changing to something unique in production
   - Update in `car_dealership/urls.py`

## 📋 Security Audit

### What's Protected:
- ✅ Database credentials
- ✅ Django SECRET_KEY
- ✅ Email credentials
- ✅ pgAdmin credentials
- ✅ API keys (if added later)
- ✅ CORS origins
- ✅ Allowed hosts

### What's in Code (Safe):
- ✅ Logic and algorithms
- ✅ Model structures
- ✅ API endpoint definitions
- ✅ Variable names/references (${VAR})

### What's NEVER in Code:
- ❌ Passwords
- ❌ Secret keys
- ❌ Database credentials
- ❌ Email passwords
- ❌ API tokens

## 🔍 Security Testing

### Test for Exposed Secrets:
```bash
# Search for potential secrets in code
grep -r "password" --exclude-dir=venv --exclude-dir=node_modules .
grep -r "secret" --exclude-dir=venv --exclude-dir=node_modules .
grep -r "api_key" --exclude-dir=venv --exclude-dir=node_modules .

# Verify .env is in .gitignore
cat .gitignore | grep "\.env"

# Check git history doesn't contain secrets
git log --all --full-history --source -- .env
```

### Verify Environment Loading:
```bash
# Check if variables are loaded
docker-compose exec backend python -c "import os; print('SECRET_KEY' in os.environ)"

# Should print: True
```

## 📞 Security Incident Response

If `.env` file is accidentally committed:

1. **Immediately rotate all credentials**
   - New SECRET_KEY
   - New database password
   - New email password
   - New pgAdmin password

2. **Remove from git history**
   ```bash
   git filter-branch --force --index-filter \
   "git rm --cached --ignore-unmatch .env" \
   --prune-empty --tag-name-filter cat -- --all
   ```

3. **Force push (DANGER)**
   ```bash
   git push origin --force --all
   ```

4. **Notify team members** to delete and re-clone

## 🔐 Best Practices

1. **Never share .env file** - Send .env.example instead
2. **Use strong passwords** - 20+ characters
3. **Regular rotation** - Change credentials every 90 days
4. **Least privilege** - Only grant necessary permissions
5. **Monitor logs** - Watch for suspicious activity
6. **Keep dependencies updated** - Regular security patches
7. **Use HTTPS everywhere** - No plain HTTP in production
8. **Backup encrypted** - Encrypt backup files
9. **2FA for admin** - Consider adding two-factor auth
10. **Security headers** - Already configured in production.py

## 📚 Additional Resources

- [Django Security](https://docs.djangoproject.com/en/stable/topics/security/)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Let's Encrypt SSL](https://letsencrypt.org/)
- [Python Decouple](https://github.com/henriquebastos/python-decouple)
