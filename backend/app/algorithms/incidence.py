"""
Incidence Matrix computation and analysis based on Gilbert Strang's
Introduction to Linear Algebra (5th Ed), Section 10.1: Graphs and Networks.

Convention:
For edge e_k = (u -> v):
A[k, u] = -1 (edge leaves node u)
A[k, v] = +1 (edge enters node v)
A[k, w] =  0 (w != u, v)
"""

from typing import Dict, List, Tuple, Any
import numpy as np


def build_incidence_matrix(
    stops: List[Dict[str, Any]],
    edges: List[Dict[str, Any]]
) -> Tuple[np.ndarray, List[str], List[str]]:
    """
    Builds the m x n incidence matrix A.
    
    Args:
        stops: List of stop dicts with 'id'
        edges: List of edge dicts with 'id', 'source', 'target'
        
    Returns:
        A: (m, n) NumPy ndarray of dtype float64
        row_labels: list of edge IDs
        col_labels: list of stop IDs
    """
    node_index = {stop["id"]: idx for idx, stop in enumerate(stops)}
    m = len(edges)
    n = len(stops)
    
    A = np.zeros((m, n), dtype=float)
    row_labels = [edge["id"] for edge in edges]
    col_labels = [stop["id"] for stop in stops]
    
    for k, edge in enumerate(edges):
        u = edge["source"]
        v = edge["target"]
        if u in node_index and v in node_index:
            u_idx = node_index[u]
            v_idx = node_index[v]
            A[k, u_idx] = -1.0  # Leaves source
            A[k, v_idx] = +1.0  # Enters target
            
    return A, row_labels, col_labels


def validate_incidence_matrix(A: np.ndarray) -> bool:
    """
    Validates that every row of incidence matrix contains exactly one -1 and one +1.
    """
    if A.size == 0:
        return True
    for row in A:
        non_zero = row[row != 0]
        if len(non_zero) != 2:
            return False
        if not ((-1.0 in non_zero) and (1.0 in non_zero)):
            return False
    return True


def get_route_submatrix(
    A: np.ndarray,
    all_edges: List[Dict[str, Any]],
    all_stops: List[Dict[str, Any]],
    route_edge_ids: List[str]
) -> Dict[str, Any]:
    """
    Extracts the submatrix of A corresponding to a specific route,
    along with the route edge indicator vector x_route.
    """
    edge_idx_map = {edge["id"]: idx for idx, edge in enumerate(all_edges)}
    stop_idx_map = {stop["id"]: idx for idx, stop in enumerate(all_stops)}
    
    m, n = A.shape
    x_route = np.zeros(m, dtype=float)
    
    active_edge_indices = []
    active_stop_ids = set()
    
    for eid in route_edge_ids:
        if eid in edge_idx_map:
            idx = edge_idx_map[eid]
            active_edge_indices.append(idx)
            x_route[idx] = 1.0
            edge = all_edges[idx]
            active_stop_ids.add(edge["source"])
            active_stop_ids.add(edge["target"])
            
    active_stop_indices = sorted([stop_idx_map[sid] for sid in active_stop_ids if sid in stop_idx_map])
    
    # Submatrix restricted to route edges and involved stops
    if active_edge_indices and active_stop_indices:
        sub_A = A[np.ix_(active_edge_indices, active_stop_indices)]
        row_sub_labels = [all_edges[i]["id"] for i in active_edge_indices]
        col_sub_labels = [all_stops[j]["id"] for j in active_stop_indices]
    else:
        sub_A = np.zeros((0, 0))
        row_sub_labels = []
        col_sub_labels = []
        
    return {
        "submatrix": sub_A.tolist(),
        "row_labels": row_sub_labels,
        "col_labels": col_sub_labels,
        "x_route_vector": x_route.tolist(),
        "algebraic_telescoping_sum": np.sum(A[active_edge_indices, :], axis=0).tolist() if active_edge_indices else []
    }
