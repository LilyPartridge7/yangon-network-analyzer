"""
Transparent Dijkstra Shortest Path Routing and Linear Algebra Decomposition.
Demonstrates:
1. Shortest path finding on weighted directed graphs.
2. Algebraic telescoping sum: Sum of incidence rows along path cancels intermediate stops!
   row_1 + row_2 + ... + row_k = -e_source + e_target
"""

import heapq
from typing import Dict, List, Tuple, Any, Optional
import numpy as np


def dijkstra_shortest_path(
    stops: List[Dict[str, Any]],
    edges: List[Dict[str, Any]],
    origin_id: str,
    destination_id: str,
    criterion: str = "time"  # 'time', 'distance', or 'stops'
) -> Dict[str, Any]:
    """
    Direct, transparent implementation of Dijkstra's algorithm.
    Does not use external black-box libraries.
    """
    stop_ids = {s["id"] for s in stops}
    if origin_id not in stop_ids or destination_id not in stop_ids:
        return {
            "found": False,
            "error": f"Invalid origin '{origin_id}' or destination '{destination_id}'."
        }
        
    if origin_id == destination_id:
        return {
            "found": True,
            "origin": origin_id,
            "destination": destination_id,
            "stops": [origin_id],
            "edges": [],
            "total_distance_km": 0.0,
            "total_travel_time_min": 0.0,
            "edge_count": 0,
            "steps": [],
            "algebraic_explanation": "Origin is identical to destination; path is the zero-length trivial path."
        }
        
    # Build adjacency list: adj[u] = [(v, weight, edge_dict)]
    adj: Dict[str, List[Tuple[str, float, Dict[str, Any]]]] = {sid: [] for sid in stop_ids}
    for edge in edges:
        u = edge["source"]
        v = edge["target"]
        if u in stop_ids and v in stop_ids:
            if criterion == "time":
                weight = float(edge.get("travel_time_min", 1.0))
            elif criterion == "distance":
                weight = float(edge.get("distance_km", 1.0))
            else:  # 'stops'
                weight = 1.0
                
            adj[u].append((v, weight, edge))
            if edge.get("bidirectional", False):
                adj[v].append((u, weight, edge))
                
    # Priority Queue for Dijkstra: (current_cost, current_node)
    pq: List[Tuple[float, str]] = [(0.0, origin_id)]
    costs: Dict[str, float] = {origin_id: 0.0}
    previous_node: Dict[str, Optional[str]] = {origin_id: None}
    previous_edge: Dict[str, Optional[Dict[str, Any]]] = {origin_id: None}
    
    execution_steps: List[Dict[str, Any]] = []
    
    while pq:
        current_cost, u = heapq.heappop(pq)
        
        if current_cost > costs.get(u, float('inf')):
            continue
            
        if u == destination_id:
            break
            
        for v, weight, edge in adj.get(u, []):
            new_cost = current_cost + weight
            if new_cost < costs.get(v, float('inf')):
                costs[v] = new_cost
                previous_node[v] = u
                previous_edge[v] = edge
                heapq.heappush(pq, (new_cost, v))
                execution_steps.append({
                    "from_node": u,
                    "to_node": v,
                    "edge_id": edge["id"],
                    "relaxed_weight": weight,
                    "new_cumulative_cost": round(new_cost, 2)
                })
                
    if destination_id not in costs:
        return {
            "found": False,
            "origin": origin_id,
            "destination": destination_id,
            "error": f"No accessible bus route between {origin_id} and {destination_id} in the current network."
        }
        
    # Reconstruct path
    path_stops = []
    path_edges = []
    curr = destination_id
    while curr is not None:
        path_stops.append(curr)
        edge = previous_edge.get(curr)
        if edge is not None:
            path_edges.append(edge)
        curr = previous_node.get(curr)
        
    path_stops.reverse()
    path_edges.reverse()
    
    total_dist = sum(float(e.get("distance_km", 0.0)) for e in path_edges)
    total_time = sum(float(e.get("travel_time_min", 0.0)) for e in path_edges)
    
    return {
        "found": True,
        "origin": origin_id,
        "destination": destination_id,
        "criterion": criterion,
        "stops": path_stops,
        "edges": [e["id"] for e in path_edges],
        "edge_details": path_edges,
        "total_distance_km": round(total_dist, 2),
        "total_travel_time_min": round(total_time, 2),
        "edge_count": len(path_edges),
        "dijkstra_steps": execution_steps[:20]  # First 20 relaxation steps for transparency
    }
