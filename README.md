# TradeTrack

A modern wealth management dashboard for tracking finances, investments, budgets, and financial goals. Built with a React + TypeScript frontend and a Node.js/Express + Prisma backend.

## Screenshots

| Dashboard | Transactions | Portfolio | Reports |
|-----------|-------------|-----------|---------|
| Responsive grid with net worth card, stat cards, recent transactions, and budget status | Desktop table / mobile card layout with category filters and floating action button | Holdings table with real-time stock prices via Alpha Vantage API | Cash flow Sankey diagram, income vs expense chart, and summary stats |

## Tech Stack

**Frontend**
- React 19 + TypeScript
- Tailwind CSS v4 (CSS-first config via `@theme` blocks)
- Framer Motion (page transitions, modals, micro-interactions)
- Recharts (performance charts, income/expense, Sankey diagrams)
- Lucide React (icon system)
- Vitest + React Testing Library (unit and component tests)

**Backend**
- Node.js + Express
- Prisma ORM (SQLite)
- Alpha Vantage API (live stock prices)
- JWT authentication

## Architecture

```
tradetrack/
├── frontend/
│   ├── src/
│   │   ├── app/              # Route-level pages (lazy-loaded)
│   │   │   ├── page.tsx      # Dashboard
│   │   │   ├── auth/page.tsx
│   │   │   ├── accounts/page.tsx
│   │   │   ├── transactions/page.tsx
│   │   │   ├── portfolio/page.tsx
│   │   │   ├── reports/page.tsx
│   │   │   ├── budgets/page.tsx
│   │   │   └── goals/page.tsx
│   │   ├── components/       # Reusable UI + feature components
│   │   │   ├── ui/           # Primitives: Button, Modal, StatCard, Toast
│   │   │   ├── dashboard/    # NetWorthCard, StatCards, RecentTransactions, BudgetStatus
│   │   │   ├── chart/        # PerformanceChart, IncomeExpenseChart, CashflowSankey
│   │   │   ├── transactions/ # TransactionTable (desktop + mobile)
│   │   │   └── portfolio/    # HoldingsTable (desktop + mobile)
│   │   ├── lib/              # Utilities, API client, contexts, hooks
│   │   └── test/             # Test setup
│   └── vite.config.ts
└── backend/
    ├── prisma/               # Schema + migrations
    └── src/                  # Express routes, controllers, middleware
```

### Code Splitting

Every route page uses `React.lazy()` + `<Suspense>` for automatic code splitting. The build produces:

| Chunk | Size (gzip) | Description |
|-------|-------------|-------------|
| Main bundle | 130 KB | Core React + router + auth |
| Recharts | 106 KB | Chart library (lazy-loaded) |
| Page chunks | 3–8 KB each | Per-route code |

### State Management

- **Auth context** — JWT token + user object in `localStorage`, `AuthProvider` wraps the app
- **Currency context** — User currency preference (USD/INR/EUR/GBP) persisted in `localStorage`
- **Local component state** — Most data fetching happens at component level with `useEffect`

## Key Features

- **Responsive design** — CSS-first approach using Tailwind breakpoints; mobile cards, desktop tables, slide-up modals on mobile, hamburger drawer sidebar
- **Real-time stock prices** — Alpha Vantage API with caching (5-min TTL) and rate-limit handling
- **Multi-currency** — USD, INR, EUR, GBP with compact formatting (`$1.5k`, `₹1.5L`)
- **Skeleton loading** — Pulsing placeholder UI on every page
- **Toast notifications** — Global toast system via React context
- **Empty states** — Illustrated empty states with CTAs
- **Error boundaries** — Per-route error isolation
- **Accessibility** — `prefers-reduced-motion` support, 44px touch targets, focus-visible rings
- **Dark theme** — Custom dark glass morphism design system

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Frontend

```bash
cd frontend
npm install
npm run dev        # http://localhost:5173
```

### Backend

```bash
cd backend
npm install
npx prisma migrate dev
npm run dev        # http://localhost:5000
```

### Environment Variables

Create `backend/.env`:

```
DATABASE_URL="file:./dev.db"
JWT_SECRET="your-secret-key"
ALPHA_VANTAGE_API_KEY="your-api-key"
```

## Testing

```bash
cd frontend
npm test           # Single run
npm run test:watch # Watch mode
```

**74 tests** across 9 test files covering:
- API client (token management, CRUD methods, error handling)
- Auth context (login, logout, persistence, provider boundary)
- Currency context (multi-currency, localStorage sync)
- `formatCurrency` (wholes, decimals, negatives, compact, sign, custom symbol)
- `cn()` utility (class merging, conflict resolution)
- UI components (Modal, Button, Toast, PageHeader)

## Design System

| Token | Value |
|-------|-------|
| Background | `#0F0F0F` |
| Accent | `#FF7F50` (Coral/Orange) |
| Heading font | Playfair Display |
| Body font | Inter |
| Border radius (cards) | 24px |
| Glass effect | `#1a1a1a` with backdrop blur |

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Type-check + production build |
| `npm test` | Run Vitest |
| `npm run test:watch` | Run Vitest in watch mode |
| `npm run lint` | Run ESLint |
| `npm run preview` | Preview production build |
