# Software Architecture: Yangon Bus Transportation Network Analyzer

This document outlines the modular architecture, component responsibilities, and data communication patterns of the application.

---

## 1. System Architecture Overview

```
                                +-----------------------------------+
                                |        Web Browser (Client)       |
                                |  React 19 + TypeScript + Vite     |
                                |  Tailwind CSS v4 + KaTeX + D3     |
                                +-----------------+-----------------+
                                                  |
                                                  | HTTP / JSON (REST API)
                                                  v
                                +-----------------+-----------------+
                                |      FastAPI Backend Server       |
                                |      (Python 3.14 + Uvicorn)      |
                                +-----------------+-----------------+
                                                  |
                         +------------------------+------------------------+
                         |                                                 |
                         v                                                 v
            +------------+------------+                       +------------+------------+
            |  Linear Algebra Engine  |                       | Transportation Datasets |
            |  NumPy + Custom Logic   |                       | (data/*.csv via Pandas) |
            +-------------------------+                       +-------------------------+
            | • incidence.py          |                       | • stops.csv             |
            | • adjacency.py          |                       | • edges.csv             |
            | • connectivity.py       |                       | • routes.csv            |
            | • flow.py               |                       | • passenger_flows.csv   |
            | • cycles.py             |                       +-------------------------+
            | • routing.py            |
            +-------------------------+
```

---

## 2. Backend Modules (`backend/app/`)

1. **`algorithms/incidence.py`**:
   - Builds $m \times n$ incidence matrix $A$.
   - Validates that every row has one $-1$ and one $+1$.
   - Extracts route submatrices and computes path indicator vectors $\mathbf{x}_{\text{route}} \in \{0, 1\}^m$.

2. **`algorithms/adjacency.py`**:
   - Computes binary adjacency, distance-weighted adjacency, and time-weighted adjacency.
   - Computes Degree Matrix $D$ and Graph Laplacian $L = D - G$.
   - Verifies the fundamental identity $L = A^T A$ and calculates Laplacian eigenvalues.

3. **`algorithms/connectivity.py`**:
   - Calculates matrix rank using SVD (`np.linalg.matrix_rank`).
   - Identifies connected components via BFS/DFS.
   - Computes nullity of $A$ ($\dim(N(A)) = n - \operatorname{rank}(A)$) and cycle space dimension ($\dim(N(A^T)) = m - \operatorname{rank}(A)$).

4. **`algorithms/routing.py`**:
   - Transparent, library-free Dijkstra algorithm supporting optimization by `time`, `distance`, and `stops`.
   - Produces step-by-step relaxation traces and algebraic telescoping sums.

5. **`algorithms/flow.py`**:
   - Computes node net inflows $\mathbf{b} = A^T \mathbf{y}$.
   - Evaluates node flow conservation and corridor capacity utilization percentages.
   - Executes source-to-destination demand experiments proving Kirchhoff's Current Law.

6. **`algorithms/cycles.py`**:
   - Extracts fundamental network cycles via DFS back-edges.
   - Constructs circulation vectors $\mathbf{y}_{\text{cycle}}$ and verifies $A^T \mathbf{y} = \mathbf{0}$.

7. **`services/network_service.py`**:
   - Loads CSV datasets into memory.
   - Maintains active graph state and handles real-time node/edge disruptions.

---

## 3. Frontend Modules (`frontend/src/`)

1. **`components/network/NetworkGraph.tsx`**:
   - D3.js force-directed network simulation with geographic anchoring.
   - Bi-directional selection synchronization with matrix rows and columns.
   - Edge flow thickness scaling and node status color coding.

2. **`components/network/LeafletMapView.tsx`**:
   - Leaflet map rendering authentic Yangon geographic coordinates over OpenStreetMap tiles.

3. **`components/matrix/MatrixTable.tsx`**:
   - Interactive matrix viewer highlighting active rows and columns on click/hover.

4. **`pages/`**:
   - `DashboardPage.tsx`: Top-level linear algebra KPIs and topological preview.
   - `RouteExplorerPage.tsx`: Shortest path routing with route submatrix decomposition.
   - `MatrixLabPage.tsx`: Live tabs for $A$, $G$, $D$, and $L = A^T A$.
   - `FlowLabPage.tsx`: Passenger flow simulator with edge volume sliders.
   - `CyclesLabPage.tsx`: Loop circulation and left nullspace verification.
   - `DisruptionLabPage.tsx`: Station disruption simulator with side-by-side Before/After analysis.
   - `TheoryPage.tsx`: Chapter 10.1 theoretical exposition and interactive 4-node model.

5. **`components/layout/PresentationBar.tsx`**:
   - 10-slide guided lecture walkthrough with keyboard navigation.
