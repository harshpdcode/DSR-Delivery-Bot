"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/store/authStore";
import { 
  Bot, 
  LayoutDashboard, 
  PlusSquare, 
  BarChart3, 
  Bell, 
  Settings as SettingsIcon, 
  LogOut, 
  Menu, 
  X, 
  User as UserIcon,
  PackageCheck
} from "lucide-react";
import { toast } from "sonner";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, token, logout, loading } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!loading && !token) {
      toast.error("Please login to access the dashboard.");
      router.push("/login");
    }
  }, [user, token, loading, router]);

  if (loading || !token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-0">
        <div className="relative flex flex-col items-center">
          <LoaderSpinner />
          <p className="mt-4 text-brand-gray/60 font-medium">Verifying access...</p>
        </div>
      </div>
    );
  }

  const handleLogout = () => {
    logout();
    toast.success("Successfully logged out.");
    router.push("/login");
  };

  const navItems = [
    { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
    { name: "Fleet Management", href: "/dashboard/robots", icon: Bot },
    { name: "Request Delivery", href: "/dashboard/delivery/new", icon: PlusSquare },
    { name: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
    { name: "Notifications", href: "/dashboard/notifications", icon: Bell },
    { name: "Settings", href: "/dashboard/settings", icon: SettingsIcon },
  ];

  return (
    <div className="min-h-screen bg-surface-0 flex">
      {/* â”€â”€ Sidebar (Desktop) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <aside className="hidden md:flex md:w-64 flex-col bg-surface-1 border-r border-surface-3 shrink-0">
        <div className="p-6 border-b border-surface-3 flex items-center space-x-2">
          <Bot className="h-7 w-7 text-brand-lime animate-robot-move" />
          <span className="text-lg font-bold tracking-wider text-brand-white">
            DSR Delivery <span className="text-brand-lime">Bot</span>
          </span>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-body font-semibold transition-all ${
                  isActive
                    ? "bg-brand-lime/10 text-brand-lime border-l-2 border-brand-lime"
                    : "text-brand-gray/60 hover:text-brand-white hover:bg-surface-2"
                }`}
              >
                <item.icon className="h-5 w-5" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* User Card & Logout */}
        <div className="p-4 border-t border-surface-3 bg-surface-2/30">
          <div className="flex items-center space-x-3 mb-4">
            <div className="h-10 w-10 rounded-full bg-brand-lime/10 border border-brand-lime/20 flex items-center justify-center text-brand-lime font-bold">
              {user?.full_name?.charAt(0).toUpperCase() || "U"}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-caption font-bold text-brand-white truncate">{user?.full_name}</p>
              <p className="text-micro text-brand-gray/40 capitalize">{user?.role}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-2 px-4 py-2.5 rounded-lg border border-surface-4 text-brand-gray/60 hover:text-status-error hover:bg-status-error/10 hover:border-status-error/20 transition-colors text-caption font-bold"
          >
            <LogOut className="h-4.5 w-4.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* â”€â”€ Mobile Sidebar Drawer â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden bg-surface-0/80 backdrop-blur-sm">
          <aside className="w-64 bg-surface-1 border-r border-surface-3 flex flex-col h-full">
            <div className="p-6 border-b border-surface-3 flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <Bot className="h-7 w-7 text-brand-lime" />
                <span className="text-lg font-bold tracking-wider text-brand-white">DSR Delivery Bot</span>
              </div>
              <button onClick={() => setSidebarOpen(false)} className="text-brand-gray">
                <X className="h-6 w-6" />
              </button>
            </div>
            <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-body font-semibold transition-all ${
                      isActive
                        ? "bg-brand-lime/10 text-brand-lime border-l-2 border-brand-lime"
                        : "text-brand-gray/60 hover:text-brand-white hover:bg-surface-2"
                    }`}
                  >
                    <item.icon className="h-5 w-5" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>
            <div className="p-4 border-t border-surface-3">
              <button
                onClick={handleLogout}
                className="w-full flex items-center space-x-2 px-4 py-2.5 rounded-lg border border-surface-4 text-brand-gray/60 hover:text-status-error hover:bg-status-error/10 hover:border-status-error/20 transition-colors text-caption font-bold"
              >
                <LogOut className="h-4.5 w-4.5" />
                <span>Sign Out</span>
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* â”€â”€ Main Content Area â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
        {/* Header */}
        <header className="h-16 bg-surface-1 border-b border-surface-3 flex items-center justify-between px-6 shrink-0 z-20">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden text-brand-gray focus:outline-none"
            >
              <Menu className="h-6 w-6" />
            </button>
            <h2 className="text-title font-bold text-brand-white tracking-tight">
              {navItems.find((item) => item.href === pathname)?.name || "Dashboard"}
            </h2>
          </div>

          <div className="flex items-center space-x-4">
            {/* Quick action button */}
            <Link 
              href="/dashboard/delivery/new" 
              className="hidden sm:flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-brand-lime text-brand-black text-caption font-bold hover:shadow-glow-lime transition-all"
            >
              <PlusSquare className="h-4 w-4" />
              <span>New Delivery</span>
            </Link>

            {/* Notification Badge */}
            <Link href="/dashboard/notifications" className="relative p-2 rounded-lg bg-surface-2 hover:bg-surface-3 transition-colors text-brand-gray hover:text-brand-lime">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1 right-1 h-2.5 w-2.5 bg-brand-lime rounded-full ring-2 ring-surface-1" />
            </Link>
          </div>
        </header>

        {/* Inner Content with custom scrollbar behavior */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 bg-surface-0 bg-grid">
          {children}
        </main>
      </div>
    </div>
  );
}

function LoaderSpinner() {
  return (
    <div className="relative">
      <div className="h-10 w-10 rounded-full border-2 border-surface-3" />
      <div className="absolute inset-0 h-10 w-10 rounded-full border-t-2 border-brand-lime animate-spin" />
    </div>
  );
}
