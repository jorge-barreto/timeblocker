# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Status

**Backend implementation is complete** based on specifications in TimeGrid Backend.md. The backend includes full API endpoints, database schema, authentication, and notification services. Frontend implementation is still pending.

## Project Overview

TimeGrid is designed as a PWA that combines calendar functionality with time blocking, task management, and offline-first capabilities. The application uses 15-minute increment time blocks with drag-and-drop functionality for time management.

## Planned Technology Stack

### Frontend
- React 18 with TypeScript
- Material UI (@mui/material) for components
- Zustand for state management
- @dnd-kit/core for drag and drop
- Vite as build tool
- vite-plugin-pwa with Workbox for PWA features
- IndexedDB (via idb) for offline storage
- date-fns for date handling
- Axios for HTTP requests

### Backend
- Node.js with Express
- PostgreSQL database
- MikroORM as ORM
- JWT authentication with bcryptjs
- web-push for notifications
- node-cron for scheduled tasks

## Documentation Files

The following specification files contain detailed implementation guidance:

- `TimeGrid Frontend PWA.md` - Frontend components, state management, PWA features
- `TimeGrid Frontend - Services.md` - API services, offline sync, notification handling
- `TimeGrid Backend.md` - API endpoints, database schema, authentication
- `TimeGrid - Utilities and Configuration.md` - Shared utilities, configuration, deployment

## Implementation Commands

### Backend (Implemented)
```bash
cd backend
npm install          # Install dependencies
npm run dev          # Development server with nodemon
npm run build        # TypeScript compilation to dist/
npm start            # Production server from dist/
npm run migration:create  # Create new database migration  
npm run migration:up      # Run pending migrations
npm run migration:down    # Rollback migrations
```

### Frontend (Expected)
```bash
npm run dev         # Development server with HMR
npm run build       # Production build
npm run preview     # Preview production build
npm test           # Run tests
```

### Docker (Implemented)
```bash
cd backend
docker-compose up -d        # Start PostgreSQL and backend services
docker-compose down         # Stop all services  
docker-compose logs -f      # View logs from all services
```

### Environment Setup
```bash
cd backend
cp .env.example .env        # Copy and configure environment variables
# Edit .env with actual values for JWT_SECRET, VAPID keys, etc.
```

## Architecture Notes

- **Offline-First**: Uses IndexedDB for local storage with background sync to server
- **PWA Features**: Service worker for caching and push notifications
- **Time Blocking**: 15-minute increments as base unit for all time calculations
- **Hierarchical Tasks**: Tasks can contain subtasks with inheritance of properties
- **JWT Authentication**: Stateless authentication with refresh token rotation
- **Database Migrations**: Uses MikroORM migrations for schema versioning

## Backend Implementation Status

✅ **Completed Components:**
- Express.js server with TypeScript
- MikroORM with PostgreSQL integration  
- JWT authentication system
- User management with bcrypt password hashing
- Task CRUD operations with hierarchical support
- Time block management with 15-minute increment validation
- Push notification service with VAPID
- Daily planning reminder cron jobs
- Database schema and migrations
- Docker containerization
- Comprehensive error handling and validation

## Development Workflow

1. ✅ Backend API endpoints and database schema (COMPLETED)
2. 🔄 Implement frontend components following Material UI design system (PENDING)
3. 🔄 Add PWA features (service worker, manifest, offline capabilities) (PENDING)
4. 🔄 Implement drag-and-drop time blocking functionality (PENDING)
5. 🔄 Add push notification system (PENDING)
6. ✅ Set up Docker containerization (COMPLETED)
7. 🔄 Configure CI/CD pipeline (PENDING)

## API Endpoints (Implemented)

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/push-subscription` - Update push notification subscription

### Tasks
- `GET /api/tasks` - Get user tasks (filterable by status, priority, parentId)
- `POST /api/tasks` - Create new task
- `PATCH /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task

### Time Blocks
- `GET /api/day-view` - Get time blocks for a specific date
- `POST /api/timeblocks` - Create new time block
- `PATCH /api/timeblocks/:id` - Update time block
- `DELETE /api/timeblocks/:id` - Delete time block

### Health Check
- `GET /api/health` - Service health status

## Key Implementation Notes

- ✅ All time calculations use 15-minute increments with validation
- ✅ Push notifications implemented with VAPID key configuration
- ✅ Database uses UUID primary keys for all entities
- ✅ API follows RESTful conventions with proper HTTP status codes
- ✅ JWT authentication with bcrypt password hashing
- ✅ Comprehensive input validation with express-validator
- ✅ Time zone support for user-specific time calculations
- ✅ Overlap detection for time block scheduling
- ✅ Hierarchical task structure with subtask support
- 🔄 Frontend state management through Zustand stores (PENDING)
- 🔄 Offline data sync capabilities (PENDING)