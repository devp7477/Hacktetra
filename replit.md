# SynergySphere - Advanced Team Collaboration Platform

## Overview

SynergySphere is a comprehensive team collaboration platform designed to streamline project management, task coordination, and team communication. The application serves as an intelligent backbone for teams, helping them organize work, communicate effectively, and manage resources while providing insights to prevent issues before they become problems.

The platform is built as a full-stack web application with both desktop and mobile-responsive interfaces, featuring real-time collaboration capabilities, project management tools, task tracking, and integrated team communication.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

The frontend is built using **React 18** with **TypeScript** in a **Vite**-powered development environment. The application follows a component-based architecture with clear separation of concerns:

- **UI Framework**: Utilizes shadcn/ui components built on top of Radix UI primitives for consistent, accessible design
- **Styling**: Tailwind CSS with CSS custom properties for theming and dark mode support
- **State Management**: TanStack Query (React Query) for server state management and caching
- **Routing**: Wouter for lightweight client-side routing
- **Form Handling**: React Hook Form with Zod validation for type-safe form management

The frontend follows a modular structure with organized directories for components, pages, hooks, and utilities. Components are built with reusability in mind and include comprehensive UI elements for forms, navigation, data display, and user interactions.

### Backend Architecture

The backend is an **Express.js** server with **TypeScript** following RESTful API conventions:

- **Runtime**: Node.js with ES modules
- **API Structure**: Express routes with middleware for authentication, error handling, and request logging
- **Real-time Communication**: WebSocket integration for live chat and notifications
- **Session Management**: Express sessions with PostgreSQL storage for persistent authentication

The server architecture separates concerns into distinct modules for routing, database operations, authentication, and WebSocket handling.

### Authentication System

Authentication is handled through **Replit's OpenID Connect (OIDC)** integration:

- **Provider**: Replit OIDC for seamless authentication in the Replit environment
- **Session Storage**: PostgreSQL-backed sessions with configurable TTL
- **Security**: HTTP-only cookies with secure flags for production
- **User Management**: Automatic user creation and profile synchronization

### Database Design

The application uses **PostgreSQL** as the primary database with **Drizzle ORM** for type-safe database operations:

- **Schema Definition**: Centralized schema definitions in TypeScript with automatic type generation
- **Migration Strategy**: Drizzle Kit for database migrations and schema management
- **Connection**: Neon serverless PostgreSQL with WebSocket support for optimal performance

Key database entities include users, projects, tasks, project members, chat messages, and notifications with proper relational constraints and indexes.

### Data Layer Architecture

The storage layer is abstracted through a comprehensive interface pattern:

- **Storage Interface**: Defined contracts for all data operations ensuring consistency
- **Repository Pattern**: Clean separation between business logic and data access
- **Type Safety**: Full TypeScript integration with Drizzle-generated types
- **Query Optimization**: Efficient querying with proper joins and indexing strategies

### Real-time Features

WebSocket implementation provides live updates for:

- **Chat Messages**: Instant message delivery within project contexts
- **Task Updates**: Real-time task status changes and notifications
- **Project Activities**: Live updates for project changes and member activities

### Mobile-First Design

The application implements a responsive design strategy:

- **Desktop**: Collapsible sidebar navigation with comprehensive layouts
- **Mobile**: Bottom navigation bar with optimized touch interfaces
- **Responsive Components**: All UI components adapt seamlessly across device sizes
- **Touch Optimization**: Mobile-specific interactions and gesture support

## External Dependencies

### Core Development Dependencies

- **@neondatabase/serverless**: Serverless PostgreSQL client for Neon database connectivity
- **drizzle-orm**: Type-safe ORM for PostgreSQL with excellent TypeScript integration
- **@tanstack/react-query**: Powerful data fetching and state management for React applications

### UI and Styling Dependencies

- **@radix-ui/react-***: Comprehensive set of accessible, unstyled UI primitives
- **tailwindcss**: Utility-first CSS framework for rapid UI development
- **class-variance-authority**: Type-safe utility for creating component variants
- **lucide-react**: Consistent icon library with React components

### Authentication and Session Management

- **openid-client**: OpenID Connect client for Replit authentication
- **passport**: Authentication middleware for Node.js
- **connect-pg-simple**: PostgreSQL session store for Express sessions

### Development and Build Tools

- **vite**: Fast development server and build tool optimized for modern web development
- **tsx**: TypeScript execution environment for Node.js development
- **esbuild**: Fast JavaScript bundler for production builds

### Form and Validation

- **react-hook-form**: Performant forms library with minimal re-renders
- **@hookform/resolvers**: Validation resolvers for React Hook Form
- **zod**: TypeScript-first schema validation library

### Utility Libraries

- **date-fns**: Modern JavaScript date utility library
- **clsx**: Utility for constructing className strings conditionally
- **ws**: WebSocket library for real-time communication features