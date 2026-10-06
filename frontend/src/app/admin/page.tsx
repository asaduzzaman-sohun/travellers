"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Compass,
  Luggage,
  Calendar,
  CheckCircle2,
  DollarSign,
  Download,
  Plus,
  RefreshCw,
  Search,
  ExternalLink,
  Users,
  MapPin,
  X
} from "lucide-react";
import { BookingRecord, TourSummary, DashboardStats, API_BASE } from "@/lib/api";

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalTours: 0,
    activeBookings: 0,
    totalRevenue: 0,
    upcomingDepartures: 0,
  });
  const [bookings, setBookings] = useState<BookingRecord[]>([]);
  const [tours, setTours] = useState<TourSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusUpdatingId, setStatusUpdatingId] = useState<string | null>(null);

  // New Tour Modal State
  const [newTourModalOpen, setNewTourModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDestination, setNewDestination] = useState("");
  const [newCountry, setNewCountry] = useState("");
  const [newRegion, setNewRegion] = useState("Europe");
  const [newDurationDays, setNewDurationDays] = useState(7);
  const [newBasePrice, setNewBasePrice] = useState(2500);
  const [newSummary, setNewSummary] = useState("");
  const [newCoverImage, setNewCoverImage] = useState("");
  const [creatingTour, setCreatingTour] = useState(false);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, bookingsRes, toursRes] = await Promise.all([
        fetch(`${API_BASE}/tourpackages/stats`),
        fetch(`${API_BASE}/bookings`),
        fetch(`${API_BASE}/tourpackages`),
      ]);

      if (statsRes.ok) setStats(await statsRes.json());
      if (bookingsRes.ok) setBookings(await bookingsRes.json());
      if (toursRes.ok) setTours(await toursRes.json());
    } catch (err) {
      console.error("Failed to load admin dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleStatusChange = async (bookingId: string, newStatus: string) => {
    setStatusUpdatingId(bookingId);
    try {
      const res = await fetch(`${API_BASE}/bookings/${bookingId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        fetchDashboardData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setStatusUpdatingId(null);
    }
  };

  const handleExportCSV = () => {
    if (bookings.length === 0) return;
    const headers = [
      "Booking Reference",
      "Customer Name",
      "Email",
      "Phone",
      "Expedition Title",
      "Destination",
      "Departure Date",
      "Guests",
      "Total Fare",
      "Deposit Paid",
      "Balance Due",
      "Status",
      "Payment Status",
      "Dietary Notes"
    ];

    const rows = bookings.map((b) => [
      `"${b.bookingReference}"`,
      `"${b.customerName}"`,
      `"${b.customerEmail}"`,
      `"${b.customerPhone}"`,
      `"${b.tourTitle}"`,
      `"${b.destination}"`,
      `"${new Date(b.departureDate).toLocaleDateString()}"`,
      b.numberOfTravelers,
      b.totalAmount,
      b.depositPaid,
      b.balanceRemaining,
      `"${b.status}"`,
      `"${b.paymentStatus}"`,
      `"${b.dietaryRequirements || ""}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `tourflow_manifest_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCreateTour = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreatingTour(true);
    try {
      const payload = {
        title: newTitle,
        slug: newTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, ""),
        destination: newDestination,
        country: newCountry,
        region: newRegion,
        durationDays: newDurationDays,
        durationNights: newDurationDays - 1,
        basePrice: newBasePrice,
        summary: newSummary || "Authentic expedition crafted by TourFlow field experts.",
        description: newSummary || "Detailed daily expedition narrative.",
        coverImageUrl: newCoverImage || "https://images.unsplash.com/photo-1517411032315-54ef2cb783bb?auto=format&fit=crop&w=1200&q=80",
        maxGroupSize: 12,
        difficulty: "Moderate",
        category: "Adventure",
        isActive: true,
        isFeatured: false
      };

      const res = await fetch(`${API_BASE}/tourpackages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setNewTourModalOpen(false);
        fetchDashboardData();
        alert("New tour package successfully added to inventory!");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to create tour package.");
    } finally {
      setCreatingTour(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="text-xs font-bold uppercase tracking-widest text-indigo-400">
            Operations & Field Manifest
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">
            TourFlow Operator Console
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time reservation tracking, capacity control, and passenger manifests
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchDashboardData}
            className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
            title="Refresh Data"
          >
            <RefreshCw className="h-4 w-4" />
          </button>

          <button
            onClick={handleExportCSV}
            className="px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white text-xs font-bold transition-all flex items-center gap-2"
          >
            <Download className="h-4 w-4 text-emerald-400" />
            <span>Export Manifest (CSV)</span>
          </button>

          <button
            onClick={() => setNewTourModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/30 transition-all flex items-center gap-1.5"
          >
            <Plus className="h-4 w-4" />
            <span>New Tour Package</span>
          </button>
        </div>
      </div>

      {/* KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400 uppercase">Active Itineraries</span>
            <Luggage className="h-4 w-4 text-indigo-400" />
          </div>
          <div className="text-3xl font-black text-white">{stats.totalTours}</div>
          <div className="text-[11px] text-slate-500 mt-1">In global rotation</div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400 uppercase">Total Reservations</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-black text-white">{stats.activeBookings}</div>
          <div className="text-[11px] text-slate-500 mt-1">Confirmed & in process</div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400 uppercase">Departures Ahead</span>
            <Calendar className="h-4 w-4 text-sky-400" />
          </div>
          <div className="text-3xl font-black text-white">{stats.upcomingDepartures}</div>
          <div className="text-[11px] text-slate-500 mt-1">Scheduled for 2026/27</div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400 uppercase">Secured Revenue</span>
            <DollarSign className="h-4 w-4 text-amber-400" />
          </div>
          <div className="text-3xl font-black text-white">
            ${stats.totalRevenue.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">From confirmed passengers</div>
        </div>
      </div>

      {/* Bookings Manifest Table */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">Passenger Manifest & Reservations</h2>
          <span className="text-xs text-slate-400">{bookings.length} reservations total</span>
        </div>

        {bookings.length === 0 ? (
          <div className="py-16 text-center text-slate-500 bg-slate-900/40 rounded-3xl border border-slate-800">
            No bookings recorded in this environment yet.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/60">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 uppercase font-semibold border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Ref #</th>
                  <th className="py-3 px-4">Passenger</th>
                  <th className="py-3 px-4">Expedition</th>
                  <th className="py-3 px-4">Departure</th>
                  <th className="py-3 px-4">Guests</th>
                  <th className="py-3 px-4">Total</th>
                  <th className="py-3 px-4">Balance</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Update</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {bookings.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-indigo-400">
                      <Link href={`/manage?ref=${b.bookingReference}`} className="hover:underline">
                        {b.bookingReference}
                      </Link>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-white">{b.customerName}</div>
                      <div className="text-[10px] text-slate-500">{b.customerEmail}</div>
                      {b.dietaryRequirements && (
                        <div className="text-[10px] text-amber-400">Diet: {b.dietaryRequirements}</div>
                      )}
                    </td>
                    <td className="py-3.5 px-4 max-w-[200px] truncate text-white">{b.tourTitle}</td>
                    <td className="py-3.5 px-4 text-slate-400">
                      {new Date(b.departureDate).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-4 font-bold">{b.numberOfTravelers}</td>
                    <td className="py-3.5 px-4 font-bold text-white">${b.totalAmount.toLocaleString()}</td>
                    <td className="py-3.5 px-4 text-slate-400">
                      {b.balanceRemaining > 0 ? (
                        <span className="text-amber-400">${b.balanceRemaining.toLocaleString()}</span>
                      ) : (
                        <span className="text-emerald-400">Paid</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${
                        b.status === "Confirmed"
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                          : b.status === "Completed"
                          ? "bg-sky-500/10 text-sky-400 border-sky-500/20"
                          : "bg-rose-500/10 text-rose-400 border-rose-500/20"
                      }`}>
                        {b.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <select
                        value={b.status}
                        disabled={statusUpdatingId === b.id}
                        onChange={(e) => handleStatusChange(b.id, e.target.value)}
                        className="bg-slate-950 border border-slate-800 text-[11px] rounded-lg px-2 py-1 text-slate-300 focus:outline-none cursor-pointer"
                      >
                        <option value="Confirmed">Confirmed</option>
                        <option value="Completed">Completed</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Tour Inventory Table */}
      <div className="space-y-4 pt-6 border-t border-slate-800">
        <h2 className="text-lg font-bold text-white">Expedition Inventory & Catalog</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tours.map((t) => (
            <div key={t.id} className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 px-2 py-0.5 rounded bg-indigo-500/10">
                  {t.region}
                </span>
                <span className="text-xs text-slate-400">{t.durationDays} Days</span>
              </div>
              <h3 className="text-sm font-bold text-white line-clamp-1">{t.title}</h3>
              <div className="text-xs text-slate-400 flex items-center gap-1.5">
                <MapPin className="h-3 w-3 text-indigo-400" />
                <span>{t.destination}</span>
              </div>
              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <span className="font-black text-white">${(t.discountPrice ?? t.basePrice).toLocaleString()}</span>
                <Link href={`/tours/${t.slug}`} className="text-indigo-400 hover:underline font-semibold flex items-center gap-1">
                  <span>View Public Page</span>
                  <ExternalLink className="h-3 w-3" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Tour Modal */}
      {newTourModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setNewTourModalOpen(false)}
              className="absolute top-4 right-4 h-8 w-8 rounded-full bg-slate-950 border border-slate-700 flex items-center justify-center text-slate-400 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>

            <h3 className="text-lg font-bold text-white mb-4">Add New Expedition</h3>

            <form onSubmit={handleCreateTour} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Title</label>
                <input
                  type="text"
                  placeholder="e.g. New Zealand Milford Track & Southern Fjords"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Destination</label>
                  <input
                    type="text"
                    placeholder="Queenstown & Fiordland"
                    value={newDestination}
                    onChange={(e) => setNewDestination(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Country</label>
                  <input
                    type="text"
                    placeholder="New Zealand"
                    value={newCountry}
                    onChange={(e) => setNewCountry(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Region</label>
                  <select
                    value={newRegion}
                    onChange={(e) => setNewRegion(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2 py-2 text-white"
                  >
                    <option value="Americas">Americas</option>
                    <option value="Europe">Europe</option>
                    <option value="Asia">Asia</option>
                    <option value="Africa">Africa</option>
                    <option value="Oceania">Oceania</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Duration (Days)</label>
                  <input
                    type="number"
                    min={1}
                    value={newDurationDays}
                    onChange={(e) => setNewDurationDays(parseInt(e.target.value) || 1)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Base Price ($)</label>
                  <input
                    type="number"
                    min={100}
                    value={newBasePrice}
                    onChange={(e) => setNewBasePrice(parseInt(e.target.value) || 100)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Cover Image URL</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={newCoverImage}
                  onChange={(e) => setNewCoverImage(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Summary Overview</label>
                <textarea
                  rows={2}
                  placeholder="Summary of this journey..."
                  value={newSummary}
                  onChange={(e) => setNewSummary(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setNewTourModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingTour}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold"
                >
                  {creatingTour ? "Publishing..." : "Publish Expedition"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
