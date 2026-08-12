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
  PackageCheck,
  KeyRound,
  Users,
  Cpu,
  Sun,
  Moon
} from "lucide-react";
import { toast } from "sonner";
import InstallPwaPrompt from "@/components/InstallPwaPrompt";
import RobotMovingLoader from "@/components/RobotMovingLoader";
import { useThemeTransition } from "@/hooks/useThemeTransition";


export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, token, logout, loading } = useAuthStore();
  const { theme, toggleThemeWithTransition } = useThemeTransition();
  const router = useRouter();

  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mountedTimeout, setMountedTimeout] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMountedTimeout(true), 2500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!loading && !token && mountedTimeout) {
      toast.error("Please login to access the dashboard.");
      router.push("/login");
    }
  }, [user, token, loading, mountedTimeout, router]);

  const [hasUnread, setHasUnread] = useState(false);

  useEffect(() => {
    if (!user?.id) return;
    const checkUnread = () => {
      try {
        const saved = localStorage.getItem(`notifications_${user.id}`);
        if (saved) {
          const parsed = JSON.parse(saved);
          const unreadCount = parsed.filter((n: any) => n.read === false).length;
          setHasUnread(unreadCount > 0);
        } else {
          setHasUnread(true);
        }
      } catch (e) {
        setHasUnread(false);
      }
    };
    checkUnread();
  }, [user?.id, pathname]);

  if ((loading || !token) && !mountedTimeout) {
    return (
      <RobotMovingLoader
        fullScreen={true}
        label="Verifying DSR Go Access..."
        subtext="Connecting to Silver Oak Autonomous Robot Fleet..."
      />
    );
  }

  const handleLogout = () => {
    logout();
    toast.success("Successfully logged out.");
    router.push("/login");
  };

  const isAdminOrOperator = user?.role === "admin" || user?.role === "operator";

  // Items visible to ALL authenticated users
  const commonNavItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "OTP Parcel Unlock", href: "/dashboard/otp", icon: KeyRound },
    { name: "Request Delivery", href: "/dashboard/delivery/new", icon: PlusSquare },
    { name: "Notifications", href: "/dashboard/notifications", icon: Bell },
    { name: "Settings", href: "/dashboard/settings", icon: SettingsIcon },
  ];

  // Items visible ONLY to admin / operator roles
  const adminNavItems = isAdminOrOperator
    ? [
        { name: "Fleet Management", href: "/dashboard/robots", icon: Bot },
        { name: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
        { name: "Simulator", href: "/dashboard/simulator", icon: Cpu },
        { name: "User Management", href: "/dashboard/users", icon: Users },
      ]
    : [];

  const navItems = [...commonNavItems, ...adminNavItems];

  const mobileNavItems = [
    { name: "Dashboard", shortName: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Request Delivery", shortName: "Request", href: "/dashboard/delivery/new", icon: PlusSquare },
    { name: "OTP Parcel Unlock", shortName: "Unlock", href: "/dashboard/otp", icon: KeyRound },
    { name: "Notifications", shortName: "Alerts", href: "/dashboard/notifications", icon: Bell },
    ...(isAdminOrOperator ? [{ name: "Fleet Management", shortName: "Fleet", href: "/dashboard/robots", icon: Bot }] : []),
    { name: "Settings", shortName: "Settings", href: "/dashboard/settings", icon: SettingsIcon },
  ];

  return (
    <div className="h-screen bg-surface-0 text-brand-white flex overflow-hidden w-full">
      {/* ── Sidebar (Desktop: Fixed Permanently on Left) ── */}
      <aside className="hidden md:flex md:w-64 flex-col bg-surface-1 border-r border-surface-3 shrink-0 h-screen z-30">
        <div className="p-6 border-b border-surface-3 flex items-center space-x-3">
          <div className="relative w-9 h-9 rounded-xl bg-brand-lime/20 border border-brand-lime/30 flex items-center justify-center p-1">
            <img src="/Robo.webp" alt="DSR Bot" className="w-8 h-8 object-contain" />
          </div>
          <div>
            <span className="text-lg font-bold tracking-wider text-brand-white">
              DSR <span className="text-brand-lime">Go</span>
            </span>
            <p className="text-[10px] font-bold text-brand-gray/50 uppercase tracking-wider">Autonomous Fleet</p>
          </div>
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
        <div className="p-4 border-t border-surface-3 bg-surface-2/40">
          <div className="flex items-center space-x-3 mb-4">
            <div className="h-10 w-10 rounded-full bg-brand-lime/10 border border-brand-lime/20 flex items-center justify-center text-brand-lime font-bold">
              {user?.full_name?.charAt(0).toUpperCase() || "U"}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-caption font-bold text-brand-white truncate">{user?.full_name}</p>
              <p className="text-micro text-brand-gray/50 capitalize">{user?.role}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-2 px-4 py-2.5 rounded-lg border border-surface-4 text-brand-gray/60 hover:text-red-400 hover:bg-red-500/10 transition-colors text-caption font-bold"
          >
            <LogOut className="h-4.5 w-4.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* ── Main Content Area (Independently Scrollable) ── */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-surface-1 border-b border-surface-3 flex items-center justify-between px-4 sm:px-6 shrink-0 z-20">
          <div className="flex items-center space-x-2 sm:space-x-3 shrink-0 min-w-0">
            <div className="relative w-8 h-8 rounded-lg bg-brand-lime/20 flex items-center justify-center md:hidden p-0.5 border border-brand-lime/30 shrink-0">
              <img src="/Robo.webp" alt="DSR Bot" className="w-7 h-7 object-contain" />
            </div>
            <h2 className="text-body sm:text-title font-bold text-brand-white tracking-tight truncate max-w-[130px] sm:max-w-none shrink-0">
              {navItems.find((item) => item.href === pathname)?.name || "Dashboard"}
            </h2>
          </div>

          <div className="flex items-center space-x-1.5 sm:space-x-4 shrink-0">
            {/* Install PWA Button — Hidden on mobile screens to ensure zero header title overlap */}
            <div className="hidden sm:block">
              <InstallPwaPrompt />
            </div>

            {/* Quick action button */}
            <Link 
              href="/dashboard/delivery/new" 
              className="hidden sm:flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-brand-lime text-brand-black text-caption font-bold hover:shadow-glow-lime transition-all"
            >
              <PlusSquare className="h-4 w-4" />
              <span>New Delivery</span>
            </Link>

            {/* Theme Toggle Button */}
            <button
              onClick={(e) => {
                const nextTheme = theme === "light" ? "dark" : "light";
                toggleThemeWithTransition(nextTheme, e);
              }}
              className="p-2 rounded-lg bg-surface-2 hover:bg-surface-3 border border-surface-4 text-brand-white transition-all shadow-sm"
              aria-label="Toggle Theme"
              title="Toggle Light/Dark Theme"
            >
              {theme === "light" ? (
                <Sun className="h-5 w-5 text-amber-600 fill-amber-500/20" />
              ) : (
                <Moon className="h-5 w-5 text-brand-lime" />
              )}
            </button>

            {/* Notification Badge */}
            <Link href="/dashboard/notifications" className="relative p-2 rounded-lg bg-surface-2 hover:bg-surface-3 transition-colors text-brand-white hover:text-brand-lime" aria-label="Notifications">
              <Bell className="h-5 w-5" />
              {hasUnread && (
                <span className="absolute top-1 right-1 h-2.5 w-2.5 bg-brand-lime rounded-full ring-2 ring-surface-1" />
              )}
            </Link>

            {/* Mobile Sign Out Button */}
            <button
              onClick={handleLogout}
              className="p-2 rounded-lg bg-surface-2 hover:bg-surface-3 transition-colors text-brand-white hover:text-red-400 border border-surface-4 md:hidden"
              aria-label="Sign Out"
              title="Sign Out"
            >
              <LogOut className="h-5 w-5 text-red-400" />
            </button>
          </div>
        </header>


        {/* Inner Content (Scrolls independently) */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 bg-surface-0 bg-grid pb-28 md:pb-8">
          {children}
        </main>
      </div>

      {/* ── Mobile Bottom Navigation Bar (Phone View) ── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-[9999] bg-surface-1/95 backdrop-blur-xl border-t border-surface-3 px-2 py-1.5 flex items-center justify-around shadow-2xl">
        {mobileNavItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all relative ${
                isActive
                  ? "text-brand-lime font-extrabold scale-105"
                  : "text-brand-gray/60 hover:text-brand-white"
              }`}
            >
              <div className="relative">
                <Icon className={`h-5 w-5 ${isActive ? "text-brand-lime" : ""}`} />
                {item.href === "/dashboard/notifications" && hasUnread && (
                  <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-brand-lime ring-2 ring-surface-1" />
                )}
              </div>
              <span className="text-[10px] font-semibold mt-0.5 tracking-tight truncate max-w-[64px]">
                {item.shortName}
              </span>
              {isActive && (
                <span className="h-1 w-4 rounded-full bg-brand-lime mt-0.5 shadow-glow-lime" />
              )}
            </Link>
          );
        })}
      </nav>
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
