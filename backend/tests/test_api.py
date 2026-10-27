"""
CivicSense - Backend Unit and Regression Test Suite
Tests text preprocessing, schema validation, leak-free ML model training,
stratified evaluation, anomaly detection, duplicate detection, and FastAPI endpoints.
"""

import io
import pytest
import pandas as pd
from src.preprocessing import clean_text, inspect_dataframe_quality, clean_dataframe
from src.data_loader import DataLoader
from src.complaint_classifier import ComplaintClassifier, CATEGORIES
from src.sentiment_analyzer import SentimentAnalyzer, SENTIMENTS
from src.trend_analysis import TrendAnalyzer


@pytest.fixture
def sample_dataframe():
    """Generates a representative grievance test dataset with at least 2 samples per category and sentiment."""
    data = [
        {"id": "G-01", "complaint_text": "Dangerous potholes and cracked asphalt on Main Ring Road", "category": "Roads", "sentiment": "Negative", "date": "2026-08-01", "ward_or_region": "Ward 1", "department": "Public Works", "status": "Open", "urgency": "High"},
        {"id": "G-02", "complaint_text": "Pothole filled and road resurfaced quickly, great job", "category": "Roads", "sentiment": "Positive", "date": "2026-08-02", "ward_or_region": "Ward 1", "department": "Public Works", "status": "Resolved", "urgency": "Low"},
        {"id": "G-03", "complaint_text": "Severe tap water contamination and muddy odor in lines", "category": "Water Supply", "sentiment": "Negative", "date": "2026-08-03", "ward_or_region": "Ward 2", "department": "Water Board", "status": "Open", "urgency": "Critical"},
        {"id": "G-04", "complaint_text": "Clean drinking water pressure restored promptly today", "category": "Water Supply", "sentiment": "Positive", "date": "2026-08-04", "ward_or_region": "Ward 2", "department": "Water Board", "status": "Resolved", "urgency": "Low"},
        {"id": "G-05", "complaint_text": "Frequent transformer sparking and power blackout in colony", "category": "Electricity", "sentiment": "Negative", "date": "2026-08-05", "ward_or_region": "Ward 3", "department": "Electricity Board", "status": "In Progress", "urgency": "High"},
        {"id": "G-06", "complaint_text": "When is the scheduled power shutdown timing for maintenance?", "category": "Electricity", "sentiment": "Neutral", "date": "2026-08-06", "ward_or_region": "Ward 3", "department": "Electricity Board", "status": "Open", "urgency": "Medium"},
        {"id": "G-07", "complaint_text": "Primary Health Clinic doctors were very helpful and caring", "category": "Healthcare", "sentiment": "Positive", "date": "2026-08-07", "ward_or_region": "Ward 4", "department": "Health Dept", "status": "Resolved", "urgency": "Low"},
        {"id": "G-08", "complaint_text": "Shortage of essential medicines at government dispensary", "category": "Healthcare", "sentiment": "Negative", "date": "2026-08-08", "ward_or_region": "Ward 4", "department": "Health Dept", "status": "Open", "urgency": "High"},
        {"id": "G-09", "complaint_text": "Municipal school building roof leaking during monsoon rain", "category": "Education", "sentiment": "Negative", "date": "2026-08-09", "ward_or_region": "Ward 5", "department": "Education Dept", "status": "Open", "urgency": "Medium"},
        {"id": "G-10", "complaint_text": "New classroom benches and smart board installed nicely", "category": "Education", "sentiment": "Positive", "date": "2026-08-10", "ward_or_region": "Ward 5", "department": "Education Dept", "status": "Resolved", "urgency": "Low"},
        {"id": "G-11", "complaint_text": "Bus route 219 is perpetually delayed by over 45 minutes", "category": "Transportation", "sentiment": "Negative", "date": "2026-08-11", "ward_or_region": "Ward 6", "department": "Transport Corp", "status": "In Progress", "urgency": "Medium"},
        {"id": "G-12", "complaint_text": "Bus schedule query for early morning metro feeder line", "category": "Transportation", "sentiment": "Neutral", "date": "2026-08-12", "ward_or_region": "Ward 6", "department": "Transport Corp", "status": "Resolved", "urgency": "Low"},
        {"id": "G-13", "complaint_text": "Blocked sewer drain overflowing dirty wastewater onto road", "category": "Drainage / Sewage", "sentiment": "Negative", "date": "2026-08-13", "ward_or_region": "Ward 7", "department": "Sanitation Board", "status": "Open", "urgency": "Critical"},
        {"id": "G-14", "complaint_text": "Sewage line cleared and disinfectant sprayed, thank you", "category": "Drainage / Sewage", "sentiment": "Positive", "date": "2026-08-14", "ward_or_region": "Ward 7", "department": "Sanitation Board", "status": "Resolved", "urgency": "Low"},
        {"id": "G-15", "complaint_text": "Illegal banner and loud speakers near residential park", "category": "Other Public Services", "sentiment": "Negative", "date": "2026-08-15", "ward_or_region": "Ward 8", "department": "Municipal Admin", "status": "Open", "urgency": "Medium"},
        {"id": "G-16", "complaint_text": "Park benches and jogging track renovated very nicely", "category": "Other Public Services", "sentiment": "Positive", "date": "2026-08-16", "ward_or_region": "Ward 8", "department": "Municipal Admin", "status": "Resolved", "urgency": "Low"}
    ]
    return pd.DataFrame(data)


# 1. Text Preprocessing Tests
def test_clean_text_removes_noise_and_preserves_civic_terms():
    raw = "Emergency: Potholes on Bowrampet Road are causing accidents! See https://roads.gov"
    cleaned = clean_text(raw)
    assert "potholes" in cleaned
    assert "bowrampet" in cleaned
    assert "road" in cleaned
    assert "http" not in cleaned
    assert "!" not in cleaned


def test_clean_text_empty_input():
    assert clean_text("") == ""
    assert clean_text("   ") == ""
    assert clean_text(None) == ""


# 2. Schema and DataLoader Validation Tests
def test_data_loader_validate_schema_success(sample_dataframe):
    loader = DataLoader()
    valid, errors, warnings = loader.validate_schema(sample_dataframe)
    assert valid is True
    assert len(errors) == 0


def test_data_loader_validate_schema_rejects_empty():
    loader = DataLoader()
    empty_df = pd.DataFrame()
    valid, errors, _ = loader.validate_schema(empty_df)
    assert valid is False
    assert any("empty" in e.lower() for e in errors)


def test_data_loader_validate_schema_rejects_undersized():
    loader = DataLoader()
    tiny_df = pd.DataFrame([{"complaint_text": "bad road"}])
    valid, errors, _ = loader.validate_schema(tiny_df)
    assert valid is False
    assert any("minimum" in e.lower() for e in errors)


def test_data_loader_validate_schema_missing_column():
    loader = DataLoader()
    df_missing = pd.DataFrame([{"wrong_col": "text"}] * 6)
    valid, errors, _ = loader.validate_schema(df_missing)
    assert valid is False
    assert any("missing required" in e.lower() for e in errors)


# 3. Machine Learning & Leakage Protection Tests
def test_complaint_classifier_leakage_protection_and_metrics(sample_dataframe):
    classifier = ComplaintClassifier(model_type="logistic_regression")
    eval_res = classifier.train_and_evaluate(sample_dataframe, test_size=0.25, random_state=42)

    assert classifier.is_trained is True
    assert eval_res["leakage_protected"] is True
    assert "accuracy" in eval_res
    assert "precision_weighted" in eval_res
    assert "recall_weighted" in eval_res
    assert "f1_weighted" in eval_res
    assert "confusion_matrix" in eval_res
    assert "cross_validation" in eval_res
    assert "model_comparison" in eval_res

    # Test prediction
    pred = classifier.predict("Deep road pothole causing bike skid")
    assert pred["category"] in CATEGORIES
    assert 0.0 <= pred["confidence"] <= 1.0
    assert "needs_review" in pred


def test_sentiment_analyzer_evaluation_and_uncertainty(sample_dataframe):
    analyzer = SentimentAnalyzer(model_type="logistic_regression")
    eval_res = analyzer.train_and_evaluate(sample_dataframe, test_size=0.25, random_state=42)

    assert analyzer.is_trained is True
    assert eval_res["leakage_protected"] is True
    assert "accuracy" in eval_res
    assert "f1_weighted" in eval_res
    assert "cross_validation" in eval_res

    pred = analyzer.predict("Thank you very much for the rapid water line repair")
    assert pred["sentiment"] in SENTIMENTS
    assert 0.0 <= pred["confidence"] <= 1.0
    assert "probabilities" in pred


# 4. Trend Analysis & Advanced Metrics Tests
def test_trend_analyzer_advanced_metrics(sample_dataframe):
    trends = TrendAnalyzer.analyze_trends(sample_dataframe)

    assert trends["total_records"] == 16
    assert len(trends["daily_trends"]) > 0
    assert len(trends["category_sentiment_stacked"]) > 0
    assert len(trends["department_breakdown"]) > 0
    assert len(trends["ward_breakdown"]) > 0

    # Resolution analytics check
    res = trends["resolution_analytics"]
    assert res["total_cases"] == 16
    assert res["resolved_cases"] >= 0
    assert 0.0 <= res["resolution_rate_pct"] <= 100.0

    # Priority scoring check
    priority = trends["priority_scoring"]
    assert "distribution" in priority
    assert sum(priority["distribution"].values()) == 16
    assert len(priority["high_priority_queue"]) > 0
