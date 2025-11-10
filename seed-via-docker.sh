#!/bin/bash
# Seed database using Docker exec
docker-compose exec db psql -U flowbit -d flowbit <<EOF
-- This will be replaced with actual SQL insertions
SELECT 'Seeding via SQL...';
EOF


