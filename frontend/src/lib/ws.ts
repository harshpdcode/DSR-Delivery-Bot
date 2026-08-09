/**
 * Helper utility to construct backend WebSocket URLs.
 * Handles local development (pointing directly to FastAPI backend on port 8000)
 * and production (reverse proxy / explicit environment variables).
 */
export function getWsUrl(path: string): string {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;

  // 1. Explicit NEXT_PUBLIC_WS_URL (e.g. "ws://localhost:8000/ws" or "ws://localhost:8000")
  if (process.env.NEXT_PUBLIC_WS_URL) {
    const baseUrl = process.env.NEXT_PUBLIC_WS_URL.replace(/\/+$/, "");
    if (baseUrl.endsWith("/ws") && cleanPath.startsWith("/ws/")) {
      return `${baseUrl}${cleanPath.substring(3)}`;
    }
    return `${baseUrl}${cleanPath}`;
  }

  // 2. Derive from NEXT_PUBLIC_API_URL (e.g. "http://localhost:8000/api/v1")
  if (process.env.NEXT_PUBLIC_API_URL) {
    try {
      const url = new URL(process.env.NEXT_PUBLIC_API_URL);
      const wsProtocol = url.protocol === "https:" ? "wss:" : "ws:";
      return `${wsProtocol}//${url.host}${cleanPath}`;
    } catch {
      // Fallback if URL parsing fails
    }
  }

  // 3. Browser fallback
  if (typeof window !== "undefined") {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";

    // In local dev on port 3000/3001, connect directly to FastAPI backend on port 8000
    if (
      (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") &&
      window.location.port !== "8000"
    ) {
      return `${protocol}//${window.location.hostname}:8000${cleanPath}`;
    }

    // Default to current host (e.g. production Nginx proxying /ws)
    return `${protocol}//${window.location.host}${cleanPath}`;
  }

  return `ws://localhost:8000${cleanPath}`;
}
