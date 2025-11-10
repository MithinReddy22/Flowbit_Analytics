# Setup Verification Checklist

## ✅ Current Status

- [x] Docker Desktop is running (confirmed from your screenshot)
- [x] Groq API key is inserted in .env file

## 📋 Environment Files Checklist

Please verify you have created these `.env` files with the correct values:

### 1. `services/vanna/.env`

**Required variables:**
```env
DATABASE_URL=postgresql+psycopg://flowbit:flowbit_password@db:5432/flowbit
GROQ_API_KEY=your-groq-api-key-here
VANNA_API_KEY=optional-api-key-for-auth
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:4000
PORT=8000
```

**Verification:**
- [ ] File exists at `services/vanna/.env`
- [ ] `GROQ_API_KEY` is set (not empty)
- [ ] `DATABASE_URL` points to Docker database (`db:5432` for Docker, `localhost:5432` for local)

### 2. `apps/api/.env`

**Required variables:**
```env
DATABASE_URL=postgresql://flowbit:flowbit_password@localhost:5432/flowbit
VANNA_API_BASE_URL=http://localhost:8000
VANNA_API_KEY=optional-api-key
PORT=4000
```

**Verification:**
- [ ] File exists at `apps/api/.env`
- [ ] `DATABASE_URL` is set correctly
- [ ] `VANNA_API_BASE_URL` points to Vanna service

### 3. `apps/web/.env.local`

**Required variables:**
```env
NEXT_PUBLIC_API_BASE=http://localhost:4000
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Verification:**
- [ ] File exists at `apps/web/.env.local`
- [ ] `NEXT_PUBLIC_API_BASE` points to API server

## 🚀 Next Steps to Run the Project

### Step 1: Start Docker Services

```bash
docker-compose up -d
```

**Verify:**
- [ ] PostgreSQL container is running
- [ ] Vanna service container is running
- [ ] Check with: `docker-compose ps`

### Step 2: Install Dependencies

```bash
pnpm install
```

**Verify:**
- [ ] No errors during installation
- [ ] All packages installed successfully

### Step 3: Run Database Migrations

```bash
cd apps/api
pnpm prisma migrate dev
```

**Verify:**
- [ ] Migrations run successfully
- [ ] Database schema is created

### Step 4: Seed the Database

```bash
pnpm ts-node scripts/seed.ts
```

**Verify:**
- [ ] Seed script runs without errors
- [ ] Data is imported successfully
- [ ] Summary shows counts for vendors, invoices, etc.

### Step 5: Start Development Servers

From the root directory:

```bash
pnpm dev
```

**Verify:**
- [ ] Frontend starts on http://localhost:3000
- [ ] Backend API starts on http://localhost:4000
- [ ] Vanna service is accessible on http://localhost:8000

## 🔍 Quick Verification Commands

### Check Docker Containers
```bash
docker-compose ps
```

Should show:
- `flowbit-db` (PostgreSQL) - Status: Up
- `flowbit-vanna` (Vanna AI) - Status: Up

### Check Docker Logs
```bash
docker-compose logs vanna
```

Should show Vanna service starting without errors.

### Test Vanna Health Endpoint
```bash
curl http://localhost:8000/health
```

Should return:
```json
{"status":"ok","db":"connected"}
```

### Test API Health Endpoint
```bash
curl http://localhost:4000/health
```

Should return:
```json
{"status":"ok","db":"connected"}
```

## ⚠️ Common Issues

### Issue: "Cannot connect to database"
**Solution:** 
- Check Docker containers are running: `docker-compose ps`
- Verify DATABASE_URL in `.env` files matches Docker setup
- For Docker: use `db:5432` (not `localhost:5432`)
- For local: use `localhost:5432`

### Issue: "Vanna service not responding"
**Solution:**
- Check Vanna container logs: `docker-compose logs vanna`
- Verify GROQ_API_KEY is set correctly
- Check ALLOWED_ORIGINS includes your frontend URL

### Issue: "GROQ_API_KEY not found"
**Solution:**
- Verify the key is in `services/vanna/.env`
- Check for typos in variable name
- Ensure no extra spaces or quotes around the key

## 📝 Notes

- `.env` files are in `.gitignore` and won't be committed
- Never commit API keys to version control
- For production, use environment variables in your hosting platform
- Docker Compose handles networking between containers automatically

