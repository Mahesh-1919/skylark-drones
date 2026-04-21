"use client";

import { useEffect, useRef, useState } from "react";
import type { SiteEvent, AgentAnalysis, DroneWaypoint } from "@/types";

interface Props {
  events: SiteEvent[];
  droneWaypoints: DroneWaypoint[];
  analysis?: AgentAnalysis;
}

const SEVERITY_COLOR: Record<string, string> = {
  high: "#ef4444",
  medium: "#f59e0b",
  low: "#22c55e",
};

const CLASS_COLOR: Record<string, string> = {
  ESCALATE: "#ef4444",
  WATCH: "#f59e0b",
  HARMLESS: "#22c55e",
};

export default function SiteMap({ events, droneWaypoints, analysis }: Props) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<any>(null);
  const [L, setL] = useState<any>(null);
  const layerGroupRef = useRef<any>(null);
  const [animIndex, setAnimIndex] = useState(0);
  const [animating, setAnimating] = useState(false);

  // Initialize Leaflet
  useEffect(() => {
    if (typeof window !== "undefined") {
      import("leaflet").then((leaflet) => {
        setL(leaflet);
      });
    }
  }, []);

  // Initialize Map
  useEffect(() => {
    if (!L || !mapRef.current || map) return;

    const mapInstance = L.map(mapRef.current, {
      center: [51.505, -0.091],
      zoom: 15,
      zoomControl: true,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors",
    }).addTo(mapInstance);

    // Site Perimeter (The "Fence")
    const perimeter = [
      [51.508, -0.095],
      [51.508, -0.085],
      [51.502, -0.085],
      [51.502, -0.095],
      [51.508, -0.095],
    ];
    L.polyline(perimeter, { color: "#4b5563", weight: 3, dashArray: "10, 10", opacity: 0.5 }).addTo(mapInstance);

    layerGroupRef.current = L.layerGroup().addTo(mapInstance);
    setMap(mapInstance);

    return () => {
      mapInstance.remove();
    };
  }, [L]);

  // Update Markers and Path
  useEffect(() => {
    if (!map || !L || !layerGroupRef.current) return;

    const layerGroup = layerGroupRef.current;
    layerGroup.clearLayers();

    // Plot each event
    events.forEach((event) => {
      const classification = analysis?.classifications.find((c) => c.event_id === event.id);
      const color = classification ? CLASS_COLOR[classification.classification] : SEVERITY_COLOR[event.severity];

      const icon = L.divIcon({
        html: `<div style="
          width:16px;height:16px;border-radius:50%;
          background:${color};border:2px solid white;
          box-shadow:0 0 8px ${color};
        "></div>`,
        className: "custom-div-icon",
        iconSize: [16, 16],
        iconAnchor: [8, 8],
      });

      const marker = L.marker([event.lat, event.lng], { icon });
      marker.bindPopup(`
        <div style="font-family:sans-serif;font-size:12px;min-width:180px;color:#111">
          <strong style="display:block;margin-bottom:4px">${event.title}</strong>
          <span style="color:#666;font-size:11px">${new Date(event.timestamp).toLocaleTimeString()}</span><br/>
          <span style="display:inline-block;margin-top:4px">Zone: ${event.zone}</span><br/>
          ${classification ? 
            `<span style="color:${color};font-weight:bold;text-transform:uppercase">${classification.classification}</span>` : 
            `<span style="color:${SEVERITY_COLOR[event.severity]};font-weight:bold;text-transform:uppercase">${event.severity} severity</span>`
          }
        </div>
      `);
      marker.addTo(layerGroup);
    });

    // Draw drone path
    if (droneWaypoints.length > 1) {
      const latlngs = droneWaypoints.map((w) => [w.lat, w.lng] as [number, number]);
      L.polyline(latlngs, {
        color: "#818cf8",
        weight: 2,
        dashArray: "6 4",
        opacity: 0.7,
      }).addTo(layerGroup);

      L.circleMarker([droneWaypoints[0].lat, droneWaypoints[0].lng], {
        radius: 6, color: "#818cf8", fillColor: "#818cf8", fillOpacity: 1,
      }).addTo(layerGroup).bindPopup("🚁 Patrol Start Point");
    }
  }, [map, L, events, droneWaypoints, analysis]);

  // Animate drone
  const animateDrone = () => {
    if (animating || droneWaypoints.length === 0) return;
    setAnimating(true);
    setAnimIndex(0);
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setAnimIndex(i);
      if (i >= droneWaypoints.length - 1) {
        clearInterval(interval);
        setAnimating(false);
      }
    }, 800);
  };

  return (
    <div className="bg-gray-900 rounded-xl border border-gray-700 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700 bg-gray-900/50 backdrop-blur-sm z-10 relative">
        <span className="text-white font-semibold text-sm">Ridgeway Site Map</span>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-[10px] text-gray-400 font-medium uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-red-500" /> Escalate
            <span className="w-2 h-2 rounded-full bg-yellow-500 ml-1" /> Watch
            <span className="w-2 h-2 rounded-full bg-green-500 ml-1" /> Harmless
          </div>
          {analysis && (
            <button
              onClick={animateDrone}
              disabled={animating}
              className="text-xs bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1 rounded-md transition-all disabled:opacity-50 font-medium shadow-sm"
            >
              {animating ? `Drone Waypoint ${animIndex + 1}` : "▶ Replay Patrol"}
            </button>
          )}
        </div>
      </div>
      <div ref={mapRef} className="h-[380px] w-full z-0" />
      {animating && (
        <div className="px-4 py-2 bg-indigo-900/60 border-t border-indigo-700 text-indigo-200 text-xs font-medium animate-pulse">
          🚁 STATUS: {droneWaypoints[animIndex]?.note ?? "Scanning perimeter…"}
        </div>
      )}
    </div>
  );
}
