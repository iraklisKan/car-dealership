# Car Dealership Management System

A modern, full-stack car dealership management application built with Django REST Framework and React.

## Features

- **Car Inventory Management**: Browse, search, and filter car listings
- **Dynamic Search**: Filter by brand, model, fuel type, body type, transmission, price, year, and mileage
- **Contact Form**: Customer inquiries with validation
- **Admin Panel**: Django admin interface for managing cars and inquiries
- **Responsive Design**: Mobile-friendly UI with TailwindCSS
- **Image Optimization**: Automatic image compression and resizing
- **Docker Support**: Easy deployment with Docker Compose

## Tech Stack

### Backend
- Django 3.2.25
- Django REST Framework 3.14.0
- PostgreSQL 16
- Gunicorn

### Frontend
- React with Vite
- TailwindCSS
- Axios
- React Router

### DevOps
- Docker & Docker Compose
- Nginx
- pgAdmin

## Project Structure

```
car-dealership/
├── backend/
│   ├── car_dealership/
│   │   ├── settings/
│   │   │   ├── __init__.py
│   │   │   ├── base.py
│   │   │   ├── development.py
│   │   │   └── production.py
│   │   ├── urls.py
│   │   └── wsgi.py
│   ├── cars/
│   │   ├── models.py          # Car and CarImage models
│   │   ├── serializers.py     # DRF serializers
│   │   ├── views.py           # API endpoints
│   │   ├── filters.py         # Custom filters
│   │   └── admin.py           # Admin configuration
│   ├── contact/
│   │   ├── models.py          # Contact message model
│   │   ├── serializers.py     # Contact serializers
│   │   └── views.py           # Contact endpoints
│   ├── logs/                  # Application logs
│   ├── media/                 # Uploaded images
│   ├── manage.py
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── CarCard.jsx
│   │   │   ├── Header.jsx
│   │   │   ├── Footer.jsx
│   │   │   └── SearchBar.jsx
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── CarList.jsx
│   │   │   ├── CarDetail.jsx
│   │   │   └── Contact.jsx
│   │   ├── api/
│   │   │   └── axios.js       # API configuration
│   │   ├── App.jsx
│   │   └── index.jsx
│   ├── package.json
│   └── vite.config.js
└── docker-compose.yml
```

## Getting Started

### Prerequisites
- Docker Desktop installed and running
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/iraklisKan/car-dealership.git
   cd car-dealership
   ```

2. **Configure Environment Variables**
   
   **CRITICAL SECURITY STEP:** All sensitive data is stored in environment variables.
   
   ```bash
   # Copy the example file
   cp .env.example .env
   ```
   
   **Edit .env and update ALL values:**
   - `SECRET_KEY` - Generate a strong random key (minimum 50 characters)
   - `DB_PASSWORD` - Set a secure database password
   - `PGADMIN_PASSWORD` - Set a secure pgAdmin password
   - `EMAIL_HOST_USER` - Your email (if using email notifications)
   - `EMAIL_HOST_PASSWORD` - Your email app password
   
   **Generate a secure SECRET_KEY:**
   ```bash
   # Using Python
   python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
   ```
   
   ⚠️ **NEVER commit .env file to version control!**

3. **Verify config.yml references**
   
   The `config.yml` file references all variables from `.env`. Docker Compose reads from this structure.

4. **Start Docker containers**
   ```bash
   docker-compose up -d
   ```

3. **Create superuser (first time only)**
   ```bash
   docker-compose exec backend python manage.py createsuperuser
   ```

4. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000/api/
   - Admin Panel: http://localhost:8000/secure-admin/  (Changed from /admin/ for security)
   - Health Check: http://localhost:8000/health/
   - pgAdmin: http://localhost:5050

## Security Architecture

### Environment Variables (.env file)

**🔒 CRITICAL:** All sensitive data is stored in `.env` file which is:
- ✅ Listed in `.gitignore` (never committed)
- ✅ Referenced by `config.yml`
- ✅ Read by `docker-compose.yml`
- ✅ No hardcoded credentials anywhere in code

**Required Variables:**
```env
# Django Core
SECRET_KEY=<50+ character random string>
DEBUG=True|False
DJANGO_SETTINGS_MODULE=car_dealership.settings.development

# Database (PostgreSQL)
DB_NAME=car_dealership
DB_USER=postgres
DB_PASSWORD=<secure-password>
DB_HOST=db
DB_PORT=5432

# Email Configuration
EMAIL_BACKEND=django.core.mail.backends.console.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=<your-email>
EMAIL_HOST_PASSWORD=<app-password>
DEFAULT_FROM_EMAIL=noreply@cardealership.com
ADMIN_EMAIL=admin@cardealership.com

# pgAdmin
PGADMIN_EMAIL=admin@cardealership.com
PGADMIN_PASSWORD=<secure-password>

# Application
ALLOWED_HOSTS=localhost,127.0.0.1,backend
CORS_ALLOWED_ORIGINS=http://localhost:3000
VITE_API_URL=http://localhost:8000
```

**Files Structure:**
```
.env.example        → Template (committed to git)
.env                → Actual values (NEVER committed)
config.yml          → References ${VARIABLES} from .env
docker-compose.yml  → Uses env_file: .env
```

**No Default Fallbacks:** Settings files require all variables to be explicitly set in `.env` for security.

## API Endpoints

### Cars
- `GET /api/cars/` - List all cars (with pagination, filtering)
- `GET /api/cars/{id}/` - Get car details
- `GET /api/cars/latest/` - Get 10 latest cars
- `GET /api/cars/featured/` - Get featured cars

**Filter Parameters:**
- `brand` - Filter by brand
- `model` - Filter by model
- `year_min`, `year_max` - Year range
- `price_min`, `price_max` - Price range
- `mileage_max` - Maximum mileage
- `transmission` - Transmission type
- `fuel_type` - Fuel type
- `body_type` - Body style
- `condition` - New, used, or certified

### Contact
- `POST /api/contact/` - Submit contact form

## Development Features

### Logging
Configured logging to both console and file:
- Console: INFO level
- File: WARNING level (stored in `backend/logs/django.log`)

### Settings Structure
Settings are split into:
- `base.py` - Common settings
- `development.py` - Development-specific (DEBUG=True)
- `production.py` - Production-specific (DEBUG=False, security headers)

### Input Validation
- Brand/Model: Alphanumeric with spaces, hyphens, periods
- Color: Letters, spaces, hyphens only
- VIN: 17 characters (excluding I, O, Q)
- Email: Standard email format
- Phone: Digits, spaces, +, -, ()
- Mileage: 0 - 1,000,000 km
- Horsepower: 1 - 2,000 HP
- Engine Size: 0.1 - 15.0 L

### Image Optimization
Automatic optimization on upload:
- Converts to JPEG format
- Resizes to max 1920x1080
- Quality: 85%
- RGBA/PNG converted to RGB

## Docker Services

1. **db** - PostgreSQL 16 database
2. **backend** - Django application with Gunicorn
3. **frontend** - React app served by Nginx
4. **pgadmin** - Database management tool

## Production Deployment

For production:

1. Create production `.env` file with secure values
2. Set `DJANGO_SETTINGS_MODULE=car_dealership.settings.production`
3. Update `ALLOWED_HOSTS` and `CORS_ALLOWED_ORIGINS`
4. Use HTTPS (configure Nginx)
5. Set strong `SECRET_KEY`
6. Configure email backend for contact notifications

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is for educational purposes.

## Contact

- Repository: https://github.com/iraklisKan/car-dealership
- Email: autodealercy@gmail.com
- Phone: 99 022802
