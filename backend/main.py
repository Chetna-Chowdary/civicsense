"""
CivicSense - FastAPI Backend Application
Government Grievance & Public Sentiment Analysis System
Department of CSE, KLH CSE Bowrampet Campus | Course: 24AD3107
"""

import io
import os
from typing import Optional, Dict, Any, List
import pandas as pd
from fastapi import FastAPI, UploadFile, File, HTTPException, Query, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from src.data_loader import DataLoader, DEFAULT_CSV_PATH
from src.preprocessing import clean_text, inspect_dataframe_quality, clean_dataframe
from src.complaint_classifier import ComplaintClassifier, CATEGORIES
from src.sentiment_analyzer import SentimentAnalyzer, SENTIMENTS
from src.trend_analysis import TrendAnalyzer

app = FastAPI(
    title="CivicSense API",
    description="Backend API for Government Grievance Categorization & Sentiment Analytics",
    version="1.1.0"
)

# Secure CORS configuration
ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:5173",
    "http://127.0.0.1:5173"
]
env_origins = os.getenv("CORS_ORIGINS")
if env_origins:
    ALLOWED_ORIGINS.extend([origin.strip() for origin in env_origins.split(",") if origin.strip()])

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization", "Accept"],
)

# Application state
data_loader = DataLoader()
classifier_lr = ComplaintClassifier(model_type="logistic_regression")
sentiment_lr = SentimentAnalyzer(model_type="logistic_regression")


def init_models():
    """Initializes models on dataset load or update."""
    df = data_loader.df
    if df is not None and not df.empty and len(df) >= 5:
        try:
            classifier_lr.train_and_evaluate(df)
        except Exception as e:
            print(f"[WARN] Failed to train classifier: {e}")

        try:
            sentiment_lr.train_and_evaluate(df)
        except Exception as e:
            print(f"[WARN] Failed to train sentiment analyzer: {e}")


init_models()


# Request / Response Models
class TextAnalysisRequest(BaseModel):
    text: str = Field(..., min_length=3, max_length=5000, description="Citizen complaint text to analyze")
    model_type: Optional[str] = Field("logistic_regression", description="'logistic_regression' or 'naive_bayes'")


class BatchAnalyzeRequest(BaseModel):
    texts: List[str] = Field(..., max_items=100)


@app.get("/")
def root():
    return {
        "system": "CivicSense – Government Grievance & Public Sentiment Analysis System",
        "academic_context": {
            "institution": "KLH CSE Bowrampet Campus",
            "course": "Data Science (24AD3107)",
            "batch": 9,
            "team": ["B. Chetna (2420030098)", "J. Nandini (2420030262)", "S. Sai Saranya (2420030266)"],
            "guide": "Dr. N. Sunandha"
        },
        "status": "operational",
        "docs_url": "/docs"
    }


@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "models_ready": classifier_lr.is_trained and sentiment_lr.is_trained,
        "records_loaded": len(data_loader.df) if data_loader.df is not None else 0
    }


@app.get("/api/dataset")
def get_dataset(
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=500),
    category: Optional[str] = None,
    sentiment: Optional[str] = None,
    search: Optional[str] = None
):
    df = data_loader.df
    if df is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No dataset loaded.")

    filtered_df = df.copy()

    if category and category != "All":
        filtered_df = filtered_df[filtered_df["category"] == category]

    if sentiment and sentiment != "All":
        filtered_df = filtered_df[filtered_df["sentiment"] == sentiment]

    if search:
        search_lower = search.lower().strip()
        mask = (
            filtered_df["complaint_text"].astype(str).str.lower().str.contains(search_lower, na=False) |
            filtered_df["id"].astype(str).str.lower().str.contains(search_lower, na=False)
        )
        filtered_df = filtered_df[mask]

    total_records = len(filtered_df)
    start_idx = (page - 1) * page_size
    end_idx = start_idx + page_size
    records = filtered_df.iloc[start_idx:end_idx].to_dict(orient="records")

    quality = inspect_dataframe_quality(data_loader.df)

    return {
        "total": total_records,
        "page": page,
        "page_size": page_size,
        "records": records,
        "quality": quality,
        "categories": CATEGORIES,
        "sentiments": SENTIMENTS
    }


@app.post("/api/upload-csv")
async def upload_csv(file: UploadFile = File(...)):
    # Validate file extension
    if not file.filename.lower().endswith(".csv"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Unsupported file format. Please upload a valid .csv file."
        )

    # Validate file size (max 10MB)
    MAX_FILE_SIZE = 10 * 1024 * 1024
    content = await file.read()
    if len(content) == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="The uploaded CSV file is empty (0 bytes)."
        )
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail="File size exceeds the 10 MB limit."
        )

    try:
        df = pd.read_csv(io.StringIO(content.decode("utf-8", errors="replace")))
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Malformed CSV content: {str(e)}"
        )

    is_valid, errors, warnings = data_loader.validate_schema(df)
    if not is_valid:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail={"errors": errors, "warnings": warnings}
        )

    # Impute missing recommended columns if absent
    if "category" not in df.columns:
        df["category"] = "Other Public Services"
    if "sentiment" not in df.columns:
        df["sentiment"] = "Neutral"
    if "date" not in df.columns:
        df["date"] = "2026-08-01"
    if "status" not in df.columns:
        df["status"] = "Open"
    if "urgency" not in df.columns:
        df["urgency"] = "Medium"

    data_loader.df = df
    init_models()

    quality = inspect_dataframe_quality(df)
    return {
        "message": f"Successfully loaded {file.filename} with {len(df)} records.",
        "quality": quality,
        "warnings": warnings,
        "preview": df.head(5).to_dict(orient="records")
    }


@app.post("/api/clean-data")
def clean_data():
    if data_loader.df is None or data_loader.df.empty:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No active dataset to clean.")

    initial_count = len(data_loader.df)
    initial_quality = inspect_dataframe_quality(data_loader.df)

    cleaned = clean_dataframe(data_loader.df)
    data_loader.df = cleaned
    init_models()

    post_quality = inspect_dataframe_quality(cleaned)

    return {
        "message": f"Data cleaning complete: {initial_count - len(cleaned)} duplicate/invalid records resolved.",
        "before": initial_quality,
        "after": post_quality
    }


@app.post("/api/reset-demo")
def reset_demo():
    df = data_loader.reset_to_demo()
    init_models()
    return {
        "message": "Reset to default demo grievances dataset.",
        "records_count": len(df)
    }


@app.post("/api/classify-complaint")
def classify_complaint(req: TextAnalysisRequest):
    if not classifier_lr.is_trained:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Category classifier is not yet trained. Please check dataset."
        )
    try:
        result = classifier_lr.predict(req.text)
        return result
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@app.post("/api/analyze-sentiment")
def analyze_sentiment(req: TextAnalysisRequest):
    if not sentiment_lr.is_trained:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Sentiment analyzer is not yet trained. Please check dataset."
        )
    try:
        result = sentiment_lr.predict(req.text)
        return result
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@app.get("/api/trends")
def get_trends():
    if data_loader.df is None or data_loader.df.empty:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No active dataset.")
    return TrendAnalyzer.analyze_trends(data_loader.df)


@app.get("/api/model-evaluation")
def get_model_evaluation(model_type: str = "logistic_regression"):
    cat_eval = classifier_lr.evaluation_results
    sent_eval = sentiment_lr.evaluation_results

    if not cat_eval or not sent_eval:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Models have not completed evaluation on current dataset."
        )

    return {
        "model_type": model_type,
        "category_classification": cat_eval,
        "sentiment_analysis": sent_eval
    }


@app.get("/api/insights")
def get_insights():
    df = data_loader.df
    if df is None or df.empty:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No active dataset.")

    trends = TrendAnalyzer.analyze_trends(df)

    total = len(df)
    neg_count = sum(1 for s in df["sentiment"] if s == "Negative") if "sentiment" in df.columns else 0
    pos_count = sum(1 for s in df["sentiment"] if s == "Positive") if "sentiment" in df.columns else 0
    neg_ratio = round((neg_count / total) * 100, 1) if total > 0 else 0
    top_cat = df["category"].mode()[0] if "category" in df.columns and not df["category"].empty else "General"

    cat_neg_rates = {}
    if "category" in df.columns and "sentiment" in df.columns:
        for cat, group in df.groupby("category"):
            negs = sum(1 for s in group["sentiment"] if s == "Negative")
            cat_neg_rates[cat] = round((negs / len(group)) * 100, 1)

    highest_frustration_cat = max(cat_neg_rates.items(), key=lambda x: x[1]) if cat_neg_rates else ("General", 0)

    insights = [
        {
            "id": 1,
            "type": "alert",
            "title": f"Primary Volume Pressure: {top_cat}",
            "detail": f"{top_cat} constitutes the highest proportion of registered citizen complaints in the active dataset.",
            "action": f"Focus rapid-response resources and field inspections on {top_cat} infrastructure."
        },
        {
            "id": 2,
            "type": "sentiment",
            "title": f"Negative Public Sentiment Rate at {neg_ratio}%",
            "detail": f"{neg_count} out of {total} grievances convey citizen dissatisfaction or acute service disruption.",
            "action": "Ensure proactive progress notifications are sent to complainants to reduce repeat calls."
        },
        {
            "id": 3,
            "type": "risk",
            "title": f"Highest Grievance Severity: {highest_frustration_cat[0]} ({highest_frustration_cat[1]}% Negative)",
            "detail": f"Citizens reporting on {highest_frustration_cat[0]} exhibit the highest proportion of distress.",
            "action": f"Initiate departmental review of maintenance response times in {highest_frustration_cat[0]}."
        },
        {
            "id": 4,
            "type": "opportunity",
            "title": f"Citizen Appreciation Feedback: {pos_count} Cases ({round((pos_count/total)*100, 1) if total else 0}%)",
            "detail": "Complainants actively submitted positive feedback when civic repairs were concluded within SLA windows.",
            "action": "Standardize operational workflows from top-performing ward teams."
        }
    ]

    return {
        "summary_metrics": {
            "total_grievances": total,
            "negative_sentiment_pct": neg_ratio,
            "top_category": top_cat,
            "highest_frustration_category": highest_frustration_cat[0],
            "highest_frustration_rate": highest_frustration_cat[1]
        },
        "automated_insights": insights,
        "frequent_keywords": trends.get("frequent_keywords", [])[:8],
        "frequent_phrases": trends.get("frequent_phrases", [])[:6]
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
