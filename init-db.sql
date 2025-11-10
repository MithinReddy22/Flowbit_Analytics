-- Drop database if exists (force disconnection)
SELECT pg_terminate_backend(pg_stat_activity.pid)
FROM pg_stat_activity
WHERE pg_stat_activity.datname = 'flowbit'
AND pid <> pg_backend_pid();

DROP DATABASE IF EXISTS flowbit;

-- Create fresh database
CREATE DATABASE flowbit;

-- Connect to new database
\c flowbit;

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Set proper permissions
ALTER DATABASE flowbit OWNER TO flowbit;
GRANT ALL PRIVILEGES ON DATABASE flowbit TO flowbit;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO flowbit;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO flowbit;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO flowbit;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO flowbit;