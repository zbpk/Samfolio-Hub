# replit.md

## Overview

This is a freelance web development portfolio and services website called "Sam Digital." It's a full-stack application featuring a React frontend with smooth animations, a contact form, pricing sections, and portfolio showcase. The backend is built with Express.js and stores contact form submissions in a PostgreSQL database.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript, using Vite as the build tool
- **Routing**: Wouter for client-side routing (lightweight alternative to React Router)
- **Styling**: Tailwind CSS with custom theme configuration including dark mode, custom color palette with CSS variables, and custom fonts (Inter for body, Space Grotesk for display text)
- **UI Components**: shadcn/ui component library (New York style) with Radix UI primitives
- **Animations**: Framer Motion for scroll animations and reveal effects
- **Smooth Scrolling**: react-scroll for section navigation
- **State Management**: TanStack React Query for server state and data fetching
- **Form Handling**: React Hook Form with Zod validation via @hookform/resolvers

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Build**: esbuild for server bundling, tsx for development
- **API Design**: Type-safe API routes defined in `shared/routes.ts` with Zod schemas for input/output validation
- **Database ORM**: Drizzle ORM with PostgreSQL dialect
- **Development**: Vite dev server with HMR integration for the frontend

### Project Structure
```
client/           # React frontend
  src/
    components/   # Reusable UI components
    pages/        # Page components
    hooks/        # Custom React hooks
    lib/          # Utilities and query client
server/           # Express backend
  index.ts        # Server entry point
  routes.ts       # API route handlers
  storage.ts      # Database operations
  db.ts           # Database connection
shared/           # Shared code between frontend and backend
  schema.ts       # Drizzle database schema
  routes.ts       # API route definitions with Zod schemas
```

### Key Design Decisions
1. **Monorepo Structure**: Frontend and backend share types and validation schemas through the `shared/` directory, ensuring type safety across the stack
2. **Schema-First API**: API routes are defined with Zod schemas for both input validation and response types, providing runtime validation and TypeScript inference
3. **Database Abstraction**: Storage layer uses an interface pattern (`IStorage`) for potential future flexibility in swapping implementations
4. **CSS Variables for Theming**: Custom color system using HSL values with CSS variables for easy theme customization

## External Dependencies

### Database
- **PostgreSQL**: Primary database, connection via `DATABASE_URL` environment variable
- **Drizzle ORM**: Schema management and queries with `drizzle-kit` for migrations

### Third-Party Libraries
- **Radix UI**: Accessible, unstyled UI primitives for all interactive components
- **TanStack Query**: Server state management with caching and refetching
- **Framer Motion**: Animation library for scroll reveals and transitions
- **react-scroll**: Smooth scroll navigation between page sections
- **date-fns**: Date formatting utilities
- **Zod**: Schema validation for forms and API

### Development Tools
- **Vite**: Frontend build tool with HMR
- **esbuild**: Fast server bundling for production
- **tsx**: TypeScript execution for development
- **Tailwind CSS**: Utility-first CSS framework with PostCSS/Autoprefixer

### Environment Variables Required
- `DATABASE_URL`: PostgreSQL connection string (required)