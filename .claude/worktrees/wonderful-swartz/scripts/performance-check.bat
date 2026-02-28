@echo off
REM Performance Check Script for Windows
REM Runs Lighthouse CI and saves results for tracking
REM Usage: scripts\performance-check.bat

setlocal enabledelayedexpansion

echo.
echo ======================================
echo ^|  Whisker Watch Performance Check  ^|
echo ======================================
echo.

REM Check if npm is installed
where npm >nul 2>nul
if errorlevel 1 (
    echo Error: npm not found. Please install Node.js and npm.
    exit /b 1
)

REM Step 1: Build
echo.
echo 1. Building application...
call npm run build
if errorlevel 1 (
    echo Error: Build failed
    exit /b 1
)
echo Build complete!
echo.

REM Step 2: Start server
echo 2. Starting production server...
start "Next.js Server" cmd /k npm start
echo Waiting 10 seconds for server to start...
timeout /t 10 /nobreak

REM Step 3: Run Lighthouse
echo.
echo 3. Running Lighthouse CI (3 runs)...
call npx lhci autorun

REM Step 4: Cleanup
echo.
echo 4. Stopping server...
taskkill /FI "WINDOWTITLE eq Next.js Server" /T /F 2>nul
echo.

echo.
echo ======================================
echo Performance check complete!
echo ======================================
echo.
echo Tips:
echo - Results are saved in temporary storage (expires in 7 days)
echo - For persistent storage, set up GitHub integration
echo - Review the PERFORMANCE.md guide for optimization tips
echo - Run this script weekly to monitor trends
echo.

endlocal
