"""
CivicSense - Data Loader Module
Handles loading, validation, and serialization of grievance datasets (CSV/DataFrame).
"""

import os
from typing import Optional, Tuple, Dict, Any
import pandas as pd
from .preprocessing import inspect_dataframe_quality

DEFAULT_CSV_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data", "demo_grievances.csv")

REQUIRED_COLUMNS = ["complaint_text"]
RECOMMENDED_COLUMNS = ["id", "complaint_text", "category", "sentiment", "date", "ward_or_region", "department", "status"]


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

    def validate_schema(self, df: pd.DataFrame) -> Tuple[bool, list[str]]:
        missing_required = [col for col in REQUIRED_COLUMNS if col not in df.columns]
        if missing_required:
            return False, [f"Missing required column: {col}" for col in missing_required]
        return True, []

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
