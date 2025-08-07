from fastapi import APIRouter, Query
from pydantic import BaseModel
from sentence_transformers import SentenceTransformer
import faiss
import joblib
import numpy as np
import pandas as pd

# Load at startup
model = SentenceTransformer("all-MiniLM-L6-v2")
faiss_index = faiss.read_index("faiss_text_only.idx")
metadata = joblib.load("metadata.pkl")

router = APIRouter()

class SearchRequest(BaseModel):
    query: str
    top_n: int = 10

@router.post("/search")
def search_movies(req: SearchRequest):
    query_vec = model.encode([req.query], convert_to_numpy=True).astype(np.float32)
    distances, indices = faiss_index.search(query_vec, req.top_n)

    top_df = metadata.iloc[indices[0]].copy()

    # Revenue stats
    revs = top_df["revenue"].dropna()
    stats = {
        "min": round(revs.min() / 1e6, 2),
        "max": round(revs.max() / 1e6, 2),
        "mean": round(revs.mean() / 1e6, 2),
        "median": round(revs.median() / 1e6, 2),
    }

    # Return matches
    results = top_df[["title", "overview", "cast", "director", "revenue"]].to_dict(orient="records")

    return {
        "query": req.query,
        "top_results": results,
        "revenue_millions": stats
    }