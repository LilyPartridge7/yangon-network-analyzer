import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { Stop, Edge } from '../../types/network';
import { ZoomIn, ZoomOut, RotateCcw, Eye, Layers } from 'lucide-react';

interface NetworkGraphProps {
  stops: Stop[];
  edges: Edge[];
  selectedEdgeId?: string | null;
  selectedNodeId?: string | null;
  highlightedEdgeIds?: string[];
  highlightedNodeIds?: string[];
  flowValues?: Record<string, number>;
  onSelectEdge?: (edgeId: string | null) => void;
  onSelectNode?: (nodeId: string | null) => void;
  disabledStopIds?: string[];
  disabledEdgeIds?: string[];
  showFlowThickness?: boolean;
}

interface D3Node extends d3.SimulationNodeDatum {
  id: string;
  name: string;
  name_my?: string;
  area: string;
  demand_rate: number;
  latitude: number;
  longitude: number;
  inDegree: number;
  outDegree: number;
  isDisabled: boolean;
}

interface D3Link extends d3.SimulationLinkDatum<D3Node> {
  id: string;
  source: D3Node | string;
  target: D3Node | string;
  distance_km: number;
  travel_time_min: number;
  capacity: number;
  route_name: string;
  flow: number;
  isDisabled: boolean;
}

export const NetworkGraph: React.FC<NetworkGraphProps> = ({
  stops,
  edges,
  selectedEdgeId,
  selectedNodeId,
  highlightedEdgeIds = [],
  highlightedNodeIds = [],
  flowValues = {},
  onSelectEdge,
  onSelectNode,
  disabledStopIds = [],
  disabledEdgeIds = [],
  showFlowThickness = false,
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [tooltip, setTooltip] = useState<{
    visible: boolean;
    x: number;
    y: number;
    title: string;
    details: [string, string | number][];
  }>({ visible: false, x: 0, y: 0, title: '', details: [] });

  const zoomBehaviorRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);

  useEffect(() => {
    if (!svgRef.current || !containerRef.current || stops.length === 0) return;

    const width = containerRef.current.clientWidth || 800;
    const height = containerRef.current.clientHeight || 550;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    // Prepare node degree maps
    const inDeg: Record<string, number> = {};
    const outDeg: Record<string, number> = {};
    edges.forEach((e) => {
      outDeg[e.source] = (outDeg[e.source] || 0) + 1;
      inDeg[e.target] = (inDeg[e.target] || 0) + 1;
    });

    // Map geographic coordinates to initial layout positions
    // Yangon lat: ~16.76 (South) to ~16.90 (North)
    // Yangon lng: ~96.10 (West) to ~96.22 (East)
    const latExtent = [16.76, 16.90];
    const lngExtent = [96.10, 96.22];

    const xScale = d3.scaleLinear().domain(lngExtent).range([80, width - 80]);
    const yScale = d3.scaleLinear().domain(latExtent).range([height - 80, 80]); // SVG y is inverted

    const nodesData: D3Node[] = stops.map((s) => ({
      id: s.id,
      name: s.name,
      name_my: s.name_my,
      area: s.area,
      demand_rate: s.demand_rate,
      latitude: s.latitude,
      longitude: s.longitude,
      x: xScale(s.longitude) + (Math.random() - 0.5) * 20,
      y: yScale(s.latitude) + (Math.random() - 0.5) * 20,
      inDegree: inDeg[s.id] || 0,
      outDegree: outDeg[s.id] || 0,
      isDisabled: disabledStopIds.includes(s.id),
    }));

    const linksData: D3Link[] = edges.map((e) => ({
      id: e.id,
      source: e.source,
      target: e.target,
      distance_km: e.distance_km,
      travel_time_min: e.travel_time_min,
      capacity: e.capacity,
      route_name: e.route_name,
      flow: flowValues[e.id] ?? 300,
      isDisabled: disabledEdgeIds.includes(e.id) || disabledStopIds.includes(e.source) || disabledStopIds.includes(e.target),
    }));

    // Definitions (Arrow markers)
    const defs = svg.append('defs');

    // Default arrow
    defs.append('marker')
      .attr('id', 'arrow-default')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 22)
      .attr('refY', 0)
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0,-5L10,0L0,5')
      .attr('fill', '#94a3b8');

    // Highlighted arrow
    defs.append('marker')
      .attr('id', 'arrow-highlight')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 24)
      .attr('refY', 0)
      .attr('markerWidth', 7)
      .attr('markerHeight', 7)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0,-5L10,0L0,5')
      .attr('fill', '#2563eb');

    // Container group with zoom
    const g = svg.append('g').attr('class', 'main-graph');

    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.4, 4])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });

    svg.call(zoom);
    zoomBehaviorRef.current = zoom;

    // Force simulation
    const simulation = d3.forceSimulation<D3Node>(nodesData)
      .force('link', d3.forceLink<D3Node, D3Link>(linksData).id((d) => d.id).distance(75))
      .force('charge', d3.forceManyBody().strength(-280))
      .force('collision', d3.forceCollide().radius(28))
      // Gently pull towards geographic anchor points
      .force('x', d3.forceX<D3Node>((d) => xScale(d.longitude)).strength(0.35))
      .force('y', d3.forceY<D3Node>((d) => yScale(d.latitude)).strength(0.35));

    // Render Edges
    const linkGroup = g.append('g').attr('class', 'links');
    const link = linkGroup.selectAll('line')
      .data(linksData)
      .enter()
      .append('line')
      .attr('stroke', (d) => {
        if (d.isDisabled) return '#e2e8f0';
        if (d.id === selectedEdgeId) return '#2563eb';
        if (highlightedEdgeIds.includes(d.id)) return '#0284c7';
        return '#cbd5e1';
      })
      .attr('stroke-width', (d) => {
        if (d.id === selectedEdgeId || highlightedEdgeIds.includes(d.id)) return 3.5;
        if (showFlowThickness) {
          return Math.max(1.5, Math.min(8, (d.flow / 100)));
        }
        return 1.8;
      })
      .attr('stroke-dasharray', (d) => (d.isDisabled ? '4 3' : 'none'))
      .attr('marker-end', (d) => {
        if (d.isDisabled) return '';
        if (d.id === selectedEdgeId || highlightedEdgeIds.includes(d.id)) return 'url(#arrow-highlight)';
        return 'url(#arrow-default)';
      })
      .style('cursor', 'pointer')
      .on('click', (event, d) => {
        event.stopPropagation();
        if (onSelectEdge) onSelectEdge(d.id === selectedEdgeId ? null : d.id);
      })
      .on('mouseenter', (event, d) => {
        const sourceName = typeof d.source === 'object' ? d.source.name : d.source;
        const targetName = typeof d.target === 'object' ? d.target.name : d.target;
        setTooltip({
          visible: true,
          x: event.clientX,
          y: event.clientY,
          title: `Segment ${d.id}: ${sourceName} → ${targetName}`,
          details: [
            ['Route', d.route_name],
            ['Distance', `${d.distance_km} km`],
            ['Travel Time', `${d.travel_time_min} mins`],
            ['Passenger Flow', `${d.flow} pax/hr`],
            ['Capacity', `${d.capacity} pax/hr`],
            ['Status', d.isDisabled ? 'Disabled / Closed' : 'Active'],
          ],
        });
      })
      .on('mouseleave', () => {
        setTooltip((prev) => ({ ...prev, visible: false }));
      });

    // Render Nodes
    const nodeGroup = g.append('g').attr('class', 'nodes');
    const node = nodeGroup.selectAll('g')
      .data(nodesData)
      .enter()
      .append('g')
      .style('cursor', 'pointer')
      .call(
        d3.drag<SVGGElement, D3Node>()
          .on('start', (event, d) => {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
          })
          .on('drag', (event, d) => {
            d.fx = event.x;
            d.fy = event.y;
          })
          .on('end', (event, d) => {
            if (!event.active) simulation.alphaTarget(0);
            d.fx = null;
            d.fy = null;
          })
      )
      .on('click', (event, d) => {
        event.stopPropagation();
        if (onSelectNode) onSelectNode(d.id === selectedNodeId ? null : d.id);
      })
      .on('mouseenter', (event, d) => {
        setTooltip({
          visible: true,
          x: event.clientX,
          y: event.clientY,
          title: `${d.name} (${d.id})`,
          details: [
            ['Burmese', d.name_my || 'N/A'],
            ['Township / Area', d.area],
            ['In-Degree (Entering)', d.inDegree],
            ['Out-Degree (Leaving)', d.outDegree],
            ['Total Degree', d.inDegree + d.outDegree],
            ['Hourly Demand Rate', `${d.demand_rate} pax/hr`],
            ['Status', d.isDisabled ? 'Station Closed' : 'Operational'],
          ],
        });
      })
      .on('mouseleave', () => {
        setTooltip((prev) => ({ ...prev, visible: false }));
      });

    // Node circles
    node.append('circle')
      .attr('r', (d) => (d.id === selectedNodeId || highlightedNodeIds.includes(d.id) ? 14 : 10))
      .attr('fill', (d) => {
        if (d.isDisabled) return '#f87171';
        if (d.id === selectedNodeId) return '#2563eb';
        if (highlightedNodeIds.includes(d.id)) return '#38bdf8';
        return '#ffffff';
      })
      .attr('stroke', (d) => {
        if (d.isDisabled) return '#dc2626';
        if (d.id === selectedNodeId) return '#1d4ed8';
        if (highlightedNodeIds.includes(d.id)) return '#0284c7';
        return '#475569';
      })
      .attr('stroke-width', (d) => (d.id === selectedNodeId || highlightedNodeIds.includes(d.id) ? 3 : 2))
      .attr('filter', 'drop-shadow(0 1px 2px rgb(0 0 0 / 0.1))');

    // Node Stop ID text inside circle
    node.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '0.35em')
      .attr('font-size', '8px')
      .attr('font-family', 'JetBrains Mono, monospace')
      .attr('font-weight', 'bold')
      .attr('fill', (d) => {
        if (d.isDisabled || d.id === selectedNodeId) return '#ffffff';
        if (highlightedNodeIds.includes(d.id)) return '#0f172a';
        return '#334155';
      })
      .text((d) => d.id.replace('S', ''));

    // Node Label under circle
    node.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', 22)
      .attr('font-size', '10px')
      .attr('font-family', 'Inter, sans-serif')
      .attr('font-weight', (d) => (d.id === selectedNodeId || highlightedNodeIds.includes(d.id) ? 'bold' : 'normal'))
      .attr('fill', (d) => (d.isDisabled ? '#94a3b8' : '#1e293b'))
      .text((d) => d.name);

    // Simulation tick
    simulation.on('tick', () => {
      link
        .attr('x1', (d) => (d.source as D3Node).x || 0)
        .attr('y1', (d) => (d.source as D3Node).y || 0)
        .attr('x2', (d) => (d.target as D3Node).x || 0)
        .attr('y2', (d) => (d.target as D3Node).y || 0);

      node.attr('transform', (d) => `translate(${d.x || 0},${d.y || 0})`);
    });

    // Background click resets selection
    svg.on('click', () => {
      if (onSelectEdge) onSelectEdge(null);
      if (onSelectNode) onSelectNode(null);
    });

    return () => {
      simulation.stop();
    };
  }, [
    stops,
    edges,
    selectedEdgeId,
    selectedNodeId,
    highlightedEdgeIds,
    highlightedNodeIds,
    flowValues,
    disabledStopIds,
    disabledEdgeIds,
    showFlowThickness,
  ]);

  const handleZoom = (scaleMultiplier: number) => {
    if (!svgRef.current || !zoomBehaviorRef.current) return;
    d3.select(svgRef.current)
      .transition()
      .duration(300)
      .call(zoomBehaviorRef.current.scaleBy, scaleMultiplier);
  };

  const handleResetZoom = () => {
    if (!svgRef.current || !zoomBehaviorRef.current) return;
    d3.select(svgRef.current)
      .transition()
      .duration(400)
      .call(zoomBehaviorRef.current.transform, d3.zoomIdentity);
  };

  return (
    <div ref={containerRef} className="relative w-full h-[520px] bg-slate-50/60 rounded-xl border border-slate-200 overflow-hidden">
      {/* Zoom / Layout Controls */}
      <div className="absolute top-4 right-4 z-10 flex flex-col gap-1.5 bg-white/95 backdrop-blur-xs p-1.5 rounded-lg border border-slate-200 shadow-xs">
        <button
          onClick={() => handleZoom(1.3)}
          className="p-1.5 hover:bg-slate-100 rounded text-slate-700 transition-colors"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={() => handleZoom(0.7)}
          className="p-1.5 hover:bg-slate-100 rounded text-slate-700 transition-colors"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          onClick={handleResetZoom}
          className="p-1.5 hover:bg-slate-100 rounded text-slate-700 transition-colors"
          title="Reset View"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 z-10 bg-white/95 backdrop-blur-xs px-3 py-2 rounded-lg border border-slate-200 text-[11px] text-slate-600 shadow-xs flex items-center gap-4">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full border border-slate-600 bg-white inline-block"></span>
          <span>Bus Stop (Node)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3.5 h-0.5 bg-slate-400 inline-block"></span>
          <span>Direct Segment (Edge)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block"></span>
          <span>Selected / Active</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-red-400 inline-block"></span>
          <span>Disabled / Closed</span>
        </div>
      </div>

      {/* D3 Canvas */}
      <svg ref={svgRef} className="w-full h-full" />

      {/* Interactive Tooltip */}
      {tooltip.visible && (
        <div
          className="fixed z-50 pointer-events-none bg-slate-900/95 text-white p-3 rounded-lg text-xs shadow-xl border border-slate-700 max-w-xs transition-opacity"
          style={{
            left: `${tooltip.x + 15}px`,
            top: `${tooltip.y + 15}px`,
          }}
        >
          <div className="font-semibold text-slate-100 border-b border-slate-800 pb-1 mb-2">
            {tooltip.title}
          </div>
          <div className="space-y-1 text-slate-300">
            {tooltip.details.map(([label, val]) => (
              <div key={label} className="flex justify-between gap-3">
                <span className="text-slate-400">{label}:</span>
                <span className="font-medium text-slate-100 text-right">{val}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
