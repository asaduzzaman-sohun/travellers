"use client";

import React, { useState } from "react";
import { Search, Shield, ShieldCheck, User as UserIcon, Calendar, Phone, CreditCard } from "lucide-react";
import { SystemUser } from "@/lib/api";
import { useToast } from "@/lib/toast-context";

interface UsersTabProps {
  usersList: SystemUser[];
  isSuperAdmin: boolean;
  handleRoleChange: (userId: string, newRole: string) => void;
}

export function UsersTab({
  usersList,
  isSuperAdmin,
  handleRoleChange,
}: UsersTabProps) {
  const { toast } = useToast();
  const [userSearch, setUserSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  const filteredUsers = usersList.filter((u) => {
    const matchesSearch =
      u.fullName.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
      (u.nidOrPassport && u.nidOrPassport.toLowerCase().includes(userSearch.toLowerCase())) ||
      (u.phoneNumber && u.phoneNumber.toLowerCase().includes(userSearch.toLowerCase()));

    const matchesRole =
      roleFilter === "all" || u.role.toLowerCase() === roleFilter.toLowerCase();

    return matchesSearch && matchesRole;
  });

  const getRoleBadge = (role: string) => {
    switch (role?.toLowerCase()) {
      case "superadmin":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800/50">
            <ShieldCheck className="h-3 w-3 text-purple-600 dark:text-purple-400" />
            <span>SuperAdmin</span>
          </span>
        );
      case "admin":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 dark:bg-slate-800/80 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700">
            <Shield className="h-3 w-3 text-slate-600 dark:text-slate-400" />
            <span>Admin</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-normal bg-stone-50 dark:bg-stone-800/70 text-stone-600 dark:text-stone-300 border border-stone-200 dark:border-stone-700">
            <UserIcon className="h-3 w-3 text-stone-400" />
            <span>User</span>
          </span>
        );
    }
  };

  const getInitials = (name: string) => {
    if (!name) return "U";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <div className="bg-[#FFFFFF] dark:bg-[#0f121a] border border-[#E5E7EB] dark:border-[#1e2434] rounded-xl overflow-hidden shadow-xs">
      {/* Header and Filter Controls */}
      <div className="p-4 border-b border-[#E5E7EB] dark:border-[#1e2434] flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#FAFAFA] dark:bg-[#141720]">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#9CA3AF] dark:text-stone-400" />
          <input
            type="text"
            placeholder="Search by name, email, phone, NID..."
            value={userSearch}
            onChange={(e) => setUserSearch(e.target.value)}
            className="w-full bg-[#FFFFFF] dark:bg-[#12151d] border border-[#D1D5DB] dark:border-[#2a3142] rounded-md pl-9 pr-3 py-1.5 text-xs text-[#111827] dark:text-stone-100 focus:outline-none focus:border-[#111827] dark:focus:border-emerald-500"
          />
          {userSearch && (
            <button
              type="button"
              onClick={() => setUserSearch("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 text-[10px] cursor-pointer"
            >
              Clear
            </button>
          )}
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          {["all", "SuperAdmin", "Admin", "User"].map((role) => {
            const count =
              role === "all"
                ? usersList.length
                : usersList.filter((u) => u.role.toLowerCase() === role.toLowerCase()).length;
            const isActive = roleFilter.toLowerCase() === role.toLowerCase();

            return (
              <button
                key={role}
                onClick={() => setRoleFilter(role)}
                className={`px-2.5 py-1 rounded text-xs font-medium transition-colors cursor-pointer ${
                  isActive
                    ? "bg-[#111827] dark:bg-emerald-600 text-white"
                    : "bg-white dark:bg-[#141720] text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white border border-stone-200 dark:border-[#2a3142]"
                }`}
              >
                {role === "all" ? "All Users" : role} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Users Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-[#4B5563] dark:text-stone-300">
          <thead className="bg-[#F9FAFB] dark:bg-[#141720] border-b border-[#E5E7EB] dark:border-[#1e2434] text-[#111827] dark:text-stone-200 font-semibold">
            <tr>
              <th className="py-3 px-5">User Profile</th>
              <th className="py-3 px-5">System Role</th>
              <th className="py-3 px-5">Phone</th>
              <th className="py-3 px-5">NID / Passport</th>
              <th className="py-3 px-5">Registered Date</th>
              {isSuperAdmin && <th className="py-3 px-5 text-right">Role Governance</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E5E7EB] dark:divide-[#1e2434]">
            {filteredUsers.map((u) => (
              <tr key={u.id} className="hover:bg-[#F9FAFB] dark:hover:bg-[#161a25] transition-colors">
                <td className="py-3.5 px-5">
                  <div className="flex items-center gap-2.5">
                    <div className="h-7 w-7 rounded-full bg-stone-100 dark:bg-[#1a1f2e] border border-stone-200 dark:border-[#2a3142] flex items-center justify-center text-[11px] font-bold text-stone-700 dark:text-stone-200 shrink-0">
                      {getInitials(u.fullName)}
                    </div>
                    <div>
                      <div className="font-semibold text-[#111827] dark:text-stone-100">{u.fullName}</div>
                      <div className="text-[11px] text-[#6B7280] dark:text-stone-400">{u.email}</div>
                    </div>
                  </div>
                </td>
                <td className="py-3.5 px-5">{getRoleBadge(u.role)}</td>
                <td className="py-3.5 px-5 text-stone-600 dark:text-stone-300">
                  {u.phoneNumber ? (
                    <span className="inline-flex items-center gap-1 font-mono text-stone-700 dark:text-stone-300">
                      <Phone className="h-3 w-3 text-stone-400" />
                      {u.phoneNumber}
                    </span>
                  ) : (
                    <span className="text-stone-400">—</span>
                  )}
                </td>
                <td className="py-3.5 px-5 font-mono text-stone-600 dark:text-stone-300">
                  {u.nidOrPassport ? (
                    <span className="inline-flex items-center gap-1 text-stone-700 dark:text-stone-300">
                      <CreditCard className="h-3 w-3 text-stone-400" />
                      {u.nidOrPassport}
                    </span>
                  ) : (
                    <span className="text-stone-400">—</span>
                  )}
                </td>
                <td className="py-3.5 px-5 text-stone-600 dark:text-stone-300">
                  <span className="inline-flex items-center gap-1 text-stone-700 dark:text-stone-300">
                    <Calendar className="h-3 w-3 text-stone-400" />
                    {new Date(u.createdAt).toLocaleDateString()}
                  </span>
                </td>
                {isSuperAdmin && (
                  <td className="py-3.5 px-5 text-right">
                    <select
                      value={u.role}
                      onChange={(e) => {
                        const newRole = e.target.value;
                        handleRoleChange(u.id, newRole);
                        toast.success("Role Updated", `${u.fullName} is now assigned as ${newRole}.`);
                      }}
                      className="bg-[#FFFFFF] dark:bg-[#141720] border border-[#D1D5DB] dark:border-[#2a3142] rounded px-2.5 py-1 text-xs text-[#111827] dark:text-stone-200 font-medium focus:outline-none focus:border-[#111827] dark:focus:border-emerald-500 cursor-pointer"
                    >
                      <option value="User">User</option>
                      <option value="Admin">Admin</option>
                      <option value="SuperAdmin">SuperAdmin</option>
                    </select>
                  </td>
                )}
              </tr>
            ))}
            {filteredUsers.length === 0 && (
              <tr>
                <td colSpan={isSuperAdmin ? 6 : 5} className="py-12 text-center">
                  <div className="max-w-xs mx-auto flex flex-col items-center justify-center text-center space-y-2">
                    <div className="h-10 w-10 rounded-full bg-stone-100 dark:bg-stone-800 flex items-center justify-center text-stone-400">
                      <UserIcon className="h-5 w-5" />
                    </div>
                    <p className="text-xs font-semibold text-stone-900 dark:text-stone-100">No users found</p>
                    <p className="text-[11px] text-stone-500 dark:text-stone-400">
                      No registered accounts match your current query.
                    </p>
                    {(userSearch || roleFilter !== "all") && (
                      <button
                        onClick={() => {
                          setUserSearch("");
                          setRoleFilter("all");
                        }}
                        className="mt-2 text-xs font-medium text-stone-800 dark:text-emerald-400 underline hover:text-stone-950 dark:hover:text-emerald-300 cursor-pointer"
                      >
                        Reset Search
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
