# Albedo Support Documentation & Feedback Platform

A comprehensive support documentation and feedback management system built with React, TypeScript, Node.js, and PostgreSQL. This platform provides a modern, responsive interface for managing support documentation, handling user feedback, and offering AI-powered assistance through an intelligent chat widget.

## 🚀 Features

### Admin Dashboard
- **Content Management**: Full CRUD operations for support categories and articles
- **Feedback Management**: View, respond to, and manage user feedback with status tracking
- **Analytics Dashboard**: Comprehensive metrics and insights
- **User Management**: Role-based access control (Super Admin, Support Agent, Viewer)
- **Email Integration**: Automated email notifications and responses

### Public Interface
- **Documentation Portal**: Clean, searchable documentation interface
- **Support Request System**: No-login required feedback submission
- **AI Chat Widget**: Intelligent search through documentation with real-time responses
- **Feedback Tracking**: Users can track their support requests via unique tokens
- **Dark Mode**: Complete light/dark theme support with smooth transitions

### Technical Features
- **Responsive Design**: Mobile-first approach with professional UI
- **Skeleton Loading**: Smooth loading states throughout the application
- **Search Functionality**: Fuzzy search powered by Fuse.js
- **Email Service**: Nodemailer integration with HTML templates
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT-based authentication system
- **API**: RESTful API with comprehensive error handling

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for build tooling
- **Tailwind CSS** for styling
- **Radix UI** for accessible components
- **React Router** for navigation
- **TanStack Query** for data fetching
- **Fuse.js** for search functionality

### Backend
- **Node.js** with Express
- **TypeScript** for type safety
- **Prisma** as ORM
- **PostgreSQL** as database
- **JWT** for authentication
- **Nodemailer** for email services
- **bcryptjs** for password hashing
- **Zod** for validation

## 📦 Installation & Setup

### Prerequisites
- Node.js 18+ 
- PostgreSQL 13+
- npm or yarn

### 1. Clone the Repository
```bash
git clone <repository-url>
cd albedoai
```

### 2. Backend Setup
```bash
cd backend
npm install

# Copy environment variables
cp env.example .env

# Edit .env with your configuration
# DATABASE_URL="postgresql://username:password@localhost:5432/albedo_support"
# JWT_SECRET="your-super-secret-jwt-key-here"
# SMTP_HOST="smtp.gmail.com"
# SMTP_PORT=587
# SMTP_USER="your-email@gmail.com"
# SMTP_PASS="your-app-password"

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev

# Seed the database
npm run db:seed

# Start the backend server
npm run dev
```

### 3. Frontend Setup
```bash
# From the root directory
npm install

# Start the development server
npm run dev
```

### 4. Database Setup
1. Create a PostgreSQL database named `albedo_support`
2. Update the `DATABASE_URL` in your `.env` file
3. Run migrations: `npx prisma migrate dev`
4. Seed the database: `npm run db:seed`

## 🔧 Configuration

### Environment Variables

#### Backend (.env)
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
NODE_ENV="development"
CORS_ORIGIN="http://localhost:5173"

# Search Configuration
SEARCH_THRESHOLD=0.3
MAX_SEARCH_RESULTS=5
```

### Default Admin Account
After seeding the database, you can log in with:
- **Email**: admin@albedoedu.com
- **Password**: admin123

## 📁 Project Structure

```
albedoai/
├── backend/                 # Backend API
│   ├── src/
│   │   ├── routes/         # API routes
│   │   ├── middleware/     # Auth middleware
│   │   ├── services/       # Email service
│   │   └── index.ts        # Main server file
│   ├── prisma/
│   │   └── schema.prisma   # Database schema
│   └── package.json
├── src/                    # Frontend React app
│   ├── components/         # Reusable components
│   ├── pages/             # Page components
│   ├── hooks/             # Custom hooks
│   └── lib/               # Utilities
└── package.json
```

## 🚀 Deployment

### Backend Deployment
1. Build the TypeScript code: `npm run build`
2. Set up environment variables on your server
3. Run database migrations: `npx prisma migrate deploy`
4. Start the server: `npm start`

### Frontend Deployment
1. Build the React app: `npm run build`
2. Deploy the `dist` folder to your hosting service
3. Update API endpoints in the frontend code

### Docker Deployment (Optional)
```dockerfile
# Backend Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY backend/package*.json ./
RUN npm install
COPY backend/ .
RUN npm run build
EXPOSE 3001
CMD ["npm", "start"]
```

## 🔐 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcryptjs for password security
- **Input Validation**: Zod schemas for request validation
- **Rate Limiting**: Express rate limiting middleware
- **CORS Protection**: Configurable CORS settings
- **Helmet Security**: Security headers with Helmet

## 📊 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration (admin only)
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/change-password` - Change password

### Categories
- `GET /api/categories` - Get all categories
- `POST /api/categories` - Create category (admin)
- `PUT /api/categories/:id` - Update category (admin)
- `DELETE /api/categories/:id` - Delete category (admin)

### Articles
- `GET /api/articles` - Get all articles
- `POST /api/articles` - Create article (admin)
- `PUT /api/articles/:id` - Update article (admin)
- `DELETE /api/articles/:id` - Delete article (admin)

### Feedback
- `POST /api/feedback/submit` - Submit feedback (public)
- `GET /api/feedback/token/:token` - Get feedback by token (public)
- `GET /api/feedback` - Get all feedback (admin)
- `POST /api/feedback/:id/replies` - Add reply (admin)

### Search
- `POST /api/search/articles` - Search articles
- `POST /api/search/categories` - Search categories
- `POST /api/search/global` - Global search

### Analytics
- `GET /api/analytics/dashboard` - Dashboard metrics
- `GET /api/analytics/articles` - Article analytics
- `GET /api/analytics/trends` - Trend data

## 🎨 UI/UX Features

### Design System
- **Professional Color Palette**: Blue/purple gradient theme
- **Consistent Typography**: Inter font family
- **Responsive Grid**: Mobile-first responsive design
- **Smooth Animations**: CSS transitions and hover effects
- **Accessibility**: WCAG compliant components

### Dark Mode
- **System Preference Detection**: Automatic theme detection
- **Manual Toggle**: Theme switcher in header
- **Persistent Storage**: Theme preference saved locally
- **Smooth Transitions**: Animated theme switching

### Skeleton Loading
- **Card Skeletons**: For dashboard metrics
- **Table Skeletons**: For data tables
- **Form Skeletons**: For form loading states
- **Customizable**: Easy to implement across components

## 🤖 AI Chat Widget

### Features
- **Real-time Search**: Searches documentation in real-time
- **Relevance Scoring**: Intelligent result ranking
- **External Links**: Direct links to relevant articles
- **Responsive Design**: Works on all screen sizes
- **Floating Interface**: Non-intrusive overlay design

### Search Algorithm
- **Fuzzy Search**: Powered by Fuse.js
- **Multi-field Search**: Searches title, content, excerpt, and tags
- **Relevance Threshold**: Configurable search sensitivity
- **Result Limiting**: Configurable maximum results

## 📧 Email System

### Templates
- **Feedback Acknowledgment**: Welcome email for new requests
- **Reply Notifications**: Email when admin responds
- **HTML Templates**: Professional email design
- **Responsive Design**: Mobile-friendly emails

### Configuration
- **SMTP Support**: Works with any SMTP provider
- **Template System**: Easy to customize email templates
- **Error Handling**: Graceful email failure handling
- **Rate Limiting**: Prevents email spam

## 🔍 Search & Analytics

### Search Features
- **Fuzzy Matching**: Intelligent text matching
- **Category Filtering**: Filter by documentation categories
- **Relevance Scoring**: Results ranked by relevance
- **Real-time Results**: Instant search feedback

### Analytics Dashboard
- **Overview Metrics**: Total feedback, open tickets, articles
- **Trend Analysis**: Time-based analytics
- **Category Breakdown**: Performance by category
- **Response Times**: Average response time tracking

## 🛡️ Error Handling

### Frontend
- **Toast Notifications**: User-friendly error messages
- **Loading States**: Clear loading indicators
- **Fallback UI**: Graceful error boundaries
- **Retry Mechanisms**: Automatic retry for failed requests

### Backend
- **Validation Errors**: Detailed validation messages
- **HTTP Status Codes**: Proper status code usage
- **Error Logging**: Comprehensive error logging
- **Graceful Degradation**: Fallback responses

## 📱 Mobile Support

### Responsive Design
- **Mobile-first**: Designed for mobile devices first
- **Touch-friendly**: Large touch targets
- **Swipe Gestures**: Natural mobile interactions
- **Optimized Performance**: Fast loading on mobile

### Progressive Web App
- **Service Worker**: Offline functionality
- **App Manifest**: Installable on mobile devices
- **Push Notifications**: Real-time updates
- **Caching Strategy**: Efficient resource caching

## 🧪 Testing

### Frontend Testing
```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Run E2E tests
npm run test:e2e
```

### Backend Testing
```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage
```

## 📈 Performance

### Frontend Optimizations
- **Code Splitting**: Lazy loading of components
- **Image Optimization**: Optimized images and icons
- **Bundle Analysis**: Webpack bundle analyzer
- **Caching**: Efficient caching strategies

### Backend Optimizations
- **Database Indexing**: Optimized database queries
- **Connection Pooling**: Efficient database connections
- **Caching**: Redis caching for frequent queries
- **Compression**: Gzip compression for responses

## 🔧 Development

### Code Quality
- **ESLint**: Code linting and formatting
- **Prettier**: Code formatting
- **TypeScript**: Type safety
- **Husky**: Git hooks for quality checks

### Development Tools
- **Hot Reload**: Fast development feedback
- **Source Maps**: Easy debugging
- **Dev Tools**: Browser dev tools integration
- **API Testing**: Built-in API testing tools

## 📝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new features
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- **Email**: support@albedoedu.com
- **Documentation**: Check the built-in documentation
- **Issues**: Create an issue on GitHub

## 🎯 Roadmap

### Upcoming Features
- [ ] Real-time notifications
- [ ] Advanced analytics
- [ ] Multi-language support
- [ ] API rate limiting
- [ ] Advanced search filters
- [ ] Bulk operations
- [ ] Export functionality
- [ ] Integration with external tools

---

Built with ❤️ for the Albedo Education Platform