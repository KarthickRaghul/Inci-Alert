# 🚨 Inci-Alert

A comprehensive incident reporting and alerting system that aggregates news, weather data, and user-reported incidents on an interactive map with real-time notifications.

## ✨ Features

### 🔥 Core Features
- **Real-time Incident Reporting**: Users can report incidents with location, media uploads, and detailed descriptions
- **Interactive Map Visualization**: 3D globe view powered by Mapbox showing incidents by category and severity
- **Live News Aggregation**: Automated scraping and categorization of news from multiple sources (Times of India, CNN)
- **Weather Integration**: Real-time weather data integration from OpenWeatherMap
- **AI-Powered Categorization**: Automatic incident classification using keyword-based AI processing
- **Real-time Updates**: WebSocket-powered live updates for new incidents and alerts

### 🎯 User Features
- **User Authentication**: Secure registration, login, and profile management with JWT tokens
- **Media Uploads**: Support for images and videos with validation and thumbnail generation
- **Multi-category Incidents**: Support for accidents, crimes, fires, floods, storms, earthquakes, traffic, health, and weather incidents
- **Location Services**: GPS-based location capture and manual location input
- **Statistics Dashboard**: Comprehensive analytics and incident statistics
- **Responsive Design**: Modern UI with dark/light theme support

### 🛠️ Technical Features
- **RESTful API**: Comprehensive backend API with proper error handling
- **Database Migrations**: Alembic-powered database version control
- **File Handling**: Secure media upload with size and type validation
- **WebSocket Support**: Real-time bidirectional communication
- **Modern Frontend**: React with TypeScript, modern UI components, and state management

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   External      │
│   React + TS    │◄──►│   Flask + SQL   │◄──►│   APIs          │
│   Vite + UI     │    │   WebSocket     │    │   News + Weather│
└─────────────────┘    └─────────────────┘    └─────────────────┘
                              │
                       ┌─────────────────┐
                       │   PostgreSQL    │
                       │   Database      │
                       └─────────────────┘
```

## 🛠️ Technology Stack

### Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI primitives
- **State Management**: TanStack Query (React Query)
- **Routing**: React Router v6
- **Maps**: Mapbox GL JS
- **Forms**: React Hook Form with Zod validation
- **Icons**: Lucide React

### Backend
- **Framework**: Flask 3.0
- **Database**: PostgreSQL with SQLAlchemy 2.0
- **Migrations**: Alembic
- **Authentication**: Flask-JWT-Extended with bcrypt
- **Real-time**: Flask-SocketIO
- **Validation**: Marshmallow
- **Web Scraping**: BeautifulSoup4 + Requests
- **Image Processing**: Pillow

### External Services
- **Maps**: Mapbox (for interactive globe visualization)
- **Weather**: OpenWeatherMap API
- **News Sources**: Times of India, CNN (via web scraping)

## 🚀 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **Python** (v3.8 or higher)
- **PostgreSQL** (v12 or higher)
- **Git**

### External Account Requirements
- [Mapbox Account](https://mapbox.com/) (free tier available)
- [OpenWeatherMap Account](https://openweathermap.org/api) (free tier available)

## 📦 Installation

### Quick Setup (Recommended)

For a quick setup, run these commands in sequence:

```bash
# Clone repository
git clone https://github.com/KarthickRaghul/Inci-Alert.git
cd Inci-Alert

# Backend setup
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
# Edit .env file with your configuration
cd ..

# Frontend setup
cd frontend
npm install
cp .env.example .env
# Edit .env file with your Mapbox token
cd ..

# Database setup
createdb inci_alert  # or create using your preferred method

# Run migrations
cd backend
flask db upgrade
```

### Detailed Setup

### 1. Clone the Repository

```bash
git clone https://github.com/KarthickRaghul/Inci-Alert.git
cd Inci-Alert
```

### 2. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install
```

### 4. Database Setup

```bash
# Create PostgreSQL database
createdb inci_alert

# Or using psql:
psql -c "CREATE DATABASE inci_alert;"
```

## ⚙️ Configuration

### Backend Environment Variables

Create a `.env` file in the `backend` directory by copying from the example:

```bash
cd backend
cp .env.example .env
```

Then edit the `.env` file with your actual values:

```env
# Database Configuration
DATABASE_URL=postgresql+psycopg://username:password@localhost:5432/inci_alert

# Security Keys (Generate strong random keys for production)
SECRET_KEY=your-secret-key-here-change-this-in-production
JWT_SECRET_KEY=your-jwt-secret-key-here-change-this-in-production
JWT_ACCESS_TOKEN_EXPIRES=86400

# External APIs
OPENWEATHER_API_KEY=your-openweather-api-key
# Get your free API key from: https://openweathermap.org/api

# File Upload Settings
UPLOAD_FOLDER=uploads
MAX_CONTENT_LENGTH=10485760  # 10MB

# Request Settings
REQUEST_TIMEOUT=10
```

### Frontend Environment Variables

Create a `.env` file in the `frontend` directory by copying from the example:

```bash
cd frontend
cp .env.example .env
```

Then edit the `.env` file with your actual values:

```env
# Mapbox Configuration
VITE_MAPBOX_TOKEN=your-mapbox-token-here
# Get your free token from: https://mapbox.com/ (starts with 'pk.')

# API Configuration
VITE_API_BASE_URL=http://localhost:5000
```

### Database Migration

```bash
cd backend

# Initialize migration repository (if not already done)
flask db init

# Create initial migration
flask db migrate -m "Initial migration"

# Apply migrations
flask db upgrade
```

## 🚀 Running the Application

### Development Mode

#### Start Backend Server

```bash
cd backend

# Activate virtual environment
source venv/bin/activate  # or venv\Scripts\activate on Windows

# Run Flask development server
python app.py
```

The backend will be available at `http://localhost:5000`

#### Start Frontend Development Server

```bash
cd frontend

# Start Vite development server
npm run dev
```

The frontend will be available at `http://localhost:5173`

## 🚀 Deployment

### Environment Setup

#### Production Environment Variables

**Backend (.env)**
```env
# Use strong, randomly generated keys
SECRET_KEY=your-strong-production-secret-key
JWT_SECRET_KEY=your-strong-production-jwt-secret

# Use production database
DATABASE_URL=postgresql+psycopg://user:password@prod-db-host:5432/inci_alert

# Production API keys
OPENWEATHER_API_KEY=your-production-api-key

# Production settings
FLASK_ENV=production
DEBUG=False
```

**Frontend (.env.production)**
```env
VITE_MAPBOX_TOKEN=your-production-mapbox-token
VITE_API_BASE_URL=https://your-api-domain.com
```

### Docker Deployment (Coming Soon)

Docker support is planned for easier deployment. For now, use traditional deployment methods.

### Traditional Deployment

#### Backend (Using Gunicorn)
```bash
cd backend

# Install production dependencies
pip install gunicorn

# Run with Gunicorn (adjust workers based on your server)
gunicorn --worker-class eventlet -w 1 --bind 0.0.0.0:5000 app:app

# For systemd service
gunicorn --worker-class eventlet -w 1 --bind unix:/tmp/inci-alert.sock app:app
```

#### Frontend (Static Files)
```bash
cd frontend

# Build for production
npm run build

# Serve with nginx, apache, or any static file server
# Build files will be in the 'dist' directory
```

### Nginx Configuration Example

```nginx
# Backend API
upstream inci_backend {
    server unix:/tmp/inci-alert.sock;
}

# Frontend
server {
    listen 80;
    server_name your-domain.com;
    
    # Frontend static files
    location / {
        root /path/to/Inci-Alert/frontend/dist;
        try_files $uri $uri/ /index.html;
    }
    
    # Backend API
    location /api/ {
        proxy_pass http://inci_backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
    
    # WebSocket support
    location /socket.io/ {
        proxy_pass http://inci_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
    }
}

## 📡 API Documentation

### Base URL
```
http://localhost:5000
```

### Authentication Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Register new user |
| POST | `/auth/login` | User login |
| POST | `/auth/logout` | User logout |
| GET | `/auth/profile` | Get user profile |
| PUT | `/auth/profile` | Update user profile |

### Incident Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/incidents` | List all incidents |
| POST | `/incidents` | Create new incident |
| GET | `/incidents/{id}` | Get incident details |
| PUT | `/incidents/{id}` | Update incident |
| DELETE | `/incidents/{id}` | Delete incident |

### Data Ingestion Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/ingest/news` | Trigger news scraping |
| POST | `/ingest/weather` | Fetch weather data |

### Statistics Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/stats/overview` | Get overview statistics |
| GET | `/stats/incidents` | Get incident statistics |

### Media Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/media/{type}/{filename}` | Get media file |
| GET | `/media/thumbnails/{filename}` | Get thumbnail |

## 📁 Project Structure

```
Inci-Alert/
├── frontend/                   # React TypeScript frontend
│   ├── public/                # Static assets
│   ├── src/
│   │   ├── components/        # Reusable UI components
│   │   │   ├── ui/           # Base UI components (shadcn/ui)
│   │   │   ├── Map.tsx       # Interactive map component
│   │   │   ├── Navbar.tsx    # Navigation component
│   │   │   └── ...
│   │   ├── pages/            # Route components
│   │   │   ├── Home.tsx      # Dashboard/home page
│   │   │   ├── LiveAlerts.tsx # Real-time alerts
│   │   │   ├── ReportIncident.tsx # Incident reporting
│   │   │   └── ...
│   │   ├── services/         # API client and utilities
│   │   ├── hooks/            # Custom React hooks
│   │   ├── constants/        # App constants and config
│   │   └── lib/              # Utility functions
│   ├── package.json
│   └── vite.config.ts        # Vite configuration
│
├── backend/                    # Flask Python backend
│   ├── models/               # SQLAlchemy models
│   │   ├── incident.py       # Incident model
│   │   ├── user.py          # User model
│   │   └── media.py         # Media model
│   ├── routes/               # API route handlers
│   │   ├── incidents.py     # Incident endpoints
│   │   ├── auth.py          # Authentication endpoints
│   │   ├── media.py         # Media endpoints
│   │   └── stats.py         # Statistics endpoints
│   ├── services/             # Business logic
│   │   ├── scrapers/        # Web scraping modules
│   │   ├── ai_processor.py  # AI categorization
│   │   └── ingest.py        # Data ingestion
│   ├── utils/               # Utility modules
│   │   ├── db.py           # Database configuration
│   │   ├── validation.py   # Data validation schemas
│   │   └── file_handler.py # File upload handling
│   ├── migrations/          # Database migrations
│   ├── requirements.txt     # Python dependencies
│   ├── config.py           # App configuration
│   └── app.py              # Flask application entry point
│
├── README.md               # This file
└── .gitignore             # Git ignore rules
```

## 🔧 Development

### Running Tests

#### Backend Tests
```bash
cd backend

# Run all tests (if pytest is configured)
python -m pytest

# Run specific test file
python test_news_aggregator.py
```

#### News Aggregator Test
Test the news scraping and categorization system:
```bash
cd backend
python test_news_aggregator.py
```

This will test:
- News scraping from configured sources
- AI categorization system
- Database integration (optional)

### Code Style

#### Frontend
```bash
cd frontend

# Lint code
npm run lint

# Build for production
npm run build

# Preview production build  
npm run preview
```

#### Backend
Follow PEP 8 standards. Use tools like `black` and `flake8`:

```bash
pip install black flake8
black .
flake8 .
```

### Database Operations

#### Create New Migration
```bash
cd backend
flask db migrate -m "Description of changes"
```

#### Apply Migrations
```bash
flask db upgrade
```

#### Rollback Migration
```bash
flask db downgrade
```

#### Reset Database (Development)
```bash
# WARNING: This will delete all data
flask db downgrade base
flask db upgrade
```

### Common Development Commands

#### Backend Development
```bash
cd backend
source venv/bin/activate

# Start development server
python app.py

# Run with debug mode
FLASK_ENV=development python app.py

# Test news scraping
python test_news_aggregator.py

# Create new migration
flask db migrate -m "Your message"

# Apply migrations
flask db upgrade
```

#### Frontend Development
```bash
cd frontend

# Start development server
npm run dev

# Build for production
npm run build

# Lint and fix
npm run lint

# Preview build
npm run preview
```

## 🎯 Usage Examples

### Reporting an Incident

1. Navigate to `/report`
2. Fill in incident details:
   - Title and description
   - Category selection
   - Location (GPS or manual)
   - Media uploads (optional)
3. Submit the report

### Viewing Live Alerts

1. Navigate to `/alerts`
2. View incidents on the interactive map
3. Filter by category or severity
4. Click markers for detailed information

### News Aggregation

The system automatically scrapes news from configured sources. You can manually trigger:

```bash
curl -X POST http://localhost:5000/ingest/news
```

### Weather Data

Fetch weather data for a specific city:

```bash
curl -X POST http://localhost:5000/ingest/weather \
  -H "Content-Type: application/json" \
  -d '{"city": "New Delhi"}'
```

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. **Make your changes**
4. **Run tests and ensure code quality**
5. **Commit your changes**
   ```bash
   git commit -m "Add: your feature description"
   ```
6. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```
7. **Create a Pull Request**

### Contribution Guidelines

- Follow existing code style and patterns
- Add tests for new features
- Update documentation as needed
- Ensure all tests pass
- Use descriptive commit messages

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## 🆘 Troubleshooting

### Common Issues

#### Database Connection Error
```
sqlalchemy.exc.OperationalError: (psycopg.OperationalError) connection failed
```
**Solutions:**
- Ensure PostgreSQL is running: `sudo systemctl status postgresql`
- Verify database credentials in `.env` file
- Check if database exists: `psql -l | grep inci_alert`
- Test connection: `psql postgresql://username:password@localhost:5432/inci_alert`

#### Mapbox Token Error
```
Error: Mapbox access token is required
```
**Solutions:**
- Verify `VITE_MAPBOX_TOKEN` in frontend `.env` file
- Ensure token starts with `pk.` (public token)
- Check token validity on [Mapbox Dashboard](https://account.mapbox.com/)
- Restart development server after changing .env

#### News Scraping Issues
```
Error scraping news: Connection timeout / HTTP errors
```
**Solutions:**
- Check internet connectivity
- Verify scraping targets haven't changed their structure
- Check if websites are blocking requests (user-agent issues)
- Review headers in `backend/services/scrapers/news_scraper.py`

#### File Upload Issues
```
Error: File upload failed / Permission denied
```
**Solutions:**
- Check `uploads/` directory permissions: `chmod 755 uploads/`
- Verify `UPLOAD_FOLDER` path in `.env`
- Ensure `MAX_CONTENT_LENGTH` allows your file size
- Check available disk space

#### Frontend Build Issues
```
Error: Module not found / Import errors
```
**Solutions:**
- Clear node modules: `rm -rf node_modules package-lock.json && npm install`
- Check Node.js version: `node --version` (should be 18+)
- Verify all environment variables in `.env`
- Try: `npm run build:dev` for development build

#### Backend Module Import Errors
```
ModuleNotFoundError: No module named 'your_module'
```
**Solutions:**
- Ensure virtual environment is activated
- Reinstall dependencies: `pip install -r requirements.txt`
- Check Python path and virtual environment
- Verify all environment variables in `.env`

#### Port Already in Use
```
Address already in use / Port 5000 is busy
```
**Solutions:**
- Find process using port: `lsof -i :5000` or `netstat -nlp | grep 5000`
- Kill process: `kill -9 <PID>`
- Use different port: `flask run --port 5001`

#### CORS Issues
```
Access blocked by CORS policy
```
**Solutions:**
- Verify frontend URL in backend CORS settings (`app.py`)
- Check if frontend and backend URLs match in `.env`
- Ensure proper headers are set in API requests

### Debug Mode

#### Backend Debug
```bash
cd backend
export FLASK_ENV=development
export FLASK_DEBUG=1
python app.py
```

#### Frontend Debug
```bash
cd frontend
# Development server provides detailed error messages
npm run dev
```

### Logging

#### Backend Logs
- Check console output for detailed error messages
- Review Flask logs for database and API errors
- News scraper logs show scraping status

#### Frontend Logs
- Open browser developer tools (F12)
- Check Console tab for JavaScript errors
- Network tab shows API request/response details

### Performance Issues

#### Slow News Scraping
- Check `REQUEST_TIMEOUT` in backend `.env`
- Monitor network connectivity
- Consider implementing caching

#### Map Loading Issues
- Verify Mapbox token has proper permissions
- Check browser's network tab for failed requests
- Ensure stable internet connection

#### Database Performance
- Monitor PostgreSQL performance
- Consider indexing frequently queried columns
- Check database connection pool settings

### Getting Help

If you're still experiencing issues:

1. **Check the logs** in both frontend (browser console) and backend (terminal output)
2. **Search existing issues** on GitHub
3. **Create a new issue** with:
   - Error message and full stack trace
   - Your operating system and versions
   - Steps to reproduce the problem
   - Your configuration (without sensitive data)

### Reset Everything (Nuclear Option)

If nothing else works:

```bash
# Backend reset
cd backend
deactivate  # if virtual env is active
rm -rf venv/
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
# Edit .env with your settings
flask db upgrade

# Frontend reset
cd ../frontend
rm -rf node_modules/ package-lock.json
npm install
cp .env.example .env
# Edit .env with your settings
```

## 📞 Support

For support, please open an issue on GitHub or contact the maintainers.

## 🚀 Roadmap

- [ ] Mobile application (React Native)
- [ ] Email/SMS notifications
- [ ] Advanced AI categorization
- [ ] Integration with more news sources
- [ ] Incident verification system
- [ ] Advanced analytics dashboard
- [ ] Multi-language support

---

**Made with ❤️ by the Inci-Alert Team**