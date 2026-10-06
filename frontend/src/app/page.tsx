"use client";

import { useEffect, useState } from "react";
import {
  Compass,
  Calendar,
  Users,
  MapPin,
  Star,
  CheckCircle2,
  TrendingUp,
  ShieldCheck,
  Luggage,
  Clock,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Filter,
  DollarSign,
  X
} from "lucide-react";

interface Tour {
  id: string;
  title: string;
  slug: string;
  summary: string;
  destination: string;
  country: string;
  durationDays: number;
  durationNights: number;
  basePrice: number;
  discountPrice?: number;
  maxGroupSize: number;
  difficulty: string;
  category: string;
  coverImageUrl: string;
  isFeatured: boolean;
  averageRating: number;
  totalReviews: number;
  upcomingDepartures: number;
}

interface TourDetail extends Tour {
  description: string;
  inclusions: string[];
  exclusions: string[];
  itineraryDays: Array<{
    id: string;
    dayNumber: number;
    title: string;
    description: string;
    mealsIncluded?: string;
    accommodation?: string;
    location?: string;
  }>;
  schedules: Array<{
    id: string;
    startDate: string;
    endDate: string;
    pricePerPerson: number;
    totalSeats: number;
    bookedSeats: number;
    availableSeats: number;
    status: string;
  }>;
  reviews: Array<{
    id: string;
    reviewerName: string;
    rating: number;
    comment: string;
  }>;
}

interface BookingRecord {
  id: string;
  bookingReference: string;
  tourTitle: string;
  destination: string;
  departureDate: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  numberOfTravelers: number;
  totalAmount: number;
  status: string;
  paymentStatus: string;
  createdAtUtc: string;
}

const API_BASE = "http://localhost:5000/api";

export default function Home() {
  const [tours, setTours] = useState<Tour[]>([]);
  const [stats, setStats] = useState({
    totalTours: 3,
    activeBookings: 0,
    totalRevenue: 0,
    upcomingDepartures: 3,
  });
  const [activeTab, setActiveTab] = useState<"tours" | "bookings">("tours");
  const [bookings, setBookings] = useState<BookingRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTourSlug, setSelectedTourSlug] = useState<string | null>(null);
  const [tourDetail, setTourDetail] = useState<TourDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  // Booking Modal State
  const [bookingModalTour, setBookingModalTour] = useState<TourDetail | null>(null);
  const [selectedScheduleId, setSelectedScheduleId] = useState<string>("");
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [travelersCount, setTravelersCount] = useState(1);
  const [bookingSuccess, setBookingSuccess] = useState<string | null>(null);
  const [bookingSubmitting, setBookingSubmitting] = useState(false);

  // Fetch Tours & Stats
  const fetchData = async () => {
    try {
      setLoading(true);
      const [toursRes, statsRes] = await Promise.all([
        fetch(`${API_BASE}/tourpackages`),
        fetch(`${API_BASE}/tourpackages/stats`)
      ]);

      if (toursRes.ok) {
        const toursData = await toursRes.json();
        setTours(toursData);
      }
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }
    } catch {
      console.warn("Backend not reached yet, showing fallback data.");
    } finally {
      setLoading(false);
    }
  };

  const fetchBookings = async () => {
    try {
      const res = await fetch(`${API_BASE}/bookings`);
      if (res.ok) {
        const data = await res.json();
        setBookings(data);
      }
    } catch (err) {
      console.error("Failed to fetch bookings", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (activeTab === "bookings") {
      fetchBookings();
    }
  }, [activeTab]);

  // Fetch single tour detail
  const openTourDetail = async (slug: string) => {
    setSelectedTourSlug(slug);
    setDetailLoading(true);
    try {
      const res = await fetch(`${API_BASE}/tourpackages/${slug}`);
      if (res.ok) {
        const data = await res.json();
        setTourDetail(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setDetailLoading(false);
    }
  };

  // Submit Booking
  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingModalTour || !selectedScheduleId) return;

    setBookingSubmitting(true);
    try {
      const payload = {
        tourPackageId: bookingModalTour.id,
        tourScheduleId: selectedScheduleId,
        customerName,
        customerEmail,
        customerPhone,
        numberOfTravelers: travelersCount,
        specialRequests: "Standard package booking via portal"
      };

      const res = await fetch(`${API_BASE}/bookings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const result = await res.json();
        setBookingSuccess(result.bookingReference || "TF-SUCCESS");
        fetchData();
        if (activeTab === "bookings") fetchBookings();
      } else {
        alert("Booking failed. Please check schedule availability.");
      }
    } catch (err) {
      console.error(err);
      alert("Error submitting booking.");
    } finally {
      setBookingSubmitting(false);
    }
  };

  const filteredTours = tours.filter((t) => {
    const matchesSearch =
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.destination.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.country.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCategory === "All" || t.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const categories = ["All", "Cultural", "MountainTrekking", "Historical", "Adventure"];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-slate-950/80 border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-sky-400 flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <Compass className="h-6 w-6 text-white" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                TourFlow
              </span>
              <span className="ml-2 text-xs font-medium px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                .NET 10 + Next.js
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <button
              onClick={() => setActiveTab("tours")}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                activeTab === "tours"
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                  : "text-slate-400 hover:text-white hover:bg-slate-900"
              }`}
            >
              Tour Packages
            </button>
            <button
              onClick={() => setActiveTab("bookings")}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                activeTab === "bookings"
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                  : "text-slate-400 hover:text-white hover:bg-slate-900"
              }`}
            >
              Reservations
            </button>
            <a
              href="http://localhost:5000/scalar/v1"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium rounded-lg bg-slate-900 border border-slate-700/60 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <span>Scalar API Docs</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Hero & Metrics */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-950/60 via-slate-900 to-slate-950 border border-indigo-500/20 p-8 sm:p-10 shadow-2xl">
          <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="max-w-2xl space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-medium">
                <Sparkles className="h-3.5 w-3.5" />
                Live PostgreSQL Backend Connected
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white">
                Seamless Tour Planning & Operations
              </h1>
              <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
                Manage itineraries, control departure seat capacities, and automate booking workflows with .NET 10 Web API and PostgreSQL.
              </p>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 lg:gap-4">
              <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-4 backdrop-blur-sm">
                <div className="flex items-center gap-2 text-slate-400 text-xs font-medium mb-1">
                  <Luggage className="h-4 w-4 text-indigo-400" />
                  <span>Packages</span>
                </div>
                <div className="text-2xl font-bold text-white">{stats.totalTours}</div>
              </div>

              <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-4 backdrop-blur-sm">
                <div className="flex items-center gap-2 text-slate-400 text-xs font-medium mb-1">
                  <Calendar className="h-4 w-4 text-sky-400" />
                  <span>Departures</span>
                </div>
                <div className="text-2xl font-bold text-white">{stats.upcomingDepartures}</div>
              </div>

              <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-4 backdrop-blur-sm">
                <div className="flex items-center gap-2 text-slate-400 text-xs font-medium mb-1">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  <span>Bookings</span>
                </div>
                <div className="text-2xl font-bold text-white">{stats.activeBookings}</div>
              </div>

              <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-4 backdrop-blur-sm">
                <div className="flex items-center gap-2 text-slate-400 text-xs font-medium mb-1">
                  <DollarSign className="h-4 w-4 text-amber-400" />
                  <span>Revenue</span>
                </div>
                <div className="text-2xl font-bold text-white">${stats.totalRevenue.toLocaleString()}</div>
              </div>
            </div>
          </div>
        </div>

        {activeTab === "tours" ? (
          <>
            {/* Filter and Search Bar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0">
                <Filter className="h-4 w-4 text-slate-400 ml-1 mr-1 shrink-0" />
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-full transition-all shrink-0 ${
                      selectedCategory === cat
                        ? "bg-indigo-600 text-white shadow-sm"
                        : "bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <div className="w-full md:w-80">
                <input
                  type="text"
                  placeholder="Search destinations, tours..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-900/90 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Tours Grid */}
            {loading ? (
              <div className="py-20 text-center text-slate-500">Loading tour packages from .NET 10 API...</div>
            ) : filteredTours.length === 0 ? (
              <div className="py-20 text-center text-slate-500 bg-slate-900/40 rounded-2xl border border-slate-800">
                No tours matching your criteria.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTours.map((tour) => (
                  <div
                    key={tour.id}
                    className="group bg-slate-900/70 border border-slate-800/90 rounded-2xl overflow-hidden hover:border-slate-700 hover:shadow-xl hover:shadow-indigo-500/5 transition-all flex flex-col"
                  >
                    <div className="relative h-48 w-full overflow-hidden bg-slate-800">
                      <img
                        src={tour.coverImageUrl}
                        alt={tour.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-3 left-3 bg-slate-950/80 backdrop-blur-md px-2.5 py-1 rounded-full text-xs font-medium text-slate-200 border border-slate-800 flex items-center gap-1.5">
                        <MapPin className="h-3 w-3 text-indigo-400" />
                        {tour.destination}
                      </div>
                      <div className="absolute top-3 right-3 bg-indigo-600/90 backdrop-blur-md px-2.5 py-1 rounded-full text-xs font-semibold text-white shadow">
                        {tour.category}
                      </div>
                    </div>

                    <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-xs text-slate-400">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5 text-slate-500" />
                            {tour.durationDays} Days / {tour.durationNights} Nights
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
                            {tour.averageRating.toFixed(1)} ({tour.totalReviews})
                          </span>
                        </div>
                        <h3 className="text-lg font-bold text-white group-hover:text-indigo-400 transition-colors line-clamp-1">
                          {tour.title}
                        </h3>
                        <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                          {tour.summary}
                        </p>
                      </div>

                      <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                        <div>
                          <div className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Starting at</div>
                          <div className="flex items-baseline gap-1.5">
                            <span className="text-xl font-extrabold text-white">
                              ${tour.discountPrice ?? tour.basePrice}
                            </span>
                            {tour.discountPrice && (
                              <span className="text-xs text-slate-500 line-through">
                                ${tour.basePrice}
                              </span>
                            )}
                          </div>
                        </div>

                        <button
                          onClick={() => openTourDetail(tour.slug)}
                          className="px-4 py-2 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white transition-all flex items-center gap-1 shadow-md shadow-indigo-600/20"
                        >
                          Details & Book
                          <ChevronRight className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          /* Bookings Tab */
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white">All Bookings & Reservations</h2>
                <p className="text-xs text-slate-400">Real-time status of passenger reservations and payments</p>
              </div>
              <button
                onClick={fetchBookings}
                className="px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800"
              >
                Refresh
              </button>
            </div>

            {bookings.length === 0 ? (
              <div className="py-20 text-center text-slate-500 bg-slate-900/40 rounded-2xl border border-slate-800">
                No reservations found. Book a tour from the packages tab to see it here!
              </div>
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-sm">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900/90 text-slate-400 border-b border-slate-800 uppercase tracking-wider font-medium">
                    <tr>
                      <th className="py-3 px-4">Ref #</th>
                      <th className="py-3 px-4">Tour</th>
                      <th className="py-3 px-4">Customer</th>
                      <th className="py-3 px-4">Travelers</th>
                      <th className="py-3 px-4">Departure</th>
                      <th className="py-3 px-4">Total</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Payment</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-slate-300">
                    {bookings.map((b) => (
                      <tr key={b.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-bold text-indigo-400">{b.bookingReference}</td>
                        <td className="py-3.5 px-4 font-medium text-white max-w-[200px] truncate">{b.tourTitle}</td>
                        <td className="py-3.5 px-4">
                          <div>{b.customerName}</div>
                          <div className="text-[10px] text-slate-500">{b.customerEmail}</div>
                        </td>
                        <td className="py-3.5 px-4 font-medium">{b.numberOfTravelers} guest(s)</td>
                        <td className="py-3.5 px-4 text-slate-400">
                          {new Date(b.departureDate).toLocaleDateString()}
                        </td>
                        <td className="py-3.5 px-4 font-bold text-emerald-400">${b.totalAmount.toLocaleString()}</td>
                        <td className="py-3.5 px-4">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            {b.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-sky-500/10 text-sky-400 border border-sky-500/20">
                            {b.paymentStatus}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Tour Detail Drawer / Modal */}
      {selectedTourSlug && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative">
            <button
              onClick={() => {
                setSelectedTourSlug(null);
                setTourDetail(null);
              }}
              className="absolute top-4 right-4 z-20 h-8 w-8 rounded-full bg-slate-950/80 border border-slate-700 flex items-center justify-center text-slate-400 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>

            {detailLoading || !tourDetail ? (
              <div className="py-24 text-center text-slate-500">Loading tour details...</div>
            ) : (
              <div className="p-6 sm:p-8 space-y-6">
                <div className="relative h-64 -mx-6 -mt-6 sm:-mx-8 sm:-mt-8 overflow-hidden rounded-t-3xl">
                  <img
                    src={tourDetail.coverImageUrl}
                    alt={tourDetail.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />
                  <div className="absolute bottom-4 left-6 right-6">
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-indigo-600 text-white">
                      {tourDetail.category}
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-2">
                      {tourDetail.title}
                    </h2>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-950/60 p-4 rounded-2xl border border-slate-800 text-xs">
                  <div>
                    <span className="text-slate-500">Destination</span>
                    <div className="font-semibold text-white">{tourDetail.destination}</div>
                  </div>
                  <div>
                    <span className="text-slate-500">Duration</span>
                    <div className="font-semibold text-white">{tourDetail.durationDays}D / {tourDetail.durationNights}N</div>
                  </div>
                  <div>
                    <span className="text-slate-500">Group Size</span>
                    <div className="font-semibold text-white">Max {tourDetail.maxGroupSize} People</div>
                  </div>
                  <div>
                    <span className="text-slate-500">Difficulty</span>
                    <div className="font-semibold text-white">{tourDetail.difficulty}</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-sm font-bold text-white uppercase tracking-wider">Overview</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">{tourDetail.description}</p>
                </div>

                {/* Itinerary */}
                <div className="space-y-3">
                  <h4 className="text-sm font-bold text-white uppercase tracking-wider">Daily Itinerary</h4>
                  <div className="space-y-3">
                    {tourDetail.itineraryDays?.map((day) => (
                      <div key={day.id} className="p-3.5 rounded-xl bg-slate-950/50 border border-slate-800/80 text-xs space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-indigo-400">Day {day.dayNumber}: {day.title}</span>
                          {day.mealsIncluded && (
                            <span className="text-[10px] text-slate-500">Meals: {day.mealsIncluded}</span>
                          )}
                        </div>
                        <p className="text-slate-400 leading-relaxed">{day.description}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Available Departures */}
                <div className="space-y-3">
                  <h4 className="text-sm font-bold text-white uppercase tracking-wider">Upcoming Departures</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {tourDetail.schedules?.map((sched) => (
                      <div
                        key={sched.id}
                        className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between text-xs"
                      >
                        <div>
                          <div className="font-bold text-white">
                            {new Date(sched.startDate).toLocaleDateString()} - {new Date(sched.endDate).toLocaleDateString()}
                          </div>
                          <div className="text-[10px] text-emerald-400 font-medium">
                            {sched.availableSeats} of {sched.totalSeats} seats available
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-extrabold text-white">${sched.pricePerPerson}</div>
                          <div className="text-[10px] text-slate-500">/ person</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Starting Price</span>
                    <div className="text-2xl font-black text-white">${tourDetail.discountPrice ?? tourDetail.basePrice}</div>
                  </div>

                  <button
                    onClick={() => {
                      setBookingModalTour(tourDetail);
                      if (tourDetail.schedules?.length > 0) {
                        setSelectedScheduleId(tourDetail.schedules[0].id);
                      }
                      setSelectedTourSlug(null);
                    }}
                    className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all"
                  >
                    Reserve Now
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Booking Form Modal */}
      {bookingModalTour && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative">
            <button
              onClick={() => {
                setBookingModalTour(null);
                setBookingSuccess(null);
              }}
              className="absolute top-4 right-4 h-8 w-8 rounded-full bg-slate-950 border border-slate-700 flex items-center justify-center text-slate-400 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>

            {bookingSuccess ? (
              <div className="py-8 text-center space-y-4">
                <div className="h-16 w-16 mx-auto rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <CheckCircle2 className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold text-white">Booking Confirmed!</h3>
                <p className="text-xs text-slate-400">
                  Your reservation reference is:
                </p>
                <div className="inline-block px-4 py-2 bg-slate-950 border border-indigo-500/30 rounded-xl font-mono text-base font-extrabold text-indigo-400">
                  {bookingSuccess}
                </div>
                <div className="pt-4">
                  <button
                    onClick={() => {
                      setBookingModalTour(null);
                      setBookingSuccess(null);
                      setActiveTab("bookings");
                    }}
                    className="w-full py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-500 transition-colors"
                  >
                    View in Reservations Tab
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleBookingSubmit} className="space-y-4">
                <div>
                  <span className="text-[10px] text-indigo-400 uppercase font-bold tracking-wider">Reservation</span>
                  <h3 className="text-lg font-bold text-white line-clamp-1">{bookingModalTour.title}</h3>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block text-slate-400 mb-1">Departure Schedule</label>
                    <select
                      value={selectedScheduleId}
                      onChange={(e) => setSelectedScheduleId(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      required
                    >
                      {bookingModalTour.schedules?.map((s) => (
                        <option key={s.id} value={s.id}>
                          {new Date(s.startDate).toLocaleDateString()} - {new Date(s.endDate).toLocaleDateString()} (${s.pricePerPerson} / person)
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1">Full Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Alex Morgan"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-400 mb-1">Email</label>
                      <input
                        type="email"
                        placeholder="alex@example.com"
                        value={customerEmail}
                        onChange={(e) => setCustomerEmail(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-1">Phone</label>
                      <input
                        type="tel"
                        placeholder="+1 (555) 019-283"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1">Number of Travelers</label>
                    <input
                      type="number"
                      min={1}
                      max={bookingModalTour.maxGroupSize}
                      value={travelersCount}
                      onChange={(e) => setTravelersCount(parseInt(e.target.value) || 1)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      required
                    />
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                  <div>
                    <div className="text-[10px] text-slate-500">Estimated Total</div>
                    <div className="text-xl font-bold text-emerald-400">
                      ${((bookingModalTour.discountPrice ?? bookingModalTour.basePrice) * travelersCount).toLocaleString()}
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={bookingSubmitting}
                    className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all disabled:opacity-50"
                  >
                    {bookingSubmitting ? "Processing..." : "Confirm Booking"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
