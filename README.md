Quick Setup
1. Using Docker Compose (Recommended)
# Create .env file in project root (optional)
cp .env.example .env  # If .env.example exists
# Edit .env file and modify values as needed

# Start all services
docker compose up -d

# First-time database initialization
docker compose exec backend python manage.py migrate
docker compose exec backend python manage.py createsuperuser
2. Local Development (Without Docker)
Backend Setup
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
Frontend Setup
cd frontend

# Create .env.local file
cat > .env.local << EOF
NEXT_PUBLIC_API_BASE=http://localhost:8000/api
EOF

# Install dependencies
npm install

# Start development server
npm run dev
