"""
Adjacency Matrix, Degree Matrix, and Graph Laplacian computation.
Section 10.1 of Gilbert Strang's Introduction to Linear Algebra:
Demonstrates L = D - G = A^T * A.
"""

from typing import Dict, List, Tuple, Any
import numpy as np


def build_adjacency_matrices(
    stops: List[Dict[str, Any]],
    edges: List[Dict[str, Any]]
) -> Dict[str, Any]:
    """
    Computes binary and weighted adjacency matrices.
    
    Returns:
        binary_adj: (n x n) list of lists
        dist_adj: (n x n) weighted by distance_km
        time_adj: (n x n) weighted by travel_time_min
        stop_labels: list of stop IDs
    """
    n = len(stops)
    node_index = {stop["id"]: idx for idx, stop in enumerate(stops)}
    stop_labels = [stop["id"] for stop in stops]
    
    binary_adj = np.zeros((n, n), dtype=float)
    dist_adj = np.zeros((n, n), dtype=float)
    time_adj = np.zeros((n, n), dtype=float)
    
    for edge in edges:
        u = edge["source"]
        v = edge["target"]
        if u in node_index and v in node_index:
            ui = node_index[u]
            vi = node_index[v]
            dist = float(edge.get("distance_km", 1.0))
            time_val = float(edge.get("travel_time_min", 1.0))
            
            # For directed network:
            binary_adj[ui, vi] += 1.0
            dist_adj[ui, vi] = dist
            time_adj[ui, vi] = time_val
            
            # If edge is explicitly bidirectional:
            if edge.get("bidirectional", False):
                binary_adj[vi, ui] += 1.0
                dist_adj[vi, ui] = dist
                time_adj[vi, ui] = time_val
                
    return {
        "binary_adjacency": binary_adj.tolist(),
        "distance_adjacency": dist_adj.tolist(),
        "time_adjacency": time_adj.tolist(),
        "stop_labels": stop_labels
    }


def build_laplacian_and_degree(
    A: np.ndarray,
    stops: List[Dict[str, Any]],
    edges: List[Dict[str, Any]]
) -> Dict[str, Any]:
    """
    Calculates Degree Matrix D, Graph Laplacian L = D - G,
    and demonstrates the fundamental identity L = A^T * A.
    """
    n = len(stops)
    node_index = {stop["id"]: idx for idx, stop in enumerate(stops)}
    
    # Symmetrized undirected adjacency for standard graph Laplacian L = D - G
    G_sym = np.zeros((n, n), dtype=float)
    for edge in edges:
        u = edge["source"]
        v = edge["target"]
        if u in node_index and v in node_index:
            ui = node_index[u]
            vi = node_index[v]
            G_sym[ui, vi] = 1.0
            G_sym[vi, ui] = 1.0
            
    degree_vals = np.sum(G_sym, axis=1)
    D = np.diag(degree_vals)
    L_standard = D - G_sym
    
    # Gilbert Strang Section 10.1 identity:
    # A is m x n, so A^T A is n x n.
    # Note: (A^T A)_ii = total incident edges (in-degree + out-degree for directed A)
    # (A^T A)_ij = -1 for an edge between i and j.
    AtA = np.dot(A.T, A) if A.size > 0 else np.zeros((n, n))
    
    # Eigenvalues of Laplacian (algebraic connectivity = lambda_2)
    eigenvalues = np.sort(np.linalg.eigvalsh(L_standard)) if n > 0 else np.array([])
    algebraic_connectivity = float(eigenvalues[1]) if len(eigenvalues) > 1 else 0.0
    
    return {
        "degree_matrix": D.tolist(),
        "degrees": degree_vals.tolist(),
        "laplacian_D_minus_G": L_standard.tolist(),
        "AtA_matrix": AtA.tolist(),
        "eigenvalues": [round(float(ev), 4) for ev in eigenvalues],
        "algebraic_connectivity": round(algebraic_connectivity, 4),
        "identity_verified": bool(np.allclose(AtA, L_standard, atol=1e-5))
    }
