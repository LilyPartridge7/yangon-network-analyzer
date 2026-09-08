"""
Network Service:
Loads transportation datasets, maintains in-memory network state,
manages disruptions, and orchestrates linear algebra calculations.
"""

import os
import csv
from typing import Dict, List, Any, Optional, Set
import numpy as np

from app.algorithms.incidence import build_incidence_matrix, get_route_submatrix
from app.algorithms.adjacency import build_adjacency_matrices, build_laplacian_and_degree
from app.algorithms.connectivity import analyze_connectivity_and_rank
from app.algorithms.cycles import analyze_cycles_nullspace
from app.algorithms.flow import compute_node_net_flows, simulate_source_sink_experiment
from app.algorithms.routing import dijkstra_shortest_path


class NetworkService:
    def __init__(self, data_dir: Optional[str] = None):
        if data_dir is None:
            # Default to backend/data/
            base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
            data_dir = os.path.join(base_dir, "data")
        self.data_dir = data_dir
        
        self.base_stops: List[Dict[str, Any]] = []
        self.base_edges: List[Dict[str, Any]] = []
        self.base_routes: List[Dict[str, Any]] = []
        self.base_flows: Dict[str, float] = {}
        
        self.disabled_stops: Set[str] = set()
        self.disabled_edges: Set[str] = set()
        
        self.load_data()
        
    def load_data(self):
        """Loads data from CSV files."""
        stops_file = os.path.join(self.data_dir, "stops.csv")
        edges_file = os.path.join(self.data_dir, "edges.csv")
        routes_file = os.path.join(self.data_dir, "routes.csv")
        flows_file = os.path.join(self.data_dir, "passenger_flows.csv")
        
        # Load stops
        self.base_stops = []
        if os.path.exists(stops_file):
            with open(stops_file, "r", encoding="utf-8") as f:
                reader = csv.DictReader(f)
                for row in reader:
                    self.base_stops.append({
                        "id": row["id"],
                        "name": row["name"],
                        "name_my": row.get("name_my", ""),
                        "latitude": float(row["latitude"]),
                        "longitude": float(row["longitude"]),
                        "area": row["area"],
                        "demand_rate": float(row.get("demand_rate", 500))
                    })
                    
        # Load edges
        self.base_edges = []
        if os.path.exists(edges_file):
            with open(edges_file, "r", encoding="utf-8") as f:
                reader = csv.DictReader(f)
                for row in reader:
                    self.base_edges.append({
                        "id": row["id"],
                        "source": row["source"],
                        "target": row["target"],
                        "distance_km": float(row["distance_km"]),
                        "travel_time_min": float(row["travel_time_min"]),
                        "capacity": float(row["capacity"]),
                        "route_name": row["route_name"],
                        "bidirectional": row.get("bidirectional", "true").lower() == "true"
                    })
                    
        # Load routes
        self.base_routes = []
        if os.path.exists(routes_file):
            with open(routes_file, "r", encoding="utf-8") as f:
                reader = csv.DictReader(f)
                for row in reader:
                    self.base_routes.append({
                        "id": row["id"],
                        "name": row["name"],
                        "description": row["description"],
                        "color": row["color"],
                        "start_stop": row["start_stop"],
                        "end_stop": row["end_stop"]
                    })
                    
        # Load baseline flows
        self.base_flows = {}
        if os.path.exists(flows_file):
            with open(flows_file, "r", encoding="utf-8") as f:
                reader = csv.DictReader(f)
                for row in reader:
                    self.base_flows[row["edge_id"]] = float(row["baseline_flow"])
                    
    def get_active_elements(self, disabled_stops: Optional[Set[str]] = None, disabled_edges: Optional[Set[str]] = None):
        """Returns active stops and edges taking disruptions into account."""
        d_stops = disabled_stops if disabled_stops is not None else self.disabled_stops
        d_edges = disabled_edges if disabled_edges is not None else self.disabled_edges
        
        active_stops = [s for s in self.base_stops if s["id"] not in d_stops]
        active_stop_ids = {s["id"] for s in active_stops}
        
        active_edges = [
            e for e in self.base_edges
            if e["id"] not in d_edges
            and e["source"] in active_stop_ids
            and e["target"] in active_stop_ids
        ]
        return active_stops, active_edges

    def get_incidence_data(self, disabled_stops: Optional[Set[str]] = None, disabled_edges: Optional[Set[str]] = None):
        stops, edges = self.get_active_elements(disabled_stops, disabled_edges)
        A, row_labels, col_labels = build_incidence_matrix(stops, edges)
        conn = analyze_connectivity_and_rank(A, stops, edges)
        return {
            "matrix": A.tolist(),
            "dimensions": {"rows": A.shape[0], "cols": A.shape[1]},
            "row_labels": row_labels,
            "col_labels": col_labels,
            "rank": conn["rank"],
            "nullity_A": conn["nullity_A"],
            "nullity_At_cycle_space": conn["nullity_At_cycle_space"],
            "is_connected": conn["is_connected"],
            "explanation": conn["explanation"]
        }

    def get_adjacency_data(self, disabled_stops: Optional[Set[str]] = None, disabled_edges: Optional[Set[str]] = None):
        stops, edges = self.get_active_elements(disabled_stops, disabled_edges)
        return build_adjacency_matrices(stops, edges)

    def get_laplacian_data(self, disabled_stops: Optional[Set[str]] = None, disabled_edges: Optional[Set[str]] = None):
        stops, edges = self.get_active_elements(disabled_stops, disabled_edges)
        A, _, _ = build_incidence_matrix(stops, edges)
        return build_laplacian_and_degree(A, stops, edges)

    def get_network_stats(self, disabled_stops: Optional[Set[str]] = None, disabled_edges: Optional[Set[str]] = None):
        stops, edges = self.get_active_elements(disabled_stops, disabled_edges)
        A, _, _ = build_incidence_matrix(stops, edges)
        conn = analyze_connectivity_and_rank(A, stops, edges)
        
        avg_time = float(np.mean([e["travel_time_min"] for e in edges])) if edges else 0.0
        total_dist = float(np.sum([e["distance_km"] for e in edges])) if edges else 0.0
        
        return {
            "num_nodes": len(stops),
            "num_edges": len(edges),
            "rank": conn["rank"],
            "num_connected_components": conn["num_connected_components"],
            "is_connected": conn["is_connected"],
            "nullity_A": conn["nullity_A"],
            "nullity_At_cycle_space": conn["nullity_At_cycle_space"],
            "avg_travel_time_min": round(avg_time, 2),
            "total_network_length_km": round(total_dist, 2),
            "components": conn["components"],
            "isolated_stops": conn["isolated_stops"],
            "strang_identity_satisfied": conn["strang_identity_satisfied"],
            "explanation": conn["explanation"]
        }

    def compute_route(self, origin: str, destination: str, criterion: str = "time", disabled_stops: Optional[Set[str]] = None, disabled_edges: Optional[Set[str]] = None):
        stops, edges = self.get_active_elements(disabled_stops, disabled_edges)
        route_result = dijkstra_shortest_path(stops, edges, origin, destination, criterion)
        
        if not route_result.get("found", False):
            return route_result
            
        A, _, _ = build_incidence_matrix(stops, edges)
        linear_algebra_info = get_route_submatrix(A, edges, stops, route_result["edges"])
        route_result["linear_algebra"] = linear_algebra_info
        return route_result

    def analyze_passenger_flows(self, custom_flows: Optional[Dict[str, float]] = None, disabled_stops: Optional[Set[str]] = None, disabled_edges: Optional[Set[str]] = None):
        stops, edges = self.get_active_elements(disabled_stops, disabled_edges)
        A, _, _ = build_incidence_matrix(stops, edges)
        
        # Build flow vector y
        flow_vector = []
        for e in edges:
            eid = e["id"]
            if custom_flows and eid in custom_flows:
                flow_vector.append(custom_flows[eid])
            elif eid in self.base_flows:
                flow_vector.append(self.base_flows[eid])
            else:
                flow_vector.append(300.0)
                
        return compute_node_net_flows(A, flow_vector, stops, edges)

    def analyze_source_sink(self, source_id: str, target_id: str, demand: float = 500.0):
        stops, edges = self.get_active_elements()
        route_res = dijkstra_shortest_path(stops, edges, source_id, target_id, criterion="time")
        if not route_res.get("found", False):
            return {
                "success": False,
                "error": f"No available path between {source_id} and {target_id} to route flow."
            }
        A, _, _ = build_incidence_matrix(stops, edges)
        res = simulate_source_sink_experiment(A, stops, edges, source_id, target_id, demand, route_res["edges"])
        res["success"] = True
        res["path_stops"] = route_res["stops"]
        return res

    def analyze_cycles(self):
        stops, edges = self.get_active_elements()
        A, _, _ = build_incidence_matrix(stops, edges)
        return analyze_cycles_nullspace(A, stops, edges)

    def analyze_disruption(self, disabled_stop_ids: List[str], disabled_edge_ids: List[str]):
        """Compares baseline network with disrupted network."""
        base_stops, base_edges = self.get_active_elements(set(), set())
        A_base, _, _ = build_incidence_matrix(base_stops, base_edges)
        base_stats = analyze_connectivity_and_rank(A_base, base_stops, base_edges)
        
        dis_stops_set = set(disabled_stop_ids)
        dis_edges_set = set(disabled_edge_ids)
        dis_stops, dis_edges = self.get_active_elements(dis_stops_set, dis_edges_set)
        A_dis, row_dis_labels, col_dis_labels = build_incidence_matrix(dis_stops, dis_edges)
        dis_stats = analyze_connectivity_and_rank(A_dis, dis_stops, dis_edges)
        
        # Test sample travel time impact (e.g. Sule S01 to Insein S16)
        base_route = dijkstra_shortest_path(base_stops, base_edges, "S01", "S16", "time")
        dis_route = dijkstra_shortest_path(dis_stops, dis_edges, "S01", "S16", "time")
        
        return {
            "before": {
                "num_nodes": len(base_stops),
                "num_edges": len(base_edges),
                "rank": base_stats["rank"],
                "components": base_stats["num_connected_components"],
                "is_connected": base_stats["is_connected"],
                "nullity_A": base_stats["nullity_A"],
                "nullity_At": base_stats["nullity_At_cycle_space"],
                "benchmark_route_time": base_route.get("total_travel_time_min", None)
            },
            "after": {
                "num_nodes": len(dis_stops),
                "num_edges": len(dis_edges),
                "rank": dis_stats["rank"],
                "components": dis_stats["num_connected_components"],
                "is_connected": dis_stats["is_connected"],
                "nullity_A": dis_stats["nullity_A"],
                "nullity_At": dis_stats["nullity_At_cycle_space"],
                "benchmark_route_time": dis_route.get("total_travel_time_min", None),
                "benchmark_route_found": dis_route.get("found", False)
            },
            "disruption": {
                "disabled_stops": disabled_stop_ids,
                "disabled_edges": disabled_edge_ids,
                "removed_nodes_count": len(disabled_stop_ids),
                "removed_edges_count": len(base_edges) - len(dis_edges),
                "network_severed": dis_stats["num_connected_components"] > base_stats["num_connected_components"],
                "newly_isolated_stops": dis_stats["isolated_stops"]
            }
        }
