"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  Building2,
  Plus,
  Trash2,
  Star,
  MapPin,
  Search,
  X,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/lib/toast-context";
import { API_BASE } from "@/lib/api";

interface HotelItem {
  id: string;
  name: string;
  slug: string;
  place: string;
  location: string;
  pricePerNight: number;
  rating: number;
  reviewCount: number;
  starRating?: number;
  tier?: string;
  imageUrl?: string;
}

export function HotelsTab() {
  const { token } = useAuth();
  const { toast } = useToast();
  const [hotels, setHotels] = useState<HotelItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);

  // Form state
  const [name, setName] = useState("");
  const [place, setPlace] = useState("Sajek");
  const [location, setLocation] = useState("");
  const [pricePerNight, setPricePerNight] = useState<number>(3500);
  const [starRating, setStarRating] = useState<number>(3);
  const [tier, setTier] = useState<string>("Standard");
  const [imageUrl, setImageUrl] = useState("");
  const [description, setDescription] = useState("");

  const loadHotels = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/hotels?pageSize=50`);
      if (!res.ok) throw new Error("Failed to load hotels");
      const data = await res.json();
      setHotels(Array.isArray(data) ? data : data.items || []);
    } catch (err: unknown) {
      toast.error(
        "Could Not Load Accommodations",
        err instanceof Error ? err.message : "Failed to load hotel registry"
      );
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    let ignore = false;
    const fetchAsync = async () => {
      try {
        const res = await fetch(`${API_BASE}/hotels?pageSize=50`);
        if (!res.ok) throw new Error("Failed to load hotels");
        const data = await res.json();
        if (!ignore) {
          setHotels(Array.isArray(data) ? data : data.items || []);
          setLoading(false);
        }
      } catch (err: unknown) {
        if (!ignore) {
          setLoading(false);
          toast.error(
            "Could Not Load Accommodations",
            err instanceof Error ? err.message : "Failed to load hotel registry"
          );
        }
      }
    };
    fetchAsync();
    return () => {
      ignore = true;
    };
  }, [toast]);

  const handleDelete = async (hotel: HotelItem) => {
    if (!token) return;
    if (!confirm(`Are you sure you want to remove "${hotel.name}" from hotel listings?`)) return;
    try {
      const res = await fetch(`${API_BASE}/hotels/${hotel.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to delete accommodation");
      setHotels((prev) => prev.filter((h) => h.id !== hotel.id));
      toast.success("Hotel Removed", `${hotel.name} was removed from the database.`);
    } catch (err: unknown) {
      toast.error(
        "Delete Failed",
        err instanceof Error ? err.message : "Could not delete accommodation"
      );
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    if (!name.trim()) {
      toast.warning("Missing Name", "Please enter a hotel or resort name.");
      return;
    }

    try {
      setCreating(true);
      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
      const payload = {
        name: name.trim(),
        slug: `${slug}-${Date.now().toString().slice(-4)}`,
        place: place.trim(),
        location: location.trim() || `${place}, Bangladesh`,
        description: description.trim() || `Comfortable curated stay in ${place}.`,
        pricePerNight: Number(pricePerNight),
        rating: 4.5,
        reviewCount: 1,
        starRating: Number(starRating),
        tier: tier.trim(),
        imageUrl: imageUrl.trim() || "/images/hotels/default.jpg",
        amenities: ["Free WiFi", "Breakfast Included", "Air Conditioned", "24/7 Security"],
        isActive: true,
      };

      const res = await fetch(`${API_BASE}/hotels`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Failed to create hotel");
      }

      toast.success("Accommodation Registered", `${name} has been added to TourFlow.`);
      setShowCreateModal(false);
      setName("");
      setLocation("");
      setImageUrl("");
      setDescription("");
      loadHotels();
    } catch (err: unknown) {
      toast.error(
        "Registration Failed",
        err instanceof Error ? err.message : "Could not save hotel"
      );
    } finally {
      setCreating(false);
    }
  };

  const filteredHotels = hotels.filter((h) =>
    h.name.toLowerCase().includes(search.toLowerCase()) ||
    h.place.toLowerCase().includes(search.toLowerCase()) ||
    h.location.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-stone-900 flex items-center gap-2">
            <Building2 className="h-4 w-4 text-sky-700" />
            <span>Curated Partner Hotels & Eco-Resorts</span>
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            Manage verified stays, cottages, eco-resorts, and pricing across all divisions.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md bg-[#111827] text-white text-xs font-semibold hover:bg-black transition-colors shadow-xs"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Add Accommodation</span>
        </button>
      </div>

      <div className="bg-white border border-stone-200 rounded-lg overflow-hidden shadow-xs">
        {/* Search Bar */}
        <div className="p-3.5 border-b border-stone-200 bg-stone-50/60 flex items-center justify-between gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-stone-400" />
            <input
              type="text"
              placeholder="Search hotel name, location, place..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white border border-stone-300 rounded-md pl-9 pr-3 py-1.5 text-xs text-stone-900 focus:outline-none focus:border-stone-900"
            />
          </div>
          <div className="text-xs text-stone-500">
            Total Properties: <span className="font-semibold text-stone-900">{hotels.length}</span>
          </div>
        </div>

        {/* Hotels Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-stone-600">
            <thead className="bg-stone-50 border-b border-stone-200 text-stone-900 font-semibold">
              <tr>
                <th className="py-3 px-5">Property Name</th>
                <th className="py-3 px-5">Destination Place</th>
                <th className="py-3 px-5">Stars & Rating</th>
                <th className="py-3 px-5">Tier</th>
                <th className="py-3 px-5 text-right">Price / Night</th>
                <th className="py-3 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200">
              {filteredHotels.map((h) => (
                <tr key={h.id} className="hover:bg-stone-50/80 transition-colors">
                  <td className="py-3.5 px-5">
                    <div className="font-semibold text-stone-900">{h.name}</div>
                    <div className="text-[11px] text-stone-500 flex items-center gap-1 mt-0.5">
                      <MapPin className="h-3 w-3 text-stone-400" />
                      <span>{h.location}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-5">
                    <span className="font-medium text-stone-800 bg-stone-100 px-2 py-0.5 rounded text-[11px]">
                      {h.place}
                    </span>
                  </td>
                  <td className="py-3.5 px-5">
                    <div className="flex items-center gap-1 text-amber-500">
                      <Star className="h-3 w-3 fill-amber-400 text-amber-500" />
                      <span className="font-bold text-stone-800 text-xs">
                        {h.rating ? h.rating.toFixed(1) : "4.5"}
                      </span>
                      <span className="text-[11px] text-stone-400">({h.reviewCount || 0})</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-5">
                    <span className="text-stone-700 font-medium">
                      {h.tier || "Standard"}
                    </span>
                  </td>
                  <td className="py-3.5 px-5 text-right">
                    <div className="font-bold text-stone-900">
                      BDT {h.pricePerNight?.toLocaleString()}
                    </div>
                    <span className="text-[10px] text-stone-400">per night</span>
                  </td>
                  <td className="py-3.5 px-5 text-right">
                    <button
                      type="button"
                      onClick={() => handleDelete(h)}
                      className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                      title="Remove Hotel"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredHotels.length === 0 && !loading && (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-stone-400 text-xs">
                    No accommodations found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Hotel Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full border border-stone-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 border-b border-stone-200 flex items-center justify-between bg-stone-50">
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-sky-700" />
                <h3 className="text-sm font-semibold text-stone-900">Add New Accommodation</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="text-stone-400 hover:text-stone-700 p-1 rounded"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="block font-medium text-stone-700 mb-1">Property Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Sajek Hill View Resort"
                  className="w-full bg-white border border-stone-300 rounded px-2.5 py-1.5 focus:outline-none focus:border-stone-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-stone-700 mb-1">Destination Place</label>
                  <select
                    value={place}
                    onChange={(e) => setPlace(e.target.value)}
                    className="w-full bg-white border border-stone-300 rounded px-2.5 py-1.5 focus:outline-none focus:border-stone-900"
                  >
                    <option value="Sajek">Sajek Valley</option>
                    <option value="Cox's Bazar">Cox&apos;s Bazar</option>
                    <option value="Bandarban">Bandarban</option>
                    <option value="Sreemangal">Sreemangal</option>
                    <option value="Saint Martin">Saint Martin</option>
                    <option value="Sundarban">Sundarbans</option>
                    <option value="Sylhet">Sylhet</option>
                    <option value="Rangamati">Rangamati</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-stone-700 mb-1">Tier</label>
                  <select
                    value={tier}
                    onChange={(e) => setTier(e.target.value)}
                    className="w-full bg-white border border-stone-300 rounded px-2.5 py-1.5 focus:outline-none focus:border-stone-900"
                  >
                    <option value="Eco">Eco Resort</option>
                    <option value="Standard">Standard</option>
                    <option value="Deluxe">Deluxe</option>
                    <option value="Luxury">Luxury 5-Star</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-stone-700 mb-1">Price per Night (BDT)</label>
                  <input
                    type="number"
                    min={500}
                    step={100}
                    required
                    value={pricePerNight}
                    onChange={(e) => setPricePerNight(Number(e.target.value))}
                    className="w-full bg-white border border-stone-300 rounded px-2.5 py-1.5 focus:outline-none focus:border-stone-900"
                  />
                </div>

                <div>
                  <label className="block font-medium text-stone-700 mb-1">Star Category</label>
                  <select
                    value={starRating}
                    onChange={(e) => setStarRating(Number(e.target.value))}
                    className="w-full bg-white border border-stone-300 rounded px-2.5 py-1.5 focus:outline-none focus:border-stone-900"
                  >
                    <option value={3}>3 Star</option>
                    <option value={4}>4 Star</option>
                    <option value={5}>5 Star</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-medium text-stone-700 mb-1">Full Address / Location</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Ruilui Para, Sajek Valley, Baghaichhari, Rangamati"
                  className="w-full bg-white border border-stone-300 rounded px-2.5 py-1.5 focus:outline-none focus:border-stone-900"
                />
              </div>

              <div>
                <label className="block font-medium text-stone-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Highlights, views, and room qualities..."
                  className="w-full bg-white border border-stone-300 rounded px-2.5 py-1.5 focus:outline-none focus:border-stone-900"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-3.5 py-1.5 rounded border border-stone-300 bg-white hover:bg-stone-50 text-stone-700 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-4 py-1.5 rounded bg-[#111827] hover:bg-black text-white font-semibold shadow-xs"
                >
                  {creating ? "Adding..." : "Save Hotel"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
