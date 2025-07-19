# Authentication Microfrontend Application

## Overview

This is a modern authentication microfrontend application built with React, TypeScript, and Express. It provides a complete multi-tenant authentication system with enterprise-grade security features including JWT authentication, MFA support, SSO integration, and customizable tenant branding.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

The application follows a full-stack TypeScript architecture with clear separation between client and server code:

**Frontend**: React SPA with TypeScript, using Vite for development and building
**Backend**: Express.js server with TypeScript
**Database**: PostgreSQL with Drizzle ORM for schema management
**Styling**: Tailwind CSS with shadcn/ui components for consistent design
**State Management**: Zustand stores for authentication and tenant management
**Authentication**: JWT-based with refresh tokens and optional MFA

## Key Components

### Database Layer
- **Drizzle ORM**: Provides type-safe database operations with PostgreSQL
- **Schema**: Defines users, tenants, refresh tokens, and authentication attempts tables
- **Migrations**: Located in `./migrations` directory, managed via `drizzle-kit`

### Authentication System
- **JWT Implementation**: Access tokens (15min) and refresh tokens (7d) for secure session management
- **MFA Support**: TOTP-based two-factor authentication with backup codes
- **Multi-tenant**: Tenant isolation at the database level with customizable branding
- **Password Security**: bcrypt hashing with configurable salt rounds

### Frontend Architecture
- **Component Structure**: Modular auth components in `/client/src/components/auth/`
  - `LoginForm`, `RegisterForm`, `ForgotPasswordForm`: Commercial-grade authentication forms
  - `SimpleLogin`: Streamlined login component for internal applications
  - `TenantBranding`: Dynamic branding system with custom ERP360 SVG logo
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: Zustand stores for auth state and tenant configuration
- **UI Components**: shadcn/ui component library with enhanced Lucide React icons

### Backend Services
- **Memory Storage**: Development-friendly in-memory storage implementation
- **Route Handlers**: RESTful API endpoints for auth operations
- **Middleware**: JWT verification and request logging
- **Error Handling**: Centralized error handling with proper HTTP status codes

## Data Flow

1. **Tenant Resolution**: Extract tenant ID from subdomain or URL parameter
2. **Tenant Loading**: Fetch tenant configuration and apply custom branding
3. **Authentication**: Handle login/register with optional MFA verification
4. **Session Management**: Automatic token refresh and secure storage
5. **Authorization**: Middleware-based route protection with user context

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: Neon PostgreSQL driver for database connections
- **@tanstack/react-query**: Server state management and caching
- **@radix-ui**: Accessible UI primitives for components
- **bcryptjs**: Password hashing and verification
- **jsonwebtoken**: JWT token generation and verification
- **drizzle-orm**: Type-safe ORM for database operations

### Development Tools
- **Vite**: Fast development server and build tool
- **TypeScript**: Type safety across the entire application
- **Tailwind CSS**: Utility-first CSS framework
- **ESBuild**: Fast JavaScript bundler for production builds

### Authentication & Security
- **JWT**: Stateless authentication with access/refresh token pattern
- **bcrypt**: Secure password hashing with salt rounds
- **CORS**: Configured for secure cross-origin requests
- **Rate Limiting**: Planned implementation for brute force protection

## Deployment Strategy

### Development
- **Local Development**: Vite dev server with Express backend
- **Hot Reload**: File watching and automatic recompilation
- **Database**: Connection via DATABASE_URL environment variable

### Production Build
- **Frontend**: Vite build outputs to `dist/public`
- **Backend**: ESBuild bundles server code to `dist/index.js`
- **Static Serving**: Express serves built frontend assets
- **Environment**: Production configuration via environment variables

### Database Management
- **Schema Evolution**: Drizzle migrations for database schema changes
- **Connection Pooling**: Configured for production database connections
- **Backup Strategy**: Planned automated backups for data protection

The application is designed as a microfrontend that can be embedded in larger applications while maintaining its own authentication state and tenant configuration.