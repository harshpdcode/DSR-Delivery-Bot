# Real Campus Map — Setup Instructions

## 1. Install dependencies
In your `frontend/` folder run:
```
npm install leaflet react-leaflet @types/leaflet
```

## 2. Add the new files
- `src/components/CampusMap.tsx` → drop into your `frontend/src/components/` folder (new file).
- `src/app/dashboard/simulator/page.tsx` → replace your existing file with this one
  (it now imports the real map instead of the fake SVG grid).

## 3. What changed
- Real interactive Leaflet map using free OpenStreetMap/CARTO dark tiles — no API key needed.
- Centered on Silver Oak University's real coordinates (23.0906° N, 72.5344° E, Gota, Ahmedabad).
- Dark map + lime (#C6FF00) markers matching your existing Ather-inspired brand theme
  (already defined in tailwind.config.js: brand.lime, surface.0–4).
- Robot marker pulses and glows, auto-pans while "dispatched", shows block popups on click.
- WAYPOINTS lat/lng in the simulator were placeholders (~5km off) — replaced with real
  campus-area coordinates. You should fine-tune the 6 block positions:
  1. Open Google Maps, find your actual A/B/C/D/E block + canteen locations on campus.
  2. Right-click each → copy the lat/lng shown.
  3. Paste into `CAMPUS_WAYPOINTS` (CampusMap.tsx) and `WAYPOINTS` (simulator page.tsx).

## 4. Reuse elsewhere
`CampusMap` is a standalone, reusable component — you can drop it into
`dashboard/delivery/[id]/page.tsx` (the live tracking page) too:
```tsx
import dynamic from "next/dynamic";
const CampusMap = dynamic(() => import("@/components/CampusMap"), { ssr: false });

<CampusMap
  robot={{ lat: robot.lat, lng: robot.lng, heading: robot.heading }}
  trail={pastPositions}       // optional: array of [lat, lng] pairs
  followRobot
  height="400px"
/>
```

## Verified
- `npx tsc --noEmit` passes cleanly with these changes.
- `npm install` completes with no peer-dependency conflicts (react-leaflet v5 targets React 19,
  which matches your Next.js 15 / React 19 stack).
