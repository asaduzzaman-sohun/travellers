"use client";

import React from "react";
import Link from "next/link";
import { LogOut, X, LucideIcon, ArrowLeft, Globe } from "lucide-react";

export interface NavItem {
  id: string;
  label: string;
  icon: LucideIcon;
}

interface DashboardSidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  isSuperAdmin: boolean;
  isAdmin: boolean;
  navItems: NavItem[];
  activeTab: string;
  handleTabChange: (tabId: string) => void;
  avatarUrl?: string;
  user: {
    fullName: string;
    email: string;
  };
  logout: () => void;
}

export function DashboardSidebar({
  sidebarOpen,
  setSidebarOpen,
  isSuperAdmin,
  isAdmin,
  navItems,
  activeTab,
  handleTabChange,
  avatarUrl,
  user,
  logout,
}: DashboardSidebarProps) {
  return (
    <>
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black/40 backdrop-blur-xs z-40 lg:hidden"
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-[#FFFFFF] dark:bg-[#0c0f16] border-r border-[#E5E7EB] dark:border-[#1e2434] flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Top Header Logo */}
        <div className="h-16 px-5 border-b border-[#E5E7EB] dark:border-[#1e2434] flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="h-7 w-7 bg-[#111827] dark:bg-emerald-600 rounded-md flex items-center justify-center text-white text-xs font-bold tracking-wider group-hover:bg-black dark:group-hover:bg-emerald-500 transition-colors">
              TF
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-sm tracking-tight text-[#111827] dark:text-stone-100 leading-tight">
                Traveller Console
              </span>
              <span className="text-[10px] text-[#6B7280] dark:text-stone-400 font-medium leading-tight">
                TourFlow Management
              </span>
            </div>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-[#4B5563] dark:text-stone-400 hover:text-[#111827] dark:hover:text-white p-1 rounded-md cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Quick Portal Switcher */}
        <div className="px-3 py-2.5 border-b border-[#E5E7EB] dark:border-[#1e2434] bg-[#F9FAFB]/70 dark:bg-[#0f121a]">
          <Link
            href="/"
            className="flex items-center justify-between px-3 py-2 rounded-md text-xs font-medium text-[#4B5563] dark:text-stone-300 hover:text-[#111827] dark:hover:text-white hover:bg-[#FFFFFF] dark:hover:bg-[#161a25] hover:border-[#E5E7EB] dark:hover:border-[#2a3142] border border-transparent transition-all shadow-2xs group"
          >
            <span className="flex items-center gap-2">
              <ArrowLeft className="h-3.5 w-3.5 text-[#9CA3AF] dark:text-stone-400 group-hover:text-[#111827] dark:group-hover:text-white group-hover:-translate-x-0.5 transition-transform" />
              <span>Back to Main Website</span>
            </span>
            <Globe className="h-3.5 w-3.5 text-[#9CA3AF] dark:text-stone-400" />
          </Link>
        </div>

        {/* Current Role Indicator */}
        <div className="px-4 py-2.5 border-b border-[#E5E7EB] dark:border-[#1e2434] bg-[#FFFFFF] dark:bg-[#0c0f16]">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-wider text-[#6B7280] dark:text-stone-400 font-semibold">
              Security Level
            </span>
            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
              isSuperAdmin
                ? "bg-stone-900 dark:bg-emerald-950/60 text-white dark:text-emerald-300 border-stone-900 dark:border-emerald-500/40"
                : isAdmin
                ? "bg-teal-50 dark:bg-teal-950/40 text-teal-800 dark:text-teal-300 border-teal-200 dark:border-teal-500/40"
                : "bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-700"
            }`}>
              {isSuperAdmin ? "Super Admin" : isAdmin ? "Admin" : "Traveler"}
            </span>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleTabChange(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-medium rounded-md transition-colors text-left cursor-pointer ${
                  isActive
                    ? "bg-[#F3F4F6] dark:bg-[#1f2536] text-[#111827] dark:text-white font-semibold shadow-2xs"
                    : "text-[#4B5563] dark:text-stone-300 hover:bg-[#F9FAFB] dark:hover:bg-[#161a25] hover:text-[#111827] dark:hover:text-white"
                }`}
              >
                <Icon className={`h-4 w-4 shrink-0 ${isActive ? "text-[#111827] dark:text-amber-400" : "text-[#6B7280] dark:text-stone-400"}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer User Card */}
        <div className="p-4 border-t border-[#E5E7EB] dark:border-[#1e2434] bg-[#FFFFFF] dark:bg-[#0c0f16]">
          <div className="flex items-center gap-3">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={user.fullName}
                className="h-8 w-8 rounded-full object-cover border border-[#E5E7EB] dark:border-[#2a3142]"
              />
            ) : (
              <div className="h-8 w-8 rounded-full bg-[#111827] dark:bg-emerald-600 text-white flex items-center justify-center text-xs font-bold">
                {user.fullName ? user.fullName[0].toUpperCase() : "U"}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-[#111827] dark:text-stone-100 truncate leading-tight">
                {user.fullName}
              </p>
              <p className="text-[11px] text-[#6B7280] dark:text-stone-400 truncate leading-none mt-0.5">
                {user.email}
              </p>
            </div>
            <button
              onClick={() => logout()}
              title="Sign Out"
              className="text-[#6B7280] dark:text-stone-400 hover:text-[#DC2626] dark:hover:text-rose-400 transition-colors p-1 cursor-pointer"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
