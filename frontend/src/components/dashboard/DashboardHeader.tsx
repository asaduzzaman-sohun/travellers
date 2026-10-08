"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Menu,
  ChevronRight,
  ChevronDown,
  RefreshCw,
  Settings,
  LogOut,
} from "lucide-react";
import { NavItem } from "./DashboardSidebar";

interface DashboardHeaderProps {
  setSidebarOpen: (open: boolean) => void;
  activeTab: string;
  navItems: NavItem[];
  handleTabChange: (tabId: string) => void;
  loadData: () => void;
  loading: boolean;
  avatarUrl?: string;
  user: {
    fullName: string;
    email: string;
  };
  logout: () => void;
}

export function DashboardHeader({
  setSidebarOpen,
  activeTab,
  navItems,
  handleTabChange,
  loadData,
  loading,
  avatarUrl,
  user,
  logout,
}: DashboardHeaderProps) {
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 h-16 bg-[#FFFFFF] border-b border-[#E5E7EB] flex items-center justify-between px-6 sm:px-8">
      {/* Left: Mobile Toggle + Breadcrumbs */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setSidebarOpen(true)}
          className="lg:hidden p-1.5 rounded-md border border-[#E5E7EB] text-[#4B5563] hover:text-[#111827]"
        >
          <Menu className="h-4 w-4" />
        </button>

        {/* Breadcrumb Path */}
        <div className="flex items-center gap-2 text-xs text-[#6B7280]">
          <span
            className="hover:text-[#111827] cursor-pointer"
            onClick={() => handleTabChange("overview")}
          >
            Dashboard
          </span>
          <ChevronRight className="h-3 w-3 text-[#9CA3AF]" />
          <span className="font-semibold text-[#111827] capitalize">
            {navItems.find((n) => n.id === activeTab)?.label || activeTab}
          </span>
        </div>
      </div>

      {/* Right: Actions + User Profile Dropdown */}
      <div className="flex items-center gap-2 sm:gap-3">
        <Link
          href="/"
          title="Visit Public Website"
          className="p-2 text-[#6B7280] hover:text-[#111827] rounded-md hover:bg-[#F9FAFB] transition-colors hidden sm:flex items-center gap-1.5 text-xs font-medium border border-transparent hover:border-[#E5E7EB]"
        >
          <span className="text-[11px] text-[#6B7280]">Web Portal</span>
        </Link>

        <button
          onClick={loadData}
          disabled={loading}
          title="Refresh Data"
          className="p-2 text-[#6B7280] hover:text-[#111827] rounded-md hover:bg-[#F9FAFB] transition-colors border border-transparent hover:border-[#E5E7EB]"
        >
          <RefreshCw
            className={`h-4 w-4 ${loading ? "animate-spin text-[#111827]" : ""}`}
          />
        </button>

        <div className="relative">
          <button
            onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
            className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-[#F9FAFB] border border-[#E5E7EB] transition-colors text-xs font-medium text-[#111827]"
          >
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={user.fullName}
                className="h-7 w-7 rounded-full object-cover border border-[#E5E7EB]"
              />
            ) : (
              <div className="h-7 w-7 rounded-full bg-[#111827] text-white flex items-center justify-center text-xs font-semibold">
                {user.fullName ? user.fullName[0].toUpperCase() : "U"}
              </div>
            )}
            <span className="hidden sm:inline font-semibold max-w-[200px] truncate text-left">
              {user.fullName || "User"}
            </span>
            <ChevronDown className="h-3.5 w-3.5 text-[#6B7280]" />
          </button>

          {profileDropdownOpen && (
            <div className="absolute right-0 mt-2 w-52 bg-[#FFFFFF] border border-[#E5E7EB] rounded-md py-1.5 z-50 text-xs shadow-none">
              <div className="px-3 py-2 border-b border-[#E5E7EB]">
                <p className="font-semibold text-[#111827] truncate">
                  {user.fullName}
                </p>
                <p className="text-[11px] text-[#6B7280] truncate">
                  {user.email}
                </p>
              </div>
              <button
                onClick={() => {
                  handleTabChange("profile");
                  setProfileDropdownOpen(false);
                }}
                className="w-full text-left px-3 py-2 text-[#4B5563] hover:bg-[#F3F4F6] hover:text-[#111827] flex items-center gap-2"
              >
                <Settings className="h-3.5 w-3.5" />
                <span>Account Settings</span>
              </button>
              <div className="border-t border-[#E5E7EB] my-1" />
              <button
                onClick={() => {
                  setProfileDropdownOpen(false);
                  logout();
                }}
                className="w-full text-left px-3 py-2 text-[#DC2626] hover:bg-[#FEF2F2] flex items-center gap-2"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
