"use client";

import { useEffect, useState, useRef } from "react";
import { useAuthStore } from "@/store/authStore";
import {
  Bell,
  Check,
  Trash2,
  AlertTriangle,
  Info,
  CheckCircle2,
  Clock,
  Radio,
  Share2
} from "lucide-react";
import { toast } from "sonner";

import { getWsUrl } from "@/lib/ws";

interface NotificationItem {
  id: string;
  title: string;
  body: string;
  type: "info" | "success" | "warning" | "error";
  read: boolean;
  timestamp: Date;
}

export default function NotificationsPage() {
  const { user, token } = useAuthStore();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const socketRef = useRef<WebSocket | null>(null);

  // Pre-seed mock history for visual completeness
  useEffect(() => {
    const saved = localStorage.getItem(`notifications_${user?.id}`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Convert timestamp strings back to Date objects
        setNotifications(
          parsed.map((n: any) => ({ ...n, timestamp: new Date(n.timestamp) }))
        );
        return;
      } catch (e) {
        // Fallback to defaults
      }
    }

    const defaultNotifications: NotificationItem[] = [
      {
        id: "mock-1",
        title: "Robot DSR-Alpha Dispatched",
        body: "Mission SOU-9821 has started. Robot is en route to B Block.",
        type: "info",
        read: false,
        timestamp: new Date(Date.now() - 5 * 60 * 1000), // 5 min ago
      },
      {
        id: "mock-2",
        title: "OTP Verification Required",
        body: "Robot DSR-Beta has arrived at E Block. OTP generated for secure unlock.",
        type: "warning",
        read: false,
        timestamp: new Date(Date.now() - 25 * 60 * 1000), // 25 min ago
      },
      {
        id: "mock-3",
        title: "Delivery Completed Successfully",
        body: "Package for 'Prof. Amit' at A Block has been verified and collected.",
        type: "success",
        read: true,
        timestamp: new Date(Date.now() - 2 * 3600 * 1000), // 2 hours ago
      },
      {
        id: "mock-4",
        title: "System Maintenance Alert",
        body: "Robot DSR-Gamma has been flagged for routine wheel encoder calibration.",
        type: "error",
        read: true,
        timestamp: new Date(Date.now() - 24 * 3600 * 1000), // 1 day ago
      },
    ];

    setNotifications(defaultNotifications);
    localStorage.setItem(
      `notifications_${user?.id}`,
      JSON.stringify(defaultNotifications)
    );
  }, [user]);

  // Save to localStorage helper
  const saveNotifications = (items: NotificationItem[]) => {
    setNotifications(items);
    localStorage.setItem(`notifications_${user?.id}`, JSON.stringify(items));
  };

  // Live WebSocket Connection
  useEffect(() => {
    if (!user?.id || !token) return;

    let isMounted = true;
    let reconnectTimer: NodeJS.Timeout | null = null;

    const connectWs = () => {
      if (!isMounted) return;

      const wsUrl = getWsUrl(`/ws/notifications/${user.id}`);
      const socket = new WebSocket(wsUrl);
      socketRef.current = socket;

      socket.onopen = () => {
        if (isMounted) {
          console.log("Notification Socket Connected");
        }
      };

      socket.onmessage = (event) => {
        if (!isMounted) return;
        try {
          const msg = JSON.parse(event.data);
          
          // Skip pings
          if (msg.type === "pong") return;

          const newNotification: NotificationItem = {
            id: msg.id || `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            title: msg.title || "Alert Broadcast",
            body: msg.body || "A telemetry event or status change was recorded.",
            type: msg.type || "info",
            read: false,
            timestamp: new Date(),
          };

          // Trigger Sonner toast
          if (newNotification.type === "success") {
            toast.success(newNotification.title, { description: newNotification.body });
          } else if (newNotification.type === "error") {
            toast.error(newNotification.title, { description: newNotification.body });
          } else {
            toast(newNotification.title, { description: newNotification.body });
          }

          setNotifications((prev) => {
            const updated = [newNotification, ...prev];
            localStorage.setItem(`notifications_${user.id}`, JSON.stringify(updated));
            return updated;
          });
        } catch (e) {
          console.error("Failed to parse WebSocket notification:", e);
        }
      };

      socket.onclose = () => {
        if (isMounted) {
          reconnectTimer = setTimeout(connectWs, 5000);
        }
      };

      socket.onerror = () => {
        if (socket.readyState === WebSocket.OPEN) {
          socket.close();
        }
      };
    };

    connectWs();

    return () => {
      isMounted = false;
      if (reconnectTimer) clearTimeout(reconnectTimer);
      if (socketRef.current) {
        socketRef.current.onopen = null;
        socketRef.current.onmessage = null;
        socketRef.current.onclose = null;
        socketRef.current.onerror = null;
        if (
          socketRef.current.readyState === WebSocket.OPEN ||
          socketRef.current.readyState === WebSocket.CONNECTING
        ) {
          socketRef.current.close();
        }
        socketRef.current = null;
      }
    };
  }, [user, token]);

  const handleMarkAllRead = () => {
    const updated = notifications.map((n) => ({ ...n, read: true }));
    saveNotifications(updated);
    toast.success("All notifications marked as read");
  };

  const handleMarkRead = (id: string) => {
    const updated = notifications.map((n) =>
      n.id === id ? { ...n, read: true } : n
    );
    saveNotifications(updated);
  };

  const handleDelete = (id: string) => {
    const updated = notifications.filter((n) => n.id !== id);
    saveNotifications(updated);
    toast.success("Notification dismissed");
  };

  const handleClearAll = () => {
    saveNotifications([]);
    toast.success("All notifications cleared");
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "success":
        return <CheckCircle2 className="h-5 w-5 text-status-success" />;
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-brand-yellow" />;
      case "error":
        return <AlertTriangle className="h-5 w-5 text-status-error" />;
      default:
        return <Info className="h-5 w-5 text-status-info" />;
    }
  };

  const getBorderColor = (type: string, read: boolean) => {
    if (read) return "border-surface-4/40 opacity-70";
    switch (type) {
      case "success":
        return "border-status-success/30 bg-status-success/5";
      case "warning":
        return "border-brand-yellow/30 bg-brand-yellow/5";
      case "error":
        return "border-status-error/30 bg-status-error/5";
      default:
        return "border-status-info/30 bg-status-info/5";
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <div className="flex items-center space-x-3 flex-wrap gap-2">
            <h1 className="text-display font-extrabold tracking-tight text-brand-white">Alerts & Notifications</h1>
            {unreadCount > 0 && (
              <span className="shrink-0 whitespace-nowrap text-caption font-extrabold bg-brand-lime text-brand-black px-3 py-1 rounded-full border border-brand-lime/40 shadow-xs inline-flex items-center gap-1">
                {unreadCount} New
              </span>
            )}
          </div>
          <p className="text-body text-brand-gray/50 mt-1">
            Monitor real-time system alerts, delivery completions, and security warnings.
          </p>
        </div>
        
        {notifications.length > 0 && (
          <div className="flex items-center space-x-3">
            <button
              onClick={handleMarkAllRead}
              className="px-4 py-2 rounded-lg bg-surface-2 hover:bg-surface-3 border border-surface-4 text-caption font-bold text-brand-white transition-all flex items-center space-x-2"
            >
              <Check className="h-4 w-4 text-brand-lime" />
              <span>Mark All Read</span>
            </button>
            <button
              onClick={handleClearAll}
              className="px-4 py-2 rounded-lg bg-surface-2 hover:bg-surface-3 border border-surface-4 text-caption font-bold text-brand-white hover:text-status-error hover:border-status-error/20 transition-all flex items-center space-x-2"
            >
              <Trash2 className="h-4 w-4" />
              <span>Clear All</span>
            </button>
          </div>
        )}
      </div>

      {/* Notifications List */}
      {notifications.length === 0 ? (
        <div className="text-center py-20 glassmorphism rounded-3xl border border-surface-4 p-8 space-y-4">
          <div className="relative mx-auto h-16 w-16 bg-surface-1 rounded-full border border-surface-3 flex items-center justify-center text-brand-gray/20">
            <Bell className="h-8 w-8" />
          </div>
          <h3 className="text-title font-bold">All caught up!</h3>
          <p className="text-caption text-brand-gray/50 max-w-sm mx-auto">
            You have no pending notification alerts. Real-time updates will automatically appear here as they occur.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {notifications.map((item) => (
            <div
              key={item.id}
              className={`glassmorphism rounded-2xl border p-5 flex items-start justify-between space-x-4 transition-all duration-300 ${getBorderColor(
                item.type,
                item.read
              )}`}
            >
              <div className="flex items-start space-x-4 flex-1 min-w-0">
                <div className="p-2.5 rounded-xl bg-surface-1 border border-surface-3 shrink-0">
                  {getIcon(item.type)}
                </div>
                <div className="space-y-1 flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <h4 className={`text-caption font-extrabold text-brand-white truncate ${!item.read ? 'text-brand-lime' : ''}`}>
                      {item.title}
                    </h4>
                    {!item.read && (
                      <span className="h-2 w-2 rounded-full bg-brand-lime ring-2 ring-brand-lime/20" />
                    )}
                  </div>
                  <p className="text-caption text-brand-gray/60 leading-relaxed">
                    {item.body}
                  </p>
                  <div className="flex items-center space-x-1.5 pt-1 text-micro text-brand-gray/40">
                    <Clock className="h-3.5 w-3.5" />
                    <span>
                      {item.timestamp.toLocaleDateString()} at {item.timestamp.toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-2 shrink-0">
                {!item.read && (
                  <button
                    onClick={() => handleMarkRead(item.id)}
                    className="p-1.5 rounded bg-surface-1 hover:bg-surface-3 text-brand-gray hover:text-brand-lime border border-surface-4 transition-colors"
                    title="Mark as Read"
                    aria-label="Mark as read"
                  >
                    <Check className="h-4 w-4" />
                  </button>
                )}
                <button
                  onClick={() => handleDelete(item.id)}
                  className="p-1.5 rounded bg-surface-1 hover:bg-surface-3 text-brand-gray hover:text-status-error border border-surface-4 transition-colors"
                  title="Dismiss"
                  aria-label="Dismiss notification"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
