# FastAPI-based API for Film Finance Data (JSON Charts)

from fastapi import FastAPI, HTTPException, Header, HTTPException, Depends
from pydantic import BaseModel
from typing import Dict, List, Union
from film_finance_model import FilmFinanceModel  # assume your main logic is moved into this module
from fastapi.middleware.cors import CORSMiddleware
import logging
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from fastapi.requests import Request
import os
from typing import Optional
from dotenv import load_dotenv
load_dotenv()


API_KEY = os.getenv("API_KEY")

if not API_KEY:
    raise RuntimeError("Missing required environment variable: API_KEY")

def verify_api_key(x_api_key: Optional[str] = Header(None)):
    if x_api_key is None:
        raise HTTPException(status_code=401, detail="Missing API Key")
    if x_api_key != API_KEY:
        raise HTTPException(status_code=403, detail="Invalid API Key")

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # or ["*"] for all origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ReportRequest(BaseModel):
    title: str
    budget: Dict[str, float]
    financing: Dict[str, float]
    base_case_revenue: Dict[str, float]
    scenario_multipliers: Dict[str, float]
    waterfall_terms: Dict[str, Union[float, int]]
    timeline: Dict[str, Union[int, List[float]]]

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    logger.warning("422 Validation error on request to %s", request.url)
    logger.warning("Request body (invalid): %s", await request.body())
    logger.warning("Validation errors: %s", exc.errors())
    return JSONResponse(
        status_code=422,
        content={"detail": exc.errors()}
    )

@app.post("/models")
def generate_chart_data(req: ReportRequest, auth=Depends(verify_api_key)):
    try:
        model = FilmFinanceModel(req.title, {
            "budget": req.budget,
            "financing": req.financing,
            "base_case_revenue": req.base_case_revenue,
            "scenario_multipliers": req.scenario_multipliers,
            "waterfall_terms": req.waterfall_terms,
            "timeline": req.timeline
        })
        model.run_full_analysis()

        scenario_names = list(model.results.keys())
        scenario_keys = [name.lower().replace(" ", "_") for name in scenario_names]

        roi_percent = [round(model.results[s]['roi'] * 100, 2) for s in scenario_names]
        irr_percent = [round(model.results[s]['irr'] * 100, 2) if model.results[s]['irr'] >= 0 else None for s in scenario_names]

        roi_series = [
            {"scenario": k, "label": n, "roi": r}
            for k, n, r in zip(scenario_keys, scenario_names, roi_percent)
        ]
        irr_series = [
            {"scenario": k, "label": n, "irr": i}
            for k, n, i in zip(scenario_keys, scenario_names, irr_percent)
        ]

        cash_flow_df = model.base_case_cash_flow_df
        years = cash_flow_df.index.tolist()
        annual = cash_flow_df['Net Cash Flow to Equity'].round().astype(int).tolist()
        cumulative = cash_flow_df['Cumulative Cash Flow'].round().astype(int).tolist()

        return {
            "scenarios": scenario_keys,
            "scenario_labels": dict(zip(scenario_keys, scenario_names)),
            "roi_percent": roi_percent,
            "irr_percent": irr_percent,
            "roi_series": roi_series,
            "irr_series": irr_series,
            "breakeven_receipts": round(model.breakeven_receipts),
            "cash_flows": {
                "years": years,
                "annual": annual,
                "cumulative": cumulative
            }
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate chart data: {str(e)}")
