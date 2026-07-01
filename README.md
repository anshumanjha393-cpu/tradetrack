# TradeTrack

A modern wealth management dashboard for tracking finances, investments, budgets, and financial goals.

![License](https://img.shields.io/badge/license-MIT-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-6.x-blue)
![React](https://img.shields.io/badge/React-19-61DAFB)
![Node.js](https://img.shields.io/badge/Node.js-20+-339933)

## Screenshots

| Dashboard | Transactions | Portfolio | Reports |
|-----------|-------------|-----------|---------|
| Net worth card, stat cards, recent transactions, budget status | Desktop table / mobile card layout with filters | Holdings table with real-time stock prices | Cash flow Sankey, income vs expense chart |

## Tech Stack

**Frontend** — React 19, TypeScript, Tailwind CSS v4, Framer Motion, Recharts, Lucide React, Vitest

**Backend** — Node.js, Express, TypeScript, Prisma ORM, PostgreSQL (Neon), JWT + bcrypt, Zod validation

**Deployment** — Vercel (frontend) + Render (backend)

## Features

- **7 pages** — Dashboard, Accounts, Transactions, Portfolio, Reports, Budgets, Goals
- **JWT authentication** — Signup, login, protected routes, session persistence
- **Real-time stock prices** — Yahoo Finance batch API with Alpha Vantage fallback
- **Multi-currency** — USD and INR with compact formatting
- **Responsive design** — Mobile cards, desktop tables, slide-up modals, drawer sidebar
- **Dark theme** — Glass morphism design system
- **Code splitting** — Every page lazy-loaded with `React.lazy()`
- **Rate limiting** — Auth endpoints protected against brute force
- **Compression** — gzip enabled on all API responses
- **Error boundary** — Graceful React error recovery

## Architecture

```
tradetrack/
├── frontend/          # React + Vite + TypeScript
│   ├── src/
│   │   ├── app/       # Route-level pages (lazy-loaded)
│   │   ├── components/# Reusable UI + feature components
│   │   └── lib/       # API client, contexts, utilities
│   └── vercel.json    # SPA rewrites for React Router
└── backend/           # Express + Prisma + PostgreSQL
    ├── prisma/        # Schema + seed file
    └── src/
        ├── routes/    # Auth, accounts, transactions, holdings, budgets, goals, reports
        ├── middleware/ # Auth, error handler
        └── lib/       # Prisma client, logger, cache, schemas, errors
```

## Local Setup

### Prerequisites

- Node.js 18+
- PostgreSQL database (local or Neon/Supabase)

### Frontend

```bash
cd frontend
cp .env.example .env    # Edit VITE_API_URL if needed
npm install
npm run dev             # http://localhost:5173
```

### Backend

```bash
cd backend
cp .env.example .env    # Fill in DATABASE_URL, JWT_SECRET, etc.
npm install
npx prisma migrate dev
npx prisma db seed
npm run dev             # http://localhost:5000
```

## Environment Variables

### Frontend (`frontend/.env`)

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API base URL (include `/api`) | `http://localhost:5000/api` |

### Backend (`backend/.env`)

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host/db?sslmode=require` |
| `JWT_SECRET` | Secret for signing JWTs (32+ chars) | `your-random-secret-string` |
| `PORT` | Server port | `5000` |
| `ALPHA_VANTAGE_API_KEY` | Stock price API key | `your-api-key` |
| `ALLOWED_ORIGIN` | CORS origin for production frontend | `https://your-app.vercel.app` |
| `LOG_LEVEL` | Winston log level | `info` |

## Deployment

### Vercel (Frontend)

1. Push to GitHub
2. Import repo in Vercel dashboard
3. Set root directory to `frontend`
4. Set env variable: `VITE_API_URL` = `https://your-app.onrender.com/api`

### Render (Backend)

1. Create a new Web Service on Render
2. Connect your GitHub repo
3. Set root directory to `backend`
4. Set build command: `npm install && npx prisma generate && npm run build`
5. Set start command: `npm start`
6. Add all environment variables from the table above

## Testing

```bash
cd frontend
npm test            # Single run
npm run test:watch  # Watch mode
```

## License

MIT
