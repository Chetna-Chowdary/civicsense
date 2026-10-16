"""
CivicSense - Preprocessing Module
Data Science Course Project (24AD3107) - KLH CSE Bowrampet
Text cleaning, normalization, tokenization, and stopword removal.
"""

import re
import string
from typing import List, Dict, Any
import pandas as pd

# Comprehensive standard English stopwords list suitable for standalone NLP without heavy NLTK downloads
STOPWORDS = {
    "a", "about", "above", "after", "again", "against", "all", "am", "an", "and", "any", "are",
    "aren't", "as", "at", "be", "because", "been", "before", "being", "below", "between", "both",
    "but", "by", "can't", "cannot", "could", "couldn't", "did", "didn't", "do", "does", "doesn't",
    "doing", "don't", "down", "during", "each", "few", "for", "from", "further", "had", "hadn't",
    "has", "hasn't", "have", "haven't", "having", "he", "he'd", "he'll", "he's", "her", "here",
    "here's", "hers", "herself", "him", "himself", "his", "how", "how's", "i", "i'd", "i'll", "i'm",
    "i've", "if", "in", "into", "is", "isn't", "it", "it's", "its", "itself", "let's", "me", "more",
    "most", "mustn't", "my", "myself", "no", "nor", "not", "of", "off", "on", "once", "only", "or",
    "other", "ought", "our", "ours", "ourselves", "out", "over", "own", "same", "shan't", "she",
    "she'd", "she'll", "she's", "should", "shouldn't", "so", "some", "such", "than", "that", "that's",
    "the", "their", "theirs", "them", "themselves", "then", "there", "there's", "these", "they",
    "they'd", "they'll", "they're", "they've", "this", "those", "through", "to", "too", "under",
    "until", "up", "very", "was", "wasn't", "we", "we'd", "we'll", "we're", "we've", "were", "weren't",
    "what", "what's", "when", "when's", "where", "where's", "which", "while", "who", "who's", "whom",
    "why", "why's", "with", "won't", "would", "wouldn't", "you", "you'd", "you'll", "you're", "you've",
    "your", "yours", "yourself", "yourselves"
}


def clean_text(text: str, remove_stopwords: bool = True) -> str:
    """
    Cleans raw citizen grievance text:
    1. Converts text to lowercase
    2. Strips URL hyperlinks and email references
    3. Removes non-alphanumeric punctuation and special characters
    4. Handles multiple spaces and trailing whitespace
    5. Optionally removes common English stopwords
    """
    if not isinstance(text, str) or not text.strip():
        return ""

    # Convert to lowercase
    text = text.lower()

    # Remove URLs and emails
    text = re.sub(r"https?://\S+|www\.\S+", "", text)
    text = re.sub(r"\S+@\S+", "", text)

    # Remove punctuation
    translator = str.maketrans("", "", string.punctuation + "“”‘’…•–—")
    text = text.translate(translator)

    # Remove isolated digits while keeping meaningful words
    text = re.sub(r"\b\d+\b", "", text)

    # Tokenize and remove extra whitespace
    tokens = text.split()

    if remove_stopwords:
        tokens = [word for word in tokens if word not in STOPWORDS and len(word) > 2]

    return " ".join(tokens)


def inspect_dataframe_quality(df: pd.DataFrame) -> Dict[str, Any]:
    """
    Inspects missing values, duplicates, and column metrics of a grievance dataframe.
    """
    total_rows = len(df)
    total_columns = len(df.columns)
    missing_by_column = df.isnull().sum().to_dict()
    total_missing_cells = int(df.isnull().sum().sum())
    duplicate_count = int(df.duplicated().sum())

    column_types = {col: str(df[col].dtype) for col in df.columns}

    return {
        "total_rows": total_rows,
        "total_columns": total_columns,
        "columns": list(df.columns),
        "column_types": column_types,
        "missing_by_column": {k: int(v) for k, v in missing_by_column.items()},
        "total_missing_cells": total_missing_cells,
        "duplicate_count": duplicate_count,
        "clean_ready": (total_missing_cells == 0 and duplicate_count == 0)
    }


def clean_dataframe(df: pd.DataFrame) -> pd.DataFrame:
    """
    Executes automated data cleaning:
    - Drops duplicate rows
    - Fills or drops missing critical text values
    - Trims whitespace across string columns
    - Standardizes date formatting to YYYY-MM-DD
    """
    df_cleaned = df.copy()

    # Drop duplicates
    df_cleaned = df_cleaned.drop_duplicates()

    # Fill missing values
    if "complaint_text" in df_cleaned.columns:
        df_cleaned = df_cleaned.dropna(subset=["complaint_text"])
        df_cleaned["complaint_text"] = df_cleaned["complaint_text"].astype(str).str.strip()

    if "category" in df_cleaned.columns:
        df_cleaned["category"] = df_cleaned["category"].fillna("Other Public Services").str.strip()

    if "sentiment" in df_cleaned.columns:
        df_cleaned["sentiment"] = df_cleaned["sentiment"].fillna("Neutral").str.strip()

    if "date" in df_cleaned.columns:
        try:
            df_cleaned["date"] = pd.to_datetime(df_cleaned["date"], errors="coerce").dt.strftime("%Y-%m-%d")
            df_cleaned["date"] = df_cleaned["date"].fillna("2026-08-01")
        except Exception:
            pass

    return df_cleaned
