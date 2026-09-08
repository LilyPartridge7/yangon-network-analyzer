"""
Connectivity, Rank, and Subspace dimensions based on Strang Section 10.1.

Fundamental Subspace Theorem for Graphs:
- Rank r = n - c, where c is number of connected components.
- Nullspace N(A) has dimension c (constant potentials on components).
- Left nullspace N(A^T) has dimension m - r = m - n + c (cycle space / circulations).
"""

from typing import Dict, List, Set, Any
import numpy as np


def compute_connected_components(
    stops: List[Dict[str, Any]],
    edges: List[Dict[str, Any]]
) -> List[List[str]]:
    """
    Computes connected components of the network using undirected connectivity.
    """
    adj: Dict[str, Set[str]] = {stop["id"]: set() for stop in stops}
    for edge in edges:
        u = edge["source"]
        v = edge["target"]
        if u in adj and v in adj:
            adj[u].add(v)
            adj[v].add(u)
            
    visited: Set[str] = set()
    components: List[List[str]] = []
    
    for stop in stops:
        sid = stop["id"]
        if sid not in visited:
            component = []
            queue = [sid]
            visited.add(sid)
            while queue:
                curr = queue.pop(0)
                component.append(curr)
                for neighbor in adj.get(curr, set()):
                    if neighbor not in visited:
                        visited.add(neighbor)
                        queue.append(neighbor)
            components.append(component)
            
    return components


def analyze_connectivity_and_rank(
    A: np.ndarray,
    stops: List[Dict[str, Any]],
    edges: List[Dict[str, Any]]
) -> Dict[str, Any]:
    """
    Computes matrix dimensions, rank, nullity, and explains their linear algebra
    and transportation significance.
    """
    m, n = A.shape if A.size > 0 else (0, 0)
    
    if A.size > 0:
        rank = int(np.linalg.matrix_rank(A))
    else:
        rank = 0
        
    components = compute_connected_components(stops, edges)
    num_components = len(components)
    
    # Fundamental subspace dimensions
    nullity_A = n - rank  # Dimension of potential nullspace N(A)
    nullity_At = m - rank  # Dimension of left nullspace N(A^T), i.e., cycle space
    
    is_connected = (num_components == 1) if n > 0 else False
    expected_rank = (n - num_components) if n >= num_components else 0
    
    # Identify isolated stops (degree 0)
    connected_stop_ids = set()
    for edge in edges:
        connected_stop_ids.add(edge["source"])
        connected_stop_ids.add(edge["target"])
    isolated_stops = [stop["id"] for stop in stops if stop["id"] not in connected_stop_ids]
    
    # Plain English transportation explanations
    explanation = (
        f"The network has n={n} stops and m={m} direct transit connections. "
        f"The incidence matrix A has rank={rank}. "
        f"Because there are {num_components} connected component(s), rank(A) = n - c = {n} - {num_components} = {expected_rank}. "
    )
    if is_connected:
        explanation += (
            "The network is fully connected. The rank n - 1 = "
            f"{n - 1} indicates that exactly {n - 1} edges form a spanning tree connecting all stops. "
            f"The remaining {nullity_At} edges close independent loops/cycles (dimension of N(A^T))."
        )
    else:
        explanation += (
            f"Warning: The network is disconnected into {num_components} separate regions. "
            f"Passengers cannot travel between distinct components without external connections."
        )

    return {
        "num_nodes": n,
        "num_edges": m,
        "rank": rank,
        "num_connected_components": num_components,
        "components": components,
        "is_connected": is_connected,
        "nullity_A": nullity_A,
        "nullity_At_cycle_space": nullity_At,
        "isolated_stops": isolated_stops,
        "strang_identity_satisfied": bool(rank == expected_rank),
        "explanation": explanation
    }
