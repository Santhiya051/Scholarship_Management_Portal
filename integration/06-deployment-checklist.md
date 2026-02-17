# Production Deployment Checklist

## 🚀 Pre-Deployment Preparation

### 1. Environment Configuration

#### Backend Environment Variables
```bash
# Production .env file
NODE_ENV=production
PORT=3001

# Database
DB_HOST=your-production-db-host
DB_PORT=5432
DB_NAME=scholarship_management_prod
DB_USER=scholarship_user
DB_PASSWORD=secure_password_here

# JWT Secrets (Generate strong secrets!)
JWT_SECRET=your-super-secure-jwt-secret-256-bits
JWT_REFRESH_SECRET=your-super-secure-refresh-secret-256-bits
JWT_EXPIRE=15m
JWT_REFRESH_EXPIRE=7d

# Email Configuration
SMTP_HOST=smtp.your-email-provider.com
SMTP_PORT=587
SMTP_USER=your-email@domain.com
SMTP_PASS=your-app-password
FROM_EMAIL=noreply@scholarportal.edu
FROM_NAME=ScholarPortal

# File Upload
UPLOAD_PATH=/var/www/uploads
MAX_FILE_SIZE=5242880
ALLOWED_FILE_TYPES=pdf,doc,docx,jpg,jpeg,png

# Security
BCRYPT_ROUNDS=12
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX=100

# Frontend URL
FRONTEND_URL=https://scholarportal.yourdomain.com

# Logging
LOG_LEVEL=info
LOG_FILE=/var/log/scholarportal/app.log
```

#### Frontend Environment Variables
```bash
# Production .env file
REACT_APP_API_URL=https://api.scholarportal.yourdomain.com/api/v1
REACT_APP_APP_NAME=ScholarPortal
REACT_APP_VERSION=1.0.0
REACT_APP_MAX_FILE_SIZE=5242880
REACT_APP_ALLOWED_FILE_TYPES=.pdf,.doc,.docx,.jpg,.jpeg,.png

# Analytics (optional)
REACT_APP_GOOGLE_ANALYTICS_ID=GA_MEASUREMENT_ID
```

### 2. Database Setup

#### Production Database Migration
```bash
# Create production database
createdb scholarship_management_prod

# Run migrations
npm run migrate

# Seed initial data (roles, admin user)
npm run seed:production

# Create database backup strategy
pg_dump scholarship_management_prod > backup_$(date +%Y%m%d).sql
```

#### Database Performance Optimization
```sql
-- Create additional indexes for production
CREATE INDEX CONCURRENTLY idx_applications_status_created 
ON applications(status, created_at);

CREATE INDEX CONCURRENTLY idx_scholarships_deadline_status 
ON scholarships(application_deadline, status);

CREATE INDEX CONCURRENTLY idx_notifications_user_unread 
ON notifications(user_id, is_read, created_at);

-- Update table statistics
ANALYZE;
```

### 3. Security Hardening

#### SSL/TLS Configuration
```nginx
# Nginx SSL configuration
server {
    listen 443 ssl http2;
    server_name scholarportal.yourdomain.com;
    
    ssl_certificate /path/to/certificate.crt;
    ssl_certificate_key /path/to/private.key;
    
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;
    ssl_prefer_server_ciphers off;
    
    # Security headers
    add_header Strict-Transport-Security "max-age=63072000" always;
    add_header X-Content-Type-Options nosniff;
    add_header X-Frame-Options DENY;
    add_header X-XSS-Protection "1; mode=block";
}
```

#### Backend Security Headers
```javascript
// Enhanced helmet configuration for production
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https://api.scholarportal.yourdomain.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));
```

## 🏗️ Infrastructure Setup

### 4. Server Configuration

#### Docker Setup
```dockerfile
# Backend Dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY . .
EXPOSE 3001
USER node
CMD ["npm", "start"]
```

```dockerfile
# Frontend Dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

#### Docker Compose
```yaml
# docker-compose.prod.yml
version: '3.8'
services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: scholarship_management_prod
      POSTGRES_USER: scholarship_user
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./backups:/backups
    restart: unless-stopped

  backend:
    build: ./backend
    environment:
      - NODE_ENV=production
      - DB_HOST=postgres
    depends_on:
      - postgres
    volumes:
      - ./uploads:/app/uploads
      - ./logs:/app/logs
    restart: unless-stopped

  frontend:
    build: ./frontend
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - backend
    restart: unless-stopped

volumes:
  postgres_data:
```

### 5. Monitoring & Logging

#### Application Monitoring
```javascript
// backend/src/utils/monitoring.js
const winston = require('winston');

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ 
      filename: 'logs/error.log', 
      level: 'error' 
    }),
    new winston.transports.File({ 
      filename: 'logs/combined.log' 
    })
  ]
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}

module.exports = logger;
```

#### Health Check Endpoints
```javascript
// backend/src/routes/health.js
router.get('/health', async (req, res) => {
  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: process.env.npm_package_version
  };

  try {
    // Check database connection
    await sequelize.authenticate();
    health.database = 'connected';
  } catch (error) {
    health.database = 'disconnected';
    health.status = 'error';
  }

  // Check disk space
  const stats = await fs.promises.statfs('./uploads');
  health.disk_space = {
    free: stats.bavail * stats.bsize,
    total: stats.blocks * stats.bsize
  };

  const statusCode = health.status === 'ok' ? 200 : 503;
  res.status(statusCode).json(health);
});
```

## 📊 Performance Optimization

### 6. Database Optimization

#### Connection Pooling
```javascript
// backend/src/config/database.js
const sequelize = new Sequelize({
  // ... other config
  pool: {
    max: 20,          // Maximum connections
    min: 5,           // Minimum connections
    acquire: 60000,   // Maximum time to get connection
    idle: 10000,      // Maximum idle time
    evict: 1000       // Check for idle connections interval
  },
  logging: process.env.NODE_ENV === 'development' ? console.log : false
});
```

#### Query Optimization
```javascript
// Use proper indexes and includes
const getApplicationsOptimized = async (filters) => {
  return await Application.findAll({
    include: [
      {
        model: Student,
        as: 'student',
        attributes: ['student_id', 'gpa'],
        include: [{
          model: User,
          as: 'user',
          attributes: ['first_name', 'last_name', 'email']
        }]
      },
      {
        model: Scholarship,
        as: 'scholarship',
        attributes: ['name', 'amount', 'deadline']
      }
    ],
    where: filters,
    order: [['created_at', 'DESC']],
    limit: 50 // Always limit results
  });
};
```

### 7. Frontend Optimization

#### Build Optimization
```javascript
// webpack.config.js (if ejected)
module.exports = {
  optimization: {
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
        },
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
};
```

#### Code Splitting
```javascript
// Lazy load routes
const StudentDashboard = lazy(() => import('./pages/dashboard/StudentDashboard'));
const AdminDashboard = lazy(() => import('./pages/dashboard/AdminDashboard'));

// Use Suspense
<Suspense fallback={<LoadingSpinner />}>
  <Routes>
    <Route path="/student-dashboard" element={<StudentDashboard />} />
    <Route path="/admin-dashboard" element={<AdminDashboard />} />
  </Routes>
</Suspense>
```

## 🔒 Security Checklist

### 8. Security Validation

#### Input Validation
- [ ] All API endpoints have input validation
- [ ] File upload restrictions enforced
- [ ] SQL injection prevention (parameterized queries)
- [ ] XSS prevention (input sanitization)
- [ ] CSRF protection enabled

#### Authentication & Authorization
- [ ] Strong JWT secrets (256+ bits)
- [ ] Token expiration properly configured
- [ ] Role-based access control implemented
- [ ] Password hashing with bcrypt (12+ rounds)
- [ ] Account lockout after failed attempts

#### Data Protection
- [ ] Sensitive data encrypted at rest
- [ ] HTTPS enforced (SSL/TLS)
- [ ] Database credentials secured
- [ ] Environment variables protected
- [ ] Audit logging implemented

## 🚀 Deployment Steps

### 9. Production Deployment

#### Step 1: Prepare Infrastructure
```bash
# 1. Set up production server
sudo apt update && sudo apt upgrade -y
sudo apt install nginx postgresql redis-server

# 2. Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 3. Install PM2 for process management
sudo npm install -g pm2
```

#### Step 2: Deploy Backend
```bash
# 1. Clone repository
git clone https://github.com/your-org/scholarship-portal.git
cd scholarship-portal/backend

# 2. Install dependencies
npm ci --only=production

# 3. Set up environment
cp .env.example .env
# Edit .env with production values

# 4. Run database migrations
npm run migrate

# 5. Start with PM2
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup
```

#### Step 3: Deploy Frontend
```bash
# 1. Build frontend
cd ../frontend
npm ci
npm run build

# 2. Copy build to nginx
sudo cp -r build/* /var/www/html/

# 3. Configure nginx
sudo cp nginx.conf /etc/nginx/sites-available/scholarportal
sudo ln -s /etc/nginx/sites-available/scholarportal /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

#### Step 4: Configure SSL
```bash
# Using Let's Encrypt
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d scholarportal.yourdomain.com
```

### 10. Post-Deployment Verification

#### Health Checks
```bash
# Check backend health
curl https://api.scholarportal.yourdomain.com/api/v1/health

# Check frontend
curl https://scholarportal.yourdomain.com

# Check database connection
psql -h localhost -U scholarship_user -d scholarship_management_prod -c "SELECT 1;"
```

#### Performance Testing
```bash
# Load testing with Apache Bench
ab -n 1000 -c 10 https://api.scholarportal.yourdomain.com/api/v1/scholarships

# Monitor resource usage
htop
iotop
```

## 📈 Monitoring & Maintenance

### 11. Ongoing Monitoring

#### Log Monitoring
```bash
# Set up log rotation
sudo nano /etc/logrotate.d/scholarportal

# Monitor logs
tail -f /var/log/scholarportal/app.log
pm2 logs
```

#### Database Maintenance
```bash
# Weekly database backup
0 2 * * 0 pg_dump scholarship_management_prod > /backups/weekly_$(date +\%Y\%m\%d).sql

# Monthly vacuum and analyze
0 3 1 * * psql -d scholarship_management_prod -c "VACUUM ANALYZE;"
```

#### Security Updates
```bash
# Monthly security updates
sudo apt update && sudo apt upgrade -y
npm audit fix
```

### 12. Disaster Recovery

#### Backup Strategy
- [ ] Daily database backups
- [ ] Weekly full system backups
- [ ] File upload backups
- [ ] Configuration backups
- [ ] Test restore procedures monthly

#### Rollback Plan
- [ ] Previous version deployment scripts
- [ ] Database rollback procedures
- [ ] DNS failover configuration
- [ ] Communication plan for downtime

This comprehensive checklist ensures a secure, performant, and maintainable production deployment of the scholarship management system.