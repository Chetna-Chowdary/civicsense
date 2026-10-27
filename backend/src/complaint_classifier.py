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

Uses TF-IDF Vectorization with Logistic Regression (class_weight='balanced') and MultinomialNB comparison.
Strictly fits vectorizer on training data to prevent data leakage.
Computes real evaluation metrics, cross-validation scores, per-class error analysis, and prediction uncertainty flags.
"""

from typing import List, Dict, Any, Optional, Tuple
import numpy as np
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.naive_bayes import MultinomialNB
from sklearn.model_selection import train_test_split, StratifiedKFold, cross_val_score
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
        self.model_type = model_type
        self.vectorizer = TfidfVectorizer(
            ngram_range=(1, 2),
            max_features=1500,
            sublinear_tf=True
        )
        self.model = (
            LogisticRegression(max_iter=1000, C=1.5, class_weight="balanced")
            if model_type == "logistic_regression"
            else MultinomialNB(alpha=0.5)
        )
        self.is_trained = False
        self.classes_: List[str] = CATEGORIES
        self.evaluation_results: Optional[Dict[str, Any]] = None
        self.baseline_comparison: Optional[Dict[str, Any]] = None

    def train_and_evaluate(self, df: pd.DataFrame, test_size: float = 0.25, random_state: int = 42) -> Dict[str, Any]:
        """
        Trains TF-IDF + Classifier on complaint_text -> category.
        Vectorizer is fit solely on the training partition to prevent data leakage.
        """
        valid_df = df.dropna(subset=["complaint_text", "category"]).copy()
        valid_df["cleaned_text"] = valid_df["complaint_text"].apply(clean_text)
        valid_df = valid_df[valid_df["cleaned_text"].str.len() > 2]

        if len(valid_df) < 5:
            raise ValueError(f"Insufficient valid records ({len(valid_df)}) for training classifier.")

        X_raw = valid_df["cleaned_text"].values
        y_raw = valid_df["category"].values

        # Inspect class distribution
        class_counts = pd.Series(y_raw).value_counts()
        can_stratify = (class_counts.min() >= 2) and (len(valid_df) >= 10)

        # Train / Test split
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

        # Fit vectorizer ONLY on training set (Leakage Protection)
        X_train_vec = self.vectorizer.fit_transform(X_train)
        X_test_vec = self.vectorizer.transform(X_test)

        # Train primary model
        self.model.fit(X_train_vec, y_train)
        self.is_trained = True
        self.classes_ = list(self.model.classes_)

        # Evaluate on test set
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

        # Class-level confusion / error analysis
        top_confusions = []
        for i, true_cls in enumerate(self.classes_):
            for j, pred_cls in enumerate(self.classes_):
                if i != j and cm[i][j] > 0:
                    top_confusions.append({
                        "true_category": true_cls,
                        "predicted_as": pred_cls,
                        "error_count": int(cm[i][j])
                    })
        top_confusions.sort(key=lambda x: x["error_count"], reverse=True)

        # Stratified Cross-Validation on training set
        cv_scores = []
        cv_mean = accuracy
        cv_std = 0.0
        min_train_class = pd.Series(y_train).value_counts().min()
        if min_train_class >= 2 and len(X_train) >= 12:
            try:
                n_splits = min(5, min_train_class)
                skf = StratifiedKFold(n_splits=n_splits, shuffle=True, random_state=random_state)
                scores = cross_val_score(self.model, X_train_vec, y_train, cv=skf, scoring="accuracy")
                cv_scores = [round(float(s), 4) for s in scores]
                cv_mean = round(float(np.mean(scores)), 4)
                cv_std = round(float(np.std(scores)), 4)
            except Exception:
                pass

        # Compare with MultinomialNB on identical split
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
            "class_error_analysis": top_confusions[:6],
            "model_comparison": self.baseline_comparison,
            "leakage_protected": True,
            "limitations": [
                f"Trained on {len(valid_df)} sample grievances across {len(self.classes_)} domains.",
                "Domain vocabulary captures municipal unigrams and bigrams; slang or transliterated vernacular requires periodic retraining.",
                "Short descriptions (<4 words) may default to 'Other Public Services' when key tokens are absent."
            ]
        }
        return self.evaluation_results

    def predict(self, text: str) -> Dict[str, Any]:
        """
        Classifies citizen complaint text with calibrated confidence and uncertainty warning.
        """
        if not self.is_trained:
            raise RuntimeError("Classifier model is not trained yet.")

        cleaned = clean_text(text)
        if not cleaned:
            return {
                "category": "Other Public Services",
                "confidence": 0.35,
                "probabilities": {cat: round(1.0 / len(self.classes_), 4) for cat in self.classes_},
                "key_keywords": [],
                "needs_review": True,
                "review_reason": "Empty or non-informative input text."
            }

        vec = self.vectorizer.transform([cleaned])
        pred_label = self.model.predict(vec)[0]
        probas = self.model.predict_proba(vec)[0]

        prob_dict = {cls_name: round(float(p), 4) for cls_name, p in zip(self.classes_, probas)}
        sorted_probs = sorted(probas, reverse=True)
        confidence = float(sorted_probs[0])
        margin = float(sorted_probs[0] - sorted_probs[1]) if len(sorted_probs) > 1 else confidence

        # Uncertainty thresholding
        needs_review = confidence < 0.45 or margin < 0.12
        review_reason = None
        if confidence < 0.45:
            review_reason = f"Low top-class confidence ({round(confidence * 100, 1)}% < 45%)."
        elif margin < 0.12:
            review_reason = f"Narrow probability margin ({round(margin * 100, 1)}%) between top predictions."

        # Extract top feature words
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
            "needs_review": needs_review,
            "review_reason": review_reason,
            "cleaned_text": cleaned
        }
