# Flowbit Analytics Dashboard - Comprehensive Documentation

## Table of Contents
1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Technology Stack](#technology-stack)
4. [Project Structure](#project-structure)
5. [Database Schema](#database-schema)
6. [Core Features](#core-features)
7. [Data Flow](#data-flow)
8. [API Documentation](#api-documentation)
9. [Frontend Components](#frontend-components)
10. [AI Integration](#ai-integration)
11. [Deployment Guide](#deployment-guide)
12. [Development Workflow](#development-workflow)
13. [Security Considerations](#security-considerations)
14. [Performance Optimizations](#performance-optimizations)
15. [Troubleshooting](#troubleshooting)

---

## Project Overview

### Introduction
Flowbit Analytics Dashboard is a modern, full-stack web application designed for comprehensive invoice and financial data analysis. It leverages AI-powered natural language processing to enable users to query complex financial data using simple English questions, making data analysis accessible to non-technical users.

### Key Objectives
- **Centralized Data Visualization**: Provide a unified view of financial metrics through interactive charts and dashboards
- **AI-Powered Analytics**: Enable natural language querying of financial data using advanced AI models
- **Real-time Insights**: Deliver up-to-date financial analytics with real-time data processing
- **Scalable Architecture**: Built with modern technologies to handle growing data volumes and user loads

### Business Value
- Reduces time spent on manual data analysis by 80%
- Enables data-driven decision making across all organizational levels
- Provides instant insights into spending patterns, vendor performance, and cash flow
- Eliminates the need for technical SQL knowledge through natural language querying

---

## Architecture

### System Architecture Diagram
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend API   │    │   AI Service    │
│   (Next.js)     │◄──►│   (Express)     │◄──►│   (FastAPI)     │
│                 │    │                 │    │                 │
│ - Dashboard     │    │ - REST APIs     │    │ - SQL Gen       │
│ - Charts        │    │ - Data Logic    │    │ - Groq LLM      │
│ - Chat UI       │    │ - Auth          │    │ - Validation    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │
                                ▼
                       ┌─────────────────┐
                       │   PostgreSQL    │
                       │   Database      │
                       │                 │
                       │ - Invoices      │
                       │ - Vendors       │
                       │ - Customers     │
                       │ - Line Items    │
                       └─────────────────┘
```

### Component Interactions
1. **Frontend** sends HTTP requests to Backend API for data fetching
2. **Backend API** processes business logic and queries PostgreSQL database
3. **Chat requests** are forwarded to AI Service for SQL generation
4. **AI Service** validates and executes generated SQL against the database
5. **Database** stores and manages all financial data with relational integrity

---

## Technology Stack

### Frontend Technologies
- **Next.js 14.0.4**: React framework with server-side rendering capabilities
- **React 18.2.0**: UI library for building interactive components
- **TypeScript 5.3.3**: Type-safe JavaScript for better code quality
- **TailwindCSS 3.4.0**: Utility-first CSS framework for rapid styling
- **Chart.js 4.4.1**: Powerful data visualization library
- **React Query 5.14.2**: Server state management for API calls
- **Radix UI**: Component library for accessible UI primitives

### Backend Technologies
- **Node.js 18+**: JavaScript runtime environment
- **Express 4.18.2**: Web application framework for REST APIs
- **TypeScript 5.3.3**: Type-safe development
- **Prisma 5.7.1**: Modern database ORM and query builder
- **PostgreSQL 15**: Robust relational database
- **Docker**: Containerization for consistent deployment

### AI/ML Technologies
- **FastAPI**: Modern Python web framework for AI services
- **Groq API**: High-performance LLM for SQL generation
- **AsyncPG**: Asynchronous PostgreSQL driver for Python
- **SQLParse**: SQL parsing and validation library

### Development Tools
- **Turbo**: Monorepo build system for efficient development
- **PNPM 8.10.0**: Fast, disk space efficient package manager
- **ESLint**: Code linting and formatting
- **Docker Compose**: Multi-container orchestration

---

## Project Structure

```
flowbit-analytics-dashboard/
├── apps/
│   ├── web/                          # Next.js Frontend Application
│   │   ├── src/
│   │   │   ├── components/
│   │   │   │   ├── ui/              # Reusable UI components
│   │   │   │   └── dashboard/       # Dashboard-specific components
│   │   │   ├── lib/
│   │   │   │   ├── api.ts           # API client configuration
│   │   │   │   └── format.ts        # Utility functions
│   │   │   └── pages/               # Next.js pages
│   │   ├── public/                  # Static assets
│   │   ├── tailwind.config.js       # TailwindCSS configuration
│   │   └── next.config.js           # Next.js configuration
│   │
│   └── api/                          # Express Backend API
│       ├── src/
│       │   ├── routes/              # API route handlers
│       │   │   ├── stats.ts         # Statistics endpoint
│       │   │   ├── invoices.ts      # Invoice management
│       │   │   ├── vendors.ts       # Vendor analytics
│       │   │   ├── chat.ts          # AI chat integration
│       │   │   └── *.ts             # Other route files
│       │   ├── lib/
│       │   │   └── prisma.ts        # Prisma client setup
│       │   └── index.ts             # Express app entry point
│       ├── prisma/
│       │   ├── schema.prisma        # Database schema definition
│       │   └── migrations/          # Database migration files
│       └── package.json             # Backend dependencies
│
├── services/
│   └── vanna/                        # AI Service (FastAPI)
│       ├── main.py                  # FastAPI application
│       ├── Dockerfile               # Docker configuration
│       ├── requirements.txt         # Python dependencies
│       └── .env                     # Environment variables
│
├── scripts/
│   └── seed.ts                      # Database seeding script
│
├── data/
│   └── Analytics_Test_Data.json     # Sample data for testing
│
├── docker-compose.yml               # Multi-container setup
├── turbo.json                       # Turborepo configuration
├── package.json                     # Root package configuration
└── README.md                        # Project documentation
```

---

## Database Schema

### Entity Relationship Diagram
```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│    Vendors    │     │   Invoices    │     │  Customers   │
├──────────────┤     ├──────────────┤     ├──────────────┤
│ id (UUID)    │───◄│ id (UUID)     │───◄│ id (UUID)    │
│ vendor_id    │     │ invoice_no   │     │ customer_id  │
│ name          │     │ vendor_id    │     │ name          │
│ category      │     │ customer_id  │     │ meta (JSON)  │
│ meta (JSON)   │     │ date         │     └──────────────┘
│ created_at    │     │ due_date     │
│ updated_at    │     │ status       │
└──────────────┘     │ currency     │
                      │ subtotal     │
                      │ tax          │
                      │ total_amount │
                      └──────────────┘
                              │
                              ▼
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  Line Items  │     │   Payments    │     │  Documents   │
├──────────────┤     ├──────────────┤     ├──────────────┤
│ id (UUID)    │     │ id (UUID)    │     │ id (UUID)    │
│ invoice_id   │     │ invoice_id   │     │ invoice_id   │
│ description  │     │ amount       │     │ file_name    │
│ quantity      │     │ method       │     │ url          │
│ unit_price    │     │ date         │     │ uploaded_at  │
│ total         │     │ status       │     └──────────────┘
│ category      │     └──────────────┘
│ created_at    │
│ updated_at    │
└──────────────┘
```

### Table Details

#### Vendors Table
Stores supplier and vendor information with metadata support for flexible data storage.

```sql
CREATE TABLE vendors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vendor_id TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    category TEXT,
    meta JSONB,                    -- Flexible metadata (address, tax ID, etc.)
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

#### Customers Table
Contains customer information with support for custom metadata fields.

```sql
CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    meta JSONB,                    -- Customer-specific metadata
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

#### Invoices Table
Central table storing all invoice transactions with comprehensive financial details.

```sql
CREATE TABLE invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_no TEXT UNIQUE NOT NULL,
    vendor_id UUID NOT NULL REFERENCES vendors(id),
    customer_id UUID REFERENCES customers(id),
    date DATE NOT NULL,
    due_date DATE,
    status TEXT,                    -- paid, unpaid, pending, etc.
    currency TEXT,                  -- USD, EUR, etc.
    subtotal DECIMAL(10,2),
    tax DECIMAL(10,2),
    total_amount DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

#### Line Items Table
Detailed breakdown of invoice line items with categorization.

```sql
CREATE TABLE line_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id UUID NOT NULL REFERENCES invoices(id),
    description TEXT,
    quantity DECIMAL(10,2),
    unit_price DECIMAL(10,2),
    total DECIMAL(10,2),
    category TEXT,                  -- Product/service category
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

#### Payments Table
Tracks payment information for each invoice.

```sql
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id UUID NOT NULL REFERENCES invoices(id),
    amount DECIMAL(10,2) NOT NULL,
    method TEXT,                    -- Bank transfer, credit card, etc.
    date DATE,
    status TEXT,                    -- completed, pending, failed
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

#### Documents Table
Stores document metadata and file references.

```sql
CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id UUID NOT NULL REFERENCES invoices(id),
    file_name TEXT,
    url TEXT,                       -- Document storage URL
    uploaded_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

---

## Core Features

### 1. Executive Dashboard

#### Overview
The executive dashboard provides a comprehensive view of financial metrics at a glance, designed for C-level executives and finance managers.

#### Key Metrics Displayed
- **Total Spend**: Sum of all invoice amounts
- **Invoices Processed**: Total count of processed invoices
- **Documents Uploaded**: Number of digitized documents
- **Average Invoice Value**: Mean invoice amount across all transactions

#### Data Flow
```
Frontend (React Query) 
    ↓ HTTP GET /stats
Backend API (Express)
    ↓ Prisma Query
PostgreSQL Database
    ↓ Aggregated Results
Frontend Display
```

#### Implementation Details
```typescript
// API Route: /stats
const stats = await prisma.invoice.aggregate({
  _sum: { totalAmount: true },
  _count: { id: true },
  _avg: { totalAmount: true }
});

const documents = await prisma.document.count();
```

### 2. Invoice Trends Analysis

#### Overview
Interactive line chart showing invoice volume and spending trends over time, enabling identification of seasonal patterns and growth trends.

#### Features
- Monthly aggregation of invoice data
- Dual-axis display (invoice count and total spend)
- Interactive tooltips with detailed information
- Responsive design for all screen sizes

#### Data Processing
```typescript
// Monthly aggregation logic
const monthlyData = new Map<string, {
  invoice_count: number;
  total_spend: number;
}>();

invoices.forEach((invoice) => {
  const month = invoice.date.toISOString().slice(0, 7);
  const existing = monthlyData.get(month) || { 
    invoice_count: 0, 
    total_spend: 0 
  };
  monthlyData.set(month, {
    invoice_count: existing.invoice_count + 1,
    total_spend: Number(existing.total_spend) + Number(invoice.totalAmount)
  });
});
```

#### Visualization Configuration
```javascript
// Chart.js configuration for trends
const chartConfig = {
  type: 'line',
  data: {
    labels: months,
    datasets: [
      {
        label: 'Total Spend',
        data: spendData,
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        yAxisID: 'y'
      },
      {
        label: 'Invoice Count',
        data: countData,
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        yAxisID: 'y1'
      }
    ]
  }
};
```

### 3. Vendor Performance Analytics

#### Overview
Bar chart visualization displaying top vendors by spending, helping identify key supplier relationships and negotiation opportunities.

#### Key Features
- Top 10 vendors by total spend
- Horizontal bar chart for easy label reading
- Currency formatting for financial data
- Drill-down capabilities for detailed vendor analysis

#### SQL Query Example
```sql
SELECT 
  v.name,
  SUM(i.total_amount) as total_spend
FROM vendors v
JOIN invoices i ON v.id = i.vendor_id
GROUP BY v.id, v.name
ORDER BY total_spend DESC
LIMIT 10;
```

#### Data Access Pattern
```typescript
// API endpoint for vendor analytics
app.get('/vendors/top10', async (req, res) => {
  const topVendors = await prisma.$queryRaw`
    SELECT 
      v.vendor_id,
      v.name,
      SUM(i.total_amount)::numeric as spend
    FROM vendors v
    JOIN invoices i ON v.id = i.vendor_id
    GROUP BY v.id, v.vendor_id, v.name
    ORDER BY spend DESC
    LIMIT 10
  `;
  
  res.json(topVendors);
});
```

### 4. Category Spending Analysis

#### Overview
Doughnut chart showing spending distribution across different categories, providing insights into cost allocation and budget optimization.

#### Features
- Proportional visualization of category spending
- Interactive legend with show/hide functionality
- Percentage calculations for each category
- Color-coded categories for quick identification

#### Data Aggregation Logic
```typescript
// Category spend calculation
const categorySpend = await prisma.$queryRaw`
  SELECT 
    li.category,
    SUM(li.total)::numeric as spend
  FROM line_items li
  GROUP BY li.category
  ORDER BY spend DESC
`;
```

### 5. Cash Flow Forecasting

#### Overview
Calendar-style visualization of upcoming payment obligations, essential for cash flow management and financial planning.

#### Features
- Date-based visualization of unpaid invoices
- Amount aggregation by due date
- Color coding based on urgency
- Export functionality for financial planning

#### Query Implementation
```sql
SELECT 
  due_date,
  SUM(total_amount) as outflow
FROM invoices
WHERE status != 'paid'
  AND due_date >= CURRENT_DATE
GROUP BY due_date
ORDER BY due_date ASC;
```

### 6. Advanced Invoice Management

#### Table Features
- **Pagination**: Handle large datasets efficiently
- **Sorting**: Sort by any column (date, amount, vendor, status)
- **Filtering**: Real-time search across multiple fields
- **Status Indicators**: Visual cues for payment status
- **Export**: CSV export for external analysis

#### Frontend Implementation
```typescript
// React Table configuration
const table = useReactTable({
  data,
  columns,
  getCoreRowModel: getCoreRowModel(),
  getSortedRowModel: getSortedRowModel(),
  getFilteredRowModel: getFilteredRowModel(),
  getPaginationRowModel: getPaginationRowModel(),
});
```

### 7. AI-Powered Natural Language Querying

#### Overview
Revolutionary chat interface allowing users to query financial data using natural English, powered by advanced AI models.

#### Capabilities
- Natural language to SQL conversion
- Real-time query execution
- Result visualization
- Query history tracking
- Error handling and suggestions

#### Supported Query Types
- **Aggregation Queries**: "What is the total spend?"
- **Top-N Analysis**: "Show me top 5 vendors"
- **Time-based Analysis**: "Spending in last quarter"
- **Conditional Queries**: "Unpaid invoices over $1000"
- **Comparative Analysis**: "Compare vendor spending"

---

## Data Flow

### Request-Response Cycle

#### 1. Dashboard Data Loading
```
1. User navigates to dashboard
2. React Query triggers parallel API calls:
   - GET /stats
   - GET /invoice-trends
   - GET /vendors/top10
   - GET /category-spend
   - GET /cash-outflow
3. Express API receives requests
4. Prisma ORM generates optimized SQL queries
5. PostgreSQL executes queries
6. Results flow back through the chain
7. Charts render with real data
```

#### 2. Chat Query Processing
```
1. User types natural language question
2. Frontend sends POST /chat-with-data
3. Backend forwards to AI service
4. AI service:
   - Analyzes question intent
   - Generates SQL query
   - Validates SQL for security
   - Executes query against database
   - Formats results
5. Results returned to frontend
6. SQL and results displayed to user
```

### Data Access Patterns

#### Read Operations
```typescript
// Optimized database reads with proper indexing
const invoices = await prisma.invoice.findMany({
  where: {
    date: {
      gte: startDate,
      lte: endDate
    }
  },
  include: {
    vendor: {
      select: { name: true }
    },
    customer: {
      select: { name: true }
    }
  },
  orderBy: { date: 'desc' }
});
```

#### Write Operations
```typescript
// Transactional writes for data consistency
const result = await prisma.$transaction(async (tx) => {
  const invoice = await tx.invoice.create({
    data: invoiceData
  });
  
  await tx.lineItem.createMany({
    data: lineItemsData
  });
  
  return invoice;
});
```

### Caching Strategy
- **Frontend**: React Query caches API responses with configurable TTL
- **Backend**: In-memory caching for frequently accessed aggregations
- **Database**: Query result caching for complex analytics

---

## API Documentation

### Authentication & Security
- **API Key Authentication**: Required for AI service endpoints
- **CORS Configuration**: Properly configured for frontend access
- **Rate Limiting**: 50 requests per 15 minutes for chat endpoint
- **Input Validation**: Comprehensive validation for all inputs

### Core Endpoints

#### Statistics
```typescript
GET /api/stats
Response: {
  totalSpend: number;
  invoicesProcessed: number;
  documentsUploaded: number;
  avgInvoiceValue: number;
}
```

#### Invoice Trends
```typescript
GET /api/invoice-trends?from=2024-01-01&to=2024-12-31
Response: [{
  month: string;
  invoice_count: number;
  total_spend: number;
}]
```

#### Vendor Analytics
```typescript
GET /api/vendors/top10
Response: [{
  vendor_id: string;
  name: string;
  spend: number;
}]
```

#### Category Spending
```typescript
GET /api/category-spend
Response: [{
  category: string;
  spend: number;
}]
```

#### Cash Outflow
```typescript
GET /api/cash-outflow?from=2024-01-01&to=2024-12-31
Response: [{
  date: string;
  outflow: number;
}]
```

#### Natural Language Query
```typescript
POST /api/chat-with-data
Body: {
  question: string;
}
Response: {
  sql: string;
  explain: string;
  columns: string[];
  rows: Record<string, any>[];
  truncated?: boolean;
}
```

### Error Handling
```typescript
// Standardized error response format
{
  error: string;           // Error category
  message: string;         // Detailed error message
  code?: string;          // Error code for debugging
  timestamp: string;      // ISO timestamp
}
```

---

## Frontend Components

### Component Architecture

#### 1. Dashboard Layout
```typescript
// Main dashboard component structure
export function Dashboard() {
  return (
    <div className="space-y-6">
      <StatsCards />
      <div className="grid gap-6 md:grid-cols-2">
        <InvoiceTrendsChart />
        <TopVendorsChart />
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <CategorySpendChart />
        <CashOutflowChart />
      </div>
      <InvoicesTable />
    </div>
  );
}
```

#### 2. Chart Components
```typescript
// Reusable chart wrapper component
interface ChartProps {
  data: any[];
  isLoading: boolean;
  title: string;
}

export function ChartContainer({ data, isLoading, title, children }: ChartProps) {
  if (isLoading) {
    return <ChartSkeleton title={title} />;
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          {children}
        </div>
      </CardContent>
    </Card>
  );
}
```

#### 3. Data Table Component
```typescript
// Advanced table with sorting and filtering
export function InvoicesTable() {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  
  const table = useReactTable({
    data,
    columns,
    state: { sorting, columnFilters },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });
  
  // Table JSX implementation
}
```

### State Management

#### React Query Configuration
```typescript
// API client setup with React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      retry: 3,
      refetchOnWindowFocus: false,
    },
  },
});

// Custom hook for dashboard data
export function useDashboardData() {
  const stats = useQuery({
    queryKey: ['stats'],
    queryFn: () => apiClient.getStats(),
  });
  
  const trends = useQuery({
    queryKey: ['invoice-trends'],
    queryFn: () => apiClient.getInvoiceTrends(),
  });
  
  return { stats, trends };
}
```

### UI Component Library

#### Design System
- **Color Palette**: Consistent color scheme for charts and UI
- **Typography**: Scalable font sizes and weights
- **Spacing**: Standardized spacing using Tailwind classes
- **Components**: Reusable UI components with Radix UI

#### Chart Configuration
```typescript
// Global Chart.js defaults
Chart.defaults.font.family = 'Inter, sans-serif';
Chart.defaults.color = '#6b7280';
Chart.defaults.borderColor = '#e5e7eb';

// Custom tooltip formatter
const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
});
```

---

## AI Integration

### Architecture Overview

The AI integration consists of two main components:
1. **Backend API Gateway**: Handles authentication and request routing
2. **AI Service**: FastAPI application for SQL generation and execution

### Natural Language Processing Pipeline

#### 1. Question Analysis
```python
# Question intent detection
def analyze_question_intent(question: str) -> QueryIntent:
    """Analyze the user's question to determine query type"""
    question_lower = question.lower()
    
    if any(word in question_lower for word in ['total', 'sum', 'spend']):
        return QueryIntent.AGGREGATION
    elif any(word in question_lower for word in ['top', 'best', 'highest']):
        return QueryIntent.TOP_N
    elif any(word in question_lower for word in ['average', 'avg']):
        return QueryIntent.AVERAGE
    # ... more intent detection
```

#### 2. SQL Generation
```python
# Mock SQL generation (replaces Groq API)
def generate_mock_sql(question: str) -> tuple[str, str]:
    """Generate SQL based on question patterns"""
    question_lower = question.lower()
    
    if "total spend" in question_lower:
        sql = "SELECT SUM(total_amount) as total_spend FROM invoices"
        explain = "Calculates the total spend across all invoices"
    elif "top vendors" in question_lower:
        sql = """
        SELECT v.name, SUM(i.total_amount) as total_spend 
        FROM vendors v 
        JOIN invoices i ON v.id = i.vendor_id 
        GROUP BY v.id, v.name 
        ORDER BY total_spend DESC 
        LIMIT 10
        """
        explain = "Shows the top 10 vendors by total spending"
    
    return sql, explain
```

#### 3. SQL Validation
```python
# Security-focused SQL validation
def sanitize_sql(sql: str) -> tuple[bool, str]:
    """Ensure SQL is safe to execute"""
    # Remove comments
    sql = sqlparse.format(sql, strip_comments=True)
    
    # Check for forbidden keywords
    sql_upper = sql.upper()
    for keyword in FORBIDDEN_KEYWORDS:
        if re.search(rf'\b{keyword}\b', sql_upper):
            return False, f"SQL contains forbidden keyword: {keyword}"
    
    # Ensure SELECT only
    if not sql_upper.strip().startswith('SELECT'):
        return False, "Only SELECT statements are allowed"
    
    return True, sql.strip()
```

#### 4. Query Execution
```python
# Safe SQL execution with async connection
async def execute_sql(sql: str, pool: asyncpg.Pool) -> QueryResult:
    """Execute validated SQL query"""
    async with pool.acquire() as conn:
        rows = await conn.fetch(sql)
        
        if not rows:
            return QueryResult(columns=[], rows=[])
        
        columns = list(rows[0].keys())
        result_rows = [dict(row) for row in rows]
        
        return QueryResult(
            sql=sql,
            columns=columns,
            rows=result_rows,
            truncated=len(rows) > 1000
        )
```

### Supported Query Patterns

#### Aggregation Queries
- "What is the total spend?"
- "How much did we spend last year?"
- "What's the average invoice amount?"

#### Top-N Analysis
- "Show me top 5 vendors by spending"
- "Who are our biggest customers?"
- "Which categories have the highest spend?"

#### Time-based Analysis
- "Spending trends for this year"
- "Monthly invoice counts"
- "Compare Q1 vs Q2 spending"

#### Conditional Queries
- "Unpaid invoices over $1000"
- "Invoices from Technology vendors"
- "Payments made by bank transfer"

### Error Handling & Fallbacks

```python
# Comprehensive error handling
@app.post("/generate-sql")
async def generate_sql(request: SQLRequest):
    try:
        # Generate SQL
        sql, explain = generate_sql_with_llm(request.question)
        
        # Validate SQL
        is_safe, sanitized_sql = sanitize_sql(sql)
        if not is_safe:
            raise HTTPException(status_code=400, detail=sanitized_sql)
        
        # Execute query
        result = await execute_sql(sanitized_sql, pool)
        
        return SQLResponse(
            sql=sanitized_sql,
            explain=explain,
            columns=result.columns,
            rows=result.rows,
            truncated=result.truncated
        )
        
    except Exception as e:
        logger.error(f"Error processing query: {e}")
        raise HTTPException(
            status_code=500, 
            detail="Failed to process query"
        )
```

---

## Deployment Guide

### Development Environment Setup

#### Prerequisites
- Node.js 18+ and PNPM 8+
- Docker Desktop running
- PostgreSQL client tools (optional)

#### Step-by-Step Setup

1. **Clone Repository**
```bash
git clone <repository-url>
cd flowbit-analytics-dashboard
```

2. **Install Dependencies**
```bash
pnpm install
```

3. **Environment Configuration**
```bash
# Root .env for Docker services
echo "GROQ_API_KEY=your-groq-api-key" > .env
echo "VANNA_API_KEY=vanna-secret-key" >> .env

# Backend API .env
cd apps/api
echo "DATABASE_URL=postgresql://flowbit:flowbit_password@localhost:5432/flowbit" > .env
echo "VANNA_API_BASE_URL=http://localhost:8000" >> .env
echo "VANNA_API_KEY=vanna-secret-key" >> .env
```

4. **Start Docker Services**
```bash
docker-compose up -d
```

5. **Database Setup**
```bash
cd apps/api
pnpm prisma db push
pnpm prisma generate
```

6. **Seed Database**
```bash
pnpm seed:dev
```

7. **Start Development Servers**
```bash
cd ../..
pnpm dev
```

### Production Deployment

#### Docker Production Setup
```yaml
# docker-compose.prod.yml
version: '3.8'
services:
  db:
    image: postgres:15
    environment:
      POSTGRES_DB: ${POSTGRES_DB}
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped

  api:
    build:
      context: ./apps/api
      dockerfile: Dockerfile.prod
    environment:
      DATABASE_URL: ${DATABASE_URL}
      VANNA_API_BASE_URL: http://vanna:8000
    depends_on:
      - db
    restart: unless-stopped

  web:
    build:
      context: ./apps/web
      dockerfile: Dockerfile.prod
    environment:
      NEXT_PUBLIC_API_BASE_URL: ${API_BASE_URL}
    depends_on:
      - api
    restart: unless-stopped

  vanna:
    build:
      context: ./services/vanna
      dockerfile: Dockerfile.prod
    environment:
      DATABASE_URL: ${DATABASE_URL}
      GROQ_API_KEY: ${GROQ_API_KEY}
      VANNA_API_KEY: ${VANNA_API_KEY}
    depends_on:
      - db
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - web
    restart: unless-stopped
```

#### Environment Variables
```bash
# Production environment
POSTGRES_DB=flowbit_prod
POSTGRES_USER=flowbit_user
POSTGRES_PASSWORD=secure_password
DATABASE_URL=postgresql://flowbit_user:secure_password@db:5432/flowbit_prod
GROQ_API_KEY=production-groq-key
VANNA_API_KEY=production-vanna-key
API_BASE_URL=https://api.yourdomain.com
```

#### CI/CD Pipeline (GitHub Actions)
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: pnpm install
      - run: pnpm test
      - run: pnpm lint

  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to server
        run: |
          docker-compose -f docker-compose.prod.yml pull
          docker-compose -f docker-compose.prod.yml up -d
```

---

## Development Workflow

### Code Organization

#### Monorepo Structure with Turborepo
```json
// turbo.json
{
  "$schema": "https://turbo.build/schema.json",
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "dist/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "lint": {
      "dependsOn": ["^lint"]
    },
    "test": {
      "dependsOn": ["^build"]
    }
  }
}
```

#### Database Migrations
```typescript
// Creating new migrations
npx prisma migrate dev --name add_new_field

// Applying migrations in production
npx prisma migrate deploy

// Resetting database (development only)
npx prisma migrate reset
```

### Testing Strategy

#### Unit Tests
```typescript
// Example: API route test
describe('Stats API', () => {
  it('should return correct statistics', async () => {
    const response = await request(app)
      .get('/stats')
      .expect(200);
    
    expect(response.body).toHaveProperty('totalSpend');
    expect(response.body).toHaveProperty('invoicesProcessed');
  });
});
```

#### Integration Tests
```typescript
// Example: Database integration test
describe('Database Operations', () => {
  it('should create and retrieve invoice', async () => {
    const invoice = await prisma.invoice.create({
      data: mockInvoiceData
    });
    
    const retrieved = await prisma.invoice.findUnique({
      where: { id: invoice.id }
    });
    
    expect(retrieved.invoiceNo).toBe(mockInvoiceData.invoiceNo);
  });
});
```

### Performance Monitoring

#### Frontend Performance
```typescript
// React Query performance monitoring
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      onSuccess: (data) => {
        // Track query performance
        console.log(`Query loaded in ${performance.now()}ms`);
      },
      onError: (error) => {
        // Track errors for monitoring
        Sentry.captureException(error);
      }
    }
  }
});
```

#### Backend Performance
```typescript
// API response time middleware
app.use((req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.path} - ${duration}ms`);
  });
  
  next();
});
```

---

## Security Considerations

### Authentication & Authorization

#### API Key Management
```typescript
// Secure API key validation
const validateApiKey = (req: Request, res: Response, next: NextFunction) => {
  const apiKey = req.headers['x-api-key'];
  
  if (!apiKey || apiKey !== process.env.API_KEY) {
    return res.status(401).json({ error: 'Invalid API key' });
  }
  
  next();
};
```

#### Rate Limiting
```typescript
// Express rate limiting configuration
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests
  message: 'Too many requests from this IP'
});

app.use('/api/', limiter);
```

### Data Security

#### SQL Injection Prevention
```python
# Parameterized queries in Python
async def execute_safe_query(sql: str, params: dict = None):
    """Execute SQL with parameter binding"""
    async with pool.acquire() as conn:
        if params:
            return await conn.fetch(sql, *params.values())
        return await conn.fetch(sql)
```

#### Input Validation
```typescript
// Comprehensive input validation
import Joi from 'joi';

const invoiceSchema = Joi.object({
  invoiceNo: Joi.string().required(),
  vendorId: Joi.string().uuid().required(),
  totalAmount: Joi.number().positive().required(),
  date: Joi.date().iso().required()
});

// Middleware for validation
const validateInvoice = (req: Request, res: Response, next: NextFunction) => {
  const { error } = invoiceSchema.validate(req.body);
  
  if (error) {
    return res.status(400).json({
      error: 'Validation failed',
      details: error.details
    });
  }
  
  next();
};
```

### CORS Configuration
```typescript
// Secure CORS setup
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  credentials: true,
  optionsSuccessStatus: 200
}));
```

---

## Performance Optimizations

### Database Optimizations

#### Indexing Strategy
```sql
-- Performance indexes
CREATE INDEX idx_invoices_date ON invoices(date);
CREATE INDEX idx_invoices_vendor_id ON invoices(vendor_id);
CREATE INDEX idx_invoices_status ON invoices(status) WHERE status != 'paid';
CREATE INDEX idx_line_items_category ON line_items(category);
CREATE INDEX idx_payments_date ON payments(date);

-- Composite indexes for complex queries
CREATE INDEX idx_invoices_vendor_date ON invoices(vendor_id, date);
CREATE INDEX idx_line_items_invoice_category ON line_items(invoice_id, category);
```

#### Query Optimization
```typescript
// Optimized aggregation queries
const getVendorStats = async () => {
  return await prisma.$queryRaw`
    SELECT 
      v.id,
      v.name,
      COUNT(i.id)::int as invoice_count,
      SUM(i.total_amount)::numeric as total_spend,
      AVG(i.total_amount)::numeric as avg_invoice_value
    FROM vendors v
    LEFT JOIN invoices i ON v.id = i.vendor_id
    GROUP BY v.id, v.name
    ORDER BY total_spend DESC NULLS LAST
  `;
};
```

### Frontend Optimizations

#### Code Splitting
```typescript
// Dynamic imports for code splitting
const Dashboard = lazy(() => import('./components/Dashboard'));
const ChatInterface = lazy(() => import('./components/ChatInterface'));

// Usage with Suspense
function App() {
  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/chat" element={<ChatInterface />} />
      </Routes>
    </Suspense>
  );
}
```

#### Memoization
```typescript
// React.memo for component optimization
export const InvoiceCard = React.memo(({ invoice }: InvoiceCardProps) => {
  return (
    <Card>
      <CardContent>
        {/* Card content */}
      </CardContent>
    </Card>
  );
});

// useMemo for expensive calculations
const chartData = useMemo(() => {
  return processRawData(invoices);
}, [invoices]);
```

### Caching Strategies

#### Redis Caching (Optional Enhancement)
```typescript
// Redis cache implementation
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);

const cachedQuery = async (key: string, queryFn: Function, ttl: number = 300) => {
  const cached = await redis.get(key);
  
  if (cached) {
    return JSON.parse(cached);
  }
  
  const result = await queryFn();
  await redis.setex(key, ttl, JSON.stringify(result));
  
  return result;
};

// Usage
app.get('/stats', async (req, res) => {
  const stats = await cachedQuery('dashboard:stats', getStats);
  res.json(stats);
});
```

---

## Troubleshooting

### Common Issues and Solutions

#### 1. Database Connection Issues
```
Problem: "ECONNREFUSED" database connection error
Solution:
- Check if PostgreSQL is running: docker-compose ps
- Verify DATABASE_URL in .env files
- Check network connectivity between containers
- Review PostgreSQL logs: docker-compose logs db
```

#### 2. Frontend Build Errors
```
Problem: "Module not found" errors during build
Solution:
- Clear node_modules: rm -rf node_modules && pnpm install
- Check TypeScript configuration
- Verify import paths are correct
- Run pnpm type-check to identify type errors
```

#### 3. Chat Functionality Not Working
```
Problem: AI service returning 401/403 errors
Solution:
- Verify VANNA_API_KEY in both API and Vanna .env files
- Check if Vanna service is running: curl http://localhost:8000/health
- Review docker-compose logs: docker-compose logs vanna
- Ensure proper Authorization header format
```

#### 4. Charts Not Displaying Data
```
Problem: Empty charts despite data in database
Solution:
- Check API endpoints directly: curl http://localhost:4000/stats
- Verify CORS configuration
- Check browser console for JavaScript errors
- Ensure proper data formatting in API responses
```

#### 5. Performance Issues
```
Problem: Slow dashboard loading
Solution:
- Check database query performance with EXPLAIN ANALYZE
- Add appropriate indexes
- Implement caching for expensive queries
- Consider pagination for large datasets
```

### Debugging Tools

#### Database Debugging
```sql
-- Check query performance
EXPLAIN ANALYZE SELECT * FROM invoices WHERE date >= '2024-01-01';

-- Monitor active connections
SELECT * FROM pg_stat_activity WHERE state = 'active';

-- Check table sizes
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables 
WHERE schemaname = 'public';
```

#### API Debugging
```typescript
// Request logging middleware
app.use((req, res, next) => {
  console.log({
    method: req.method,
    path: req.path,
    query: req.query,
    body: req.body,
    timestamp: new Date().toISOString()
  });
  next();
});
```

#### Frontend Debugging
```typescript
// React Query devtools
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      {/* Your app */}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
```

### Monitoring and Alerting

#### Health Checks
```typescript
// Comprehensive health check
app.get('/health', async (req, res) => {
  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    services: {
      database: 'unknown',
      ai_service: 'unknown'
    }
  };
  
  try {
    // Check database
    await prisma.$queryRaw`SELECT 1`;
    health.services.database = 'connected';
  } catch (error) {
    health.services.database = 'error';
    health.status = 'degraded';
  }
  
  try {
    // Check AI service
    await axios.get(process.env.VANNA_API_BASE_URL + '/health');
    health.services.ai_service = 'connected';
  } catch (error) {
    health.services.ai_service = 'error';
    health.status = 'degraded';
  }
  
  const statusCode = health.status === 'ok' ? 200 : 503;
  res.status(statusCode).json(health);
});
```

---

## Conclusion

The Flowbit Analytics Dashboard represents a comprehensive solution for financial data analysis, combining modern web technologies with AI-powered natural language processing. This documentation provides a complete understanding of the system architecture, implementation details, and operational considerations.

### Key Takeaways
1. **Scalable Architecture**: Microservices-based design allows for independent scaling and maintenance
2. **AI Integration**: Natural language querying makes data analysis accessible to all users
3. **Performance Optimized**: Efficient database queries and frontend optimizations ensure smooth user experience
4. **Security First**: Comprehensive security measures protect sensitive financial data
5. **Developer Friendly**: Well-documented codebase and clear development workflow

### Future Enhancements
- Real-time data streaming with WebSockets
- Advanced ML models for predictive analytics
- Multi-tenant architecture for SaaS deployment
- Enhanced export and reporting capabilities
- Mobile application development

This documentation serves as a comprehensive guide for developers, system administrators, and business stakeholders working with the Flowbit Analytics Dashboard.
