# Demonstration Guide: 5–10 Minute Presentation Walkthrough

This guide provides a structured presentation script for lecturing or demonstrating Gilbert Strang's Section 10.1 using the Yangon Bus Transportation Network Analyzer.

---

## Presentation Sequence

### Slide 1: Introduction & Network Graph Modeling
- **Action:** Open the **Dashboard** and toggle **Presentation Mode**.
- **Explanation:** Introduce the Yangon bus network model. Explain how $n = 16$ stops form nodes and $m = 26$ road segments form directed edges in graph $G = (V, E)$.

### Slide 2: The Incidence Matrix $A$
- **Action:** Switch to **Matrix Lab** (Tab 1: Incidence Matrix $A$).
- **Explanation:** Show the $26 \times 16$ table. Explain why each row corresponds to a single road segment, with $-1$ at the origin stop (where flow leaves) and $+1$ at the destination stop (where flow enters).

### Slide 3: Row-to-Edge Duality
- **Action:** Click row `E04` in the matrix table.
- **Explanation:** Observe how the physical road segment `Myaynigone (S04) → Hledan (S07)` illuminates on the graph canvas. Clicking the graph edge also highlights row 4 in the matrix.

### Slide 4: Shortest Route & Path Submatrix
- **Action:** Navigate to **Route Explorer**, select Origin `Sule (S01)` and Destination `Insein (S16)`, then click **Calculate Route**.
- **Explanation:** Highlight the sequence of stops. Scroll down to the **Linear Algebra Behind This Route** panel and explain how adding rows along the path cancels all intermediate transfer stops:
  $$\sum_{k \in \text{path}} \text{row}_k(A) = -\mathbf{e}_{\text{Sule}} + \mathbf{e}_{\text{Insein}}$$

### Slide 5: Passenger Flow Vector $\mathbf{y}$
- **Action:** Navigate to **Flow Lab**.
- **Explanation:** Explain that vector $\mathbf{y} \in \mathbb{R}^{26}$ holds the passenger volume on each road. Notice that edge thickness scales with flow volume.

### Slide 6: Flow Conservation ($A^T \mathbf{y} = \mathbf{b}$)
- **Action:** Adjust the sliders for downtown edges and run the **Source-to-Destination Experiment**.
- **Explanation:** Show the calculation $(A^T \mathbf{y})_i = \text{Inflow}(i) - \text{Outflow}(i)$. Demonstrate that intermediate transfer stops have net flow equal to $0$ (Flow Conserved ✓).

### Slide 7: Loops, Circulations & Left Nullspace ($A^T \mathbf{y} = \mathbf{0}$)
- **Action:** Switch to **Cycle / Nullspace Analyzer** and select `CYCLE_01`.
- **Explanation:** Observe the circulating flow along the loop. Verify that $A^T \mathbf{y}_{\text{cycle}} = \mathbf{0}$, proving that circulation vectors reside in the Left Nullspace $N(A^T)$.

### Slide 8: Rank & Connected Components
- **Action:** Return to **Matrix Lab** and point out $\operatorname{rank}(A) = 15$.
- **Explanation:** State the theorem: for any connected network with $n$ nodes, $\operatorname{rank}(A) = n - 1$. The remaining $m - \operatorname{rank}(A) = 26 - 15 = 11$ edges close independent cycles.

### Slide 9: Network Disruption (Simulating a Road Closure)
- **Action:** Navigate to **Disruption Lab** and click **Close Hledan (S07)**.
- **Explanation:** Demonstrate that closing this critical junction removes 4 incident edges, decreases matrix rank, and splits the network if connectivity is severed.

### Slide 10: Before vs. After Matrix & Topology Analysis
- **Action:** Inspect the side-by-side **Before vs. After** comparison cards.
- **Explanation:** Conclude the lecture by highlighting how algebraic invariants ($\operatorname{rank}$, nullity, eigenvalues of $L = A^T A$) provide immediate quantitative insight into transportation network resilience.
