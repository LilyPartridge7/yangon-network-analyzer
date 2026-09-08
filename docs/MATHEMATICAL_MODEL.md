# Mathematical Model: Linear Algebra on Graphs (Strang Section 10.1)

This document details the mathematical conventions, theorems, and proofs implemented in the Yangon Bus Transportation Network Analyzer.

---

## 1. Network Representation

Let $G = (V, E)$ be a directed graph modeling the Yangon bus transit system:
- **Node set $V$:** $\{v_1, v_2, \dots, v_n\}$, where $n = 16$ bus stops.
- **Edge set $E$:** $\{e_1, e_2, \dots, e_m\}$, where $m = 26$ direct transit segments.

---

## 2. The Incidence Matrix $A \in \mathbb{R}^{m \times n}$

For every edge $e_k = (i \to j)$ directed from stop $i$ (source) to stop $j$ (target):

$$
A_{k, p} = \begin{cases}
-1 & \text{if } p = i \quad (\text{edge leaves node } i) \\
+1 & \text{if } p = j \quad (\text{edge enters node } j) \\
0 & \text{otherwise}
\end{cases}
$$

### Properties of $A$:
1. **Row Sums:** Every row of $A$ contains exactly one $-1$ and one $+1$, hence:
   $$\sum_{p=1}^n A_{k, p} = (-1) + (+1) = 0$$
2. **Column Sums:** The sum of all column vectors equals the zero vector:
   $$\sum_{p=1}^n \mathbf{a}_{*p} = \mathbf{0}$$
3. **Nullspace of $A$ ($N(A)$):**
   If $\mathbf{x} = (x_1, \dots, x_n)^T$ is a potential vector assigned to nodes, then:
   $$(A\mathbf{x})_k = x_j - x_i$$
   For a connected graph, $A\mathbf{x} = \mathbf{0} \iff x_1 = x_2 = \dots = x_n = c$. Thus:
   $$\dim(N(A)) = 1, \qquad N(A) = \operatorname{span}\{\mathbf{1}\}, \quad \mathbf{1} = (1, 1, \dots, 1)^T$$
4. **Rank of $A$:**
   $$\operatorname{rank}(A) = n - c$$
   where $c$ is the number of connected components. For our connected Yangon network ($c=1, n=16$):
   $$\operatorname{rank}(A) = 16 - 1 = 15$$

---

## 3. Network Flow & Kirchhoff's Current Law ($A^T \mathbf{y} = \mathbf{b}$)

Let $\mathbf{y} = (y_1, \dots, y_m)^T \in \mathbb{R}^m$ represent passenger flow on each edge.

The transpose matrix-vector multiplication $A^T \mathbf{y}$ yields a node vector $\mathbf{b} \in \mathbb{R}^n$:

$$(A^T \mathbf{y})_i = \sum_{k=1}^m A_{ki} y_k = \sum_{e_k = (\cdot \to i)} (+1) y_k + \sum_{e_k = (i \to \cdot)} (-1) y_k = \text{Inflow}(i) - \text{Outflow}(i)$$

### Flow Conservation:
- **Intermediate transfer stops:** $\text{Inflow}(i) = \text{Outflow}(i) \iff (A^T \mathbf{y})_i = 0$.
- **Source stop (Passenger origin):** $\text{Outflow} > \text{Inflow} \iff b_i < 0$ (net injection into bus network).
- **Sink stop (Passenger destination):** $\text{Inflow} > \text{Outflow} \iff b_i > 0$ (net exit into city).
- **Global Solvability Condition:**
  $$\sum_{i=1}^n b_i = 0 \iff \mathbf{b} \perp \mathbf{1} \iff \mathbf{b} \in C(A^T)$$

---

## 4. Left Nullspace & Closed Loops ($N(A^T)$)

A circulation vector $\mathbf{y}_{\text{cycle}} \in \mathbb{R}^m$ has non-zero entries on a closed loop and $0$ elsewhere. Traversal around a cycle ensures that at every vertex, flow entering along the cycle equals flow leaving along the cycle:

$$A^T \mathbf{y}_{\text{cycle}} = \mathbf{0} \iff \mathbf{y}_{\text{cycle}} \in N(A^T)$$

### Dimension of Left Nullspace (Euler's Formula):
$$\dim(N(A^T)) = m - \operatorname{rank}(A) = m - (n - 1) = 26 - 15 = 11$$

There are exactly $11$ linearly independent cycle circulations in the Yangon demonstration network.

---

## 5. Graph Laplacian ($L = D - G = A^T A$)

For an unweighted directed graph with incidence matrix $A$:
- $(A^T A)_{ii} = \sum_{k=1}^m A_{ki}^2 = \operatorname{deg}(i)$ (total edges incident to node $i$).
- $(A^T A)_{ij} = \sum_{k=1}^m A_{ki} A_{kj} = -1$ if an edge exists between $i$ and $j$, and $0$ otherwise.

Therefore:
$$L = A^T A = D - G$$
where $D$ is the diagonal degree matrix and $G$ is the symmetric adjacency matrix.

### Spectral Properties:
- Eigenvalues: $0 = \lambda_1 \le \lambda_2 \le \dots \le \lambda_n$.
- $\lambda_2 > 0$ (algebraic connectivity / Fiedler eigenvalue) indicates that the network is connected.

---

## 6. Dijkstra Path Algebraic Telescoping

For a shortest path $P = (v_0, e_{k_1}, v_1, e_{k_2}, \dots, e_{k_p}, v_p)$:

$$\sum_{j=1}^p \text{row}_{k_j}(A) = (\mathbf{e}_{v_1} - \mathbf{e}_{v_0}) + (\mathbf{e}_{v_2} - \mathbf{e}_{v_1}) + \dots + (\mathbf{e}_{v_p} - \mathbf{e}_{v_{p-1}}) = -\mathbf{e}_{v_0} + \mathbf{e}_{v_p}$$

All intermediate nodes cancel out completely, proving algebraically that the path connects $v_0$ to $v_p$.
