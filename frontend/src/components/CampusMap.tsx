"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import { useTheme } from "next-themes";
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

export const CAMPUS_WAYPOINTS: CampusWaypoint[] = [
  { lat: 23.0906, lng: 72.5344, label: "A Block" },
  { lat: 23.0912, lng: 72.5351, label: "B Block" },
  { lat: 23.0918, lng: 72.5346, label: "C Block" },
  { lat: 23.0915, lng: 72.5335, label: "D Block" },
  { lat: 23.0901, lng: 72.5338, label: "E Block" },
  { lat: 23.0898, lng: 72.5348, label: "Canteen" },
];

// ── Custom Robo.webp robot marker ─────────
function robotIcon(heading = 0, isAnimated = false) {
  return L.divIcon({
    className: "",
    html: `
      <div style="
        width:44px;height:44px;position:relative;
        transform:rotate(${heading}deg);
        transition: transform 0.4s ease-out;
      ">
        <div style="
          position:absolute;inset:-6px;border-radius:9999px;
          background:#84E000;opacity:0.35;
          animation:campusPulse 2s ease-out infinite;
        "></div>
        <div style="
          position:absolute;inset:0;border-radius:9999px;
          background:#FFE234;border:2px solid #0F172A;
          box-shadow:0 0 14px rgba(132,224,0,0.85);
          display:flex;align-items:center;justify-content:center;
          overflow:hidden;padding:2px;
        ">
          <img src="/Robo.webp" style="width:100%;height:100%;object-fit:contain;" />
        </div>
      </div>
      <style>
        @keyframes campusPulse {
          0% { transform: scale(0.7); opacity: 0.5; }
          100% { transform: scale(1.7); opacity: 0; }
        }
      </style>
    `,
    iconSize: [44, 44],
    iconAnchor: [22, 22],
  });
}

// Static waypoint (block) marker
const blockIcon = (label: string) => L.divIcon({
  className: "",
  html: `
    <div style="
      padding: 3px 8px;
      background: rgba(15, 23, 42, 0.85);
      border: 1.5px solid #84E000;
      border-radius: 8px;
      color: #FFFFFF;
      font-size: 10px;
      font-weight: 800;
      box-shadow: 0 2px 8px rgba(0,0,0,0.4);
      white-space: nowrap;
    ">
      ${label}
    </div>
  `,
  iconSize: [60, 24],
  iconAnchor: [30, 12],
});

function FollowRobot({ position, follow }: { position: [number, number]; follow: boolean }) {
  const map = useMap();
  useEffect(() => {
    if (follow && position) {
      map.panTo(position, { animate: true, duration: 1.2 });
    }
  }, [position, follow, map]);
  return null;
}

function MapResizer() {
  const map = useMap();
  useEffect(() => {
    map.invalidateSize();
    const timer = setTimeout(() => map.invalidateSize(), 250);
    return () => clearTimeout(timer);
  }, [map]);
  return null;
}

export interface RobotEntry {
  id?: number;
  name?: string;
  lat: number;
  lng: number;
  heading?: number;
  status?: string;
}

export interface CampusMapProps {
  /** Single robot or multiple robots */
  robot?: RobotEntry;
  robotsList?: RobotEntry[];
  waypoints?: CampusWaypoint[];
  trail?: [number, number][];
  followRobot?: boolean;
  height?: string;
  className?: string;
  isDarkTheme?: boolean;
}

export default function CampusMap({
  robot,
  robotsList,
  waypoints = CAMPUS_WAYPOINTS,
  trail,
  followRobot = false,
  height = "340px",
  className = "",
  isDarkTheme,
}: CampusMapProps) {
  const { theme, resolvedTheme } = useTheme();
  const currentTheme = resolvedTheme || theme;
  const isLight = currentTheme === "light" || currentTheme === "ather";
  const isDark = isDarkTheme !== undefined ? isDarkTheme : !isLight;

  // Smooth position interpolation for main robot
  const [animatedPos, setAnimatedPos] = useState<[number, number] | null>(
    robot && robot.lat && robot.lng ? [robot.lat, robot.lng] : null
  );
  const targetPosRef = useRef<[number, number] | null>(
    robot && robot.lat && robot.lng ? [robot.lat, robot.lng] : null
  );

  useEffect(() => {
    if (robot && robot.lat && robot.lng && Math.abs(robot.lat) <= 90) {
      targetPosRef.current = [robot.lat, robot.lng];
      if (!animatedPos) {
        setAnimatedPos([robot.lat, robot.lng]);
      }
    }
  }, [robot?.lat, robot?.lng]);

  // Smooth movement animation loop
  useEffect(() => {
    let animFrame: number;
    const animate = () => {
      if (targetPosRef.current && animatedPos) {
        const [targetLat, targetLng] = targetPosRef.current;
        const [curLat, curLng] = animatedPos;
        
        const dLat = targetLat - curLat;
        const dLng = targetLng - curLng;
        const dist = Math.sqrt(dLat * dLat + dLng * dLng);

        if (dist > 0.000001) {
          // Move 5% closer each frame for smooth fluid gliding
          const nextLat = curLat + dLat * 0.05;
          const nextLng = curLng + dLng * 0.05;
          setAnimatedPos([nextLat, nextLng]);
        }
      }
      animFrame = requestAnimationFrame(animate);
    };

    animFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animFrame);
  }, [animatedPos]);

  const tileUrl = isDark
    ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
    : "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png";

  const allRobots = useMemo(() => {
    if (robotsList && robotsList.length > 0) return robotsList;
    if (robot) return [robot];
    return [];
  }, [robotsList, robot]);

  // Default path coordinates for visualization
  const routePolyline = useMemo<[number, number][]>(() => {
    if (trail && trail.length > 1) return trail;
    return waypoints.map(w => [w.lat, w.lng]);
  }, [trail, waypoints]);

  return (
    <div
      className={`relative rounded-2xl overflow-hidden border border-surface-3 ${className}`}
      style={{ height, minHeight: height }}
    >
      <MapContainer
        center={animatedPos || CAMPUS_CENTER}
        zoom={17}
        scrollWheelZoom={true}
        style={{ height: "100%", width: "100%", background: isDark ? "#0A0A0A" : "#EBF6F0" }}
      >
        <MapResizer />
        <TileLayer
          key={isDark ? "dark-map" : "light-map"}
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url={tileUrl}
          subdomains={["a", "b", "c", "d"]}
        />

        {/* Route Polyline Trail */}
        {routePolyline.length > 1 && (
          <Polyline 
            positions={routePolyline} 
            pathOptions={{ 
              color: isDark ? "#84E000" : "#4B9600", 
              weight: 3.5, 
              opacity: 0.7,
              dashArray: "6, 8"
            }} 
          />
        )}

        {/* Waypoint Labels */}
        {waypoints.map((wp, i) => (
          <Marker key={i} position={[wp.lat, wp.lng]} icon={blockIcon(wp.label)}>
            <Popup>
              <div className="font-bold text-caption text-[#0F172A]">
                📍 Campus Building: {wp.label}
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Multiple Fleet Robots */}
        {allRobots.map((r, idx) => {
          const pos: [number, number] = (idx === 0 && animatedPos) ? animatedPos : [r.lat, r.lng];
          return (
            <Marker key={r.id || idx} position={pos} icon={robotIcon(r.heading ?? 45, true)}>
              <Popup>
                <div className="p-1 text-caption space-y-1">
                  <p className="font-extrabold text-[#0F172A]">{r.name || `DSR Bot #${r.id || idx + 1}`}</p>
                  <p className="text-micro font-bold text-gray-500 capitalize">Status: {r.status || "IDLE"}</p>
                </div>
              </Popup>
            </Marker>
          );
        })}

        {animatedPos && <FollowRobot position={animatedPos} follow={followRobot} />}
      </MapContainer>

      <div className="absolute top-3 right-3 z-[400] bg-surface-1/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-surface-3 text-micro font-bold text-brand-white pointer-events-none shadow-md flex items-center space-x-2">
        <span className="h-2 w-2 rounded-full bg-brand-lime animate-ping" />
        <span>Silver Oak Live Campus Telemetry</span>
      </div>
    </div>
  );
}
