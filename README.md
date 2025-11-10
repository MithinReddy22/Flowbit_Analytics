# Flowbit Analytics Dashboard

A production-grade full-stack analytics dashboard with natural language SQL generation using Vanna AI.

## 🏗️ Architecture

```
┌─────────────┐      ┌─────────────┐      ┌─────────────┐      ┌─────────────┐
│   Next.js   │─────▶│  Express    │─────▶│   Vanna AI  │─────▶│  PostgreSQL │
│  Frontend   │      │    API      │      │  (FastAPI)   │      │  Database    │
└─────────────┘      └─────────────┘      └─────────────┘      └─────────────┘
```

### Tech Stack

- **Monorepo**: Turborepo with pnpm workspaces
- **Frontend**: Next.js 14 (App Router), TypeScript, TailwindCSS, shadcn/ui, Chart.js
- **Backend**: Node.js + TypeScript + Express.js, Prisma ORM
- **AI Service**: Python + FastAPI + Groq LLM
- **Database**: PostgreSQL 15
- **Deployment**: Vercel (frontend/API), Render/Railway (Vanna), Supabase/Neon (Postgres)

## 📁 Project Structure

```
.
├── apps/
│   ├── web/          # Next.js frontend
│   └── api/          # Express.js backend API
├── services/
│   └── vanna/        # Python FastAPI Vanna AI service
├── prisma/
│   └── schema.prisma # Database schema
├── scripts/
│   └── seed.ts       # Database seeding script
├── data/
│   └── Analytics_Test_Data.json
└── docker-compose.yml
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- pnpm 8+
- Docker & Docker Compose
- PostgreSQL 15 (or use Docker)
- Groq API key (for Vanna AI)

### Local Development

1. **Clone and install dependencies:**

```bash
pnpm install
```

2. **Start Docker services (PostgreSQL + Vanna):**

```bash
docker-compose up -d
```

3. **Set up environment variables:**

Create `.env` files in each service:

**`apps/api/.env`:**
```env
DATABASE_URL=postgresql://flowbit:flowbit_password@localhost:5432/flowbit
VANNA_API_BASE_URL=http://localhost:8000
VANNA_API_KEY=optional-api-key
PORT=4000
```

**`apps/web/.env.local`:**
```env
NEXT_PUBLIC_API_BASE=http://localhost:4000
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**`services/vanna/.env`:**
```env
DATABASE_URL=postgresql+psycopg://flowbit:flowbit_password@localhost:5432/flowbit
GROQ_API_KEY=your-groq-api-key
VANNA_API_KEY=optional-api-key
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:4000
PORT=8000
```

4. **Run database migrations:**

```bash
cd apps/api
pnpm prisma migrate dev
```

5. **Seed the database:**

```bash
cd apps/api
pnpm ts-node scripts/seed.ts
```

6. **Start development servers:**

From the root directory:

```bash
pnpm dev
```

This will start:
- Frontend: http://localhost:3000
- Backend API: http://localhost:4000
- Vanna AI: http://localhost:8000 (via Docker)

## 📊 Database Schema

### ER Diagram

```
┌─────────────┐         ┌─────────────┐
│   vendors   │         │  customers  │
├─────────────┤         ├─────────────┤
│ id (PK)     │         │ id (PK)     │
│ vendor_id   │         │ customer_id │
│ name        │         │ name        │
│ category    │         │ meta        │
│ meta        │         └─────────────┘
└─────────────┘              │
      │                      │
      │                      │
      ▼                      ▼
┌─────────────────────────────────────┐
│            invoices                 │
├─────────────────────────────────────┤
│ id (PK)                             │
│ invoice_number (UNIQUE)             │
│ vendor_id (FK) ───────┐            │
│ customer_id (FK) ──────┘            │
│ date                                 │
│ due_date                             │
│ status                               │
│ currency                             │
│ subtotal                             │
│ tax                                  │
│ total_amount (INDEXED)               │
└─────────────────────────────────────┘
      │
      ├──────────────┬──────────────┬──────────────┐
      │              │              │              │
      ▼              ▼              ▼              ▼
┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│ line_items  │ │  payments   │ │ documents   │
├─────────────┤ ├─────────────┤ ├─────────────┤
│ id (PK)     │ │ id (PK)     │ │ id (PK)     │
│ invoice_id  │ │ invoice_id  │ │ invoice_id  │
│ description │ │ amount      │ │ file_name   │
│ quantity    │ │ method      │ │ url         │
│ unit_price  │ │ date        │ │ uploaded_at │
│ total       │ │ status      │ └─────────────┘
│ category    │ └─────────────┘
└─────────────┘
```

### Tables

1. **vendors**: Vendor information with category and metadata
2. **customers**: Customer information
3. **invoices**: Invoice records with vendor/customer relationships
4. **line_items**: Individual line items per invoice
5. **payments**: Payment records per invoice
6. **documents**: Document metadata linked to invoices

All tables use UUID primary keys and have appropriate indexes for performance.

## 🔌 API Endpoints

### Stats

**GET** `/stats`

Returns overview statistics.

**Response:**
```json
{
  "totalSpend": 123456.78,
  "invoicesProcessed": 456,
  "documentsUploaded": 23,
  "avgInvoiceValue": 271.12
}
```

### Invoice Trends

**GET** `/invoice-trends?from=YYYY-MM-DD&to=YYYY-MM-DD`

Returns monthly invoice trends.

**Response:**
```json
[
  {
    "month": "2025-01",
    "invoice_count": 12,
    "total_spend": 12345.67
  }
]
```

### Top Vendors

**GET** `/vendors/top10`

Returns top 10 vendors by spend.

**Response:**
```json
[
  {
    "vendor_id": "vendor-123",
    "name": "Vendor Name",
    "spend": 12345.67
  }
]
```

### Category Spend

**GET** `/category-spend`

Returns spend by category.

**Response:**
```json
[
  {
    "category": "Office Supplies",
    "spend": 2345.67
  }
]
```

### Cash Outflow

**GET** `/cash-outflow?from=YYYY-MM-DD&to=YYYY-MM-DD`

Returns forecasted cash outflow.

**Response:**
```json
[
  {
    "date": "2025-11-01",
    "outflow": 2000.00
  }
]
```

### Invoices

**GET** `/invoices?q=<search>&page=1&limit=25&sort=amount_desc`

Returns paginated invoice list.

**Response:**
```json
{
  "total_count": 500,
  "items": [
    {
      "invoice_number": "INV-001",
      "vendor": { "name": "Vendor A" },
      "date": "2025-01-02",
      "total_amount": 123.45,
      "status": "paid"
    }
  ]
}
```

### Chat with Data

**POST** `/chat-with-data`

Generates SQL from natural language and executes it.

**Request:**
```json
{
  "question": "What's the total spend in the last 90 days?"
}
```

**Response:**
```json
{
  "sql": "SELECT SUM(total_amount) FROM invoices WHERE date >= current_date - interval '90 days';",
  "explain": "Total spend in last 90 days",
  "columns": ["sum"],
  "rows": [{ "sum": 12345.67 }]
}
```

## 🤖 Vanna AI Service

The Vanna AI service is a Python FastAPI application that:

1. **Accepts natural language questions** via POST `/generate-sql`
2. **Generates SQL** using Groq LLM (Llama 3.1 70B)
3. **Sanitizes SQL** to ensure only SELECT statements are allowed
4. **Executes SQL** on a read-only database user
5. **Returns results** with SQL, explanation, columns, and rows

### Security Features

- ✅ Rejects INSERT, UPDATE, DELETE, DROP, ALTER, etc.
- ✅ Only allows SELECT statements
- ✅ Prevents semicolon chaining
- ✅ Limits results to 1000 rows
- ✅ Uses read-only DB user for execution
- ✅ API key authentication (optional)
- ✅ CORS protection

### Endpoints

- **POST** `/generate-sql`: Generate and execute SQL
- **POST** `/chat-stream`: Streaming endpoint (SSE)
- **GET** `/health`: Health check

## 🚢 Deployment

### Frontend + API (Vercel)

1. **Connect your GitHub repo to Vercel**
2. **Set environment variables in Vercel:**

```
DATABASE_URL=postgresql://user:pass@host:5432/db
VANNA_API_BASE_URL=https://your-vanna-host.com
VANNA_API_KEY=your-api-key
NEXT_PUBLIC_API_BASE=/api
NEXT_PUBLIC_APP_URL=https://yourapp.vercel.app
```

3. **Deploy**

### Vanna AI (Render/Railway/Fly)

1. **Build Docker image:**
```bash
cd services/vanna
docker build -t vanna-service .
```

2. **Deploy to your platform** with environment variables:
```
DATABASE_URL=postgresql+psycopg://user:pass@host:5432/db
GROQ_API_KEY=your-groq-api-key
VANNA_API_KEY=your-api-key
ALLOWED_ORIGINS=https://yourapp.vercel.app
PORT=8000
```

### Database (Supabase/Neon)

1. **Create a PostgreSQL database**
2. **Create a read-only user for Vanna:**
```sql
CREATE USER vanna_ro WITH PASSWORD 'secure_password';
GRANT CONNECT ON DATABASE your_db TO vanna_ro;
GRANT USAGE ON SCHEMA public TO vanna_ro;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO vanna_ro;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO vanna_ro;
```

3. **Update DATABASE_URL** in all services

## 🧪 Testing

### Run Tests

```bash
# Backend tests
cd apps/api
pnpm test

# Frontend tests (if configured)
cd apps/web
pnpm test
```

### Manual Testing Checklist

- [ ] Dashboard loads and displays stats cards
- [ ] Charts render correctly (trends, vendors, categories, outflow)
- [ ] Invoices table is searchable and sortable
- [ ] Chat with Data generates SQL correctly
- [ ] SQL execution returns results
- [ ] Error handling works for invalid queries
- [ ] All API endpoints return correct data

## 📝 Scripts

### Seed Database

```bash
cd apps/api
pnpm prisma migrate dev
pnpm ts-node scripts/seed.ts
```

### Reset Database

```bash
cd apps/api
pnpm prisma migrate reset
pnpm ts-node scripts/seed.ts
```

## 🔒 Security

- ✅ SQL injection prevention via sanitization
- ✅ Read-only database user for Vanna
- ✅ API key authentication
- ✅ CORS protection
- ✅ Rate limiting on chat endpoint
- ✅ Input validation on all endpoints
- ✅ HTTPS in production

## 📚 Additional Documentation

- [API Documentation](./API_DOCS.md) (if created)
- [ER Diagram](./ER_DIAGRAM.png)
- [Demo Video](./demo.mp4) or link

## 🤝 Chat Flow

```
User Question
    │
    ▼
Frontend (Next.js)
    │
    ▼
Backend API (Express)
    │
    ├─▶ Adds schema context
    │
    ▼
Vanna AI Service (FastAPI)
    │
    ├─▶ Generates SQL (Groq LLM)
    ├─▶ Sanitizes SQL
    │
    ▼
PostgreSQL (Read-only user)
    │
    ├─▶ Executes SELECT query
    │
    ▼
Returns { sql, explain, columns, rows }
    │
    ▼
Frontend displays results
```

## 📄 License

MIT

## 👥 Contributors

Mithin Reddy Kethipelly @https://protifolio-c4c44.web.app/


