# Environment Variables Setup Guide

This guide will help you configure environment variables for the AIT Marketplace project.

## 📋 Table of Contents

- [Docker Compose Environment Variables](#docker-compose-environment-variables)
- [Backend Environment Variables](#backend-environment-variables)
- [Frontend Environment Variables](#frontend-environment-variables)
- [Quick Setup](#quick-setup)
- [Production Configuration](#production-configuration)

---

## Docker Compose Environment Variables

The `docker-compose.yml` file uses environment variables to configure services. You can set them in the following ways:

### Method 1: Create `.env` file in project root

Create a `.env` file in the project root directory:

```env
# PostgreSQL Database Configuration
POSTGRES_DB=ait_marketplace
POSTGRES_USER=ait_admin
POSTGRES_PASSWORD=ait_pass

# Backend Environment Variables (Optional, defaults are set in docker-compose.yml)
DJANGO_DEBUG=1
SECRET_KEY=change-me-in-prod-please-use-a-secure-random-key
DB_ENGINE=postgres
POSTGRES_HOST=db
POSTGRES_PORT=5432
CORS_ALLOW_ORIGIN=http://localhost:3000

# Frontend Environment Variables (Optional)
NEXT_PUBLIC_API_BASE=http://localhost:8000/api
```

### Method 2: Modify directly in docker-compose.yml

You can directly modify environment variable values in the `docker-compose.yml` file.

### Docker Compose Environment Variables Reference

| Variable Name | Description | Default Value | Required |
|---------------|-------------|---------------|----------|
| `POSTGRES_DB` | PostgreSQL database name | `ait_marketplace` | No |
| `POSTGRES_USER` | PostgreSQL username | `ait_admin` | No |
| `POSTGRES_PASSWORD` | PostgreSQL password | `ait_pass` | No |
| `DJANGO_DEBUG` | Django debug mode | `1` | No |
| `SECRET_KEY` | Django secret key | `change-me-in-prod` | Yes (for production) |
| `DB_ENGINE` | Database engine | `postgres` | No |
| `POSTGRES_HOST` | Database host | `db` | No |
| `POSTGRES_PORT` | Database port | `5432` | No |
| `CORS_ALLOW_ORIGIN` | CORS allowed origin | `http://localhost:3000` | No |
| `NEXT_PUBLIC_API_BASE` | Frontend API base URL | `http://localhost:8000/api` | No |

---

## Backend Environment Variables

The Backend uses Django, and environment variables can be set in the following ways:

### Method 1: Create `.env` file in `backend/` directory

```env
# Django Core Configuration
DJANGO_DEBUG=1
SECRET_KEY=change-me-in-prod-please-use-a-secure-random-key

# Database Configuration
# Option 1: Use SQLite (Development environment, default)
DB_ENGINE=sqlite

# Option 2: Use PostgreSQL (Recommended for production)
# DB_ENGINE=postgres
# POSTGRES_DB=ait_marketplace
# POSTGRES_USER=ait_admin
# POSTGRES_PASSWORD=ait_pass
# POSTGRES_HOST=localhost
# POSTGRES_PORT=5432

# CORS Configuration
CORS_ALLOW_ORIGIN=http://localhost:3000
CORS_ALLOW_ORIGIN_ALT=http://localhost:3001

# Email Configuration
# Development: Use console backend (emails will be printed to console)
EMAIL_BACKEND=django.core.mail.backends.console.EmailBackend

# Production: Use SMTP backend
# EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
# EMAIL_HOST=smtp.gmail.com
# EMAIL_PORT=587
# EMAIL_USE_TLS=True
# EMAIL_HOST_USER=your-email@gmail.com
# EMAIL_HOST_PASSWORD=your-app-password
# DEFAULT_FROM_EMAIL=noreply@ait-marketplace.com
```

### Method 2: Set via Docker Compose environment variables

Set environment variables in the `backend` service in `docker-compose.yml`.

### Backend Environment Variables Reference

| Variable Name | Description | Default Value | Required |
|---------------|-------------|---------------|----------|
| `DJANGO_DEBUG` | Django debug mode (`1` for on, `0` for off) | `0` | No |
| `SECRET_KEY` | Django secret key (must be changed in production) | `dev-secret-key` | Yes (for production) |
| `DB_ENGINE` | Database engine (`sqlite` or `postgres`) | `sqlite` | No |
| `POSTGRES_DB` | PostgreSQL database name | - | Required when using PostgreSQL |
| `POSTGRES_USER` | PostgreSQL username | - | Required when using PostgreSQL |
| `POSTGRES_PASSWORD` | PostgreSQL password | - | Required when using PostgreSQL |
| `POSTGRES_HOST` | PostgreSQL host | `localhost` | Required when using PostgreSQL |
| `POSTGRES_PORT` | PostgreSQL port | `5432` | Required when using PostgreSQL |
| `CORS_ALLOW_ORIGIN` | CORS allowed origin | `http://localhost:3000` | No |
| `CORS_ALLOW_ORIGIN_ALT` | CORS alternate allowed origin | `http://localhost:3001` | No |
| `EMAIL_BACKEND` | Email backend | `console.EmailBackend` | No |
| `EMAIL_HOST` | SMTP server address | `localhost` | Required when using SMTP |
| `EMAIL_PORT` | SMTP server port | `1025` | Required when using SMTP |
| `EMAIL_USE_TLS` | Use TLS | `False` | No |
| `EMAIL_HOST_USER` | SMTP username | - | Required when using SMTP |
| `EMAIL_HOST_PASSWORD` | SMTP password | - | Required when using SMTP |
| `DEFAULT_FROM_EMAIL` | Default sender email | `no-reply@ait-marketplace.local` | No |

---

## Frontend Environment Variables

The Frontend uses Next.js, and environment variables must start with `NEXT_PUBLIC_` to be accessible in the browser.

### Create `.env.local` file in `frontend/` directory

```env
# API Base URL
NEXT_PUBLIC_API_BASE=http://localhost:8000/api
```

### Frontend Environment Variables Reference

| Variable Name | Description | Default Value | Required |
|---------------|-------------|---------------|----------|
| `NEXT_PUBLIC_API_BASE` | Backend API base URL | `http://localhost:8000/api` | No |

**Note:** Next.js requires that client-accessible environment variables must start with `NEXT_PUBLIC_`.

---

## Quick Setup

### 1. Using Docker Compose (Recommended)

```bash
# Create .env file in project root (optional)
cp .env.example .env  # If .env.example exists
# Edit .env file and modify values as needed

# Start all services
docker compose up -d

# First-time database initialization
docker compose exec backend python manage.py migrate
docker compose exec backend python manage.py createsuperuser
```

### 2. Local Development (Without Docker)

#### Backend Setup

```bash
cd backend

# Create .env file
cat > .env << EOF
DJANGO_DEBUG=1
SECRET_KEY=dev-secret-key-change-in-prod
DB_ENGINE=sqlite
CORS_ALLOW_ORIGIN=http://localhost:3000
EMAIL_BACKEND=django.core.mail.backends.console.EmailBackend
EOF

# Install dependencies
pip install -r requirements.txt

# Run migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Start development server
python manage.py runserver
```

#### Frontend Setup

```bash
cd frontend

# Create .env.local file
cat > .env.local << EOF
NEXT_PUBLIC_API_BASE=http://localhost:8000/api
EOF

# Install dependencies
npm install

# Start development server
npm run dev
```

---

## Production Configuration

### Security Recommendations

1. **Change SECRET_KEY**
   ```bash
   # Generate a secure key
   python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
   ```

2. **Disable DEBUG Mode**
   ```env
   DJANGO_DEBUG=0
   ```

3. **Use Strong Passwords**
   - PostgreSQL password
   - SMTP password
   - All sensitive information

4. **Configure HTTPS**
   - Update `CORS_ALLOW_ORIGIN` to production domain
   - Update `NEXT_PUBLIC_API_BASE` to production API URL



6. **Use Environment Variable Management Tools**
   - Use Docker secrets
   - Use cloud provider key management services
   - Do not commit `.env` files to version control

### Production Environment Example Configuration

#### docker-compose.yml (Production)

```yaml
services:
  backend:
    environment:
      DJANGO_DEBUG: "0"
      SECRET_KEY: "${SECRET_KEY}"  # Read from environment variables or secrets
      DB_ENGINE: "postgres"
      POSTGRES_HOST: "db"
      # ... other configurations
```

#### backend/.env (Production)

```env
DJANGO_DEBUG=0
SECRET_KEY=your-very-secure-secret-key-here
DB_ENGINE=postgres
POSTGRES_DB=ait_marketplace
POSTGRES_USER=ait_admin
POSTGRES_PASSWORD=strong-password-here
POSTGRES_HOST=db
POSTGRES_PORT=5432
CORS_ALLOW_ORIGIN=https://yourdomain.com
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password
DEFAULT_FROM_EMAIL=noreply@yourdomain.com
```

#### frontend/.env.local (Production)

```env
NEXT_PUBLIC_API_BASE=https://api.yourdomain.com/api
```

---

## Frequently Asked Questions

### Q: How to generate Django SECRET_KEY?

```bash
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```

### Q: Email functionality not working?

- Development: Check console output, emails will be printed to console
- Production: Check if SMTP configuration is correct, ensure `EMAIL_HOST_USER` and `EMAIL_HOST_PASSWORD` are set correctly

### Q: CORS errors?

Make sure `CORS_ALLOW_ORIGIN` is set to your frontend URL, e.g., `http://localhost:3000`

### Q: Database connection failed?

- Check if PostgreSQL is running
- Check if `POSTGRES_HOST`, `POSTGRES_PORT`, `POSTGRES_USER`, `POSTGRES_PASSWORD` are correct
- Check if the database has been created

### Q: Frontend cannot connect to Backend?

- Check if `NEXT_PUBLIC_API_BASE` is correct
- Ensure Backend service is running
- Check CORS configuration

---

## Important Notes

1. **Do not commit sensitive information to version control**
   - Add `.env` and `.env.local` to `.gitignore`
   - Use `.env.example` as a template

2. **Environment Variable Priority**
   - Docker Compose environment variables > `.env` file > default values in code

3. **Next.js Environment Variables**
   - Only variables starting with `NEXT_PUBLIC_` can be accessed in the browser
   - Restart development server after modifying environment variables

4. **Django Environment Variables**
   - Restart Django server after modifying environment variables

---

## Related Files

- `docker-compose.yml` - Docker Compose configuration
- `backend/marketplace/settings.py` - Django settings
- `frontend/lib/api.ts` - Frontend API client configuration

---

If you have any questions, please refer to the main README.md or submit an Issue.
