"use client";

import React, { useState, useEffect, useCallback } from "react";
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
  Plus,
  Server,
  Gauge,
  RefreshCw,
  AlertTriangle
} from "lucide-react";
import {
  API_BASE,
  PlatformStats,
  DashboardStats,
  BookingRecord,
  TourSummary,
  SystemUser,
  SystemMetricsResponse,
  LoadBalancerStatusResponse,
  fetchSystemMetrics,
  fetchLoadBalancerStatus
} from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

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
  const { token, isAdmin } = useAuth();
  const [metrics, setMetrics] = useState<SystemMetricsResponse | null>(null);
  const [lbStatus, setLbStatus] = useState<LoadBalancerStatusResponse | null>(null);
  const [activeNodeHeader, setActiveNodeHeader] = useState<string | null>(null);
  const [gatewayHeader, setGatewayHeader] = useState<string | null>(null);
  const [telemetryLoading, setTelemetryLoading] = useState(false);
  const [probeResults, setProbeResults] = useState<
    Array<{ idx: number; status: number; servedBy: string; balancer: string; latencyMs: string }>
  >([]);
  const [probing, setProbing] = useState(false);

  const loadClusterTelemetry = useCallback(async () => {
    if (isTraveller || !isAdmin || !token) return;
    setTelemetryLoading(true);
    try {
      const [sysRes, lbRes] = await Promise.allSettled([
        fetchSystemMetrics(token),
        fetchLoadBalancerStatus(),
      ]);

      if (sysRes.status === "fulfilled") {
        setMetrics(sysRes.value.metrics);
        setActiveNodeHeader(sysRes.value.servedBy);
        setGatewayHeader(sysRes.value.loadBalancer);
      }
      if (lbRes.status === "fulfilled") {
        setLbStatus(lbRes.value);
      }
    } finally {
      setTelemetryLoading(false);
    }
  }, [isTraveller, isAdmin, token]);

  useEffect(() => {
    loadClusterTelemetry();
  }, [loadClusterTelemetry]);

  const runLoadBalancerProbe = async () => {
    setProbing(true);
    const results: Array<{ idx: number; status: number; servedBy: string; balancer: string; latencyMs: string }> = [];
    for (let i = 1; i <= 6; i++) {
      const t0 = performance.now();
      try {
        const res = await fetch(`${API_BASE}/health`, { cache: "no-store" });
        const body = await res.json().catch(() => ({}));
        results.push({
          idx: i,
          status: res.status,
          servedBy: res.headers.get("X-Served-By") || body.instanceId || "standalone",
          balancer: res.headers.get("X-LoadBalancer") || "Direct",
          latencyMs: res.headers.get("X-Response-Time-Ms") || `${Math.round(performance.now() - t0)}`,
        });
      } catch {
        results.push({
          idx: i,
          status: 0,
          servedBy: "Unreachable",
          balancer: "-",
          latencyMs: "-",
        });
      }
    }
    setProbeResults(results);
    await loadClusterTelemetry();
    setProbing(false);
  };

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
                <p className="text-[10px] text-[#6B7280] font-medium leading-none">Rate Limiter</p>
                <p className="font-semibold text-[#111827] truncate mt-0.5">
                  {metrics
                    ? `${metrics.policies.length} Partitioned Policies`
                    : "SlidingWindow + TokenBucket"}
                </p>
              </div>
            </div>
          </div>

          {/* Live Load Balancer & Rate Limiter Telemetry Strip */}
          <div className="pt-3 border-t border-[#F3F4F6] space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-xs font-bold text-[#111827]">
                <Server className="h-3.5 w-3.5 text-indigo-600" />
                <span>Load Balancer &amp; Rate Limiting Telemetry</span>
                {activeNodeHeader && (
                  <span className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200 font-mono text-[10px]">
                    Node: {activeNodeHeader}
                  </span>
                )}
                {gatewayHeader && (
                  <span className="px-2 py-0.5 rounded bg-teal-50 text-teal-700 border border-teal-200 font-mono text-[10px]">
                    {gatewayHeader}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={loadClusterTelemetry}
                  disabled={telemetryLoading}
                  className="px-2.5 py-1 rounded border border-[#E5E7EB] hover:border-[#111827] text-[11px] font-semibold text-[#111827] flex items-center gap-1 transition cursor-pointer"
                >
                  <RefreshCw className={`h-3 w-3 ${telemetryLoading ? "animate-spin" : ""}`} />
                  Refresh
                </button>
                <button
                  type="button"
                  onClick={runLoadBalancerProbe}
                  disabled={probing}
                  className="px-2.5 py-1 rounded bg-[#111827] hover:bg-black text-white text-[11px] font-semibold flex items-center gap-1 transition cursor-pointer disabled:opacity-50"
                >
                  <Gauge className="h-3 w-3 text-emerald-400" />
                  {probing ? "Probing 6x..." : "Run 6x LB Distribution Probe"}
                </button>
              </div>
            </div>

            {lbStatus && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
                <div className="p-3 rounded-md bg-[#F9FAFB] border border-[#E5E7EB] text-xs space-y-1">
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-[#6B7280]">
                    Gateway Policy
                  </div>
                  <div className="font-bold text-[#111827]">{lbStatus.algorithm}</div>
                  <div className="text-[11px] text-[#6B7280]">
                    Healthy Upstreams: {lbStatus.healthyNodeCount}/{lbStatus.totalNodeCount} • Proxied:{" "}
                    {lbStatus.totalProxiedRequests} • Gateway 429s: {lbStatus.totalGatewayThrottled}
                  </div>
                </div>

                {lbStatus.destinations?.map((dest) => {
                  const isHealthy = dest.isAvailable && dest.activeHealth !== "Unhealthy";
                  return (
                    <div
                      key={dest.id}
                      className="p-3 rounded-md bg-[#F9FAFB] border border-[#E5E7EB] text-xs flex items-center justify-between"
                    >
                      <div>
                        <div className="font-bold text-[#111827] font-mono">{dest.id}</div>
                        <div className="text-[11px] text-[#6B7280]">{dest.address}</div>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                          isHealthy
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-rose-50 text-rose-700 border-rose-200"
                        }`}
                      >
                        {dest.activeHealth}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}

            {metrics && (
              <div className="space-y-2">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <div className="p-2.5 rounded-md bg-[#F9FAFB] border border-[#E5E7EB]">
                    <span className="text-[10px] text-[#6B7280] block">Node Requests</span>
                    <strong className="text-sm text-[#111827] tabular-nums">{metrics.totalRequests}</strong>
                  </div>
                  <div className="p-2.5 rounded-md bg-[#F9FAFB] border border-[#E5E7EB]">
                    <span className="text-[10px] text-[#6B7280] block">Avg Node Latency</span>
                    <strong className="text-sm text-[#111827] tabular-nums">
                      {metrics.averageResponseTimeMs} ms
                    </strong>
                  </div>
                  <div className="p-2.5 rounded-md bg-[#F9FAFB] border border-[#E5E7EB]">
                    <span className="text-[10px] text-[#6B7280] block">429 Throttles Blocked</span>
                    <strong className="text-sm text-amber-700 tabular-nums">
                      {metrics.totalRateLimitRejections}
                    </strong>
                  </div>
                  <div className="p-2.5 rounded-md bg-[#F9FAFB] border border-[#E5E7EB]">
                    <span className="text-[10px] text-[#6B7280] block">Node Uptime</span>
                    <strong className="text-sm text-[#111827] tabular-nums">{metrics.uptimeSeconds}s</strong>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                  {metrics.policies.map((pol) => (
                    <div
                      key={pol.name}
                      className="p-2.5 rounded-md border border-[#E5E7EB] bg-white text-[11px] space-y-0.5"
                    >
                      <div className="flex items-center justify-between font-bold text-[#111827]">
                        <span className="uppercase">{pol.name}</span>
                        <span className="text-[10px] font-mono text-indigo-700">{pol.permitLimit}</span>
                      </div>
                      <div className="text-[#4B5563] font-medium">{pol.algorithm}</div>
                      <div className="text-[10px] text-[#6B7280]">{pol.windowDescription}</div>
                    </div>
                  ))}
                </div>

                {metrics.recentThrottles && metrics.recentThrottles.length > 0 && (
                  <div className="p-2.5 rounded-md bg-amber-50/70 border border-amber-200 text-[11px] text-amber-900 space-y-1">
                    <div className="font-bold flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                      Recent 429 Rate Limit Audit Events
                    </div>
                    {metrics.recentThrottles.slice(0, 3).map((ev, i) => (
                      <div key={i} className="font-mono text-[10px]">
                        [{new Date(ev.timestampUtc).toLocaleTimeString()}] policy={ev.policy} client={ev.clientKey} path={ev.path}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {probeResults.length > 0 && (
              <div className="p-3 rounded-md bg-slate-900 text-slate-100 text-[11px] space-y-1.5">
                <div className="font-semibold text-emerald-400">
                  Live Load Distribution Trace (via {API_BASE}/health):
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                  {probeResults.map((p) => (
                    <div key={p.idx} className="bg-slate-800 border border-slate-700 rounded px-2 py-1.5 font-mono">
                      <div className="text-slate-400">Req #{p.idx} ({p.status})</div>
                      <div className="font-bold text-white truncate">{p.servedBy}</div>
                      <div className="text-[10px] text-teal-300">{p.latencyMs}ms • {p.balancer}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
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
