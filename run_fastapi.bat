@echo off
echo ========================================================
echo   CivicSense - Starting FastAPI REST Backend
echo ========================================================
echo.

cd /d "%~dp0backend"

if not exist venv (
    echo [INFO] Creating Python virtual environment in backend\venv...
    python -m venv venv
    if %errorlevel% neq 0 (
        py -m venv venv
    )
)

if exist venv\Scripts\activate.bat (
    call venv\Scripts\activate.bat
)

echo [INFO] Installing / updating Python requirements...
pip install -r requirements.txt

echo [INFO] Launching FastAPI REST server on http://127.0.0.1:8000...
uvicorn main:app --reload --host 127.0.0.1 --port 8000
pause
