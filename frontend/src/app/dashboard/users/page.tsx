"use client";

import { useState, useEffect } from "react";
import RoleGuard from "@/components/RoleGuard";
import { useAuthStore } from "@/store/authStore";
import { 
  Users, 
  Search, 
  Shield, 
  UserCheck, 
  UserX, 
  UserPlus, 
  Loader2, 
  Check, 
  X,
  Crown,
  User as UserIcon,
  RefreshCw
} from "lucide-react";
import { toast } from "sonner";

function UserManagementContent() {
  const { token, user: currentUser } = useAuthStore();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      let url = "/api/v1/users";
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (roleFilter) params.append("role_filter", roleFilter);
      if (params.toString()) url += `?${params.toString()}`;

      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        throw new Error("Failed to fetch users or insufficient admin permissions");
      }

      const data = await res.json();
      setUsers(data);
    } catch (err: any) {
      toast.error(err.message || "Failed to load user list");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchUsers();
  }, [token, roleFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchUsers();
  };

  const handleRoleChange = async (targetUserId: number, newRole: string) => {
    setUpdatingId(targetUserId);
    try {
      const res = await fetch(`/api/v1/users/${targetUserId}/role`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ role: newRole }),
      });

      if (!res.ok) throw new Error("Failed to update user role");
      const updatedUser = await res.json();

      setUsers((prev) =>
        prev.map((u) => (u.id === targetUserId ? updatedUser : u))
      );
      toast.success(`Updated role for ${updatedUser.full_name} to ${newRole.toUpperCase()}`);
    } catch (err: any) {
      toast.error(err.message || "Could not update user role");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleStatusToggle = async (targetUserId: number, currentStatus: boolean) => {
    setUpdatingId(targetUserId);
    try {
      const res = await fetch(`/api/v1/users/${targetUserId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ is_active: !currentStatus }),
      });

      if (!res.ok) throw new Error("Failed to update user status");
      const updatedUser = await res.json();

      setUsers((prev) =>
        prev.map((u) => (u.id === targetUserId ? updatedUser : u))
      );
      toast.success(
        `Account for ${updatedUser.full_name} is now ${updatedUser.is_active ? "ACTIVE" : "DEACTIVATED"}`
      );
    } catch (err: any) {
      toast.error(err.message || "Could not update user status");
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-display font-extrabold tracking-tight">{"User Management"}</h1>
            <span className="px-2.5 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-caption font-bold flex items-center space-x-1">
              <Shield className="h-3.5 w-3.5" />
              <span>{"Admin Control Center"}</span>
            </span>
          </div>
          <p className="text-body text-brand-gray/60 mt-1">
            {"View user roles, update permissions, and manage account statuses across Silver Oak University."}
          </p>
        </div>

        <button
          onClick={fetchUsers}
          className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-surface-2 hover:bg-surface-3 border border-surface-4 text-brand-white font-bold transition-all"
        >
          <RefreshCw className="h-4 w-4 text-brand-lime" />
          <span>{"Refresh List"}</span>
        </button>
      </div>

      {/* Filters and Search Bar */}
      <div className="glassmorphism rounded-2xl p-6 border border-surface-4 flex flex-col md:flex-row gap-4 justify-between items-center">
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-96">
          <Search className="absolute left-3.5 top-3 h-5 w-5 text-brand-gray/40" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, or phone..."
            className="w-full bg-surface-1 border border-surface-4 focus:border-brand-lime focus:outline-none rounded-xl py-2.5 pl-11 pr-4 text-body text-brand-white transition-colors"
          />
        </form>

        <div className="flex items-center space-x-4 w-full md:w-auto">
          <label className="text-caption font-semibold text-brand-white/60 whitespace-nowrap">
            {"Filter Role:"}
          </label>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="bg-surface-1 border border-surface-4 focus:border-brand-lime focus:outline-none rounded-xl py-2.5 px-4 text-caption text-brand-white transition-colors cursor-pointer"
          >
            <option value="">{"All Roles"}</option>
            <option value="admin">{"Admins Only"}</option>
            <option value="user">{"Standard Users"}</option>
          </select>
        </div>
      </div>

      {/* Users Data Table */}
      <div className="glassmorphism rounded-3xl border border-surface-4 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16 text-brand-gray/50 space-x-2">
            <Loader2 className="h-6 w-6 animate-spin text-brand-lime" />
            <span className="text-body font-medium">{"Querying user database..."}</span>
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-16 text-brand-gray/50 space-y-2">
            <Users className="h-10 w-10 mx-auto text-brand-gray/30" />
            <p className="text-body font-semibold">{"No users found matching query."}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-2/60 border-b border-surface-4 text-micro font-extrabold uppercase tracking-wider text-brand-white/60">
                  <th className="py-4 px-6">{"User Profile"}</th>
                  <th className="py-4 px-6">{"Contact Phone"}</th>
                  <th className="py-4 px-6">{"Current Role"}</th>
                  <th className="py-4 px-6">{"Account Status"}</th>
                  <th className="py-4 px-6 text-right">{"Admin Actions"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-3/50 text-caption font-semibold">
                {users.map((u) => {
                  const isAdmin = u.role === "admin" || u.role === "operator";
                  const isBusy = updatingId === u.id;
                  const isSelf = currentUser?.id === u.id;

                  return (
                    <tr key={u.id} className="hover:bg-surface-2/30 transition-colors">
                      {/* Name & Email */}
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-3">
                          <div className={`h-10 w-10 rounded-xl flex items-center justify-center font-bold text-body shrink-0 ${
                            isAdmin 
                              ? "bg-purple-500/20 text-purple-400 border border-purple-500/30" 
                              : "bg-brand-lime/20 text-brand-lime border border-brand-lime/30"
                          }`}>
                            {u.full_name?.charAt(0).toUpperCase() || "U"}
                          </div>
                          <div>
                            <div className="flex items-center space-x-1.5">
                              <span className="font-bold text-brand-white">{u.full_name}</span>
                              {isSelf && (
                                <span className="text-[10px] px-1.5 py-0.2 rounded bg-brand-lime/20 text-brand-lime font-bold">
                                  {"(You)"}
                                </span>
                              )}
                            </div>
                            <span className="text-micro text-brand-white/60 block">{u.email}</span>
                          </div>
                        </div>
                      </td>

                      {/* Phone */}
                      <td className="py-4 px-6 text-brand-white/70">
                        {u.phone || "N/A"}
                      </td>

                      {/* Role Badge */}
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-micro font-extrabold capitalize ${
                          isAdmin
                            ? "bg-purple-500/15 text-purple-400 border border-purple-500/30"
                            : "bg-brand-lime/10 text-brand-lime border border-brand-lime/20"
                        }`}>
                          {isAdmin ? <Crown className="h-3 w-3" /> : <UserIcon className="h-3 w-3" />}
                          <span>{u.role}</span>
                        </span>
                      </td>

                      {/* Account Status Badge */}
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-md text-micro font-bold ${
                          u.is_active
                            ? "bg-status-success/15 text-status-success border border-status-success/20"
                            : "bg-status-error/15 text-status-error border border-status-error/20"
                        }`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${u.is_active ? "bg-status-success" : "bg-status-error"}`} />
                          <span>{u.is_active ? "Active" : "Deactivated"}</span>
                        </span>
                      </td>

                      {/* Admin Actions */}
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          {isBusy ? (
                            <Loader2 className="h-5 w-5 animate-spin text-brand-lime" />
                          ) : (
                            <>
                              {/* Toggle Role Button */}
                              <button
                                onClick={() => handleRoleChange(u.id, isAdmin ? "user" : "admin")}
                                disabled={isSelf}
                                className="px-3 py-1.5 rounded-lg border border-surface-4 bg-surface-2 hover:bg-surface-3 text-brand-gray hover:text-brand-white text-micro font-bold transition-all disabled:opacity-30"
                                title={isAdmin ? "Demote to Standard User" : "Promote to Admin"}
                              >
                                {isAdmin ? "Demote to User" : "Make Admin"}
                              </button>

                              {/* Toggle Status Button */}
                              <button
                                onClick={() => handleStatusToggle(u.id, u.is_active)}
                                disabled={isSelf}
                                className={`px-3 py-1.5 rounded-lg text-micro font-bold transition-all border disabled:opacity-30 ${
                                  u.is_active
                                    ? "border-status-error/30 text-status-error hover:bg-status-error/10"
                                    : "border-status-success/30 text-status-success hover:bg-status-success/10"
                                }`}
                              >
                                {u.is_active ? "Deactivate" : "Activate"}
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default function UserManagementPage() {
  return (
    <RoleGuard roles={["admin", "operator"]}>
      <UserManagementContent />
    </RoleGuard>
  );
}
