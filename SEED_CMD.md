# How to Seed Database - CMD Instructions

## Quick Method: Use the Batch File

1. **Double-click** `seed-database.bat` in the project root folder
   OR
2. **Open CMD** and run:
   ```cmd
   cd "D:\Downloads\Flow bit Analytical Dashboard"
   seed-database.bat
   ```

---

## Manual Method: Step by Step

### Step 1: Open CMD
Press `Win + R`, type `cmd`, press Enter

### Step 2: Navigate to the API directory
```cmd
cd "D:\Downloads\Flow bit Analytical Dashboard\apps\api"
```

### Step 3: Set the database URL
```cmd
set DATABASE_URL=postgresql://flowbit:flowbit_password@localhost:5432/flowbit
```

### Step 4: Run the seed script
```cmd
pnpm tsx ../../scripts/seed.ts
```

---

## Alternative: Use Python Script

### Step 1: Navigate to project root
```cmd
cd "D:\Downloads\Flow bit Analytical Dashboard"
```

### Step 2: Set the database URL
```cmd
set DATABASE_URL=postgresql://flowbit:flowbit_password@localhost:5432/flowbit
```

### Step 3: Run Python script
```cmd
python scripts/seed.py
```

---

## Verify Data Was Inserted

After seeding, verify:

```cmd
cd "D:\Downloads\Flow bit Analytical Dashboard"
docker-compose exec db psql -U flowbit -d flowbit -c "SELECT COUNT(*) FROM invoices;"
```

You should see a number > 0 if data was successfully inserted.

---

## Common Issues

### "No package.json found"
**Solution:** Make sure you're in `apps\api` directory

### "pnpm: command not found"
**Solution:** Install pnpm: `npm install -g pnpm`

### "python: can't open file"
**Solution:** Make sure you're in the project root directory

### "Cannot find module '@prisma/client'"
**Solution:** First generate Prisma client:
```cmd
cd "D:\Downloads\Flow bit Analytical Dashboard\apps\api"
npx prisma generate --schema=../../prisma/schema.prisma
```


