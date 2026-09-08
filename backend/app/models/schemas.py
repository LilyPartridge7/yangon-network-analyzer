"""
Pydantic schemas for request validation and response serialization.
"""

from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field


class StopModel(BaseModel):
    id: str
    name: str
    name_my: Optional[str] = None
    latitude: float
    longitude: float
    area: str
    demand_rate: float


class EdgeModel(BaseModel):
    id: str
    source: str
    target: str
    distance_km: float
    travel_time_min: float
    capacity: float
    route_name: str
    bidirectional: bool = True


class RouteLineModel(BaseModel):
    id: str
    name: str
    description: str
    color: str
    start_stop: str
    end_stop: str


class NetworkStatsModel(BaseModel):
    num_nodes: int
    num_edges: int
    rank: int
    num_connected_components: int
    is_connected: bool
    nullity_A: int
    nullity_At_cycle_space: int
    avg_travel_time_min: float
    total_network_length_km: float


class RouteRequest(BaseModel):
    origin: str
    destination: str
    criterion: str = Field(default="time", description="'time', 'distance', or 'stops'")


class FlowAnalyzeRequest(BaseModel):
    flows: Dict[str, float] = Field(
        default_factory=dict,
        description="Map of edge_id -> passenger flow (passengers/hr)"
    )


class SourceSinkExperimentRequest(BaseModel):
    source_id: str
    target_id: str
    demand: float = 500.0


class DisruptionRequest(BaseModel):
    disabled_stop_ids: List[str] = Field(default_factory=list)
    disabled_edge_ids: List[str] = Field(default_factory=list)
