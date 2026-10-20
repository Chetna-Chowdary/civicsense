# CivicSense – Public Grievance & Sentiment Analysis System

Government grievance analysis and citizen feedback intelligence system powered by **Scikit-Learn (TF-IDF + Logistic Regression)**, **React / TypeScript**, **Streamlit**, **Plotly**, and **FastAPI**.

---

## 📁 Where Are The Files Located?

This project contains two coordinated parts:

```
CivicSense/
├── src/                         <-- 🌐 FRONTEND FILES (React 19 + TypeScript + Vite + Tailwind)
│   ├── components/              <-- All UI pages & modules:
│   │   ├── dashboard/           <-- Dashboard with charts & metrics
│   │   ├── complaint-analysis/  <-- 8-Domain category classifier (presets & live prediction)
│   │   ├── sentiment-analysis/  <-- 3-Class sentiment polarity analysis
│   │   ├── trend-analysis/      <-- Temporal & daily/weekly/monthly trends
│   │   ├── complaint-explorer/  <-- Searchable complaint table with filters
│   │   ├── model-evaluation/    <-- 8x8 & 3x3 Confusion matrices & test metrics
│   │   ├── data-management/     <-- CSV loader, null checker, deduplication
│   │   ├── insights/            <-- Strategic automated civic insights
│   │   └── layout/              <-- Sidebar & Header
│   ├── services/mlEngine.ts     <-- Client-side ML engine (TF-IDF + Logistic Regression)
│   ├── types/index.ts           <-- TypeScript definitions (all 8 categories)
│   └── App.tsx & main.tsx       <-- Main application entry points
│
├── package.json                 <-- Frontend dependencies & scripts
├── vite.config.ts               <-- Vite bundler configuration
├── index.html                   <-- HTML entry point
│
├── backend/                     <-- 🐍 PYTHON BACKEND FILES
│   ├── streamlit_app.py         <-- Streamlit Production Dashboard (Plotly + Matplotlib)
│   ├── main.py                  <-- FastAPI REST API server
│   ├── requirements.txt         <-- Python dependencies
│   ├── data/demo_grievances.csv <-- 8-Domain labeled dataset (100+ records)
│   ├── src/                     <-- Python ML classifier, sentiment, & preprocessing
│   └── tests/                   <-- Pytest unit & integration test suite
│
├── run_frontend.bat             <-- Windows 1-click launcher for React Frontend
├── run_streamlit.bat            <-- Windows 1-click launcher for Streamlit Dashboard
└── run_fastapi.bat              <-- Windows 1-click launcher for FastAPI Server
```

---

## 🚀 How to Run in VS Code on Windows

### Quick Method: Double-Click Batch Files
- To run the **React Frontend**: Double-click `run_frontend.bat`
- To run the **Streamlit Dashboard**: Double-click `run_streamlit.bat`
- To run the **FastAPI Backend**: Double-click `run_fastapi.bat`

---

### Terminal Method (Step-by-Step in VS Code)

#### 1. Running the React Frontend (in root directory)
Open VS Code Terminal (`Ctrl + ~`) in the project root:
```powershell
# 1. Install Node dependencies (only needed once)
npm install

# 2. Start the Vite development server
npm run dev
```
Open **`http://localhost:3000`** in your browser.

> **Common Error:** Running `npm install` inside the `backend/` folder.  
> **Fix:** Run `cd ..` to go to the project root where `package.json` is located.

---

#### 2. Running the Python Streamlit Dashboard (Plotly + Matplotlib)
Open a new terminal tab in VS Code:
```powershell
# 1. Navigate into the backend directory
cd backend

# 2. Create Python virtual environment (if not already created)
python -m venv venv

# 3. Allow script execution in current PowerShell session
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass

# 4. Activate virtual environment
.\venv\Scripts\Activate.ps1

# 5. Install Python dependencies
pip install -r requirements.txt

# 6. Launch Streamlit
streamlit run streamlit_app.py
```
Open **`http://localhost:8501`** in your browser.

---

#### 3. Running the Python FastAPI REST Server (Optional)
In the activated `backend` terminal:
```powershell
uvicorn main:app --reload --host 127.0.0.1 --port 8000
```
- API Docs: `http://127.0.0.1:8000/docs`
- Run tests: `pytest tests/ -v`

---

## 🛠️ Common Windows Errors & Solutions

| Error Message | Cause | Solution |
|---|---|---|
| `File Activate.ps1 cannot be loaded because running scripts is disabled` | PowerShell security policy | Run `Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass` then run `.\venv\Scripts\Activate.ps1` |
| `npm ERR! enoent ENOENT: no such file or directory, open '...\backend\package.json'` | You are inside `backend/` instead of root | Type `cd ..` to return to the root folder before running `npm` commands |
| `'python' or 'pip' is not recognized` | Python is not added to Windows PATH | Use `py -m venv venv` or install Python from [python.org](https://www.python.org) and check "Add Python to PATH" |
| `'streamlit' is not recognized` | Virtual environment is not activated or dependencies not installed | Run `.\venv\Scripts\Activate.ps1` and `pip install -r requirements.txt` |
| `Port 3000 or 8501 is already in use` | Another instance is already running | Close the other terminal or press `Ctrl + C` to stop it |
