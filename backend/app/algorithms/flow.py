"""
Passenger Flow Simulator and Flow Conservation (A^T * y = b)
Section 10.1 of Gilbert Strang's Introduction to Linear Algebra.

In our convention:
Row k of A has:
-1 at source node u (leaves u)
+1 at target node v (enters v)

Therefore:
(A^T * y)_i = sum(k) A_{ki} * y_k
             = (sum of flows ENTERING node i) - (sum of flows LEAVING node i)
             = Net Inflow at node i.

Flow conservation at an intermediate stop means:
Inflow = Outflow  <=>  (A^T * y)_i = 0.
"""

from typing import Dict, List, Any
import numpy as np


def compute_node_net_flows(
    A: np.ndarray,
    flow_vector_y: List[float],
    stops: List[Dict[str, Any]],
    edges: List[Dict[str, Any]],
    tolerance: float = 1e-3
) -> Dict[str, Any]:
    """
    Computes b = A^T * y, representing net inflow at each node.
    Evaluates flow conservation and edge capacity utilization.
    """
    m, n = A.shape if A.size > 0 else (0, 0)
    y = np.array(flow_vector_y, dtype=float)
    if len(y) != m:
        raise ValueError(f"Flow vector length ({len(y)}) must match number of edges ({m})")
        
    At_y = np.dot(A.T, y) if A.size > 0 else np.zeros(n)
    
    node_flows = []
    total_imbalance = 0.0
    conserved_count = 0
    
    for idx, stop in enumerate(stops):
        net_inflow = float(At_y[idx]) if idx < len(At_y) else 0.0
        is_conserved = abs(net_inflow) <= tolerance
        
        if is_conserved:
            conserved_count += 1
            status = "conserved"
        elif net_inflow > tolerance:
            status = "net_sink"  # More people entering stop than leaving (destinations / alighting)
            total_imbalance += abs(net_inflow)
        else:
            status = "net_source"  # More people boarding than arriving (origins / boarding)
            total_imbalance += abs(net_inflow)
            
        node_flows.append({
            "stop_id": stop["id"],
            "stop_name": stop["name"],
            "net_flow": round(net_inflow, 2),
            "status": status,
            "is_conserved": is_conserved
        })
        
    # Edge utilization
    edge_utilizations = []
    for idx, edge in enumerate(edges):
        flow_val = float(y[idx]) if idx < len(y) else 0.0
        cap = float(edge.get("capacity", 500))
        pct = (flow_val / cap * 100.0) if cap > 0 else 0.0
        edge_utilizations.append({
            "edge_id": edge["id"],
            "flow": round(flow_val, 1),
            "capacity": cap,
            "utilization_percent": round(pct, 1),
            "is_congested": pct > 90.0
        })
        
    global_sum = float(np.sum(At_y))
    is_globally_balanced = abs(global_sum) <= tolerance
    
    return {
        "b_vector": [round(float(val), 2) for val in At_y],
        "node_flows": node_flows,
        "edge_utilizations": edge_utilizations,
        "total_imbalance": round(total_imbalance, 2),
        "conserved_node_count": conserved_count,
        "total_nodes": n,
        "global_sum": round(global_sum, 2),
        "is_globally_balanced": is_globally_balanced,
        "explanation": (
            f"Under our incidence convention, (A^T * y)_i calculates net passenger inflow. "
            f"{conserved_count} out of {n} stops satisfy exact flow balance (A^T * y ≈ 0). "
            f"The global sum of all node flows is {round(global_sum, 2)} passengers/hr "
            f"({'Global conservation satisfied: total boarding = total alighting' if is_globally_balanced else 'Global imbalance detected'})."
        )
    }


def simulate_source_sink_experiment(
    A: np.ndarray,
    stops: List[Dict[str, Any]],
    edges: List[Dict[str, Any]],
    source_id: str,
    target_id: str,
    demand: float,
    path_edge_ids: List[str]
) -> Dict[str, Any]:
    """
    Constructs node demand vector b where:
        b[source] = -demand (passengers boarding/leaving the network into transit)
        b[target] = +demand (passengers arriving/exiting transit to city)
        b[other]  = 0       (intermediate transfer nodes must conserve flow)
        
    Sets up flow vector y along the path and proves A^T * y = b.
    """
    m, n = A.shape
    stop_idx = {stop["id"]: idx for idx, stop in enumerate(stops)}
    edge_idx = {edge["id"]: idx for idx, edge in enumerate(edges)}
    
    if source_id not in stop_idx or target_id not in stop_idx:
        raise ValueError("Invalid source or target stop ID")
        
    s_idx = stop_idx[source_id]
    t_idx = stop_idx[target_id]
    
    # Construct b vector
    b = np.zeros(n, dtype=float)
    b[s_idx] = -demand
    b[t_idx] = +demand
    
    # Construct y flow vector along the routed path
    y = np.zeros(m, dtype=float)
    for eid in path_edge_ids:
        if eid in edge_idx:
            y[edge_idx[eid]] = demand
            
    At_y = np.dot(A.T, y) if A.size > 0 else np.zeros(n)
    satisfied = bool(np.allclose(At_y, b, atol=1e-3))
    
    return {
        "source_id": source_id,
        "target_id": target_id,
        "demand": demand,
        "path_edge_ids": path_edge_ids,
        "demand_vector_b": b.tolist(),
        "flow_vector_y": y.tolist(),
        "At_y": At_y.tolist(),
        "equation_satisfied": satisfied,
        "simple_explanation": (
            f"{demand} passengers board at {source_id} (net outflow into buses, -{demand}), "
            f"travel through intermediate stops without staying (net change 0), "
            f"and alight at {target_id} (net inflow into destination, +{demand})."
        ),
        "advanced_math_explanation": (
            "This demonstrates Kirchhoff's Current Law: A^T * y = b. "
            "Because intermediate stops neither generate nor absorb passengers, b_intermediate = 0. "
            "The sum sum(b_i) = (-demand) + (+demand) + 0 = 0 guarantees that b is orthogonal "
            "to the nullspace vector 1 = (1, 1, ..., 1)^T, which is the exact solvability condition "
            "for network flow problems (b in Column Space of A^T)."
        )
    }
