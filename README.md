# Yangon Bus Transportation Network Analyzer
### Graph, Incidence Matrix, and Network Flow Analysis

[![Python](https://img.shields.io/badge/Python-3.14-blue.svg)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.141-009688.svg)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-19-61DAFB.svg)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6.svg)](https://www.typescriptlang.org)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-v4-38B2AC.svg)](https://tailwindcss.com)

An educational, university-grade web application modeling the Yangon bus transit network as a weighted directed graph to interactively demonstrate **Section 10.1 ("Graphs and Networks")** from Gilbert Strang's *Introduction to Linear Algebra, Fifth Edition*.

---

## 🏛️ Connection to Linear Algebra (Gilbert Strang Section 10.1)

| Transportation Concept | Linear Algebra Object | Mathematical Formulation |
| :--- | :--- | :--- |
| **Bus Stops ($n=16$)** | Node Potential Vector $\mathbf{x} \in \mathbb{R}^n$ | Matrix Columns of $A$ |
| **Direct Road Segments ($m=26$)** | Edge Differences $(A\mathbf{x})_k = x_j - x_i$ | Matrix Rows of $A$ |
| **Network Topology** | Incidence Matrix $A \in \mathbb{R}^{m \times n}$ | $A_{ki} = -1$ (leaves), $A_{kj} = +1$ (enters) |
| **Passenger Volume** | Flow Vector $\mathbf{y} \in \mathbb{R}^m$ | Passengers per hour along corridors |
| **Node Flow Balance** | Transpose Product $A^T \mathbf{y} = \mathbf{b}$ | $(A^T \mathbf{y})_i = \text{Inflow}(i) - \text{Outflow}(i)$ |
| **Closed Circulation Loops** | Left Nullspace $N(A^T)$ | $A^T \mathbf{y}_{\text{cycle}} = \mathbf{0}, \quad \dim = m - \operatorname{rank}(A) = 11$ |
| **Spanning Trees & Connectivity** | Matrix Rank | $\operatorname{rank}(A) = n - c = 16 - 1 = 15$ |
| **Graph Laplacian** | Symmetric Matrix $L \in \mathbb{R}^{n \times n}$ | $L = D - G = A^T A$ |

---

## 🚀 Key Features

1. **Interactive Dual-Mode Network Visualizer:**
   - **Force Graph Canvas (D3.js):** Interactive topological layout with drag-and-drop, zoom/pan, edge thickness scaling by passenger volume, and node degree indicators.
   - **Geographic Map (Leaflet):** Map view overlaying authentic Yangon coordinates (Sule, Lanmadaw, Sanchaung, Myaynigone, Shwedagon, Tamwe, Hledan, Kamayut, Insein, etc.).

2. **Matrix Lab:**
   - Interactive tables for **Incidence Matrix $A$**, **Adjacency Matrix $G$** (Binary & Weighted by distance/time), **Degree Matrix $D$**, and **Graph Laplacian $L = A^T A$**.
   - **Bi-directional synchronization:** Clicking/hovering any edge on the graph highlights the matrix row, and vice-versa.

3. **Route Explorer & Linear Algebra Route Submatrix:**
   - Transparent Dijkstra shortest-path engine (time, distance, or stop count).
   - Dedicated *"Linear Algebra Behind This Route"* panel demonstrating path submatrix extraction and algebraic telescoping row summation: $\sum_{k \in \text{path}} \text{row}_k(A) = -\mathbf{e}_{\text{origin}} + \mathbf{e}_{\text{destination}}$.

4. **Passenger Flow Simulator ($A^T \mathbf{y} = \mathbf{b}$):**
   - Sliders to modify passenger volume on corridors.
   - Real-time node flow conservation checking (Conserved ✓ vs. Imbalance ⚠).
   - Source-to-Destination Kirchhoff demand experiment with Simple & Advanced explanation modes.

5. **Cycle / Left Nullspace Analyzer:**
   - Detects fundamental cycle basis.
   - Verifies $A^T \mathbf{y}_{\text{cycle}} = \mathbf{0}$ for every circulating loop.
   - Shows $\dim(N(A^T)) = m - \operatorname{rank}(A) = 11$.

6. **Network Disruption & Resilience Lab:**
   - Simulates station closures (e.g., closing Hledan or Myaynigone) and road closures.
   - Instant side-by-side **Before vs. After** comparison of matrix rank, connected components, and travel time penalties.

7. **Theory Page & 4-Node Mini Teaching Model:**
   - Formal mathematical exposition with KaTeX equations.
   - 4-node diamond mini network (Sule, Hledan, Tamwe, Junction) with an explicit $4 \times 4$ incidence matrix table explaining every entry.

8. **Presentation Mode:**
   - High-contrast, large-typography mode with keyboard navigation (`←`/`→`/`Space`) for 5–10 minute classroom demonstrations.

---

## 📊 Dataset Notice

All geographic coordinates reflect real Yangon landmarks. However, transit connections, travel times, capacities, and flows are clearly designated as an **"Educational Sample Yangon Network"** to illustrate linear algebra concepts without claiming to represent official YBS municipal data.

All data is stored in modular CSV files in `backend/data/`:
- `stops.csv`
- `edges.csv`
- `routes.csv`
- `passenger_flows.csv`

---

## 🛠️ Installation & Setup

### Prerequisites
- Python 3.10+ (tested on Python 3.14)
- Node.js 18+ & npm
- `uv` (recommended for Python package management)

### 1. Backend Setup
```bash
cd backend
# Create virtual environment and install dependencies
uv venv
# Activate virtual environment (Windows PowerShell)
.\.venv\Scripts\activate
# Install requirements
uv pip install fastapi uvicorn numpy pandas pydantic pytest httpx

# Run unit test suite
python -m pytest tests/test_linear_algebra.py -v

# Start FastAPI server
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
API Documentation will be accessible at `http://127.0.0.1:8000/docs`.

### 2. Frontend Setup
```bash
cd frontend
# Install dependencies
npm install

# Start development server
npm run dev
```
Open `http://localhost:5173` in your browser.

---

## 🧪 Unit Tests

The backend test suite (`backend/tests/test_linear_algebra.py`) rigorously validates:
- Incidence matrix dimensions and row validity (one $-1$, one $+1$)
- Rank theorem $\operatorname{rank}(A) = n - 1$ on connected networks
- Graph Laplacian identity $L = D - G = A^T A$
- Left nullspace condition $A^T \mathbf{y} = \mathbf{0}$ for cycles
- Transparent Dijkstra shortest paths
- Kirchhoff flow conservation $A^T \mathbf{y} = \mathbf{b}$
- Disruption rank degradation and component isolation

---

## 📖 Documentation
- [Project Overview](docs/PROJECT_OVERVIEW.md)
- [Mathematical Model & Proofs](docs/MATHEMATICAL_MODEL.md)
- [Software Architecture](docs/ARCHITECTURE.md)
- [Data Dictionary](docs/DATA_DICTIONARY.md)
- [Demonstration Guide](docs/DEMO_GUIDE.md)

---

## 📄 License
Educational Open-Source Project based on Gilbert Strang's *Introduction to Linear Algebra*.
