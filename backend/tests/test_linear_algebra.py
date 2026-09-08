"""
Comprehensive Unit Test Suite for Yangon Transportation Network Linear Algebra Engine.
Tests all mathematical properties defined in Gilbert Strang Section 10.1:
- Incidence matrix dimensions and row entries (-1, +1)
- Rank(A) = n - 1 for connected networks
- Nullspace of A^T and cycle circulation vectors: A^T * y = 0
- Graph Laplacian identity: L = D - G = A^T * A
- Flow conservation: A^T * y = b
- Transparent Dijkstra routing and path submatrix
- Network disruptions and component severance
"""

import pytest
import numpy as np

from app.algorithms.incidence import build_incidence_matrix, validate_incidence_matrix, get_route_submatrix
from app.algorithms.adjacency import build_adjacency_matrices, build_laplacian_and_degree
from app.algorithms.connectivity import analyze_connectivity_and_rank, compute_connected_components
from app.algorithms.cycles import find_fundamental_cycles, analyze_cycles_nullspace
from app.algorithms.flow import compute_node_net_flows, simulate_source_sink_experiment
from app.algorithms.routing import dijkstra_shortest_path
from app.services.network_service import NetworkService


# Sample known 4-node graph from Strang Section 10.1
# Sule (S1) -> Hledan (S2) -> Junction (S4)
# Sule (S1) -> Tamwe (S3)  -> Junction (S4)
FOUR_NODE_STOPS = [
    {"id": "S1", "name": "Sule", "latitude": 16.77, "longitude": 96.15, "area": "Downtown", "demand_rate": 500},
    {"id": "S2", "name": "Hledan", "latitude": 16.82, "longitude": 96.12, "area": "Kamayut", "demand_rate": 600},
    {"id": "S3", "name": "Tamwe", "latitude": 16.80, "longitude": 96.17, "area": "Tamwe", "demand_rate": 550},
    {"id": "S4", "name": "Junction", "latitude": 16.85, "longitude": 96.15, "area": "Mayangone", "demand_rate": 450}
]

FOUR_NODE_EDGES = [
    {"id": "e1", "source": "S1", "target": "S2", "distance_km": 5.0, "travel_time_min": 15.0, "capacity": 500, "route_name": "R1", "bidirectional": False},
    {"id": "e2", "source": "S1", "target": "S3", "distance_km": 4.0, "travel_time_min": 12.0, "capacity": 500, "route_name": "R2", "bidirectional": False},
    {"id": "e3", "source": "S2", "target": "S4", "distance_km": 6.0, "travel_time_min": 18.0, "capacity": 500, "route_name": "R1", "bidirectional": False},
    {"id": "e4", "source": "S3", "target": "S4", "distance_km": 5.5, "travel_time_min": 16.0, "capacity": 500, "route_name": "R2", "bidirectional": False}
]


def test_four_node_incidence_matrix():
    """Verifies incidence matrix for classic 4-node, 4-edge diamond network."""
    A, rows, cols = build_incidence_matrix(FOUR_NODE_STOPS, FOUR_NODE_EDGES)
    assert A.shape == (4, 4)
    assert validate_incidence_matrix(A) is True
    
    # Check expected rows:
    # e1: S1 -> S2 => [-1, 1, 0, 0]
    np.testing.assert_array_equal(A[0], [-1, 1, 0, 0])
    # e2: S1 -> S3 => [-1, 0, 1, 0]
    np.testing.assert_array_equal(A[1], [-1, 0, 1, 0])
    # e3: S2 -> S4 => [0, -1, 0, 1]
    np.testing.assert_array_equal(A[2], [0, -1, 0, 1])
    # e4: S3 -> S4 => [0, 0, -1, 1]
    np.testing.assert_array_equal(A[3], [0, 0, -1, 1])


def test_four_node_rank_and_connectivity():
    """Verifies that rank(A) = n - 1 = 3 for connected 4-node graph."""
    A, _, _ = build_incidence_matrix(FOUR_NODE_STOPS, FOUR_NODE_EDGES)
    res = analyze_connectivity_and_rank(A, FOUR_NODE_STOPS, FOUR_NODE_EDGES)
    assert res["num_nodes"] == 4
    assert res["num_edges"] == 4
    assert res["rank"] == 3  # n - 1
    assert res["num_connected_components"] == 1
    assert res["nullity_A"] == 1
    assert res["nullity_At_cycle_space"] == 1  # 4 - 3 = 1 independent loop!
    assert res["strang_identity_satisfied"] is True


def test_four_node_cycle_left_nullspace():
    """
    In the 4-node diamond:
    e1: S1->S2, e3: S2->S4, e4: S3->S4 (reversed is S4->S3), e2: S1->S3 (reversed is S3->S1).
    Circulation: y = [1, -1, 1, -1]^T
    Verify A^T * y = 0 exactly.
    """
    A, _, _ = build_incidence_matrix(FOUR_NODE_STOPS, FOUR_NODE_EDGES)
    y_cycle = np.array([1.0, -1.0, 1.0, -1.0])
    At_y = np.dot(A.T, y_cycle)
    np.testing.assert_allclose(At_y, [0.0, 0.0, 0.0, 0.0], atol=1e-7)


def test_yangon_full_network_incidence_matrix():
    """Verifies the loaded Yangon educational network."""
    svc = NetworkService()
    stops, edges = svc.get_active_elements()
    A, row_labels, col_labels = build_incidence_matrix(stops, edges)
    
    assert len(stops) == 16
    assert len(edges) == 26
    assert A.shape == (26, 16)
    assert validate_incidence_matrix(A) is True
    
    stats = svc.get_network_stats()
    assert stats["is_connected"] is True
    assert stats["num_connected_components"] == 1
    # For a connected graph of 16 nodes, rank(A) must be exactly 15!
    assert stats["rank"] == 15
    # Cycle space dimension: m - rank(A) = 26 - 15 = 11!
    assert stats["nullity_At_cycle_space"] == 11


def test_laplacian_identity():
    """Verifies Graph Laplacian identity L = D - G = A^T A."""
    svc = NetworkService()
    lap = svc.get_laplacian_data()
    assert lap["identity_verified"] is True
    # Smallest eigenvalue of Laplacian for connected graph is 0
    assert abs(lap["eigenvalues"][0]) < 1e-5
    # Second eigenvalue (Fiedler value / algebraic connectivity) is strictly positive for connected graph
    assert lap["algebraic_connectivity"] > 0.0


def test_dijkstra_routing():
    """Tests transparent Dijkstra algorithm from Sule (S01) to Insein (S16)."""
    svc = NetworkService()
    stops, edges = svc.get_active_elements()
    
    res_time = dijkstra_shortest_path(stops, edges, "S01", "S16", criterion="time")
    assert res_time["found"] is True
    assert res_time["stops"][0] == "S01"
    assert res_time["stops"][-1] == "S16"
    assert res_time["total_travel_time_min"] > 0
    
    # Verify linear algebra route submatrix
    A, _, _ = build_incidence_matrix(stops, edges)
    sub = get_route_submatrix(A, edges, stops, res_time["edges"])
    assert len(sub["submatrix"]) == len(res_time["edges"])
    # Telescoping sum of rows along path: should have -1 at origin and +1 at destination
    telescoping = np.array(sub["algebraic_telescoping_sum"])
    stop_idx_map = {s["id"]: idx for idx, s in enumerate(stops)}
    assert telescoping[stop_idx_map["S01"]] == -1.0
    assert telescoping[stop_idx_map["S16"]] == +1.0
    # All intermediate stops along path cancel out to 0!
    for sid in res_time["stops"][1:-1]:
        assert abs(telescoping[stop_idx_map[sid]]) < 1e-5


def test_source_sink_kirchhoff():
    """Tests A^T * y = b for source-sink experiment."""
    svc = NetworkService()
    res = svc.analyze_source_sink("S01", "S07", demand=400.0)
    assert res["success"] is True
    assert res["equation_satisfied"] is True
    b = np.array(res["demand_vector_b"])
    assert np.isclose(np.sum(b), 0.0)  # Total sum of b is 0 (solvability condition)


def test_disruption_impact():
    """Tests closing Hledan (S07) and observes the matrix and topological impact."""
    svc = NetworkService()
    dis = svc.analyze_disruption(disabled_stop_ids=["S07"], disabled_edge_ids=[])
    
    assert dis["before"]["num_nodes"] == 16
    assert dis["after"]["num_nodes"] == 15
    # Edges incident to S07 must be removed
    assert dis["after"]["num_edges"] < dis["before"]["num_edges"]
    assert dis["disruption"]["removed_nodes_count"] == 1
    assert dis["disruption"]["removed_edges_count"] > 0


def test_cycles_nullspace():
    """Tests cycle detection and left nullspace condition A^T * y = 0."""
    svc = NetworkService()
    cycles_res = svc.analyze_cycles()
    assert cycles_res["num_cycles_detected"] > 0
    for c in cycles_res["cycles"]:
        assert c["is_in_nullspace"] is True
        assert c["max_residual"] < 1e-4


def test_invalid_disconnected_route():
    """Tests routing failure when stops are disconnected or invalid."""
    svc = NetworkService()
    res = svc.compute_route("INVALID_STOP_A", "S16")
    assert res["found"] is False
    assert "error" in res


def test_custom_flow_conservation():
    """Tests flow analysis calculation with custom flow inputs."""
    svc = NetworkService()
    custom = {"E01": 500.0, "E02": 500.0}
    flow_res = svc.analyze_passenger_flows(custom)
    assert len(flow_res["b_vector"]) == 16
    assert "node_flows" in flow_res
    assert "edge_utilizations" in flow_res
