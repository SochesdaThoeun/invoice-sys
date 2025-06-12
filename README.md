

FULL URL: www.invoicee.xyz

# Invoice Management System

A complete full-stack multi-tenant invoicing platform built with modern web technologies. Features a React frontend with TypeScript and a Node.js backend with PostgreSQL, designed for businesses to manage quotes, orders, invoices, and analytics.

## 🚀 Tech Stack

### Frontend
- **React 19** with TypeScript for type-safe development
- **Vite 6** for fast development and optimized builds
- **Redux Toolkit & RTK Query** for state management and API caching
- **React Router 7** for client-side routing
- **Tailwind CSS v4** for utility-first styling
- **Radix UI** primitives for accessible components
- **React Hook Form** with Zod validation
- **Recharts** for data visualization

### Backend
- **Node.js 18+** with TypeScript for type-safe server development
- **Express 5** for HTTP server and routing
- **TypeORM 0.3** for database ORM and migrations
- **PostgreSQL 16** for relational data storage
- **JWT** for authentication and authorization
- **bcryptjs** for password hashing
- **class-validator** for request validation
- **Docker Compose** for development environment

## 🏁 Quick Setup

### Prerequisites
- Node.js 18+ and npm
- Docker and Docker Compose

### 1. Clone and Install Dependencies
```bash
# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../client
npm install
```

### 2. Start Database
```bash
cd server
docker-compose up -d
```

This starts:
- PostgreSQL database on port `5458`
- pgAdmin interface on port `5050` (admin@admin.com / password)

### 3. Setup Database Schema
```bash
cd server
npm run migration:run
```

### 4. Configure Environment
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

Optionally, create a `.env` file in the client directory:
```env
VITE_API_URL=http://localhost:3000
```

### 5. Start Development Servers
```bash
# Terminal 1 - Start backend
cd server
npm run dev

# Terminal 2 - Start frontend
cd client
npm run dev
```

- Backend API: `http://localhost:3000`
- Frontend App: `http://localhost:5173`

## 📁 Project Structure

```
invoice_sys/
├── server/                 # Backend API
│   ├── src/
│   │   ├── entities/      # Database entity definitions
│   │   │   ├── auth/      # Authentication & JWT handling
│   │   │   ├── user/      # User management
│   │   │   ├── product/   # Product catalog
│   │   │   ├── customer/  # Customer management
│   │   │   ├── quote/     # Quote creation & management
│   │   │   ├── order/     # Order processing
│   │   │   ├── invoice/   # Invoice generation
│   │   │   └── analytics/ # Reporting & dashboard data
│   │   ├── middleware/    # Custom Express middleware
│   │   ├── migrations/    # Database migration files
│   │   └── utils/         # Helper functions and utilities
│   └── docker-compose.yml # Database setup
├── client/                # Frontend React app
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── features/      # Feature-based modules
│   │   │   ├── auth/      # Authentication & authorization
│   │   │   ├── products/  # Product management
│   │   │   ├── quotes/    # Quote creation & management
│   │   │   ├── orders/    # Order processing
│   │   │   ├── invoices/  # Invoice generation & tracking
│   │   │   └── analytics/ # Dashboard & reporting
│   │   ├── hooks/         # Custom React hooks
│   │   ├── services/      # API clients & utilities
│   │   ├── utils/         # Helper functions
│   │   └── types/         # TypeScript type definitions
│   └── package.json
└── README.md              # This file
```

## ✨ Core Features

### Business Logic
- **Multi-tenant Architecture** - Complete data isolation per seller
- **Quote → Order → Invoice Flow** - Streamlined business process
- **Double-entry Accounting** - Automatic ledger entries
- **Real-time Updates** - Efficient data synchronization
- **Role-based Authorization** - Admin and Seller access control

### User Interface
- **Responsive Design** - Mobile-first approach
- **Interactive Dashboard** - Analytics and reporting
- **Form Management** - Validated input handling
- **Print Support** - Invoice PDF generation
- **Drag & Drop** - Sortable and reorderable items

### Technical Features
- **JWT Authentication** - Secure API access
- **Database Migrations** - Version-controlled schema changes
- **Input Validation** - Client and server-side validation
- **Transaction Safety** - Database transaction management
- **API Caching** - Optimized data fetching with RTK Query

## 🗄️ Database Schema

The system uses PostgreSQL with the following key entities:

- **Users** - Sellers and admins with authentication
- **Products** - Catalog items with pricing and tax codes
- **Customers** - Client information and business addresses
- **Quotes** - Draft proposals that convert to orders
- **Orders** - Central entity linking quotes to invoices
- **Invoices** - Final billing documents with payment tracking
- **Categories** - Chart of accounts for double-entry bookkeeping
- **LedgerEntries** - Accounting records for financial reporting

## 📋 Available Scripts

### Backend (server/)
- `npm run dev` - Start development server with auto-reload
- `npm run start` - Start production server
- `npm run build` - Compile TypeScript to JavaScript
- `npm run migration:run` - Run database migrations
- `npm run migration:revert` - Revert last migration

### Frontend (client/)
- `npm run dev` - Start development server with hot reload
- `npm run build` - Build optimized production bundle
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint for code quality

## 🔧 Development Workflow

1. **Database Changes**: Create migrations for schema updates
2. **Feature Development**: 
   - Backend: Create modules with services, controllers, and DTOs
   - Frontend: Create feature modules with components and hooks
3. **API Integration**: Use RTK Query for efficient data fetching
4. **Validation**: Implement both client and server-side validation
5. **Testing**: Write unit and integration tests for all components
6. **UI/UX**: Follow responsive design principles with Tailwind CSS

## 🏗️ Business Rules

- **Tenant Isolation**: All data scoped to seller ID
- **Immutable Invoices**: Issued invoices cannot be modified
- **Automatic Relationships**: Creating quotes/invoices auto-creates orders
- **Transaction Integrity**: Ledger entries created atomically
- **Address Management**: Each customer has one business address

## 🚀 Production Deployment

### Backend Deployment
1. Build the TypeScript application: `npm run build`
2. Set production environment variables
3. Run database migrations: `npm run migration:run`
4. Start the server: `npm start`

### Frontend Deployment
1. Build the React application: `npm run build`
2. Serve the `dist` folder with a static file server
3. Configure API URL for production environment

## 📞 Support

For issues and questions:
1. Check the individual README files in `server/` and `client/` directories
2. Review the database schema and API documentation
3. Ensure all prerequisites are installed and services are running

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes following the project structure
4. Test both frontend and backend changes
5. Submit a pull request

---

**Note**: This is a full-stack application requiring both frontend and backend services to run simultaneously for complete functionality. 