"""
Yangon Bus Transportation Network Analyzer - Backend Application.
Based on Gilbert Strang's Introduction to Linear Algebra, Section 10.1: Graphs and Networks.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.endpoints import router as api_router

app = FastAPI(
    title="Yangon Bus Transportation Network Analyzer",
    description="Educational Linear Algebra & Network Flow Analyzer based on Gilbert Strang Section 10.1",
    version="1.0.0"
)

# Enable CORS for frontend development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api")


@app.get("/")
def root():
    return {
        "title": "Yangon Bus Transportation Network Analyzer API",
        "subtitle": "Graph, Incidence Matrix, and Network Flow Analysis",
        "reference": "Gilbert Strang, Introduction to Linear Algebra (5th Ed), Section 10.1",
        "docs_url": "/docs"
    }


@app.get("/health")
def health_check():
    return {"status": "healthy"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True)
