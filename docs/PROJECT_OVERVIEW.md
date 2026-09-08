# Project Overview: Yangon Bus Transportation Network Analyzer

**Subtitle:** Graph, Incidence Matrix, and Network Flow Analysis  
**Mathematical Foundation:** Section 10.1, "Graphs and Networks," from Gilbert Strang's *Introduction to Linear Algebra* (5th Edition).

---

## 1. Executive Summary

The **Yangon Bus Transportation Network Analyzer** is a university-grade interactive web application designed to demonstrate the fundamental role of linear algebra in modeling, analyzing, and optimizing public transportation networks.

Rather than acting solely as a generic route planner, this application uses a modeled Yangon bus network as an interactive testbed for:
- **Incidence Matrix ($A$) & Adjacency Matrix ($G$)**
- **Graph Laplacian ($L = D - G = A^T A$)**
- **Rank and Nullspace Dimensions ($\operatorname{rank}(A) = n - c$)**
- **Network Flow & Flow Conservation ($A^T \mathbf{y} = \mathbf{b}$)**
- **Closed Circulation Loops & Left Nullspace ($A^T \mathbf{y} = \mathbf{0} \implies \mathbf{y} \in N(A^T)$)**
- **Shortest Path Algebraic Telescoping Cancellation**
- **Network Resiliency & Disruption Modeling**

---

## 2. Core Educational Principles

1. **Linear Algebra First, Transportation Second:** Every physical transit entity maps directly to a linear algebra object:
   - **Bus Stops ($n=16$)** $\to$ Matrix Columns / Node Potential Space $\mathbb{R}^n$
   - **Road Segments ($m=26$)** $\to$ Matrix Rows / Edge Flow Space $\mathbb{R}^m$
   - **Incidence Matrix ($A$)** $\to$ Network Topology Operator ($A_{ki} = -1, A_{kj} = +1$)
   - **Passenger Volumes ($\mathbf{y}$)** $\to$ Flow Vector $\mathbf{y} \in \mathbb{R}^m$
   - **Flow Balance** $\to$ Matrix-Vector Transpose Equation $A^T \mathbf{y} = \mathbf{b}$
   - **Independent Loops ($m - \operatorname{rank}(A) = 11$)** $\to$ Left Nullspace $N(A^T)$

2. **Educational Sample Dataset Integrity:**
   - Real geographic coordinates (lat/lng) are used for authentic Yangon landmarks (Sule, Lanmadaw, Sanchaung, Myaynigone, Shwedagon, Tamwe, Hledan, Kamayut, Yankin, Thingangyun, Thaketa, Mayangone, South Okkalapa, North Okkalapa, Bayint Naung, Insein).
   - Route connections, travel times, capacities, and flows are synthetic educational data formulated to demonstrate Strang's theorems without misrepresenting official YBS municipal operations.

3. **Multi-Mode Visualizations:**
   - **Interactive Force-Directed Graph:** D3.js interactive canvas with bi-directional synchronization to the matrix rows and columns.
   - **Geographic Map View:** Leaflet and OpenStreetMap rendering of real Yangon transit corridors.
   - **Matrix Lab:** Live inspection of $A$, $G$, $D$, and $L$.
   - **Passenger Flow Simulator:** Dynamic edge flow sliders and real-time node conservation checks.
   - **Resilience & Disruption Lab:** Live simulation of station closures with side-by-side Before/After matrix metric comparisons.
   - **Presentation Mode:** 10-slide guided walkthrough formatted for large projector displays.
