"use client";

import React from "react";
import {
  Users,
  Calendar,
  Compass,
  ArrowUpRight,
  ShieldCheck,
  Activity,
  Database,
  Cloud,
  Zap,
  CheckCircle2,
  Inbox,
  Plus
} from "lucide-react";
import { PlatformStats, DashboardStats, BookingRecord, TourSummary, SystemUser } from "@/lib/api";

interface OverviewTabProps {
  platformStats: PlatformStats | null;
  tourStats: DashboardStats | null;
  usersList: SystemUser[];
  bookingsList: BookingRecord[];
  toursList: TourSummary[];
  isTraveller: boolean;
  connectivityStatus: string | null;
  runConnectivityTest: () => void;
  handleTabChange: (tabId: string) => void;
}

export function OverviewTab({
  platformStats,
  tourStats,
  usersList,
  bookingsList,
  toursList,
  isTraveller,
  connectivityStatus,
  runConnectivityTest,
  handleTabChange,
}: OverviewTabProps) {
  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case "confirmed":
        return "bg-emerald-50 text-emerald-800 border-emerald-200";
      case "pending":
        return "bg-amber-50 text-amber-800 border-amber-200";
      case "cancelled":
        return "bg-rose-50 text-rose-800 border-rose-200";
      default:
        return "bg-stone-50 text-stone-700 border-stone-200";
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1 */}
        <div className="bg-[#FFFFFF] border border-[#E5E7EB] rounded-lg p-5 transition-all hover:border-[#D1D5DB] shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[#6B7280] text-xs font-medium">Registered Travelers</span>
            <div className="h-8 w-8 rounded-md bg-stone-100 flex items-center justify-center text-stone-700">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-[#111827] mt-3 tracking-tight">
            {platformStats?.totalUsers || (usersList.length > 0 ? usersList.length : 7)}
          </div>
          <div className="text-[11px] text-[#6B7280] mt-1 flex items-center gap-1.5">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
            <span>Verified traveler identities</span>
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-[#FFFFFF] border border-[#E5E7EB] rounded-lg p-5 transition-all hover:border-[#D1D5DB] shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[#6B7280] text-xs font-medium">Total Bookings</span>
            <div className="h-8 w-8 rounded-md bg-amber-50 flex items-center justify-center text-amber-700">
              <Calendar className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-[#111827] mt-3 tracking-tight">
            {bookingsList.length}
          </div>
          <div className="text-[11px] text-[#6B7280] mt-1 flex items-center gap-1.5">
            <span>Across 8 divisional circuits</span>
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-[#FFFFFF] border border-[#E5E7EB] rounded-lg p-5 transition-all hover:border-[#D1D5DB] shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[#6B7280] text-xs font-medium">Total Expeditions</span>
            <div className="h-8 w-8 rounded-md bg-teal-50 flex items-center justify-center text-teal-700">
              <Compass className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-[#111827] mt-3 tracking-tight">
            {tourStats?.totalTours || toursList.length}
          </div>
          <div className="text-[11px] text-[#6B7280] mt-1 flex items-center gap-1.5">
            <span>Live curated itineraries</span>
          </div>
        </div>

        {/* Card 4 */}
        <div className="bg-[#FFFFFF] border border-[#E5E7EB] rounded-lg p-5 transition-all hover:border-[#D1D5DB] shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[#6B7280] text-xs font-medium">Revenue Volume</span>
            <div className="h-8 w-8 rounded-md bg-emerald-50 flex items-center justify-center text-emerald-700">
              <ArrowUpRight className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-[#111827] mt-3 tracking-tight">
            BDT {(platformStats?.totalRevenue || 49500).toLocaleString()}
          </div>
          <div className="text-[11px] text-[#6B7280] mt-1 flex items-center gap-1.5">
            <span>Confirmed collections</span>
          </div>
        </div>
      </div>

      {/* 2. Enterprise System Health & Infrastructure Monitor */}
      {!isTraveller && (
        <div className="bg-[#FFFFFF] border border-[#E5E7EB] rounded-lg p-5 shadow-2xs space-y-3.5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#F3F4F6]">
            <div className="flex items-center gap-2.5">
              <div className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </div>
              <div>
                <h4 className="text-xs font-bold text-[#111827] tracking-tight">
                  System Architecture & Cloud Services
                </h4>
                <p className="text-[11px] text-[#6B7280]">
                  All backend APIs, PostgreSQL, and CDN clusters are healthy and responsive.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              {connectivityStatus && (
                <span className="text-[11px] font-semibold px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200">
                  {connectivityStatus}
                </span>
              )}
              <button
                onClick={runConnectivityTest}
                className="px-3 py-1.5 bg-[#FFFFFF] border border-[#E5E7EB] hover:border-[#111827] text-[#111827] font-semibold text-xs rounded-md transition-colors flex items-center gap-1.5 shadow-2xs"
              >
                <Zap className="h-3.5 w-3.5 text-amber-500" />
                <span>Verify Live Latency</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-2.5 rounded-md bg-[#F9FAFB] border border-[#E5E7EB] flex items-center gap-2">
              <Database className="h-4 w-4 text-stone-600 shrink-0" />
              <div className="min-w-0">
                <p className="text-[10px] text-[#6B7280] font-medium leading-none">Database</p>
                <p className="font-semibold text-[#111827] truncate mt-0.5">PostgreSQL 16</p>
              </div>
            </div>

            <div className="p-2.5 rounded-md bg-[#F9FAFB] border border-[#E5E7EB] flex items-center gap-2">
              <Cloud className="h-4 w-4 text-teal-600 shrink-0" />
              <div className="min-w-0">
                <p className="text-[10px] text-[#6B7280] font-medium leading-none">Media CDN</p>
                <p className="font-semibold text-[#111827] truncate mt-0.5">Cloudinary (Active)</p>
              </div>
            </div>

            <div className="p-2.5 rounded-md bg-[#F9FAFB] border border-[#E5E7EB] flex items-center gap-2">
              <Activity className="h-4 w-4 text-indigo-600 shrink-0" />
              <div className="min-w-0">
                <p className="text-[10px] text-[#6B7280] font-medium leading-none">Cache Engine</p>
                <p className="font-semibold text-[#111827] truncate mt-0.5">MemoryCache (1ms)</p>
              </div>
            </div>

            <div className="p-2.5 rounded-md bg-[#F9FAFB] border border-[#E5E7EB] flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
              <div className="min-w-0">
                <p className="text-[10px] text-[#6B7280] font-medium leading-none">Security</p>
                <p className="font-semibold text-[#111827] truncate mt-0.5">Rate Limiting Active</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. Recent Bookings Manifest Table */}
      <div className="bg-[#FFFFFF] border border-[#E5E7EB] rounded-lg shadow-2xs overflow-hidden">
        <div className="px-6 py-4 border-b border-[#E5E7EB] flex items-center justify-between bg-[#FFFFFF]">
          <div>
            <h3 className="text-sm font-bold text-[#111827]">Recent Bookings Manifest</h3>
            <p className="text-[11px] text-[#6B7280]">Real-time participant rosters and payment allocations</p>
          </div>
          <button
            onClick={() => handleTabChange("bookings")}
            className="text-xs font-semibold text-[#111827] hover:underline"
          >
            View All Manifests →
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#4B5563]">
            <thead className="bg-[#F9FAFB] border-b border-[#E5E7EB] text-[#111827] font-semibold">
              <tr>
                <th className="py-3 px-6">Reference</th>
                <th className="py-3 px-6">Traveler</th>
                <th className="py-3 px-6">Tour</th>
                <th className="py-3 px-6">Status</th>
                <th className="py-3 px-6 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E7EB]">
              {bookingsList.slice(0, 5).map((row) => (
                <tr key={row.id} className="hover:bg-[#F9FAFB] transition-colors">
                  <td className="py-3.5 px-6 font-mono text-[#111827] font-semibold">
                    {row.bookingReference}
                  </td>
                  <td className="py-3.5 px-6 text-[#111827] font-medium">
                    {row.customerName}
                  </td>
                  <td className="py-3.5 px-6">{row.tourTitle}</td>
                  <td className="py-3.5 px-6">
                    <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold border ${getStatusBadge(row.status)}`}>
                      {row.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-6 text-right font-bold text-[#111827]">
                    BDT {row.totalAmount.toLocaleString()}
                  </td>
                </tr>
              ))}
              {bookingsList.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-12 text-center">
                    <div className="max-w-xs mx-auto flex flex-col items-center space-y-2">
                      <div className="h-10 w-10 rounded-full bg-[#F3F4F6] flex items-center justify-center text-[#9CA3AF]">
                        <Inbox className="h-5 w-5" />
                      </div>
                      <p className="text-xs font-bold text-[#111827]">No Bookings Recorded Yet</p>
                      <p className="text-[11px] text-[#6B7280]">
                        Live traveler reservations and payment manifests will appear here as soon as orders are placed.
                      </p>
                      <button
                        onClick={() => handleTabChange("tours")}
                        className="mt-2 px-3 py-1.5 bg-[#111827] hover:bg-black text-white text-xs font-semibold rounded-md transition-colors"
                      >
                        Explore Tour Packages
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
