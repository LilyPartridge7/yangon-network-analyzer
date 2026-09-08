# Data Dictionary: Yangon Bus Transportation Network

**Dataset Classification:** Educational Sample Yangon Network  
**Notice:** Geographic coordinates represent authentic Yangon locations. Transit connections, passenger flows, capacities, and travel times are synthetic educational parameters for linear algebra demonstrations.

---

## 1. `stops.csv` (Nodes)

| Field | Type | Description | Example |
| :--- | :--- | :--- | :--- |
| `id` | String | Unique stop identifier (corresponds to column in incidence matrix $A$) | `S01` |
| `name` | String | English name of Yangon transit landmark | `Sule Pagoda` |
| `name_my` | String | Burmese name of stop | `ဆူးလေ` |
| `latitude` | Float | Verified GPS latitude in Yangon | `16.7744` |
| `longitude` | Float | Verified GPS longitude in Yangon | `96.1587` |
| `area` | String | Township or district | `Kyauktada` |
| `demand_rate` | Float | Simulated baseline hourly passenger demand (pax/hr) | `850` |

---

## 2. `edges.csv` (Directed Segments)

| Field | Type | Description | Example |
| :--- | :--- | :--- | :--- |
| `id` | String | Unique edge identifier (corresponds to row in incidence matrix $A$) | `E01` |
| `source` | String | Origin stop ID (entry $-1$ in row) | `S01` |
| `target` | String | Destination stop ID (entry $+1$ in row) | `S02` |
| `distance_km` | Float | Simulated transit segment physical distance in kilometers | `1.8` |
| `travel_time_min`| Float | Simulated estimated bus transit travel time in minutes | `6.0` |
| `capacity` | Float | Maximum passenger transit capacity per hour | `600` |
| `route_name` | String | Designated educational YBS route line | `YBS Line 1 (Downtown Loop)` |
| `bidirectional` | Boolean | Whether physical reverse travel exists | `true` |

---

## 3. `routes.csv` (Transit Line Summary)

| Field | Type | Description | Example |
| :--- | :--- | :--- | :--- |
| `id` | String | Route identifier | `R01` |
| `name` | String | Transit line title | `YBS Line 1 (Downtown Loop)` |
| `description` | String | Corridor serviced | `Circular route servicing Sule, Lanmadaw, Sanchaung` |
| `color` | String | Hexadecimal line color code | `#2563EB` |
| `start_stop` | String | Starting terminal stop ID | `S01` |
| `end_stop` | String | Ending terminal stop ID | `S01` |

---

## 4. `passenger_flows.csv` (Flow Vector $\mathbf{y}$)

| Field | Type | Description | Example |
| :--- | :--- | :--- | :--- |
| `edge_id` | String | Identifier matching `edges.csv` | `E01` |
| `source` | String | Origin stop ID | `S01` |
| `target` | String | Destination stop ID | `S02` |
| `baseline_flow` | Float | Default passenger volume (pax/hr) for vector $\mathbf{y}$ | `320` |
| `capacity` | Float | Capacity ceiling | `600` |
