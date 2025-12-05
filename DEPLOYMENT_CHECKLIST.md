# Production Deployment Checklist

## 🚀 Pre-Deployment (Do These First)

### 1. Server Setup
- [ ] Provision server (AWS, DigitalOcean, etc.)
- [ ] Install Docker and Docker Compose
- [ ] Configure firewall (allow ports 80, 443, 22)
- [ ] Set up SSH key authentication
- [ ] Disable root SSH login

### 2. Domain & SSL
- [ ] Purchase/configure domain name
- [ ] Point DNS to server IP
- [ ] Install SSL certificate (Let's Encrypt recommended)
- [ ] Configure SSL auto-renewal

### 3. Environment Configuration
- [ ] Copy `.env.production.example` to `.env` on server
- [ ] Run `python scripts/generate_secrets.py` to generate:
  - [ ] Production `SECRET_KEY` (50+ characters)
  - [ ] Strong `DB_PASSWORD`
  - [ ] Strong `PGADMIN_PASSWORD`
- [ ] Update `ALLOWED_HOSTS` with your domain
- [ ] Update `CORS_ALLOWED_ORIGINS` with frontend URL
- [ ] Configure production email (SMTP credentials)
- [ ] Update `VITE_API_URL` to production API URL
- [ ] Verify `DEBUG=False`
- [ ] Verify `DJANGO_SETTINGS_MODULE=car_dealership.settings.production`

### 4. Database
- [ ] Set up automated backups (use `scripts/backup_database.bat`)
- [ ] Schedule daily backup (Windows Task Scheduler or cron)
- [ ] Test backup restore (`scripts/restore_database.bat`)
- [ ] Configure offsite backup storage (S3, Google Cloud, etc.)

### 5. Security Verification
- [ ] Run `python security_check.py` - must show 0 issues
- [ ] Verify `.env` is in `.gitignore`
- [ ] Verify no secrets in git history: `git log --all --full-history --source --all -- .env`
- [ ] Change admin URL from `/admin/` (already changed to `/secure-admin/`)
- [ ] Review rate limiting settings in `settings/base.py`
- [ ] Verify CORS origins are specific (no wildcards)

---

## 🔧 Deployment Steps

### 1. Initial Deployment

```bash
# On server
git clone https://github.com/your-username/car-dealership.git
cd car-dealership

# Create .env file
cp .env.production.example .env
# Edit .env with production values (use nano, vim, etc.)

# Generate secrets
python scripts/generate_secrets.py

# Start application
docker-compose up -d

# Run migrations
docker-compose exec backend python manage.py migrate

# Create superuser
docker-compose exec backend python manage.py createsuperuser

# Collect static files
docker-compose exec backend python manage.py collectstatic --noinput

# Load initial data (if needed)
docker-compose exec backend python manage.py loaddata cars/fixtures/initial_cars.json
```

### 2. Subsequent Deployments

Use the deployment script:

```bash
# Windows
scripts\deploy.bat

# Linux/Mac
./scripts/deploy.sh
```

---

## ✅ Post-Deployment Verification

### 1. Health Checks
- [ ] Visit `https://yourdomain.com/health/` - should return status: healthy
- [ ] Check database connectivity in health response
- [ ] Verify cache status (if Redis enabled)

### 2. Functionality Tests
- [ ] Frontend loads: `https://yourdomain.com`
- [ ] API accessible: `https://yourdomain.com/api/cars/`
- [ ] Admin panel: `https://yourdomain.com/secure-admin/`
- [ ] Car listings display correctly
- [ ] Search/filter functionality works
- [ ] Contact form submission works
- [ ] Image uploads work
- [ ] Email notifications send (test contact form)

### 3. Security Tests
- [ ] HTTPS redirect works (http → https)
- [ ] Security headers present (use securityheaders.com)
- [ ] SSL certificate valid (use ssllabs.com)
- [ ] Rate limiting works (test with multiple requests)
- [ ] CORS only allows your domain
- [ ] Admin panel requires authentication
- [ ] No debug information in error pages

### 4. Performance Tests
- [ ] Page load time < 3 seconds
- [ ] API response time < 500ms
- [ ] Images load correctly
- [ ] Mobile responsive

---

## 📊 Monitoring Setup

### 1. Error Tracking (Recommended: Sentry)
- [ ] Create Sentry account (free tier available)
- [ ] Install: `pip install sentry-sdk`
- [ ] Add to `settings/production.py`:
```python
import sentry_sdk
from sentry_sdk.integrations.django import DjangoIntegration

sentry_sdk.init(
    dsn=config('SENTRY_DSN'),
    integrations=[DjangoIntegration()],
    traces_sample_rate=0.1,
)
```
- [ ] Add `SENTRY_DSN` to `.env`
- [ ] Test error reporting

### 2. Uptime Monitoring
- [ ] Set up UptimeRobot (free tier: 50 monitors)
- [ ] Monitor: `https://yourdomain.com/health/`
- [ ] Configure email alerts for downtime

### 3. Logs
- [ ] Set up log rotation (logrotate)
- [ ] Monitor disk space for logs
- [ ] Review logs weekly: `docker-compose logs backend`

---

## 🔐 Security Hardening (After Launch)

### Immediate (Week 1)
- [ ] Enable HSTS preload (already configured)
- [ ] Review Django security checklist: `python manage.py check --deploy`
- [ ] Set up automated security updates
- [ ] Configure fail2ban for SSH protection

### Short-term (Month 1)
- [ ] Implement 2FA for admin accounts
- [ ] Set up IP whitelisting for admin (optional)
- [ ] Regular security audits
- [ ] Penetration testing

### Ongoing
- [ ] Monthly Django/package updates
- [ ] Quarterly security reviews
- [ ] Annual penetration testing
- [ ] Regular backup restoration tests

---

## 📈 Performance Optimization (Optional)

### If Needed (After Traffic Analysis)
- [ ] Enable Redis caching (uncomment in `docker-compose.yml`)
- [ ] Set up CDN for static files (CloudFlare, AWS CloudFront)
- [ ] Database query optimization
- [ ] Add database read replicas (high traffic only)
- [ ] Implement full-text search (Elasticsearch)

---

## 🆘 Emergency Procedures

### Site Down
1. Check logs: `docker-compose logs backend`
2. Check container status: `docker-compose ps`
3. Restart services: `docker-compose restart`
4. If database corrupted: restore from backup

### Data Loss
1. Stop all services: `docker-compose down`
2. Restore from backup: `scripts\restore_database.bat <backup_file>`
3. Restart services: `docker-compose up -d`

### Security Breach
1. Immediately rotate all secrets (SECRET_KEY, passwords)
2. Review access logs
3. Contact authorities if customer data exposed
4. Notify users (GDPR requirement)

---

## 📞 Support Contacts

- **Hosting Provider:** [Provider support link]
- **Domain Registrar:** [Registrar support]
- **Emergency Contact:** [Your contact]
- **Database Backups:** `backups/database/` on server

---

## 📝 Regular Maintenance Schedule

### Daily (Automated)
- ✅ Database backups (3 AM via Task Scheduler)
- ✅ Health check monitoring

### Weekly (Manual)
- [ ] Review error logs
- [ ] Check backup success
- [ ] Monitor disk space

### Monthly (Manual)
- [ ] Test backup restoration
- [ ] Update dependencies
- [ ] Security review
- [ ] Performance analysis

### Quarterly (Manual)
- [ ] Full security audit
- [ ] Database optimization
- [ ] Update documentation

---

## ✅ Deployment Complete Checklist

Before marking deployment as complete:

- [ ] All pre-deployment items checked
- [ ] Deployment successful
- [ ] Post-deployment verification passed
- [ ] Monitoring configured
- [ ] Backups automated and tested
- [ ] Emergency procedures documented
- [ ] Team trained on maintenance
- [ ] Documentation updated

---

## 📚 Additional Resources

- **Django Deployment Checklist:** https://docs.djangoproject.com/en/3.2/howto/deployment/checklist/
- **Django Security:** https://docs.djangoproject.com/en/3.2/topics/security/
- **Docker Best Practices:** https://docs.docker.com/develop/dev-best-practices/
- **Let's Encrypt:** https://letsencrypt.org/getting-started/

---

**Last Updated:** December 5, 2025  
**Review Date:** Review quarterly or after major changes
