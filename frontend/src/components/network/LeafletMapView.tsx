import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { Stop, Edge } from '../../types/network';

interface LeafletMapViewProps {
  stops: Stop[];
  edges: Edge[];
  selectedEdgeId?: string | null;
  selectedNodeId?: string | null;
  highlightedEdgeIds?: string[];
  highlightedNodeIds?: string[];
  onSelectEdge?: (edgeId: string | null) => void;
  onSelectNode?: (nodeId: string | null) => void;
}

export const LeafletMapView: React.FC<LeafletMapViewProps> = ({
  stops,
  edges,
  selectedEdgeId,
  selectedNodeId,
  highlightedEdgeIds = [],
  highlightedNodeIds = [],
  onSelectEdge,
  onSelectNode,
}) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layerGroupRef = useRef<L.LayerGroup | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      // Center on Yangon
      const map = L.map(mapContainerRef.current, {
        center: [16.835, 96.155],
        zoom: 12,
        minZoom: 10,
        maxZoom: 16,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map);

      layerGroupRef.current = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;
    }

    const layerGroup = layerGroupRef.current;
    if (!layerGroup) return;
    layerGroup.clearLayers();

    const stopMap = new Map<string, Stop>();
    stops.forEach((s) => stopMap.set(s.id, s));

    // Render Edges
    edges.forEach((edge) => {
      const u = stopMap.get(edge.source);
      const v = stopMap.get(edge.target);
      if (!u || !v) return;

      const isSelected = edge.id === selectedEdgeId;
      const isHighlighted = highlightedEdgeIds.includes(edge.id);

      const color = isSelected ? '#2563eb' : isHighlighted ? '#0284c7' : '#64748b';
      const weight = isSelected || isHighlighted ? 4 : 2;

      const polyline = L.polyline(
        [
          [u.latitude, u.longitude],
          [v.latitude, v.longitude],
        ],
        {
          color,
          weight,
          opacity: isSelected || isHighlighted ? 0.9 : 0.6,
          dashArray: edge.bidirectional ? undefined : '5, 5',
        }
      );

      polyline.bindTooltip(
        `<strong>Segment ${edge.id}</strong><br/>${u.name} → ${v.name}<br/>${edge.distance_km} km • ${edge.travel_time_min} mins`,
        { sticky: true }
      );

      polyline.on('click', () => {
        if (onSelectEdge) onSelectEdge(isSelected ? null : edge.id);
      });

      layerGroup.addLayer(polyline);
    });

    // Render Stop Markers
    stops.forEach((stop) => {
      const isSelected = stop.id === selectedNodeId;
      const isHighlighted = highlightedNodeIds.includes(stop.id);

      const marker = L.circleMarker([stop.latitude, stop.longitude], {
        radius: isSelected || isHighlighted ? 9 : 6,
        fillColor: isSelected ? '#2563eb' : isHighlighted ? '#38bdf8' : '#ffffff',
        color: isSelected ? '#1d4ed8' : '#334155',
        weight: 2,
        fillOpacity: 1,
      });

      marker.bindTooltip(
        `<strong>${stop.name} (${stop.id})</strong><br/>${stop.name_my || ''}<br/>${stop.area}`,
        { permanent: false, direction: 'top' }
      );

      marker.on('click', () => {
        if (onSelectNode) onSelectNode(isSelected ? null : stop.id);
      });

      layerGroup.addLayer(marker);
    });
  }, [stops, edges, selectedEdgeId, selectedNodeId, highlightedEdgeIds, highlightedNodeIds, onSelectEdge, onSelectNode]);

  return (
    <div className="relative w-full h-[520px] rounded-xl border border-slate-200 overflow-hidden">
      <div ref={mapContainerRef} className="w-full h-full" />
    </div>
  );
};
