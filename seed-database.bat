@echo off
echo ========================================
echo Flowbit Database Seeding Script
echo ========================================
echo.

cd /d "%~dp0"

echo Setting environment variable...
set DATABASE_URL=postgresql://flowbit:flowbit_password@localhost:5432/flowbit

echo.
echo Running Python seed script...
echo This may take a few minutes depending on data size...
echo.

python scripts\seed.py

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo Seed completed successfully!
    echo ========================================
) else (
    echo.
    echo ========================================
    echo Seed failed. Check the error above.
    echo ========================================
)

pause

