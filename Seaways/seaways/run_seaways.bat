@echo off
SETLOCAL
echo ===================================================
echo   SEAWAYS - MARITIME INTELLIGENCE LAUNCHER
echo ===================================================
echo.

:: Check if Node is installed
where node.exe >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js is not found in your system PATH.
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b
)

echo [1/2] Launching Backend Server...
start "SEAWAYS BACKEND" cmd /k "cd server && title SEAWAYS BACKEND && npm install && npm start"

echo [2/2] Launching Frontend Dashboard...
start "SEAWAYS FRONTEND" cmd /k "cd client && title SEAWAYS FRONTEND && npm install && npm run dev"

echo.
echo ===================================================
echo   SYSTEM INITIALIZING...
echo   Please wait for 'npm install' to finish in both
echo   windows. Once ready:
echo.
echo   URL: http://localhost:5173
echo ===================================================
echo.
pause
