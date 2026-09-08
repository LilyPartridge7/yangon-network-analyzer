"""
Cycle / Nullspace Analyzer based on Gilbert Strang Section 10.1.

In Strang Section 10.1:
The left nullspace N(A^T) corresponds to edge flows y where:
    A^T * y = 0
This represents circulation of passengers/vehicles around closed loops,
leaving ZERO net accumulation at any node.
Dimension of N(A^T) = m - rank(A) = m - n + 1 (for connected graph).
"""

from typing import Dict, List, Set, Tuple, Any
import numpy as np


def find_fundamental_cycles(
    stops: List[Dict[str, Any]],
    edges: List[Dict[str, Any]]
) -> List[Dict[str, Any]]:
    """
    Finds a set of distinct simple cycles in the network.
    Constructs an edge traversal for each cycle.
    """
    # Build adjacency list with edge pointers
    # adj[u] = [(neighbor_v, edge_id, edge_dir_forward: bool)]
    adj: Dict[str, List[Tuple[str, str, bool]]] = {stop["id"]: [] for stop in stops}
    for edge in edges:
        u = edge["source"]
        v = edge["target"]
        eid = edge["id"]
        if u in adj and v in adj:
            adj[u].append((v, eid, True))
            adj[v].append((u, eid, False))
            
    visited: Set[str] = set()
    parent_edge: Dict[str, str] = {}
    parent_node: Dict[str, str] = {}
    depth_map: Dict[str, int] = {}
    cycles_found: List[List[Tuple[str, str, bool]]] = []
    
    # DFS to find back-edges which identify fundamental cycles
    for start_node in stops:
        sid = start_node["id"]
        if sid not in visited:
            stack = [(sid, None, None, 0)]
            while stack:
                curr, p_node, p_edge, depth = stack.pop()
                if curr not in visited:
                    visited.add(curr)
                    depth_map[curr] = depth
                    parent_node[curr] = p_node
                    parent_edge[curr] = p_edge
                    
                    for nbr, eid, fwd in adj[curr]:
                        if eid == p_edge:
                            continue
                        if nbr not in visited:
                            stack.append((nbr, curr, eid, depth + 1))
                        elif depth_map.get(nbr, 0) < depth:
                            # Back-edge detected! Forms a cycle between curr and nbr
                            cycle_steps = [(curr, nbr, eid, fwd)]
                            trace = curr
                            while trace != nbr and trace is not None and trace in parent_node:
                                pe = parent_edge.get(trace)
                                pn = parent_node.get(trace)
                                if pe and pn:
                                    # Find orientation of edge pe
                                    is_fwd = True
                                    for target, cand_eid, cand_fwd in adj.get(pn, []):
                                        if cand_eid == pe and target == trace:
                                            is_fwd = cand_fwd
                                            break
                                    cycle_steps.append((pn, trace, pe, is_fwd))
                                trace = pn
                            if len(cycle_steps) >= 3:
                                cycles_found.append(cycle_steps)
                                
    # Deduplicate cycles and format
    formatted_cycles = []
    edge_idx_map = {edge["id"]: idx for idx, edge in enumerate(edges)}
    m = len(edges)
    
    seen_edge_sets = set()
    for cycle in cycles_found:
        edge_ids = [step[2] for step in cycle]
        edge_set_frozen = frozenset(edge_ids)
        if edge_set_frozen in seen_edge_sets:
            continue
        seen_edge_sets.add(edge_set_frozen)
        
        # Build circulation vector y_cycle in R^m
        y_cycle = np.zeros(m, dtype=float)
        nodes_in_order = []
        for u, v, eid, is_fwd in cycle:
            nodes_in_order.append(u)
            if eid in edge_idx_map:
                idx = edge_idx_map[eid]
                # If traversed in forward edge direction, +1; if reverse, -1
                y_cycle[idx] = 1.0 if is_fwd else -1.0
                
        formatted_cycles.append({
            "cycle_id": f"CYCLE_{len(formatted_cycles)+1:02d}",
            "edge_ids": edge_ids,
            "node_ids": nodes_in_order,
            "y_vector": y_cycle.tolist(),
            "length": len(cycle)
        })
        
    return formatted_cycles


def analyze_cycles_nullspace(
    A: np.ndarray,
    stops: List[Dict[str, Any]],
    edges: List[Dict[str, Any]]
) -> Dict[str, Any]:
    """
    Analyzes cycles and verifies that for each cycle circulation vector y,
    A^T * y = 0 (left nullspace condition).
    """
    cycles = find_fundamental_cycles(stops, edges)
    m, n = A.shape if A.size > 0 else (0, 0)
    rank = int(np.linalg.matrix_rank(A)) if A.size > 0 else 0
    cycle_space_dimension = m - rank
    
    analyzed_cycles = []
    for c in cycles:
        y = np.array(c["y_vector"], dtype=float)
        # Calculate A^T * y
        At_y = np.dot(A.T, y) if A.size > 0 else np.zeros(n)
        is_in_nullspace = bool(np.allclose(At_y, 0, atol=1e-5))
        max_residual = float(np.max(np.abs(At_y))) if len(At_y) > 0 else 0.0
        
        analyzed_cycles.append({
            **c,
            "At_y_result": [round(float(val), 4) for val in At_y],
            "is_in_nullspace": is_in_nullspace,
            "max_residual": max_residual,
            "explanation": (
                "Flow circulation around this closed loop generates ZERO net accumulation at every node: "
                "A^T * y = 0. Therefore, y belongs to the left nullspace N(A^T)."
            )
        })
        
    return {
        "num_cycles_detected": len(analyzed_cycles),
        "cycle_space_dimension": cycle_space_dimension,
        "formula": f"dim(N(A^T)) = m - rank(A) = {m} - {rank} = {cycle_space_dimension}",
        "cycles": analyzed_cycles,
        "theoretical_meaning": (
            "According to the Fundamental Theorem of Linear Algebra (Strang 10.1), "
            "the left nullspace N(A^T) has dimension m - rank(A). Every vector in N(A^T) "
            "represents an independent loop flow or circulation where inflow equals outflow at every stop."
        )
    }
