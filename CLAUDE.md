# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Status

**Monorepo structure implemented with Yarn workspaces**. Backend implementation is complete with full API endpoints, database schema, authentication, and notification services. Frontend shell is created with basic React/Vite setup. Full frontend implementation is pending.

## Project Overview

TimeBlocker is designed as a PWA that combines calendar functionality with time blocking, task management, and offline-first capabilities. The application uses 15-minute increment time blocks with drag-and-drop functionality for time management.

## Project Structure

This is a monorepo using Yarn workspaces with the following structure:
```
/
├── backend/          # Express.js API server (✅ COMPLETED)
├── frontend/         # React PWA (🔄 SHELL CREATED)
├── package.json      # Root workspace configuration
├── docker-compose.yml # Multi-service Docker setup
└── nginx.conf        # Production reverse proxy config
```

## Technology Stack

### Frontend
- React 18 with TypeScript
- Material UI (@mui/material) for components
- Zustand for state management
- @dnd-kit/core for drag and drop
- Vite as build tool
- vite-plugin-pwa with Workbox for PWA features
- IndexedDB (via idb) for offline storage
- dayjs for date handling
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

- `TimeBlocker Frontend PWA.md` - Frontend components, state management, PWA features
- `TimeBlocker Frontend - Services.md` - API services, offline sync, notification handling
- `TimeBlocker Backend.md` - API endpoints, database schema, authentication
- `TimeBlocker - Utilities and Configuration.md` - Shared utilities, configuration, deployment

## Implementation Commands

### Monorepo Setup
```bash
yarn install            # Install all workspace dependencies
yarn dev                # Start both frontend and backend in development
yarn build              # Build both frontend and backend
yarn docker:up          # Start all Docker services (postgres, backend, frontend, nginx)
yarn docker:down        # Stop all Docker services
yarn docker:logs        # View logs from all services
```

### Backend Workspace
```bash
yarn workspace @timeblocker/backend dev          # Development server
yarn workspace @timeblocker/backend build        # Build TypeScript
yarn workspace @timeblocker/backend start        # Production server
yarn migration:create     # Create database migration (from root)
yarn migration:up         # Run pending migrations (from root)
yarn migration:down       # Rollback migrations (from root)
```

### Frontend Workspace  
```bash
yarn workspace @timeblocker/frontend dev         # Development server with HMR
yarn workspace @timeblocker/frontend build       # Production build
yarn workspace @timeblocker/frontend preview     # Preview production build
yarn workspace @timeblocker/frontend lint        # ESLint check
yarn workspace @timeblocker/frontend type-check  # TypeScript check
```

### Environment Setup
```bash
# Backend environment
cp backend/.env.example backend/.env
# Edit backend/.env with JWT_SECRET, VAPID keys, database URL

# Frontend environment  
cp frontend/.env.example frontend/.env
# Edit frontend/.env with API URL and VAPID public key
```

## Architecture Notes

- **Offline-First**: Uses IndexedDB for local storage with background sync to server
- **PWA Features**: Service worker for caching and push notifications
- **Time Blocking**: 15-minute increments as base unit for all time calculations
- **Hierarchical Tasks**: Tasks can contain subtasks with inheritance of properties
- **JWT Authentication**: Stateless authentication with refresh token rotation
- **Database Migrations**: Uses MikroORM migrations for schema versioning

## Implementation Status

### ✅ Backend (Completed)
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
- All TypeScript dependencies and compilation resolved

### 🔄 Frontend (Foundation Complete, Core Implementation Pending)
- ✅ React 18 + TypeScript + Vite setup
- ✅ Material UI theme and basic components
- ✅ React Router with authentication routing
- ✅ Zustand auth store structure
- ✅ Basic page components (Home, Login, Register, Dashboard)
- ✅ PWA configuration with vite-plugin-pwa
- ✅ API service integration (authService)
- ✅ Demo user functionality with sample data
- 🔄 **Core API services** (task.service.ts, timeblock.service.ts) - PENDING
- 🔄 **Zustand stores** (task.store.ts, timeblock.store.ts) - PENDING
- 🔄 **Task management UI** (TaskList, TaskItem, TaskForm) - PENDING
- 🔄 **Time blocking UI** (DayViewGrid, TimeBlock, TimeSlot) - PENDING
- 🔄 **Drag-and-drop system** (@dnd-kit integration) - PENDING
- 🔄 **Calendar navigation** and day view switching - PENDING
- 🔄 **Offline functionality** (IndexedDB, service worker) - PENDING

### ✅ Infrastructure (Completed)
- ✅ Yarn workspaces monorepo structure
- ✅ Docker compose with multi-service setup
- ✅ Nginx reverse proxy configuration
- ✅ Production and development environments

## Development Workflow

1. ✅ Backend API endpoints and database schema (COMPLETED)
2. ✅ Monorepo structure with Yarn workspaces (COMPLETED)
3. ✅ Demo user functionality with sample data (COMPLETED)
4. 🔄 **Phase 1: Core API & State Foundation** (PENDING)
   - API services layer (task.service.ts, timeblock.service.ts)
   - Zustand stores with offline-first patterns
5. 🔄 **Phase 2: Essential UI Components** (PENDING)
   - Task management UI (TaskList, TaskItem, TaskForm)
   - Time blocking UI (DayViewGrid, TimeBlock, TimeSlot)
   - Drag-and-drop system with @dnd-kit
6. 🔄 **Phase 3: User Experience Features** (PENDING)
   - Calendar navigation and day view switching
   - Task-to-timeblock linking and 15-minute validation
   - Search, filtering, and hierarchical task display
7. 🔄 **Phase 4: Advanced Features** (PENDING)
   - PWA capabilities (offline storage, service worker)
   - Push notification system integration
   - Advanced task management (recurring, categories)
8. 🔄 Configure CI/CD pipeline (PENDING)

## API Endpoints (Implemented)

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/demo` - Login as demo user (creates demo data)
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

## Demo User

The application includes a demo user feature for easy testing:

- **Access**: Click "Try Demo" button on the home page
- **Credentials**: `demo@timeblocker.app` / `demo123` (auto-created)
- **Sample Data**: Includes pre-populated tasks, time blocks, and schedule
- **Features**: Full access to all application features with realistic data

## Implementation Plan

### 📋 **Current Todo List Status**
The project has **30 detailed tasks** organized into 4 phases, with each task cross-referencing specific documentation:

#### **Phase 1: Core API & State Foundation (Tasks 1-6)**
- `task.service.ts` and `timeblock.service.ts` with complete CRUD operations
- Zustand stores with offline-first patterns and optimistic updates
- Foundation for all data operations

#### **Phase 2: Essential UI Components (Tasks 7-12)**
- TaskList and TaskItem components with drag support
- DayViewGrid with 15-minute time slot precision
- TimeBlock components with collision detection
- Complete @dnd-kit drag-and-drop system

#### **Phase 3: User Experience (Tasks 13-22)**
- Task and time block creation/editing forms
- Calendar navigation with day view switching
- Task-to-timeblock linking and validation
- Search, filtering, and hierarchical task displays

#### **Phase 4: Advanced Features (Tasks 23-30)**
- PWA capabilities (IndexedDB, service worker)
- Push notifications with VAPID
- Advanced task management (recurring tasks, categories)
- Time tracking and progress visualization

### 🎯 **Next Immediate Steps**
1. **Start Phase 1**: Implement core API services to connect frontend to backend
2. **Build data foundation**: Create Zustand stores for tasks and time blocks  
3. **Enable demo functionality**: Connect demo user to real task/time block display

### 📚 **Documentation References**
All tasks include specific references to:
- **TimeBlocker Frontend PWA.md**: Component specifications with line numbers
- **TimeBlocker Frontend - Services.md**: API patterns and state management
- **TimeBlocker Backend.md**: API endpoints and data models

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
- ✅ Monorepo structure with Yarn workspaces
- ✅ Multi-service Docker setup with Nginx reverse proxy
- 🔄 Frontend state management through Zustand stores (IN PROGRESS)
- 🔄 Offline data sync capabilities (PENDING)