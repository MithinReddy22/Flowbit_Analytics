# Prerequisites - Flowbit Analytics Dashboard

This document lists all prerequisites and setup requirements before running the project.

## 🔧 Required Software

### 1. Node.js (Version 18 or higher)

**Why needed:** The frontend (Next.js) and backend (Express.js) are built with Node.js and TypeScript.

**How to check:**
```bash
node --version
```

**Installation:**
- **Windows:** Download from [nodejs.org](https://nodejs.org/)
- **macOS:** `brew install node` or download from nodejs.org
- **Linux:** `sudo apt-get install nodejs npm` (Ubuntu/Debian)

**Required version:** Node.js 18.0.0 or higher

---

### 2. pnpm (Version 8 or higher)

**Why needed:** The project uses pnpm as the package manager for the monorepo workspace.

**How to check:**
```bash
pnpm --version
```

**Installation:**
```bash
npm install -g pnpm
```

**Required version:** pnpm 8.0.0 or higher

---

### 3. Docker & Docker Compose

**Why needed:** 
- PostgreSQL database runs in a Docker container
- Vanna AI service runs in a Docker container
- Ensures consistent development environment

**How to check:**
```bash
docker --version
docker-compose --version
```

**Installation:**
- **Windows:** Download [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- **macOS:** Download [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- **Linux:** 
  ```bash
  sudo apt-get update
  sudo apt-get install docker.io docker-compose
  sudo usermod -aG docker $USER
  ```

**Required versions:**
- Docker 20.10 or higher
- Docker Compose 2.0 or higher

**Note:** After installing Docker Desktop, make sure it's running before starting the project.

---

### 4. PostgreSQL 15 (Optional - if not using Docker)

**Why needed:** The application uses PostgreSQL as the database. If you're using Docker Compose, PostgreSQL will be automatically set up.

**When needed:** Only if you want to run PostgreSQL locally without Docker.

**Installation:**
- **Windows:** Download from [postgresql.org](https://www.postgresql.org/download/windows/)
- **macOS:** `brew install postgresql@15`
- **Linux:** `sudo apt-get install postgresql-15`

**Note:** If using Docker Compose, you can skip this installation.

---

### 5. Python 3.11+ (Optional - for local Vanna development)

**Why needed:** The Vanna AI service is built with Python and FastAPI. If you're using Docker, Python is included in the container.

**When needed:** Only if you want to run the Vanna service locally without Docker.

**How to check:**
```bash
python3 --version
```

**Installation:**
- **Windows:** Download from [python.org](https://www.python.org/downloads/)
- **macOS:** `brew install python@3.11`
- **Linux:** `sudo apt-get install python3.11 python3-pip`

**Note:** If using Docker Compose, you can skip this installation.

---

## 🔑 Required API Keys & Accounts

### 1. Groq API Key

**Why needed:** The Vanna AI service uses Groq's LLM (Llama 3.1 70B) to generate SQL queries from natural language.

**How to get:**
1. Visit [console.groq.com](https://console.groq.com/)
2. Sign up for a free account
3. Navigate to API Keys section
4. Create a new API key
5. Copy the API key (you'll need it for the `.env` file)

**Free tier:** Groq offers free API access with rate limits.

**Where to use:** Add to `services/vanna/.env` as `GROQ_API_KEY=your-key-here`

---

## 📋 System Requirements

### Minimum System Requirements

- **RAM:** 8GB (16GB recommended)
- **Disk Space:** 5GB free space
- **CPU:** 2 cores (4 cores recommended)
- **OS:** Windows 10+, macOS 10.15+, or Linux (Ubuntu 20.04+)

### Recommended System Requirements

- **RAM:** 16GB
- **Disk Space:** 10GB free space
- **CPU:** 4+ cores
- **OS:** Latest stable version

---

## 🛠️ Development Tools (Optional but Recommended)

### 1. Git

**Why needed:** Version control and cloning the repository.

**Installation:**
- **Windows:** Download from [git-scm.com](https://git-scm.com/download/win)
- **macOS:** `xcode-select --install` or download from git-scm.com
- **Linux:** `sudo apt-get install git`

### 2. VS Code (Recommended IDE)

**Why recommended:** Best TypeScript/Next.js development experience.

**Extensions to install:**
- ESLint
- Prettier
- Prisma
- Docker
- Python

### 3. PostgreSQL Client (Optional)

**Why useful:** For direct database access and debugging.

**Options:**
- **pgAdmin** (GUI)
- **DBeaver** (GUI)
- **psql** (CLI - comes with PostgreSQL)

---

## ✅ Pre-Flight Checklist

Before running the project, ensure you have:

- [ ] Node.js 18+ installed (`node --version`)
- [ ] pnpm 8+ installed (`pnpm --version`)
- [ ] Docker Desktop installed and running (`docker --version`)
- [ ] Docker Compose installed (`docker-compose --version`)
- [ ] Groq API key obtained from console.groq.com
- [ ] At least 5GB free disk space
- [ ] At least 8GB RAM available
- [ ] Git installed (if cloning from repository)
- [ ] Ports 3000, 4000, 5432, and 8000 available (not in use by other applications)

---

## 🚨 Common Issues & Solutions

### Issue: "pnpm: command not found"
**Solution:** Install pnpm globally: `npm install -g pnpm`

### Issue: "Docker daemon is not running"
**Solution:** Start Docker Desktop application

### Issue: "Port 5432 is already in use"
**Solution:** 
- Stop any existing PostgreSQL instances
- Or change the port in `docker-compose.yml`

### Issue: "Port 3000 is already in use"
**Solution:** 
- Stop any application using port 3000
- Or change the port in `apps/web/package.json` dev script

### Issue: "GROQ_API_KEY not found"
**Solution:** 
- Sign up at console.groq.com
- Create an API key
- Add it to `services/vanna/.env`

---

## 📚 Next Steps

Once all prerequisites are installed:

1. **Verify installations:**
   ```bash
   node --version
   pnpm --version
   docker --version
   docker-compose --version
   ```

2. **Clone/Download the project** (if not already done)

3. **Install dependencies:**
   ```bash
   pnpm install
   ```

4. **Set up environment variables** (see README.md)

5. **Start Docker services:**
   ```bash
   docker-compose up -d
   ```

6. **Run database migrations:**
   ```bash
   cd apps/api
   pnpm prisma migrate dev
   ```

7. **Seed the database:**
   ```bash
   pnpm ts-node scripts/seed.ts
   ```

8. **Start development servers:**
   ```bash
   cd ../..
   pnpm dev
   ```

---

## 🆘 Need Help?

If you encounter issues:

1. Check the [README.md](./README.md) for detailed setup instructions
2. Verify all prerequisites are installed correctly
3. Ensure Docker Desktop is running
4. Check that all required ports are available
5. Verify environment variables are set correctly

---

**Last Updated:** 2025-11-08


