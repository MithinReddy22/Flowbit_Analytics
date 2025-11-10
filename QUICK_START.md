# Quick Start Guide

## ✅ Current Setup Status

- [x] Docker Desktop is running
- [x] Groq API key is configured in `services/vanna/.env`
- [x] Environment files created

## 🚀 Start the Project (Step by Step)

### Step 1: Start Docker Services

Open a terminal in the project root and run:

```bash
docker-compose up -d
```

**Expected output:**
```
Creating flowbit-db ... done
Creating flowbit-vanna ... done
```

**Verify containers are running:**
```bash
docker-compose ps
```

You should see:
- `flowbit-db` - Status: Up
- `flowbit-vanna` - Status: Up

### Step 2: Install Dependencies

```bash
pnpm install
```

This will install all dependencies for the monorepo (frontend, backend, and root).

### Step 3: Set Up Database

```bash
cd apps/api
pnpm prisma migrate dev
```

This creates the database schema.

**When prompted for a migration name, you can use:** `init`

### Step 4: Seed the Database

```bash
pnpm ts-node scripts/seed.ts
```

This imports the test data from `Analytics_Test_Data.json`.

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

### Step 5: Start Development Servers

Go back to the root directory and start all services:

```bash
cd ../..
pnpm dev
```

This will start:
- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:4000
- **Vanna AI:** Already running in Docker on http://localhost:8000

### Step 6: Open the Application

Open your browser and navigate to:
```
http://localhost:3000
```

You should see the Flowbit Analytics Dashboard!

## 🔍 Verify Everything is Working

### Check Docker Containers
```bash
docker-compose ps
```

### Check Vanna Service Health
```bash
curl http://localhost:8000/health
```

Should return: `{"status":"ok","db":"connected"}`

### Check API Health
```bash
curl http://localhost:4000/health
```

Should return: `{"status":"ok","db":"connected"}`

### Check Frontend
Open http://localhost:3000 in your browser.

## 🐛 Troubleshooting

### Issue: "Cannot connect to database"
**Solution:**
1. Check Docker containers: `docker-compose ps`
2. Check database logs: `docker-compose logs db`
3. Verify DATABASE_URL in `apps/api/.env` is correct

### Issue: "Vanna service not responding"
**Solution:**
1. Check Vanna logs: `docker-compose logs vanna`
2. Verify GROQ_API_KEY in `services/vanna/.env` is set
3. Check Vanna health: `curl http://localhost:8000/health`

### Issue: "Port already in use"
**Solution:**
- Port 3000: Change in `apps/web/package.json` dev script
- Port 4000: Change PORT in `apps/api/.env`
- Port 5432: Change in `docker-compose.yml`
- Port 8000: Change PORT in `services/vanna/.env`

### Issue: "Prisma migrate fails"
**Solution:**
1. Ensure Docker containers are running
2. Check DATABASE_URL is correct
3. Try: `pnpm prisma migrate reset` (WARNING: deletes all data)

## 📝 Next Steps

Once everything is running:

1. **Explore the Dashboard:**
   - View stats cards
   - Check charts (trends, vendors, categories, outflow)
   - Search and sort invoices table

2. **Try Chat with Data:**
   - Switch to "Chat with Data" tab
   - Ask: "What's the total spend in the last 90 days?"
   - See the generated SQL and results

3. **Check API Endpoints:**
   - Visit http://localhost:4000/stats
   - Visit http://localhost:4000/vendors/top10
   - Visit http://localhost:4000/invoices

## 🛑 Stop Services

To stop all services:

```bash
# Stop development servers (Ctrl+C in terminal running pnpm dev)
# Stop Docker containers
docker-compose down
```

To stop and remove all data:

```bash
docker-compose down -v
```

---

**You're all set! Happy coding! 🚀**

