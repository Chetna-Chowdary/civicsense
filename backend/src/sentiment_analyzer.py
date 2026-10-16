"""
CivicSense - Sentiment Analyzer Module
Determines citizen sentiment: Positive, Negative, or Neutral.
Trains on grievance corpus/sentiment dataset using TF-IDF and Logistic Regression/MultinomialNB.
Calculates rigorous evaluation metrics and per-class reports.
"""

from typing import List, Dict, Any, Optional
import numpy as np
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, precision_recall_fscore_support, confusion_matrix, classification_report
from .preprocessing import clean_text

SENTIMENTS = ["Positive", "Negative", "Neutral"]


class SentimentAnalyzer:
    def __init__(self, model_type: str = "logistic_regression"):
        self.model_type = "logistic_regression"
        self.vectorizer = TfidfVectorizer(
            ngram_range=(1, 2),
            max_features=1000,
            sublinear_tf=True
        )
        self.model = LogisticRegression(max_iter=1000, C=1.5, class_weight="balanced")

        self.is_trained = False
        self.classes_: List[str] = SENTIMENTS
        self.evaluation_results: Optional[Dict[str, Any]] = None

    def train_and_evaluate(self, df: pd.DataFrame, test_size: float = 0.25, random_state: int = 42) -> Dict[str, Any]:
        """
        Trains sentiment model and calculates test metrics on real held-out data.
        """
        valid_df = df.dropna(subset=["complaint_text", "sentiment"]).copy()
        valid_df["cleaned_text"] = valid_df["complaint_text"].apply(clean_text)
        valid_df = valid_df[valid_df["cleaned_text"].str.len() > 2]

        X_raw = valid_df["cleaned_text"].values
        y_raw = valid_df["sentiment"].values

        try:
            X_train, X_test, y_train, y_test = train_test_split(
                X_raw, y_raw, test_size=test_size, random_state=random_state, stratify=y_raw
            )
        except Exception:
            X_train, X_test, y_train, y_test = train_test_split(
                X_raw, y_raw, test_size=test_size, random_state=random_state
            )

        X_train_vec = self.vectorizer.fit_transform(X_train)
        X_test_vec = self.vectorizer.transform(X_test)

        self.model.fit(X_train_vec, y_train)
        self.is_trained = True
        self.classes_ = list(self.model.classes_)

        y_pred = self.model.predict(X_test_vec)

        accuracy = float(accuracy_score(y_test, y_pred))
        precision, recall, f1, _ = precision_recall_fscore_support(
            y_test, y_pred, average="weighted", zero_division=0
        )
        macro_precision, macro_recall, macro_f1, _ = precision_recall_fscore_support(
            y_test, y_pred, average="macro", zero_division=0
        )

        cm = confusion_matrix(y_test, y_pred, labels=self.classes_)
        report_dict = classification_report(
            y_test, y_pred, labels=self.classes_, output_dict=True, zero_division=0
        )

        self.evaluation_results = {
            "model_type": self.model_type,
            "train_samples": len(X_train),
            "test_samples": len(X_test),
            "total_samples": len(valid_df),
            "classes": self.classes_,
            "accuracy": round(accuracy, 4),
            "precision_weighted": round(float(precision), 4),
            "recall_weighted": round(float(recall), 4),
            "f1_weighted": round(float(f1), 4),
            "precision_macro": round(float(macro_precision), 4),
            "recall_macro": round(float(macro_recall), 4),
            "f1_macro": round(float(macro_f1), 4),
            "confusion_matrix": cm.tolist(),
            "classification_report": report_dict
        }
        return self.evaluation_results

    def predict(self, text: str) -> Dict[str, Any]:
        """
        Predicts sentiment for a given text snippet.
        """
        if not self.is_trained:
            raise RuntimeError("Sentiment analyzer is not trained yet.")

        cleaned = clean_text(text)
        if not cleaned:
            return {
                "sentiment": "Neutral",
                "confidence": 0.5,
                "probabilities": {s: 0.3333 for s in self.classes_},
                "polarity_words": []
            }

        vec = self.vectorizer.transform([cleaned])
        pred_label = self.model.predict(vec)[0]
        probas = self.model.predict_proba(vec)[0]

        prob_dict = {cls_name: round(float(p), 4) for cls_name, p in zip(self.classes_, probas)}
        confidence = float(np.max(probas))

        # Detect salient polarity words
        words = cleaned.split()
        return {
            "sentiment": str(pred_label),
            "confidence": round(confidence, 4),
            "probabilities": prob_dict,
            "tokens": words[:8],
            "cleaned_text": cleaned
        }
