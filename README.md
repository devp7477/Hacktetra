<<<<<<< HEAD
# Hacktetra
=======
# SynergySphere - Team Collaboration Platform

SynergySphere is an advanced team collaboration platform built with modern web technologies.

## Project Structure

- `client/` - Frontend application built with React, TypeScript, and Tailwind CSS
- `server/` - Backend API built with Express.js, TypeScript, and Prisma
- `shared/` - Shared types and validation schemas used by both client and server

## Setup Instructions

### Prerequisites

- Node.js (v18+)
- NeonDB account (or another PostgreSQL database)

### Backend Setup

1. Create a NeonDB database or use another PostgreSQL database
2. Create a `.env` file in the `server/` directory with the following content:

```
DATABASE_URL="postgresql://user:password@hostname:port/database?sslmode=require"
PORT=5001
SESSION_SECRET="your-secret-key"
FRONTEND_URL="http://localhost:3001"
```

3. Install dependencies and generate Prisma client:

```bash
cd server
npm install
npx prisma generate
```

4. Run database migrations:

```bash
npx prisma migrate dev
```

5. Seed the database with initial data:

```bash
npm run prisma:seed
```

6. Start the backend server:

```bash
npm run dev
```

The server will run on port 5001 by default.

### Frontend Setup

1. Install dependencies:

```bash
cd client
npm install
```

2. Start the frontend development server:

```bash
npm run dev
```

The frontend will run on port 3001 by default.

## API Documentation

The backend provides the following API endpoints:

- `/api/projects` - CRUD operations for projects
- `/api/tasks` - CRUD operations for tasks
- `/api/users` - User management
- `/api/auth` - Authentication endpoints

## Database Schema

The database schema is defined in `server/prisma/schema.prisma` and includes the following models:

- `Project` - Project information
- `Task` - Tasks associated with projects
- `User` - User information
- `ProjectMember` - Project membership and roles
- `ChatMessage` - Real-time chat messages
- `Notification` - User notifications

## Technologies Used

### Frontend
- React
- TypeScript
- Tailwind CSS
- Radix UI
- React Query
- Wouter (for routing)

### Backend
- Express.js
- TypeScript
- Prisma (ORM)
- NeonDB (PostgreSQL)
- WebSockets (for real-time features)

## Development

To connect to your NeonDB database:

1. Sign up for a NeonDB account at https://neon.tech
2. Create a new project and database
3. Get your connection string from the NeonDB dashboard
4. Add the connection string to your `.env` file as `DATABASE_URL`

## License

MIT
>>>>>>> 3d32298 (Initial commit)
