# Invoice System Backend

Node.js/Express backend API for the multi-tenant invoicing platform. Handles authentication, business logic, data persistence, and provides RESTful endpoints for managing quotes, orders, invoices, and analytics.

## Tech Stack & Frameworks

- **Node.js 18+** with TypeScript for type-safe server development
- **Express 5** for HTTP server and routing
- **TypeORM 0.3** for database ORM and migrations
- **PostgreSQL 16** for relational data storage
- **JWT** for authentication and authorization
- **bcryptjs** for password hashing
- **class-validator** for request validation
- **Docker Compose** for development environment

## Quick Setup

### Prerequisites
- Node.js 18+ and npm
- Docker and Docker Compose

### 1. Install Dependencies
```bash
cd server
npm install
```

### 2. Start Database
```bash
docker-compose up -d
```

This starts:
- PostgreSQL database on port `5458`
- pgAdmin interface on port `5050` (admin@admin.com / password)

### 3. Setup Database Schema
```bash
npm run migration:run
```

### 4. Start Development Server
```bash
npm run dev
```

Backend API runs on `http://localhost:3000`

## Environment Configuration

Create a `.env` file in the server directory:

```env
# Database
DB_HOST=localhost
DB_PORT=5458
DB_USERNAME=postgres
DB_PASSWORD=password
DB_DATABASE=invoice_sys

# JWT
JWT_SECRET=your-secret-key-here
JWT_EXPIRES_IN=24h

# Server
PORT=3000
NODE_ENV=development
```

## Available Scripts

- `npm run dev` - Start development server with auto-reload
- `npm run start` - Start production server
- `npm run build` - Compile TypeScript to JavaScript
- `npm run migration:run` - Run database migrations
- `npm run migration:revert` - Revert last migration

## API Architecture

```
src/
├── app.ts                  # Express app setup and middleware
├── data-source.ts         # TypeORM database configuration
├── entities/              # Database entity definitions
├── modules/               # Feature-based API modules
│   ├── auth/             # Authentication & JWT handling
│   ├── user/             # User management
│   ├── product/          # Product catalog
│   ├── customer/         # Customer management
│   ├── quote/            # Quote creation & management
│   ├── order/            # Order processing
│   ├── invoice/          # Invoice generation
│   └── analytics/        # Reporting & dashboard data
├── middleware/           # Custom Express middleware
├── migrations/           # Database migration files
└── utils/               # Helper functions and utilities
```

## Core Features

- **Multi-tenant Architecture** - Complete data isolation per seller
- **Quote → Order → Invoice Flow** - Streamlined business process
- **Double-entry Accounting** - Automatic ledger entries
- **JWT Authentication** - Secure API access
- **Role-based Authorization** - Admin and Seller roles
- **Database Migrations** - Version-controlled schema changes
- **Input Validation** - Request data validation with class-validator
- **Transaction Safety** - Database transaction management

## Database Schema

The system uses PostgreSQL with the following key entities:

- **Users** - Sellers and admins with authentication
- **Products** - Catalog items with pricing and tax codes
- **Customers** - Client information and business addresses
- **Quotes** - Draft proposals that convert to orders
- **Orders** - Central entity linking quotes to invoices
- **Invoices** - Final billing documents with payment tracking
- **Categories** - Chart of accounts for double-entry bookkeeping
- **LedgerEntries** - Accounting records for financial reporting

## Business Rules

- **Tenant Isolation**: All data scoped to seller ID
- **Immutable Invoices**: Issued invoices cannot be modified
- **Automatic Relationships**: Creating quotes/invoices auto-creates orders
- **Transaction Integrity**: Ledger entries created atomically
- **Address Management**: Each customer has one business address

## Development Workflow

1. **Database Changes**: Create migrations for schema updates
2. **Feature Modules**: Organize code by business domain
3. **Service Layer**: Implement business logic with proper tenant isolation
4. **Controller Layer**: Handle HTTP requests and responses
5. **Validation**: Use DTOs with class-validator decorators
6. **Testing**: Write unit and integration tests for all endpoints
