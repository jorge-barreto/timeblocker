# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Status

**This is currently a documentation-only project** containing comprehensive specifications for TimeGrid - a Progressive Web App for calendar-style time management. No source code has been implemented yet.

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

## Implementation Commands (When Code Exists)

### Backend (Expected)
```bash
npm run dev          # Development server
npm run build        # Production build
npm run migration:create  # Create database migration  
npm run migration:up      # Run migrations
npm test            # Run tests
```

### Frontend (Expected)
```bash
npm run dev         # Development server with HMR
npm run build       # Production build
npm run preview     # Preview production build
npm test           # Run tests
```

### Docker (Expected)
```bash
docker-compose up -d        # Start all services
docker-compose down         # Stop services  
docker-compose logs -f      # View logs
```

## Architecture Notes

- **Offline-First**: Uses IndexedDB for local storage with background sync to server
- **PWA Features**: Service worker for caching and push notifications
- **Time Blocking**: 15-minute increments as base unit for all time calculations
- **Hierarchical Tasks**: Tasks can contain subtasks with inheritance of properties
- **JWT Authentication**: Stateless authentication with refresh token rotation
- **Database Migrations**: Uses MikroORM migrations for schema versioning

## Development Workflow (When Implementing)

1. Start with backend API endpoints and database schema
2. Implement frontend components following Material UI design system
3. Add PWA features (service worker, manifest, offline capabilities)
4. Implement drag-and-drop time blocking functionality
5. Add push notification system
6. Set up Docker containerization
7. Configure CI/CD pipeline

## Key Implementation Notes

- All time calculations should use 15-minute increments
- Offline data must sync properly when connection is restored  
- Push notifications require VAPID key configuration
- Database uses UUID primary keys for all entities
- Frontend state management through Zustand stores
- API follows RESTful conventions with proper HTTP status codes