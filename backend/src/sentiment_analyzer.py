"""
CivicSense - Sentiment Analyzer Module
Determines citizen sentiment: Positive, Negative, or Neutral.
Trains on grievance corpus/sentiment labels using TF-IDF and Logistic Regression.
Strictly fits vectorizer on training split to eliminate data leakage.
Computes real evaluation metrics, cross-validation, baseline comparisons, and uncertainty review flags.
"""

from typing import List, Dict, Any, Optional
import numpy as np
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.naive_bayes import MultinomialNB
from sklearn.model_selection import train_test_split, StratifiedKFold, cross_val_score
from sklearn.metrics import accuracy_score, precision_recall_fscore_support, confusion_matrix, classification_report
from .preprocessing import clean_text

SENTIMENTS = ["Positive", "Negative", "Neutral"]


class SentimentAnalyzer:
    def __init__(self, model_type: str = "logistic_regression"):
        self.model_type = model_type
        self.vectorizer = TfidfVectorizer(
            ngram_range=(1, 2),
            max_features=1200,
            sublinear_tf=True
        )
        self.model = (
            LogisticRegression(max_iter=1000, C=1.5, class_weight="balanced")
            if model_type == "logistic_regression"
            else MultinomialNB(alpha=0.5)
        )
        self.is_trained = False
        self.classes_: List[str] = SENTIMENTS
        self.evaluation_results: Optional[Dict[str, Any]] = None
        self.baseline_comparison: Optional[Dict[str, Any]] = None

    def train_and_evaluate(self, df: pd.DataFrame, test_size: float = 0.25, random_state: int = 42) -> Dict[str, Any]:
        """
        Trains sentiment model and calculates test metrics on real held-out data.
        Vectorizer is fit solely on the training partition to prevent data leakage.
        """
        valid_df = df.dropna(subset=["complaint_text", "sentiment"]).copy()
        valid_df["cleaned_text"] = valid_df["complaint_text"].apply(clean_text)
        valid_df = valid_df[valid_df["cleaned_text"].str.len() > 2]

        if len(valid_df) < 5:
            raise ValueError(f"Insufficient valid records ({len(valid_df)}) for training sentiment analyzer.")

        X_raw = valid_df["cleaned_text"].values
        y_raw = valid_df["sentiment"].values

        class_counts = pd.Series(y_raw).value_counts()
        can_stratify = (class_counts.min() >= 2) and (len(valid_df) >= 10)

        if can_stratify:
            try:
                X_train, X_test, y_train, y_test = train_test_split(
                    X_raw, y_raw, test_size=test_size, random_state=random_state, stratify=y_raw
                )
            except Exception:
                X_train, X_test, y_train, y_test = train_test_split(
                    X_raw, y_raw, test_size=test_size, random_state=random_state
                )
        else:
            X_train, X_test, y_train, y_test = train_test_split(
                X_raw, y_raw, test_size=test_size, random_state=random_state
            )

        # Leakage protection: fit vectorizer strictly on train split
        X_train_vec = self.vectorizer.fit_transform(X_train)
        X_test_vec = self.vectorizer.transform(X_test)

        self.model.fit(X_train_vec, y_train)
        self.is_trained = True
        self.classes_ = list(self.model.classes_)

        y_pred = self.model.predict(X_test_vec)

        accuracy = float(accuracy_score(y_test, y_pred))
        precision_w, recall_w, f1_w, _ = precision_recall_fscore_support(
            y_test, y_pred, average="weighted", zero_division=0
        )
        precision_m, recall_m, f1_m, _ = precision_recall_fscore_support(
            y_test, y_pred, average="macro", zero_division=0
        )

        cm = confusion_matrix(y_test, y_pred, labels=self.classes_)
        report_dict = classification_report(
            y_test, y_pred, labels=self.classes_, output_dict=True, zero_division=0
        )

        # Cross validation on training split
        cv_scores = []
        cv_mean = accuracy
        cv_std = 0.0
        min_train_class = pd.Series(y_train).value_counts().min()
        if min_train_class >= 2 and len(X_train) >= 10:
            try:
                n_splits = min(5, min_train_class)
                skf = StratifiedKFold(n_splits=n_splits, shuffle=True, random_state=random_state)
                scores = cross_val_score(self.model, X_train_vec, y_train, cv=skf, scoring="accuracy")
                cv_scores = [round(float(s), 4) for s in scores]
                cv_mean = round(float(np.mean(scores)), 4)
                cv_std = round(float(np.std(scores)), 4)
            except Exception:
                pass

        # Comparison with Naive Bayes
        nb_model = MultinomialNB(alpha=0.5)
        nb_model.fit(X_train_vec, y_train)
        nb_pred = nb_model.predict(X_test_vec)
        nb_acc = float(accuracy_score(y_test, nb_pred))
        _, _, nb_f1, _ = precision_recall_fscore_support(y_test, nb_pred, average="weighted", zero_division=0)

        self.baseline_comparison = {
            "logistic_regression": {
                "accuracy": round(accuracy, 4),
                "f1_weighted": round(float(f1_w), 4)
            },
            "naive_bayes": {
                "accuracy": round(nb_acc, 4),
                "f1_weighted": round(float(nb_f1), 4)
            }
        }

        self.evaluation_results = {
            "model_type": self.model_type,
            "train_samples": len(X_train),
            "test_samples": len(X_test),
            "total_samples": len(valid_df),
            "classes": self.classes_,
            "accuracy": round(accuracy, 4),
            "precision_weighted": round(float(precision_w), 4),
            "recall_weighted": round(float(recall_w), 4),
            "f1_weighted": round(float(f1_w), 4),
            "precision_macro": round(float(precision_m), 4),
            "recall_macro": round(float(recall_m), 4),
            "f1_macro": round(float(f1_m), 4),
            "cross_validation": {
                "folds": len(cv_scores),
                "scores": cv_scores,
                "mean_accuracy": cv_mean,
                "std_accuracy": cv_std
            },
            "confusion_matrix": cm.tolist(),
            "classification_report": report_dict,
            "model_comparison": self.baseline_comparison,
            "leakage_protected": True,
            "limitations": [
                f"Sentiment evaluated over {len(valid_df)} citizen feedback records.",
                "Polarity model distinguishes gratitude ('Positive'), informational query ('Neutral'), and acute distress ('Negative').",
                "Ambivalent or sarcastic text may require manual human supervisor verification."
            ]
        }
        return self.evaluation_results

    def predict(self, text: str) -> Dict[str, Any]:
        """
        Predicts sentiment with calibrated confidence and uncertainty flag.
        """
        if not self.is_trained:
            raise RuntimeError("Sentiment analyzer is not trained yet.")

        cleaned = clean_text(text)
        if not cleaned:
            return {
                "sentiment": "Neutral",
                "confidence": 0.5,
                "probabilities": {s: round(1.0 / len(self.classes_), 4) for s in self.classes_},
                "tokens": [],
                "needs_review": True,
                "review_reason": "Empty or non-informative text."
            }

        vec = self.vectorizer.transform([cleaned])
        pred_label = self.model.predict(vec)[0]
        probas = self.model.predict_proba(vec)[0]

        prob_dict = {cls_name: round(float(p), 4) for cls_name, p in zip(self.classes_, probas)}
        sorted_probs = sorted(probas, reverse=True)
        confidence = float(sorted_probs[0])
        margin = float(sorted_probs[0] - sorted_probs[1]) if len(sorted_probs) > 1 else confidence

        needs_review = confidence < 0.50 or margin < 0.15
        review_reason = None
        if confidence < 0.50:
            review_reason = f"Low sentiment confidence ({round(confidence * 100, 1)}% < 50%)."
        elif margin < 0.15:
            review_reason = f"Narrow margin ({round(margin * 100, 1)}%) between sentiments."

        words = cleaned.split()
        return {
            "sentiment": str(pred_label),
            "confidence": round(confidence, 4),
            "probabilities": prob_dict,
            "tokens": words[:8],
            "needs_review": needs_review,
            "review_reason": review_reason,
            "cleaned_text": cleaned
        }
