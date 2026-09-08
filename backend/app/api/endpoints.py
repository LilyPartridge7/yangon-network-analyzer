"""
FastAPI REST Endpoints for Yangon Bus Transportation Network Analyzer.
"""

from typing import Dict, List, Any, Optional
from fastapi import APIRouter, HTTPException, Query

from app.models.schemas import (
    RouteRequest,
    FlowAnalyzeRequest,
    SourceSinkExperimentRequest,
    DisruptionRequest
)
from app.services.network_service import NetworkService

router = APIRouter()
network_service = NetworkService()


@router.get("/network")
def get_entire_network():
    """Returns all stops, edges, and route line definitions."""
    stops, edges = network_service.get_active_elements()
    return {
        "dataset_disclaimer": "Educational Sample Yangon Network: Stops feature realistic Yangon coordinates, but connections, travel times, and passenger flows are simulated for educational linear algebra demonstrations.",
        "stops": stops,
        "edges": edges,
        "routes": network_service.base_routes
    }


@router.get("/stops")
def get_stops():
    """Returns list of active stops."""
    stops, _ = network_service.get_active_elements()
    return stops


@router.get("/edges")
def get_edges():
    """Returns list of active edges."""
    _, edges = network_service.get_active_elements()
    return edges


@router.get("/network/stats")
def get_network_stats():
    """Returns rank, dimensions, components, and connectivity analysis."""
    return network_service.get_network_stats()


@router.get("/matrices/incidence")
def get_incidence_matrix():
    """Returns the m x n incidence matrix A with dimensions and rank."""
    return network_service.get_incidence_data()


@router.get("/matrices/adjacency")
def get_adjacency_matrices():
    """Returns binary and weighted adjacency matrices (distance, travel time)."""
    return network_service.get_adjacency_data()


@router.get("/matrices/laplacian")
def get_laplacian_matrix():
    """Returns degree matrix D, Graph Laplacian L = D - G, and verification of L = A^T A."""
    return network_service.get_laplacian_data()


@router.post("/route")
def compute_route(req: RouteRequest):
    """Computes shortest route using transparent Dijkstra algorithm and returns linear algebra route submatrix."""
    res = network_service.compute_route(req.origin, req.destination, req.criterion)
    if not res.get("found", False) and "error" in res:
        raise HTTPException(status_code=404, detail=res["error"])
    return res


@router.post("/flow/analyze")
def analyze_flow(req: FlowAnalyzeRequest):
    """Computes net node inflows b = A^T y and assesses flow conservation."""
    return network_service.analyze_passenger_flows(req.flows)


@router.post("/flow/source-sink")
def analyze_source_sink(req: SourceSinkExperimentRequest):
    """Demonstrates Kirchhoff's Current Law A^T y = b for an origin-destination demand experiment."""
    res = network_service.analyze_source_sink(req.source_id, req.target_id, req.demand)
    if not res.get("success", False):
        raise HTTPException(status_code=400, detail=res.get("error", "Failed to route flow"))
    return res


@router.get("/cycles/analyze")
def analyze_cycles():
    """Finds cycles and proves that cycle circulation vectors satisfy A^T y = 0 (left nullspace)."""
    return network_service.analyze_cycles()


@router.post("/disruption/analyze")
def analyze_disruption(req: DisruptionRequest):
    """Simulates bus stop or road closures and provides before/after linear algebra comparison."""
    return network_service.analyze_disruption(req.disabled_stop_ids, req.disabled_edge_ids)
