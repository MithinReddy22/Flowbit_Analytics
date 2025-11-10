# How to Seed the Database - Step by Step

## Option 1: Using PowerShell (Recommended)

1. **Open PowerShell** (not CMD)
2. **Navigate to the project:**
   ```powershell
   cd "D:\Downloads\Flow bit Analytical Dashboard\apps\api"
   ```

3. **Set environment variable:**
   ```powershell
   $env:DATABASE_URL="postgresql://flowbit:flowbit_password@localhost:5432/flowbit"
   ```

4. **Run the seed script:**
   ```powershell
   pnpm tsx ../../scripts/seed.ts
   ```

---

## Option 2: Using CMD (Command Prompt)

1. **Open CMD**
2. **Navigate to the project:**
   ```cmd
   cd "D:\Downloads\Flow bit Analytical Dashboard\apps\api"
   ```

3. **Set environment variable:**
   ```cmd
   set DATABASE_URL=postgresql://flowbit:flowbit_password@localhost:5432/flowbit
   ```

4. **Run the seed script:**
   ```cmd
   pnpm tsx ../../scripts/seed.ts
   ```

---

## Option 3: Using Python Script

1. **Open PowerShell or CMD**
2. **Navigate to the project root:**
   ```powershell
   cd "D:\Downloads\Flow bit Analytical Dashboard"
   ```

3. **Set environment variable:**
   
   **In PowerShell:**
   ```powershell
   $env:DATABASE_URL="postgresql://flowbit:flowbit_password@localhost:5432/flowbit"
   ```
   
   **In CMD:**
   ```cmd
   set DATABASE_URL=postgresql://flowbit:flowbit_password@localhost:5432/flowbit
   ```

4. **Run the Python script:**
   ```cmd
   python scripts/seed.py
   ```

---

## Quick Copy-Paste Commands

### For PowerShell:
```powershell
cd "D:\Downloads\Flow bit Analytical Dashboard\apps\api"
$env:DATABASE_URL="postgresql://flowbit:flowbit_password@localhost:5432/flowbit"
pnpm tsx ../../scripts/seed.ts
```

### For CMD:
```cmd
cd "D:\Downloads\Flow bit Analytical Dashboard\apps\api"
set DATABASE_URL=postgresql://flowbit:flowbit_password@localhost:5432/flowbit
pnpm tsx ../../scripts/seed.ts
```

---

## Verify Data Was Inserted

After running the seed script, verify:

```cmd
docker-compose exec db psql -U flowbit -d flowbit -c "SELECT COUNT(*) FROM invoices;"
```

You should see a number > 0 if data was successfully inserted.

---

## Troubleshooting

### Issue: "No package.json found"
**Solution:** Make sure you're in the `apps/api` directory

### Issue: "python: can't open file"
**Solution:** Make sure you're in the project root directory (`D:\Downloads\Flow bit Analytical Dashboard`)

### Issue: "The filename, directory name, or volume label syntax is incorrect"
**Solution:** 
- In CMD, use `set` instead of `$env:`
- In PowerShell, use `$env:` instead of `set`

### Issue: "Cannot find module '@prisma/client'"
**Solution:** First generate Prisma client:
```cmd
cd "D:\Downloads\Flow bit Analytical Dashboard\apps\api"
npx prisma generate --schema=../../prisma/schema.prisma
```


