# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Status

**Monorepo structure implemented with Yarn workspaces**. Backend implementation is complete with full API endpoints, database schema, authentication, and notification services. **Frontend is ~85% complete** with full navigation, UI components, error handling, and branding implemented. Core functionality is working with remaining tasks being PWA features and optimization.

## Project Overview

TimeBlocker is designed as a PWA that combines calendar functionality with time blocking, task management, and offline-first capabilities. The application uses 15-minute increment time blocks with drag-and-drop functionality for time management.

## Project Structure

This is a monorepo using Yarn workspaces with the following structure:
```
/
├── backend/          # Express.js API server (✅ COMPLETED)
├── frontend/         # React PWA (🔄 ~85% COMPLETE)
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

### 🔄 Frontend (~85% Complete - Polish & PWA Phase)
#### ✅ **Completed Foundation (100%)**
- ✅ React 18 + TypeScript + Vite setup
- ✅ Material UI theme and basic components
- ✅ React Router with authentication routing
- ✅ PWA configuration with vite-plugin-pwa
- ✅ Demo user functionality with sample data

#### ✅ **Completed Core Systems (100%)**
- ✅ **Core API services** (task.service.ts, timeblock.service.ts) - COMPLETE with full CRUD
- ✅ **Zustand stores** (task.store.ts, timeblock.store.ts) - COMPLETE with optimistic updates
- ✅ **Authentication system** (authStore.ts, authService.ts) - COMPLETE with JWT handling
- ✅ **Error handling** (react-toastify) - COMPLETE with responsive mobile/desktop positioning

#### ✅ **UI Components Fully Implemented (95%)**
- ✅ **TaskList component** - Complete with search, filters, statistics
- ✅ **TaskItem component** - Complete with drag support, subtasks, progress tracking
- ✅ **TaskForm component** - Complete with validation, recurring tasks, all fields
- ✅ **Dashboard component** - Complete with stats, quick actions, improved layout
- ✅ **DayViewGrid component** - Complete with drag-drop, time positioning, 15-minute slots
- ✅ **TimeBlock component** - Complete with drag support, status indicators, menu actions
- ✅ **TimeBlockForm component** - Complete with time validation, task linking, 15-minute rounding
- ✅ **TimeSlot component** - Complete with drop zones for drag-and-drop
- ✅ **Navigation system** - Complete with tabs (Dashboard, Tasks, Calendar)
- ✅ **Drag-and-drop system** (@dnd-kit integration) - COMPLETE and functional
- ✅ **Calendar navigation** - COMPLETE with day view switching, today button
- ✅ **15-minute time slot precision** - COMPLETE with validation and rounding

#### ✅ **User Experience Features (90%)**
- ✅ **Task-to-timeblock linking** - COMPLETE with dropdown selection
- ✅ **Demo data integration** - Tasks and time blocks display properly
- ✅ **Component integration** - All views accessible through navigation
- ✅ **Error handling and loading states** - Toast notifications for all operations
- ✅ **Responsive design** - Mobile-first approach with desktop optimization
- ✅ **Brand identity** - Custom SVG logo and icon integrated throughout app

#### 🔄 **Remaining Tasks (15%)**
- 🔄 **MikroORM collection issues** - Task.totalMinutesWorked needs collection population fix
- 🔄 **Time block overlap detection** - Debug existing demo data causing false overlaps
- 🔄 **Offline functionality** (IndexedDB, service worker) - PENDING
- 🔄 **PWA optimization** - Service worker caching, offline sync
- 🔄 **Performance optimization** - Code splitting, bundle optimization

### ✅ Infrastructure (Completed)
- ✅ Yarn workspaces monorepo structure
- ✅ Docker compose with multi-service setup
- ✅ Nginx reverse proxy configuration
- ✅ Production and development environments

## Development Workflow

1. ✅ Backend API endpoints and database schema (COMPLETED)
2. ✅ Monorepo structure with Yarn workspaces (COMPLETED)
3. ✅ Demo user functionality with sample data (COMPLETED)
4. ✅ **Phase 1: Core API & State Foundation** (COMPLETED)
   - ✅ API services layer (task.service.ts, timeblock.service.ts) - COMPLETE
   - ✅ Zustand stores with offline-first patterns - COMPLETE
5. ✅ **Phase 2: Essential UI Components** (COMPLETED)
   - ✅ Task management UI (TaskList, TaskItem, TaskForm) - COMPLETE with full functionality
   - ✅ Time blocking UI (DayViewGrid, TimeBlock, TimeSlot) - COMPLETE and integrated
   - ✅ Drag-and-drop system with @dnd-kit - COMPLETE and functional
   - ✅ Navigation system with tab routing - COMPLETE
6. ✅ **Phase 3: User Experience Features** (COMPLETED)
   - ✅ Calendar navigation with day view switching - COMPLETE
   - ✅ Task-to-timeblock linking and 15-minute validation - COMPLETE
   - ✅ Search, filtering, and hierarchical task displays - COMPLETE
   - ✅ Error handling with toast notifications - COMPLETE
   - ✅ Responsive mobile/desktop design - COMPLETE
7. 🔄 **Phase 4: Advanced Features** (PENDING)
   - 🔄 PWA capabilities (offline storage, service worker) - PENDING
   - 🔄 Push notification system integration - PENDING
   - 🔄 Advanced task management (recurring, categories) - PENDING
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

### 📋 **Current Implementation Status: ~85% Complete**

#### ✅ **Phases 1-3: Core Functionality (COMPLETED)**
- ✅ **Phase 1**: Core API & State Foundation - COMPLETE
  - `task.service.ts` and `timeblock.service.ts` with complete CRUD operations ✅
  - Zustand stores with offline-first patterns and optimistic updates ✅
  - Foundation for all data operations ✅

- ✅ **Phase 2**: Essential UI Components - COMPLETE
  - All individual component files (TaskItem, TaskForm, TimeBlock, TimeBlockForm, TimeSlot) ✅
  - DayViewGrid fully integrated into app navigation ✅
  - Complete @dnd-kit drag-and-drop system ✅
  - TaskList with search, filters, statistics ✅
  - Dashboard with improved layout and quick actions ✅

- ✅ **Phase 3**: User Experience Features - COMPLETE
  - Calendar navigation with day view switching ✅
  - Task-to-timeblock linking and 15-minute validation ✅
  - Error handling with responsive toast notifications ✅
  - Full app navigation with tabs (Dashboard, Tasks, Calendar) ✅
  - Mobile-first responsive design ✅
  - Brand identity with custom SVG logo/icon ✅

#### 🔄 **Phase 4: Advanced Features (IN PROGRESS - 15% remaining)**
- 🔄 PWA capabilities (IndexedDB, service worker) - PENDING
- 🔄 Push notifications with VAPID - Backend ready, frontend integration pending
- 🔄 Time tracking and progress visualization - Basic implementation complete
- 🔄 Performance optimization and code splitting - PENDING

### 🎯 **Next Immediate Steps - Focus on PWA & Polish**
1. **Fix MikroORM Issues**: Resolve Task.totalMinutesWorked collection initialization
2. **Debug Time Block Overlaps**: Investigate demo data causing false overlap errors
3. **Implement PWA Features**: Add service worker for offline functionality
4. **Performance Optimization**: Code splitting and bundle optimization
5. **Testing & Bug Fixes**: End-to-end testing and edge case handling

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
- ✅ Frontend state management through Zustand stores (COMPLETE)
- ✅ Core UI components with drag-and-drop functionality (COMPLETE)
- ✅ Task and time block management systems (COMPLETE)
- ✅ Component integration and calendar navigation (COMPLETE)
- ✅ Error handling with responsive toast notifications (COMPLETE)
- ✅ Brand identity with custom SVG logo and icon (COMPLETE)
- 🔄 MikroORM collection initialization fixes (IN PROGRESS)
- 🔄 Offline data sync capabilities (PENDING)