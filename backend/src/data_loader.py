"""
CivicSense - Data Loader Module
Handles loading, robust schema validation, and serialization of grievance datasets (CSV/DataFrame).
"""

import os
from typing import Optional, Tuple, Dict, Any, List
import pandas as pd
from .preprocessing import inspect_dataframe_quality

DEFAULT_CSV_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data", "demo_grievances.csv")

REQUIRED_COLUMNS = ["complaint_text"]
RECOMMENDED_COLUMNS = ["id", "complaint_text", "category", "sentiment", "date", "ward_or_region", "department", "status", "urgency"]

VALID_CATEGORIES = {
    "Roads", "Water Supply", "Electricity", "Healthcare",
    "Education", "Transportation", "Drainage / Sewage", "Other Public Services"
}
VALID_SENTIMENTS = {"Positive", "Negative", "Neutral"}


class DataLoader:
    def __init__(self, csv_path: Optional[str] = None):
        self.csv_path = csv_path or DEFAULT_CSV_PATH
        self.df: Optional[pd.DataFrame] = None
        self.load_dataset()

    def load_dataset(self, file_path: Optional[str] = None) -> pd.DataFrame:
        target_path = file_path or self.csv_path
        if not os.path.exists(target_path):
            raise FileNotFoundError(f"Grievance dataset not found at: {target_path}")

        df = pd.read_csv(target_path)
        self.df = df
        return df

    def validate_schema(self, df: pd.DataFrame) -> Tuple[bool, List[str], List[str]]:
        """
        Validates uploaded dataframe:
        Returns: (is_valid, errors, warnings)
        """
        errors: List[str] = []
        warnings: List[str] = []

        if df is None or df.empty:
            return False, ["Dataset is empty. At least 5 grievance records are required."], []

        if len(df) < 5:
            return False, [f"Dataset has only {len(df)} records. A minimum of 5 records is required for machine learning."], []

        # Standardize column headers by stripping whitespace
        df.columns = [str(c).strip() for c in df.columns]

        # Check required columns
        missing_required = [col for col in REQUIRED_COLUMNS if col not in df.columns]
        if missing_required:
            errors.append(f"Missing required column: {', '.join(missing_required)}")

        # Check if complaint_text has usable values
        if "complaint_text" in df.columns:
            non_empty_texts = df["complaint_text"].dropna().astype(str).str.strip()
            valid_text_count = (non_empty_texts.str.len() > 3).sum()
            if valid_text_count == 0:
                errors.append("Column 'complaint_text' contains no valid textual content.")
            elif valid_text_count < 5:
                errors.append(f"Only {valid_text_count} valid complaint texts found. Minimum 5 required.")

        # Check recommended columns and add helpful warnings
        missing_rec = [col for col in RECOMMENDED_COLUMNS if col not in df.columns]
        if missing_rec:
            warnings.append(f"Optional recommended columns missing: {', '.join(missing_rec)}. Defaults will be imputed.")

        # Inspect label consistency if category is present
        if "category" in df.columns:
            cats = set(df["category"].dropna().astype(str).str.strip().unique())
            unknown_cats = cats - VALID_CATEGORIES
            if unknown_cats:
                warnings.append(f"Non-standard category values detected ({len(unknown_cats)} distinct): {list(unknown_cats)[:4]}. They will be grouped under 'Other Public Services'.")

        # Inspect sentiment consistency if present
        if "sentiment" in df.columns:
            sents = set(df["sentiment"].dropna().astype(str).str.strip().unique())
            unknown_sents = sents - VALID_SENTIMENTS
            if unknown_sents:
                warnings.append(f"Non-standard sentiment values ({list(unknown_sents)[:3]}). They will be mapped to 'Neutral'.")

        is_valid = len(errors) == 0
        return is_valid, errors, warnings

    def get_summary(self) -> Dict[str, Any]:
        if self.df is None:
            self.load_dataset()
        quality = inspect_dataframe_quality(self.df)
        return {
            "file_path": self.csv_path,
            "quality": quality,
            "sample_records": self.df.head(5).to_dict(orient="records")
        }

    def reset_to_demo(self) -> pd.DataFrame:
        self.csv_path = DEFAULT_CSV_PATH
        return self.load_dataset(DEFAULT_CSV_PATH)
