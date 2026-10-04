from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import os

from agent import run_debate


app = FastAPI(
    title="Multi-Agent Debate API",
    description="API for the Multi-Agent Debate System",
    version="1.0.0"
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class DebateRequest(BaseModel):

    topic: str = Field(
        ...,
        min_length=3,
        description="Topic for the debate"
    )

    rounds: int = Field(
        default=2,
        ge=1,
        le=4,
        description="Number of debate rounds"
    )


@app.get("/api/")
def home():

    return {
        "message": "Multi-Agent Debate API is running",
        "status": "success"
    }


@app.get("/api/health")
def health_check():

    return {
        "status": "healthy",
        "groq_api_key_configured": bool(
            os.environ.get("GROQ_API_KEY")
        )
    }


@app.post("/api/debate")
def create_debate(request: DebateRequest):

    if not os.environ.get("GROQ_API_KEY"):

        raise HTTPException(
            status_code=500,
            detail="GROQ_API_KEY is not configured."
        )

    try:

        result = run_debate(
            topic=request.topic,
            rounds=request.rounds
        )

        return {
            "success": True,
            "data": result
        }

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=f"Debate generation failed: {str(e)}"
        )
