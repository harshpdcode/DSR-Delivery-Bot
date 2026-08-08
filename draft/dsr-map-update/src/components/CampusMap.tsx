"use client";

/**
 * CampusMap — real, interactive Leaflet map (OpenStreetMap tiles) centered on
 * Silver Oak University, Gota, Ahmedabad. 100% free — no API key required.
 *
 * Styled dark with lime accents to match the Ather-app-inspired brand theme
 * already defined in tailwind.config.js (brand.lime #C6FF00 / surface blacks).
 */

import { useEffect, useRef, useMemo } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";

// ── Real Silver Oak University campus anchor point ─────────────────────────
// Gota, SG Highway, Ahmedabad — 23.0906°N, 72.5344°E
export const CAMPUS_CENTER: [number, number] = [23.0906, 72.5344];

export interface CampusWaypoint {
  lat: number;
  lng: number;
  label: string;
}

// Approximate block layout around the real campus center. Nudge these to
// match actual building positions once you have them (e.g. from Google Maps
// "drop a pin" -> copy coordinates).
export const CAMPUS_WAYPOINTS: CampusWaypoint[] = [
  { lat: 23.0906, lng: 72.5344, label: "A Block" },
  { lat: 23.0912, lng: 72.5351, label: "B Block" },
  { lat: 23.0918, lng: 72.5346, label: "C Block" },
  { lat: 23.0915, lng: 72.5335, label: "D Block" },
  { lat: 23.0901, lng: 72.5338, label: "E Block" },
  { lat: 23.0898, lng: 72.5348, label: "Canteen" },
];

// ── Custom lime "robot" marker (divIcon, no external image needed) ─────────
function robotIcon(heading = 0) {
  return L.divIcon({
    className: "",
    html: `
      <div style="
        width:34px;height:34px;position:relative;
        transform:rotate(${heading}deg);
      ">
        <div style="
          position:absolute;inset:0;border-radius:9999px;
          background:#C6FF00;opacity:0.18;
          animation:campusPulse 2s ease-out infinite;
        "></div>
        <div style="
          position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);
          width:16px;height:16px;border-radius:9999px;
          background:#C6FF00;border:2px solid #0A0A0A;
          box-shadow:0 0 10px rgba(198,255,0,0.8);
        "></div>
      </div>
      <style>
        @keyframes campusPulse {
          0% { transform: scale(0.6); opacity: 0.35; }
          100% { transform: scale(1.6); opacity: 0; }
        }
      </style>
    `,
    iconSize: [34, 34],
    iconAnchor: [17, 17],
  });
}

// Static waypoint (block) marker
const blockIcon = L.divIcon({
  className: "",
  html: `
    <div style="
      width:14px;height:14px;border-radius:9999px;
      background:#1F2433;border:2px solid #3A3D4A;
      box-shadow:0 0 4px rgba(0,0,0,0.6);
    "></div>
  `,
  iconSize: [14, 14],
  iconAnchor: [7, 7],
});

// Keeps the map smoothly following the robot without the user losing manual pan/zoom control
function FollowRobot({ position, follow }: { position: [number, number]; follow: boolean }) {
  const map = useMap();
  useEffect(() => {
    if (follow) {
      map.panTo(position, { animate: true, duration: 0.8 });
    }
  }, [position, follow, map]);
  return null;
}

export interface CampusMapProps {
  /** Live robot position */
  robot?: { lat: number; lng: number; heading?: number };
  /** Waypoint set to render as static markers; defaults to CAMPUS_WAYPOINTS */
  waypoints?: CampusWaypoint[];
  /** Optional path trail (e.g. route taken so far) */
  trail?: [number, number][];
  /** Auto-pan the map to keep the robot centered as it moves */
  followRobot?: boolean;
  /** Map height (any valid CSS value) */
  height?: string;
  className?: string;
}

export default function CampusMap({
  robot,
  waypoints = CAMPUS_WAYPOINTS,
  trail,
  followRobot = false,
  height = "320px",
  className = "",
}: CampusMapProps) {
  const robotPos = useMemo<[number, number] | null>(
    () => (robot ? [robot.lat, robot.lng] : null),
    [robot]
  );

  return (
    <div
      className={`relative rounded-xl overflow-hidden border border-surface-3 ${className}`}
      style={{ height }}
    >
      <MapContainer
        center={CAMPUS_CENTER}
        zoom={17}
        scrollWheelZoom={true}
        style={{ height: "100%", width: "100%", background: "#0A0A0A" }}
      >
        {/* CARTO dark-matter tiles: free, no API key, matches the dark/lime brand theme */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          subdomains={["a", "b", "c", "d"]}
        />

        {waypoints.map((wp, i) => (
          <Marker key={i} position={[wp.lat, wp.lng]} icon={blockIcon}>
            <Popup>{wp.label}</Popup>
          </Marker>
        ))}

        {trail && trail.length > 1 && (
          <Polyline positions={trail} pathOptions={{ color: "#C6FF00", weight: 3, opacity: 0.6 }} />
        )}

        {robotPos && (
          <>
            <Marker position={robotPos} icon={robotIcon(robot?.heading ?? 0)}>
              <Popup>DSR Robot — live position</Popup>
            </Marker>
            <FollowRobot position={robotPos} follow={followRobot} />
          </>
        )}
      </MapContainer>

      <div className="absolute top-2 right-2 z-[400] bg-surface-1/90 backdrop-blur px-2 py-1 rounded-md border border-surface-3 text-micro text-brand-gray/50 pointer-events-none">
        Silver Oak University
      </div>
    </div>
  );
}
