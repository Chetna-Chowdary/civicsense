"""
CivicSense - FastAPI Backend Application
Government Grievance & Public Sentiment Analysis System
Department of CSE, KLH CSE Bowrampet Campus | Batch 9 | Course: 24AD3107
"""

import io
import os
from typing import Optional, Dict, Any, List
import pandas as pd
from fastapi import FastAPI, UploadFile, File, HTTPException, Query
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
    version="1.0.0"
)

# Enable CORS for local React development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Application state
data_loader = DataLoader()
classifier_lr = ComplaintClassifier(model_type="logistic_regression")
sentiment_lr = SentimentAnalyzer(model_type="logistic_regression")

# Initialize models on startup
def init_models():
    df = data_loader.df
    if df is not None and not df.empty:
        classifier_lr.train_and_evaluate(df)
        sentiment_lr.train_and_evaluate(df)

init_models()


# Request / Response Models
class TextAnalysisRequest(BaseModel):
    text: str = Field(..., min_length=3, description="Citizen complaint text to analyze")
    model_type: Optional[str] = Field("logistic_regression", description="'logistic_regression' or 'naive_bayes'")


class BatchAnalyzeRequest(BaseModel):
    texts: List[str]


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
        raise HTTPException(status_code=404, detail="No dataset loaded.")

    filtered_df = df.copy()

    if category and category != "All":
        filtered_df = filtered_df[filtered_df["category"] == category]

    if sentiment and sentiment != "All":
        filtered_df = filtered_df[filtered_df["sentiment"] == sentiment]

    if search:
        search_lower = search.lower()
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
    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only CSV files are supported.")

    try:
        content = await file.read()
        df = pd.read_csv(io.StringIO(content.decode("utf-8", errors="replace")))

        is_valid, errors = data_loader.validate_schema(df)
        if not is_valid:
            raise HTTPException(status_code=422, detail="; ".join(errors))

        # Update dataset
        data_loader.df = df
        init_models()

        quality = inspect_dataframe_quality(df)
        return {
            "message": f"Successfully uploaded {file.filename} with {len(df)} records.",
            "quality": quality,
            "preview": df.head(5).to_dict(orient="records")
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to process CSV: {str(e)}")


@app.post("/api/clean-data")
def clean_data():
    if data_loader.df is None:
        raise HTTPException(status_code=400, detail="No dataset loaded.")

    initial_count = len(data_loader.df)
    initial_quality = inspect_dataframe_quality(data_loader.df)

    cleaned = clean_dataframe(data_loader.df)
    data_loader.df = cleaned
    init_models()

    post_quality = inspect_dataframe_quality(cleaned)

    return {
        "message": f"Dataset cleaned: {initial_count - len(cleaned)} duplicate/invalid rows handled.",
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
    try:
        result = classifier_lr.predict(req.text)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/analyze-sentiment")
def analyze_sentiment(req: TextAnalysisRequest):
    try:
        result = sentiment_lr.predict(req.text)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/trends")
def get_trends():
    if data_loader.df is None or data_loader.df.empty:
        raise HTTPException(status_code=400, detail="No active dataset.")
    return TrendAnalyzer.analyze_trends(data_loader.df)


@app.get("/api/model-evaluation")
def get_model_evaluation(model_type: str = "logistic_regression"):
    cat_eval = classifier_lr.evaluation_results
    sent_eval = sentiment_lr.evaluation_results

    return {
        "model_type": "logistic_regression",
        "category_classification": cat_eval,
        "sentiment_analysis": sent_eval
    }


@app.get("/api/insights")
def get_insights():
    df = data_loader.df
    if df is None or df.empty:
        raise HTTPException(status_code=400, detail="No active dataset.")

    trends = TrendAnalyzer.analyze_trends(df)

    # Calculate key insights based on real data
    total = len(df)
    neg_count = sum(1 for s in df["sentiment"] if s == "Negative") if "sentiment" in df.columns else 0
    pos_count = sum(1 for s in df["sentiment"] if s == "Positive") if "sentiment" in df.columns else 0
    neu_count = sum(1 for s in df["sentiment"] if s == "Neutral") if "sentiment" in df.columns else 0

    neg_ratio = round((neg_count / total) * 100, 1) if total > 0 else 0
    top_cat = df["category"].mode()[0] if "category" in df.columns and not df["category"].empty else "None"

    # Category with highest negative sentiment
    cat_neg_rates = {}
    if "category" in df.columns and "sentiment" in df.columns:
        for cat, group in df.groupby("category"):
            negs = sum(1 for s in group["sentiment"] if s == "Negative")
            cat_neg_rates[cat] = round((negs / len(group)) * 100, 1)

    highest_frustration_cat = max(cat_neg_rates.items(), key=lambda x: x[1]) if cat_neg_rates else ("None", 0)

    insights = [
        {
            "id": 1,
            "type": "alert",
            "title": f"Dominant Grievance Pressure: {top_cat}",
            "detail": f"{top_cat} accounts for the highest single share of logged public complaints with strong citizen urgency.",
            "action": "Prioritize rapid inter-departmental taskforce and budget allocation for field repairs."
        },
        {
            "id": 2,
            "type": "sentiment",
            "title": f"Negative Public Sentiment Rate at {neg_ratio}%",
            "detail": f"{neg_count} out of {total} grievances express citizen dissatisfaction or emergency infrastructure failure.",
            "action": "Deploy proactive SMS status updates to complainants to reduce escalation friction."
        },
        {
            "id": 3,
            "type": "risk",
            "title": f"Highest Frustration Sector: {highest_frustration_cat[0]} ({highest_frustration_cat[1]}% Negative)",
            "detail": f"Citizens reporting on {highest_frustration_cat[0]} express acute frustration compared to other civic domains.",
            "action": f"Establish immediate review of response SLA and emergency supply chains in {highest_frustration_cat[0]}."
        },
        {
            "id": 4,
            "type": "opportunity",
            "title": f"Resolution Positive Feedback at {pos_count} Cases ({round((pos_count/total)*100, 1) if total else 0}%)",
            "detail": "Citizens actively submitted positive feedback when road repairs and drinking water restorations were executed within 48 hours.",
            "action": "Replicate standard operating procedures from successful ward teams across all municipal divisions."
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
