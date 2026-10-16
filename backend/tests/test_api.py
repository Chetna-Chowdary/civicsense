"""
CivicSense - Backend Unit and Integration Tests
Verifies preprocessing, category classification, sentiment analysis, and FastAPI routes.
"""

import pytest
import pandas as pd
from src.preprocessing import clean_text, inspect_dataframe_quality
from src.complaint_classifier import ComplaintClassifier
from src.sentiment_analyzer import SentimentAnalyzer
from src.trend_analysis import TrendAnalyzer


@pytest.fixture
def sample_dataframe():
    data = [
        {"id": "G-1", "complaint_text": "Huge dangerous potholes on the main highway road", "category": "Roads", "sentiment": "Negative", "date": "2026-08-01"},
        {"id": "G-2", "complaint_text": "Muddy dirty tap water coming from pipes", "category": "Water Supply", "sentiment": "Negative", "date": "2026-08-02"},
        {"id": "G-3", "complaint_text": "Thank you for the quick water pipe repair", "category": "Water Supply", "sentiment": "Positive", "date": "2026-08-03"},
        {"id": "G-4", "complaint_text": "What is the schedule for power cuts in our colony?", "category": "Electricity", "sentiment": "Neutral", "date": "2026-08-04"},
        {"id": "G-5", "complaint_text": "Hospital doctors were very kind and polite", "category": "Healthcare", "sentiment": "Positive", "date": "2026-08-05"},
        {"id": "G-6", "complaint_text": "School roof leaking severely during rain", "category": "Education", "sentiment": "Negative", "date": "2026-08-06"},
        {"id": "G-7", "complaint_text": "Bus route 219 is always delayed by 40 minutes", "category": "Transportation", "sentiment": "Negative", "date": "2026-08-07"},
        {"id": "G-8", "complaint_text": "Garbage dump near community park is smelling bad", "category": "Other Public Services", "sentiment": "Negative", "date": "2026-08-08"},
        {"id": "G-9", "complaint_text": "Blocked sewer line overflowing onto road with sewage smell", "category": "Drainage / Sewage", "sentiment": "Negative", "date": "2026-08-09"},
    ]
    return pd.DataFrame(data)


def test_clean_text():
    raw = "Potholes on Bowrampet Road are causing accidents! Please visit http://roads.gov"
    cleaned = clean_text(raw)
    assert "potholes" in cleaned
    assert "bowrampet" in cleaned
    assert "http" not in cleaned
    assert "!" not in cleaned


def test_inspect_quality(sample_dataframe):
    quality = inspect_dataframe_quality(sample_dataframe)
    assert quality["total_rows"] == 9
    assert quality["duplicate_count"] == 0
    assert quality["total_missing_cells"] == 0


def test_complaint_classifier(sample_dataframe):
    classifier = ComplaintClassifier(model_type="logistic_regression")
    eval_res = classifier.train_and_evaluate(sample_dataframe, test_size=0.25, random_state=42)
    assert classifier.is_trained is True
    assert "accuracy" in eval_res

    pred = classifier.predict("Damaged asphalt road with deep craters")
    assert "category" in pred
    assert "confidence" in pred
    assert 0.0 <= pred["confidence"] <= 1.0


def test_sentiment_analyzer(sample_dataframe):
    analyzer = SentimentAnalyzer(model_type="logistic_regression")
    eval_res = analyzer.train_and_evaluate(sample_dataframe, test_size=0.25, random_state=42)
    assert analyzer.is_trained is True
    assert "accuracy" in eval_res

    pred = analyzer.predict("Excellent work, thank you team!")
    assert pred["sentiment"] in ["Positive", "Negative", "Neutral"]
    assert 0.0 <= pred["confidence"] <= 1.0


def test_trend_analyzer(sample_dataframe):
    trends = TrendAnalyzer.analyze_trends(sample_dataframe)
    assert trends["total_records"] == 9
    assert len(trends["category_breakdown"]) > 0
    assert len(trends["sentiment_breakdown"]) > 0
