# Final Solution: How to Seed the Database

## The Problem

There are authentication issues connecting from Windows to Docker PostgreSQL. The password authentication is failing even though the password is correct.

## Solution: Use Docker Exec to Run Seed Script

Since direct connection from Windows is having issues, we'll run the seed script **inside the Docker container** where connection is guaranteed.

### Step 1: Install Python packages in Docker container

```cmd
docker-compose exec db bash -c "apt-get update && apt-get install -y python3 python3-pip"
```

### Step 2: Install required Python packages

```cmd
docker-compose exec db bash -c "pip3 install asyncpg"
```

### Step 3: Copy files to container

```cmd
cd "D:\Downloads\Flow bit Analytical Dashboard"
docker cp scripts/seed.py flowbit-db:/tmp/seed.py
docker cp data/Analytics_Test_Data.json flowbit-db:/tmp/Analytics_Test_Data.json
```

### Step 4: Run seed script inside container

```cmd
docker-compose exec db bash -c "cd /tmp && DATABASE_URL='postgresql://flowbit:flowbit_password@localhost:5432/flowbit' python3 seed.py"
```

---

## Alternative: Manual SQL Insert (Simpler)

If the Python script still has issues, you can manually insert a few records to test:

```cmd
docker-compose exec db psql -U flowbit -d flowbit -c "INSERT INTO vendors (vendor_id, name) VALUES ('test-vendor-1', 'Test Vendor') RETURNING id;"
```

---

## Quick Test: Verify Connection Works

Test if you can connect from Windows:

```cmd
docker-compose exec db psql -U flowbit -d flowbit -c "SELECT COUNT(*) FROM invoices;"
```

If this works, the database is accessible. The issue is specifically with Python's psycopg connecting from Windows.

---

## Recommended: Use the Batch File

I've updated `seed-database.bat` to use Python. Try running it:

1. **Double-click** `seed-database.bat` in the project root
2. OR open CMD and run:
   ```cmd
   cd "D:\Downloads\Flow bit Analytical Dashboard"
   seed-database.bat
   ```

The batch file will:
- Set the environment variable correctly
- Run the Python seed script
- Show progress

---

## If All Else Fails: Manual Data Entry

You can manually insert test data to see the dashboard working:

```cmd
docker-compose exec db psql -U flowbit -d flowbit
```

Then run SQL commands:
```sql
INSERT INTO vendors (vendor_id, name, category) VALUES 
('vendor-1', 'Test Vendor 1', 'Office Supplies'),
('vendor-2', 'Test Vendor 2', 'IT Services');

INSERT INTO invoices (invoice_number, vendor_id, date, total_amount) VALUES
('INV-001', (SELECT id FROM vendors WHERE vendor_id = 'vendor-1'), '2025-01-01', 1000.00),
('INV-002', (SELECT id FROM vendors WHERE vendor_id = 'vendor-2'), '2025-01-02', 2000.00);
```

This will at least show some data in the dashboard.


