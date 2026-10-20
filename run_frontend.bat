@echo off
echo ========================================================
echo   CivicSense - Starting React Frontend (Vite)
echo ========================================================
echo.

if not exist node_modules (
    echo [INFO] node_modules not found. Installing dependencies...
    call npm install
    if %errorlevel% neq 0 (
        echo [ERROR] npm install failed. Make sure Node.js is installed from https://nodejs.org
        pause
        exit /b %errorlevel%
    )
)

echo [INFO] Launching Vite development server on http://localhost:3000...
call npm run dev
pause
