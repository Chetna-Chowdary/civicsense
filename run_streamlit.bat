@echo off
echo ========================================================
echo   CivicSense - Starting Streamlit ML Dashboard
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
) else (
    echo [WARNING] Could not find venv\Scripts\activate.bat. Using system Python.
)

echo [INFO] Installing / updating Python requirements...
pip install -r requirements.txt

echo [INFO] Launching Streamlit dashboard on http://localhost:8501...
streamlit run streamlit_app.py
pause
