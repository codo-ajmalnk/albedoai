# Deployment Guide

This guide covers deploying the Albedo Support Documentation & Feedback Platform to various hosting platforms.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- PostgreSQL database
- SMTP email service (Gmail, SendGrid, etc.)
- Domain name (optional)

### 1. Environment Setup

#### Backend Environment Variables
Create a `.env` file in the `backend/` directory:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/albedo_support"

# JWT
JWT_SECRET="your-super-secret-jwt-key-here"
JWT_EXPIRES_IN="7d"

# Email Configuration
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
FROM_EMAIL="noreply@albedoedu.com"
FROM_NAME="Albedo Support"

# App Configuration
PORT=3001
NODE_ENV="production"
CORS_ORIGIN="https://yourdomain.com"

# Search Configuration
SEARCH_THRESHOLD=0.3
MAX_SEARCH_RESULTS=5
```

#### Frontend Environment Variables
Create a `.env` file in the root directory:

```env
VITE_API_URL=https://your-api-domain.com
VITE_APP_NAME="Albedo Support"
```

### 2. Database Setup

#### Local PostgreSQL
```bash
# Create database
createdb albedo_support

# Run migrations
cd backend
npx prisma migrate deploy

# Seed database
npm run db:seed
```

#### Cloud PostgreSQL (Recommended)
- **Heroku Postgres**: Easy setup with add-on
- **AWS RDS**: Scalable and reliable
- **DigitalOcean Managed Databases**: Cost-effective
- **Supabase**: Open source alternative

### 3. Build and Deploy

#### Development Build
```bash
# Install dependencies
npm run setup

# Start development servers
npm run dev:full
```

#### Production Build
```bash
# Build both frontend and backend
npm run build:full

# Start production server
npm run backend:start
```

## 🌐 Hosting Platforms

### Vercel (Frontend) + Railway (Backend)

#### Frontend on Vercel
1. Connect your GitHub repository to Vercel
2. Set build command: `npm run build`
3. Set output directory: `dist`
4. Add environment variables:
   ```
   VITE_API_URL=https://your-backend.railway.app
   ```

#### Backend on Railway
1. Connect your GitHub repository to Railway
2. Set root directory: `backend`
3. Add environment variables (see backend env above)
4. Railway will automatically detect Node.js and install dependencies

### Netlify (Frontend) + Heroku (Backend)

#### Frontend on Netlify
1. Connect repository to Netlify
2. Set build command: `npm run build`
3. Set publish directory: `dist`
4. Add environment variables in Netlify dashboard

#### Backend on Heroku
1. Create new Heroku app
2. Add PostgreSQL add-on
3. Set environment variables
4. Deploy from GitHub

### DigitalOcean App Platform

#### Full Stack Deployment
1. Connect repository to DigitalOcean
2. Configure build settings:
   - Frontend: `npm run build` → `dist`
   - Backend: `cd backend && npm run build` → `dist`
3. Add environment variables
4. Configure database connection

### AWS (Advanced)

#### Frontend on S3 + CloudFront
1. Build frontend: `npm run build`
2. Upload `dist` folder to S3 bucket
3. Configure CloudFront distribution
4. Set up custom domain

#### Backend on EC2 + RDS
1. Launch EC2 instance
2. Install Node.js and PM2
3. Set up RDS PostgreSQL instance
4. Deploy backend code
5. Configure load balancer

## 🐳 Docker Deployment

### Docker Compose Setup

Create `docker-compose.yml`:

```yaml
version: '3.8'
services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: albedo_support
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  backend:
    build: ./backend
    ports:
      - "3001:3001"
    environment:
      DATABASE_URL: postgresql://postgres:password@postgres:5432/albedo_support
      JWT_SECRET: your-jwt-secret
      SMTP_HOST: smtp.gmail.com
      SMTP_USER: your-email@gmail.com
      SMTP_PASS: your-app-password
    depends_on:
      - postgres

  frontend:
    build: .
    ports:
      - "3000:80"
    environment:
      VITE_API_URL: http://backend:3001
    depends_on:
      - backend

volumes:
  postgres_data:
```

### Docker Commands
```bash
# Build and start
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## 🔧 Production Optimizations

### Backend Optimizations
1. **Enable Compression**: Use gzip compression
2. **Rate Limiting**: Implement API rate limiting
3. **Caching**: Add Redis for caching
4. **Monitoring**: Set up logging and monitoring
5. **Security**: Enable HTTPS and security headers

### Frontend Optimizations
1. **CDN**: Use CDN for static assets
2. **Caching**: Set proper cache headers
3. **Compression**: Enable gzip/brotli compression
4. **Minification**: Minify CSS and JavaScript
5. **Image Optimization**: Optimize images

### Database Optimizations
1. **Indexing**: Add proper database indexes
2. **Connection Pooling**: Use connection pooling
3. **Backups**: Set up automated backups
4. **Monitoring**: Monitor database performance

## 🔐 Security Checklist

### Backend Security
- [ ] Use HTTPS in production
- [ ] Set secure JWT secrets
- [ ] Enable CORS properly
- [ ] Validate all inputs
- [ ] Use rate limiting
- [ ] Set security headers
- [ ] Keep dependencies updated

### Frontend Security
- [ ] Use HTTPS
- [ ] Sanitize user inputs
- [ ] Implement CSP headers
- [ ] Use secure cookies
- [ ] Validate forms client-side

### Database Security
- [ ] Use strong passwords
- [ ] Enable SSL connections
- [ ] Restrict database access
- [ ] Regular security updates
- [ ] Backup encryption

## 📊 Monitoring & Analytics

### Application Monitoring
- **Uptime Monitoring**: UptimeRobot, Pingdom
- **Error Tracking**: Sentry, Bugsnag
- **Performance**: New Relic, DataDog
- **Logs**: LogRocket, Papertrail

### Database Monitoring
- **Query Performance**: pg_stat_statements
- **Connection Monitoring**: pg_stat_activity
- **Disk Usage**: Monitor database size
- **Backup Verification**: Test restore procedures

## 🔄 CI/CD Pipeline

### GitHub Actions Example

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        
    - name: Install dependencies
      run: npm run setup
      
    - name: Run tests
      run: npm test
      
    - name: Build application
      run: npm run build:full
      
    - name: Deploy to production
      run: |
        # Your deployment commands here
        echo "Deploying to production..."
```

## 🚨 Troubleshooting

### Common Issues

#### Database Connection Issues
```bash
# Check database connection
psql $DATABASE_URL

# Test connection from backend
cd backend && node -e "console.log(process.env.DATABASE_URL)"
```

#### Email Issues
```bash
# Test SMTP connection
cd backend && node -e "
const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransporter({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});
transporter.verify().then(console.log).catch(console.error);
"
```

#### Build Issues
```bash
# Clear cache and rebuild
rm -rf node_modules package-lock.json
npm install
npm run build:full
```

### Performance Issues
1. **Check database queries**: Use `EXPLAIN ANALYZE`
2. **Monitor memory usage**: Use `htop` or similar
3. **Check network latency**: Use `ping` and `traceroute`
4. **Review logs**: Check application and server logs

## 📈 Scaling

### Horizontal Scaling
1. **Load Balancer**: Use nginx or cloud load balancer
2. **Multiple Backend Instances**: Deploy multiple backend instances
3. **Database Replication**: Set up read replicas
4. **CDN**: Use CloudFlare or AWS CloudFront

### Vertical Scaling
1. **Increase Server Resources**: More CPU, RAM, disk
2. **Database Optimization**: Better indexing, query optimization
3. **Caching**: Implement Redis caching
4. **Connection Pooling**: Optimize database connections

## 🔄 Backup & Recovery

### Database Backups
```bash
# Create backup
pg_dump $DATABASE_URL > backup.sql

# Restore backup
psql $DATABASE_URL < backup.sql

# Automated backup script
#!/bin/bash
pg_dump $DATABASE_URL | gzip > backup_$(date +%Y%m%d_%H%M%S).sql.gz
```

### Application Backups
1. **Code Repository**: Use Git for version control
2. **Environment Variables**: Store securely (1Password, etc.)
3. **File Uploads**: Backup to S3 or similar
4. **Configuration**: Document all configuration changes

## 📞 Support

For deployment issues:
1. Check the logs first
2. Review this documentation
3. Check GitHub issues
4. Contact support team

---

**Happy Deploying! 🚀**
