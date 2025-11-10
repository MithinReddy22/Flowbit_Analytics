# Clear Setup Guide - Flowbit Analytics Dashboard

## ✅ Question 1: Is Docker Enough or PostgreSQL Required?

### **ANSWER: Docker is ENOUGH! You DON'T need a separate PostgreSQL installation.**

**Why?**
- Docker Compose includes PostgreSQL 15 running in a container
- The `docker-compose.yml` file sets up PostgreSQL automatically
- When you run `docker-compose up -d`, it creates a PostgreSQL database for you

**What you have:**
- ✅ Docker Desktop (running)
- ✅ PostgreSQL running inside Docker container (port 5432)
- ✅ No need to install PostgreSQL separately

---

## ✅ Question 2: Should I Insert Data in Database?

### **ANSWER: YES! You MUST insert data for the dashboard to show anything.**

**Current Status:**
- ❌ Database tables don't exist yet (need to create them)
- ❌ No data in database (need to seed it)
- ✅ Test data file exists: `data/Analytics_Test_Data.json`

**What you need to do:**
1. **Create database tables** (run migrations)
2. **Insert data** (run seed script)

---

## 🚀 Step-by-Step Setup Instructions

### Step 1: Verify Docker is Running

```bash
docker-compose ps
```

**Expected output:**
- `flowbit-db` - Status: Up (healthy) ✅
- `flowbit-vanna` - Status: Up ✅

If not running:
```bash
docker-compose up -d
```

---

### Step 2: Create Database Tables (Migrations)

Open a terminal in the project root and run:

```bash
cd apps/api
npx prisma db push --schema=../../prisma/schema.prisma
```

**What this does:**
- Creates all database tables (vendors, customers, invoices, line_items, payments, documents)
- Sets up relationships and indexes

**Expected output:**
```
✔ Generated Prisma Client
✔ Database schema pushed successfully
```

---

### Step 3: Insert Data (Seed Database)

Still in the `apps/api` directory, run:

```bash
pnpm ts-node scripts/seed.ts
```

**What this does:**
- Reads `data/Analytics_Test_Data.json`
- Normalizes and imports all data into the database
- Creates vendors, customers, invoices, line items, payments, and documents

**Expected output:**
```
🌱 Starting seed process...
📊 Found X documents to process
...
📈 Seed Summary:
   Processed: X documents
   Vendors: X
   Customers: X
   Invoices: X
   Line Items: X
   Payments: X
   Documents: X
✨ Seed completed successfully!
```

**This may take a few minutes** depending on the size of your test data file.

---

### Step 4: Verify Data is Inserted

Check if data exists:

```bash
docker-compose exec db psql -U flowbit -d flowbit -c "SELECT COUNT(*) FROM invoices;"
```

**Expected output:**
```
 count 
-------
   XXX
(1 row)
```

If you see a number > 0, data is successfully inserted! ✅

---

### Step 5: Start Backend API Server

In a new terminal window:

```bash
cd apps/api
```

Set environment variables:
```powershell
$env:DATABASE_URL="postgresql://flowbit:flowbit_password@localhost:5432/flowbit"
$env:VANNA_API_BASE_URL="http://localhost:8000"
$env:PORT="4000"
```

Start the server:
```bash
pnpm dev
```

**Expected output:**
```
🚀 API server running on port 4000
```

---

### Step 6: Start Frontend (Next.js)

In another terminal window:

```bash
cd apps/web
pnpm dev
```

**Expected output:**
```
✓ Ready in X seconds
○ Local: http://localhost:3000
```

---

### Step 7: Open Dashboard

Open your browser and go to:
```
http://localhost:3000
```

**You should now see:**
- ✅ Stats cards with numbers (Total Spend, Invoices, etc.)
- ✅ Charts with data (Invoice Trends, Top Vendors, etc.)
- ✅ Invoices table with data

---

## 📋 Quick Checklist

- [ ] Docker Desktop is running
- [ ] Docker containers are up (`docker-compose ps`)
- [ ] Database tables created (`npx prisma db push`)
- [ ] Data seeded (`pnpm ts-node scripts/seed.ts`)
- [ ] Backend API running on port 4000
- [ ] Frontend running on port 3000
- [ ] Dashboard shows data at http://localhost:3000

---

## 🔍 Troubleshooting

### Issue: "relation does not exist"
**Solution:** Run Step 2 (create tables) first

### Issue: "No data visible on dashboard"
**Solution:** Run Step 3 (seed data) - this is required!

### Issue: "Cannot connect to database"
**Solution:** 
1. Check Docker is running: `docker-compose ps`
2. Verify database is healthy: `docker-compose logs db`

### Issue: "404 errors on API calls"
**Solution:**
1. Make sure backend API is running on port 4000
2. Restart Next.js frontend after creating API routes

---

## 📝 Summary

1. **Docker = PostgreSQL** ✅ (No separate installation needed)
2. **You MUST seed data** ✅ (Otherwise dashboard will be empty)
3. **Follow Steps 2-3** to create tables and insert data
4. **Then start servers** (Steps 5-6)
5. **Open dashboard** (Step 7)

---

**Need help?** Check the logs:
- Backend: Check the terminal running `pnpm dev` in `apps/api`
- Frontend: Check the terminal running `pnpm dev` in `apps/web`
- Database: `docker-compose logs db`
- Vanna: `docker-compose logs vanna`


