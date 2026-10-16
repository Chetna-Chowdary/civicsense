"""
CivicSense - Trend Analysis Module
Analyzes temporal grievance patterns:
- Daily, weekly, and monthly complaint volume
- Category distribution over time
- Sentiment shifts and polarity trajectories
- Recurring keywords and n-gram issues
"""

from typing import Dict, Any, List
from collections import Counter
import pandas as pd
from .preprocessing import clean_text


class TrendAnalyzer:
    @staticmethod
    def analyze_trends(df: pd.DataFrame) -> Dict[str, Any]:
        """
        Computes time-series and distributional trends from the active dataframe.
        """
        work_df = df.copy()

        # Ensure date format
        if "date" in work_df.columns:
            work_df["parsed_date"] = pd.to_datetime(work_df["date"], errors="coerce")
            work_df = work_df.dropna(subset=["parsed_date"]).sort_values("parsed_date")
        else:
            work_df["parsed_date"] = pd.date_range(start="2026-08-01", periods=len(work_df), freq="D")

        # Daily trends
        daily_counts = work_df.groupby(work_df["parsed_date"].dt.strftime("%Y-%m-%d")).size()
        daily_trends = [{"date": d, "count": int(c)} for d, c in daily_counts.items()]

        # Weekly trends
        weekly_counts = work_df.groupby(work_df["parsed_date"].dt.to_period("W").dt.start_time.dt.strftime("%Y-%m-%d")).size()
        weekly_trends = [{"week_start": w, "count": int(c)} for w, c in weekly_counts.items()]

        # Monthly trends
        monthly_counts = work_df.groupby(work_df["parsed_date"].dt.strftime("%Y-%m")).size()
        monthly_trends = [{"month": m, "count": int(c)} for m, c in monthly_counts.items()]

        # Category Breakdown
        category_counts = work_df["category"].value_counts().to_dict() if "category" in work_df.columns else {}
        category_breakdown = [{"category": k, "count": int(v)} for k, v in category_counts.items()]

        # Sentiment Breakdown
        sentiment_counts = work_df["sentiment"].value_counts().to_dict() if "sentiment" in work_df.columns else {}
        sentiment_breakdown = [{"sentiment": k, "count": int(v)} for k, v in sentiment_counts.items()]

        # Cross Tabulation: Category vs Sentiment
        if "category" in work_df.columns and "sentiment" in work_df.columns:
            cross_tab = pd.crosstab(work_df["category"], work_df["sentiment"]).to_dict(orient="index")
        else:
            cross_tab = {}

        # Category trends over time (by month or week)
        time_category_piv = pd.crosstab(
            work_df["parsed_date"].dt.strftime("%Y-%m-%d"),
            work_df["category"]
        ).reset_index().to_dict(orient="records")

        # Top frequently reported issue keywords (unigrams and bigrams)
        all_cleaned_tokens: List[str] = []
        bigrams: List[str] = []
        if "complaint_text" in work_df.columns:
            for text in work_df["complaint_text"].dropna():
                tokens = clean_text(str(text)).split()
                all_cleaned_tokens.extend(tokens)
                for i in range(len(tokens) - 1):
                    bigrams.append(f"{tokens[i]} {tokens[i+1]}")

        top_unigrams = [{"term": term, "count": count} for term, count in Counter(all_cleaned_tokens).most_common(15)]
        top_bigrams = [{"term": term, "count": count} for term, count in Counter(bigrams).most_common(12)]

        return {
            "total_records": len(work_df),
            "date_range": {
                "start": str(work_df["parsed_date"].min().date()) if not work_df.empty else None,
                "end": str(work_df["parsed_date"].max().date()) if not work_df.empty else None
            },
            "daily_trends": daily_trends,
            "weekly_trends": weekly_trends,
            "monthly_trends": monthly_trends,
            "category_breakdown": category_breakdown,
            "sentiment_breakdown": sentiment_breakdown,
            "category_sentiment_cross": cross_tab,
            "timeline_categories": time_category_piv,
            "frequent_keywords": top_unigrams,
            "frequent_phrases": top_bigrams
        }
