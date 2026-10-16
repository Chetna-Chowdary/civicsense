# CivicSense – FastAPI & Machine Learning Backend

**Course:** Data Science (24AD3107)  
**Academic Year:** 2026 - 2027  
**Department:** Computer Science & Engineering, KLH CSE Bowrampet Campus  
**Project:** Review-2 / Batch 9  
**Team Members:**  
- B. Chetna – 2420030098  
- J. Nandini – 2420030262  
- S. Sai Saranya – 2420030266  
**Guide:** Dr. N. Sunandha  

---

## 1. Overview
CivicSense backend is an enterprise-grade data science system powered by **Python**, **FastAPI**, **Streamlit**, **Plotly**, **Matplotlib**, **Pandas**, **Scikit-Learn**, and **NLP**. It processes citizen complaints, cleans unstructured text, categorizes grievances into 8 public domains (Roads, Water Supply, Electricity, Healthcare, Education, Transportation, Drainage / Sewage, and Other Public Services), performs 3-class sentiment analysis (Positive, Negative, Neutral) using Logistic Regression with separately trained models, evaluates ML models on held-out test splits, and generates time-series trend analytics.

---

## 2. Setup & Execution on Windows (VS Code)

### Prerequisites:
- Python 3.10+ installed and added to `PATH`
- Visual Studio Code

### Step 1: Open VS Code Terminal
1. Open the project root folder in VS Code.
2. Open a new PowerShell / Command Prompt terminal (`Ctrl + ~`).
3. Navigate into the backend folder:
   ```powershell
   cd backend
   ```

### Step 2: Create and Activate Virtual Environment
```powershell
python -m venv venv
.\venv\Scripts\Activate.ps1
```
*(If PowerShell restricts execution scripts, run `Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass` first).*

### Step 3: Install Dependencies
```powershell
pip install --upgrade pip
pip install -r requirements.txt
```

### Step 4: Run Unit Tests
```powershell
pytest tests/ -v
```

### Step 5: Option A – Run Streamlit Dashboard (Plotly & Matplotlib)
```powershell
streamlit run streamlit_app.py
```
This launches the native Python Streamlit dashboard in your default browser at `http://localhost:8501`.

### Step 6: Option B – Start the FastAPI REST Server
```powershell
uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

Once started:
- **API Base:** `http://127.0.0.1:8000`
- **Interactive Swagger Documentation:** `http://127.0.0.1:8000/docs`
- **ReDoc Documentation:** `http://127.0.0.1:8000/redoc`

---

## 3. API Endpoints Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Service health status and dataset stats |
| `GET` | `/api/dataset` | Fetch paginated grievances with search and filters |
| `POST` | `/api/upload-csv` | Upload external grievance CSV with validation |
| `POST` | `/api/clean-data` | Execute automated deduplication and null handling |
| `POST` | `/api/classify-complaint` | Categorize complaint text using TF-IDF + Classifier |
| `POST` | `/api/analyze-sentiment` | Predict sentiment (Positive/Negative/Neutral) |
| `GET` | `/api/trends` | Time-series, weekly, monthly, and n-gram keyword trends |
| `GET` | `/api/model-evaluation` | True test set metrics (accuracy, F1, confusion matrix) |
| `GET` | `/api/insights` | Automated civic insights and priority recommendations |
| `POST` | `/api/reset-demo` | Restore default 100-record demo grievance corpus |

---

## 4. Connecting Frontend to Local FastAPI Backend
In the CivicSense web application:
1. Click **Backend Status** in the top navigation bar.
2. Select **"Connect to Local FastAPI Backend (http://127.0.0.1:8000)"**.
3. The frontend will ping `http://127.0.0.1:8000/api/health` and route all real-time inferences and data operations to your local Python process!
4. You can switch back to **"Embedded ML Engine"** anytime for standalone presentation.
