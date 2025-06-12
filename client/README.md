# Invoice System Frontend

Modern React-based frontend for managing invoices, quotes, orders, and analytics. Built with TypeScript and designed for multi-tenant invoice management with a clean, responsive interface.

## Tech Stack & Frameworks

- **React 19** with TypeScript for type-safe development
- **Vite 6** for fast development and optimized builds
- **Redux Toolkit & RTK Query** for state management and API caching
- **React Router 7** for client-side routing
- **Tailwind CSS v4** for utility-first styling
- **Radix UI** primitives for accessible components
- **React Hook Form** with Zod validation
- **Recharts** for data visualization
- **Axios** for HTTP requests

## Quick Setup

### Prerequisites
- Node.js 18+ and npm
- Backend server running (see setup below)

### 1. Install Dependencies
```bash
cd client
npm install
```

### 2. Configure API Connection
The frontend connects to the backend API through configuration in `src/lib/apiUtils.ts`. By default, it connects to `http://localhost:3000/api`. To change the backend URL, update the `.env` file:

```env
VITE_API_URL=http://localhost:3000/api
```

Or modify the BASE_URL directly in `src/lib/apiUtils.ts`:

```typescript
const BASE_URL = 'http://your-backend-url.com/api';
```

### 3. Start Development Server
```bash
npm run dev
```

The frontend will be available at `http://localhost:5173`

## Backend Setup & Integration

The frontend connects to a Node.js/Express backend with PostgreSQL database.

### 1. Start Database (Docker)
```bash
cd server
docker-compose up -d
```

This starts:
- PostgreSQL database on port `5458`
- pgAdmin interface on port `5050` (admin@admin.com / password)

### 2. Setup Backend Server
```bash
cd server
npm install
npm run migration:run  # Setup database tables
npm run dev            # Start development server
```

Backend runs on `http://localhost:3000`

### 3. Start Frontend
```bash
cd client
npm run dev
```

Frontend runs on `http://localhost:5173` and connects to the backend API.

## Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build optimized production bundle
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint for code quality

## Project Architecture

```
src/
├── components/          # Reusable UI components (Radix UI wrappers)
├── features/           # Feature-based modules
│   ├── auth/           # Authentication & authorization
│   ├── products/       # Product management
│   ├── quotes/         # Quote creation & management
│   ├── orders/         # Order processing
│   ├── invoices/       # Invoice generation & tracking
│   └── analytics/      # Dashboard & reporting
├── hooks/              # Custom React hooks
├── services/           # API clients & utilities
├── utils/              # Helper functions
└── types/              # TypeScript type definitions
```

## Key Features

- **Multi-tenant Architecture** - Seller-based data isolation
- **Real-time Updates** - RTK Query for efficient data fetching
- **Responsive Design** - Mobile-first approach with Tailwind
- **Form Management** - React Hook Form with Zod validation
- **Data Visualization** - Interactive charts and analytics
- **Print Support** - Invoice PDF generation
- **Drag & Drop** - Sortable lists and reorderable items
