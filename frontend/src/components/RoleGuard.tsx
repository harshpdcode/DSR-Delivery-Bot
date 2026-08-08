"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { toast } from "sonner";
import { ShieldAlert } from "lucide-react";

type AllowedRole = "admin" | "operator" | "security" | "maintenance" | "user";

interface RoleGuardProps {
  /** Roles that are allowed to see this page. */
  roles: AllowedRole[];
  children: React.ReactNode;
}

/**
 * Wraps admin-only pages. If the logged-in user's role is not in `roles`,
 * they are redirected to /dashboard with a permission-denied toast.
 *
 * Usage:
 *   <RoleGuard roles={["admin", "operator"]}>
 *     <YourPage />
 *   </RoleGuard>
 */
export default function RoleGuard({ roles, children }: RoleGuardProps) {
  const { user, loading } = useAuthStore();
  const router = useRouter();

  const isAuthorized = user && roles.includes(user.role as AllowedRole);

  useEffect(() => {
    // Wait until auth state has resolved
    if (loading) return;
    if (!user) {
      toast.error("Please login to continue.");
      router.replace("/login");
      return;
    }
    if (!isAuthorized) {
      toast.error("You don't have permission to access this page.", {
        description: "This area is restricted to administrators.",
      });
      router.replace("/dashboard");
    }
  }, [loading, user, isAuthorized, router]);

  // While loading or unauthorized, show a neutral loading/blocked state
  if (loading || !isAuthorized) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        {!loading && user && !isAuthorized ? (
          // Show access denied UI briefly before redirect triggers
          <div className="flex flex-col items-center space-y-3 text-center">
            <div className="p-4 rounded-full bg-status-error/10 border border-status-error/20">
              <ShieldAlert className="h-8 w-8 text-status-error" />
            </div>
            <p className="text-body font-bold text-brand-white">Access Denied</p>
            <p className="text-caption text-brand-gray/50 max-w-xs">
              This page is restricted to administrators. Redirecting you back…
            </p>
          </div>
        ) : (
          // Generic spinner while auth resolves
          <div className="h-8 w-8 rounded-full border-2 border-surface-3 border-t-brand-lime animate-spin" />
        )}
      </div>
    );
  }

  return <>{children}</>;
}
