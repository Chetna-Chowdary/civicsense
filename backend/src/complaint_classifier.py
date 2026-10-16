"""
CivicSense - Complaint Classifier Module
Categorizes citizen grievances into 8 key public service areas:
- Roads
- Water Supply
- Electricity
- Healthcare
- Education
- Transportation
- Drainage / Sewage
- Other Public Services

Uses TF-IDF Vectorization with Logistic Regression.
Computes real evaluation metrics on held-out test splits without fabricated values.
"""

from typing import List, Dict, Any, Optional
import numpy as np
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, precision_recall_fscore_support, confusion_matrix, classification_report
from .preprocessing import clean_text

CATEGORIES = [
    "Roads",
    "Water Supply",
    "Electricity",
    "Healthcare",
    "Education",
    "Transportation",
    "Drainage / Sewage",
    "Other Public Services"
]


class ComplaintClassifier:
    def __init__(self, model_type: str = "logistic_regression"):
        self.model_type = "logistic_regression"
        self.vectorizer = TfidfVectorizer(
            ngram_range=(1, 2),
            max_features=1200,
            sublinear_tf=True
        )
        self.model = LogisticRegression(max_iter=1000, C=1.5, class_weight="balanced")

        self.is_trained = False
        self.classes_: List[str] = CATEGORIES
        self.evaluation_results: Optional[Dict[str, Any]] = None

    def train_and_evaluate(self, df: pd.DataFrame, test_size: float = 0.25, random_state: int = 42) -> Dict[str, Any]:
        """
        Trains TF-IDF + Classifier on complaint_text -> category and evaluates on held-out test split.
        """
        valid_df = df.dropna(subset=["complaint_text", "category"]).copy()
        valid_df["cleaned_text"] = valid_df["complaint_text"].apply(clean_text)
        valid_df = valid_df[valid_df["cleaned_text"].str.len() > 2]

        X_raw = valid_df["cleaned_text"].values
        y_raw = valid_df["category"].values

        # Stratified train/test split
        try:
            X_train, X_test, y_train, y_test = train_test_split(
                X_raw, y_raw, test_size=test_size, random_state=random_state, stratify=y_raw
            )
        except Exception:
            # Fallback to unstratified if any class has too few instances
            X_train, X_test, y_train, y_test = train_test_split(
                X_raw, y_raw, test_size=test_size, random_state=random_state
            )

        # Fit vectorizer
        X_train_vec = self.vectorizer.fit_transform(X_train)
        X_test_vec = self.vectorizer.transform(X_test)

        # Train model
        self.model.fit(X_train_vec, y_train)
        self.is_trained = True
        self.classes_ = list(self.model.classes_)

        # Predict on held-out test split
        y_pred = self.model.predict(X_test_vec)
        y_proba = self.model.predict_proba(X_test_vec)

        # Evaluation metrics
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
        Classifies a single input complaint text into a public service category.
        """
        if not self.is_trained:
            raise RuntimeError("Classifier model is not trained yet.")

        cleaned = clean_text(text)
        if not cleaned:
            return {
                "category": "Other Public Services",
                "confidence": 0.35,
                "probabilities": {cat: 1.0 / len(self.classes_) for cat in self.classes_},
                "key_keywords": []
            }

        vec = self.vectorizer.transform([cleaned])
        pred_label = self.model.predict(vec)[0]
        probas = self.model.predict_proba(vec)[0]

        prob_dict = {cls_name: round(float(p), 4) for cls_name, p in zip(self.classes_, probas)}
        confidence = float(np.max(probas))

        # Extract top matching vocabulary features
        feature_names = np.array(self.vectorizer.get_feature_names_out())
        row_indices = vec.indices
        row_data = vec.data
        if len(row_indices) > 0:
            top_kw_idx = np.argsort(row_data)[::-1][:6]
            key_keywords = feature_names[row_indices[top_kw_idx]].tolist()
        else:
            key_keywords = cleaned.split()[:4]

        return {
            "category": str(pred_label),
            "confidence": round(confidence, 4),
            "probabilities": prob_dict,
            "key_keywords": key_keywords,
            "cleaned_text": cleaned
        }
