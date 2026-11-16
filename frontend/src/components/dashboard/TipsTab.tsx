"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  Lightbulb,
  Plus,
  Trash2,
  Eye,
  Search,
  X,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/lib/toast-context";
import { API_BASE } from "@/lib/api";

interface TipItem {
  id: string;
  title: string;
  slug: string;
  category: string;
  summary: string;
  viewsCount: number;
  season?: string;
  isPublished: boolean;
  createdAtUtc: string;
}

export function TipsTab() {
  const { token } = useAuth();
  const { toast } = useToast();
  const [tips, setTips] = useState<TipItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);

  // Form state
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Packing");
  const [summary, setSummary] = useState("");
  const [content, setContent] = useState("");
  const [season, setSeason] = useState("Year-round");

  const loadTips = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/traveltips?pageSize=50`);
      if (!res.ok) throw new Error("Failed to load travel tips");
      const data = await res.json();
      setTips(Array.isArray(data) ? data : data.items || []);
    } catch (err: unknown) {
      toast.error(
        "Could Not Load Tips",
        err instanceof Error ? err.message : "Failed to load travel insights"
      );
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    let ignore = false;
    const fetchAsync = async () => {
      try {
        const res = await fetch(`${API_BASE}/traveltips?pageSize=50`);
        if (!res.ok) throw new Error("Failed to load travel tips");
        const data = await res.json();
        if (!ignore) {
          setTips(Array.isArray(data) ? data : data.items || []);
          setLoading(false);
        }
      } catch (err: unknown) {
        if (!ignore) {
          setLoading(false);
          toast.error(
            "Could Not Load Tips",
            err instanceof Error ? err.message : "Failed to load travel insights"
          );
        }
      }
    };
    fetchAsync();
    return () => {
      ignore = true;
    };
  }, [toast]);

  const handleDelete = async (tip: TipItem) => {
    if (!token) return;
    if (!confirm(`Are you sure you want to delete tip "${tip.title}"?`)) return;
    try {
      const res = await fetch(`${API_BASE}/traveltips/${tip.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to delete travel tip");
      setTips((prev) => prev.filter((t) => t.id !== tip.id));
      toast.success("Tip Deleted", `${tip.title} was removed.`);
    } catch (err: unknown) {
      toast.error(
        "Delete Failed",
        err instanceof Error ? err.message : "Could not delete travel tip"
      );
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    if (!title.trim()) {
      toast.warning("Missing Title", "Please enter an advisory title.");
      return;
    }

    try {
      setCreating(true);
      const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
      const payload = {
        title: title.trim(),
        slug: `${slug}-${Date.now().toString().slice(-4)}`,
        category: category.trim(),
        summary: summary.trim() || title.trim(),
        content: content.trim() || summary.trim(),
        season: season.trim(),
        authorName: "TourFlow Safety Team",
        viewsCount: 0,
        isPublished: true,
      };

      const res = await fetch(`${API_BASE}/traveltips`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Failed to create tip");
      }

      toast.success("Travel Tip Published", `${title} is now live for all travelers.`);
      setShowCreateModal(false);
      setTitle("");
      setSummary("");
      setContent("");
      loadTips();
    } catch (err: unknown) {
      toast.error(
        "Publishing Failed",
        err instanceof Error ? err.message : "Could not publish travel tip"
      );
    } finally {
      setCreating(false);
    }
  };

  const filteredTips = tips.filter((t) =>
    t.title.toLowerCase().includes(search.toLowerCase()) ||
    t.category.toLowerCase().includes(search.toLowerCase()) ||
    t.summary.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-stone-900 flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-amber-600" />
            <span>Traveler Guidelines & Seasonal Field Advisories</span>
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            Publish domestic travel advice, local customs, monsoon precautions, and gear checklists.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md bg-[#111827] text-white text-xs font-semibold hover:bg-black transition-colors shadow-xs"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Publish Advisory</span>
        </button>
      </div>

      <div className="bg-white border border-stone-200 rounded-lg overflow-hidden shadow-xs">
        {/* Search Bar */}
        <div className="p-3.5 border-b border-stone-200 bg-stone-50/60 flex items-center justify-between gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-stone-400" />
            <input
              type="text"
              placeholder="Search advisory title, category, keywords..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white border border-stone-300 rounded-md pl-9 pr-3 py-1.5 text-xs text-stone-900 focus:outline-none focus:border-stone-900"
            />
          </div>
          <div className="text-xs text-stone-500">
            Total Articles: <span className="font-semibold text-stone-900">{tips.length}</span>
          </div>
        </div>

        {/* Tips Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-stone-600">
            <thead className="bg-stone-50 border-b border-stone-200 text-stone-900 font-semibold">
              <tr>
                <th className="py-3 px-5">Title & Summary</th>
                <th className="py-3 px-5">Category</th>
                <th className="py-3 px-5">Season</th>
                <th className="py-3 px-5">Views</th>
                <th className="py-3 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200">
              {filteredTips.map((t) => (
                <tr key={t.id} className="hover:bg-stone-50/80 transition-colors">
                  <td className="py-3.5 px-5">
                    <div className="font-semibold text-stone-900">{t.title}</div>
                    <div className="text-[11px] text-stone-500 line-clamp-1 mt-0.5">
                      {t.summary}
                    </div>
                  </td>
                  <td className="py-3.5 px-5">
                    <span className="font-medium text-stone-800 bg-stone-100 px-2 py-0.5 rounded text-[11px]">
                      {t.category}
                    </span>
                  </td>
                  <td className="py-3.5 px-5">
                    <span className="text-stone-700 font-medium">
                      {t.season || "Year-round"}
                    </span>
                  </td>
                  <td className="py-3.5 px-5">
                    <div className="flex items-center gap-1 text-stone-600 font-mono">
                      <Eye className="h-3 w-3 text-stone-400" />
                      <span>{t.viewsCount || 0}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-5 text-right">
                    <button
                      type="button"
                      onClick={() => handleDelete(t)}
                      className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                      title="Delete Advisory"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredTips.length === 0 && !loading && (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-stone-400 text-xs">
                    No travel advisories found. Publish your first tip above.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Advisory Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full border border-stone-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 border-b border-stone-200 flex items-center justify-between bg-stone-50">
              <div className="flex items-center gap-2">
                <Lightbulb className="h-4 w-4 text-amber-600" />
                <h3 className="text-sm font-semibold text-stone-900">Publish Travel Advisory</h3>
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
                <label className="block font-medium text-stone-700 mb-1">Advisory Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Monsoon Trekking in Bandarban: Leech & Trail Safety"
                  className="w-full bg-white border border-stone-300 rounded px-2.5 py-1.5 focus:outline-none focus:border-stone-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-stone-700 mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-white border border-stone-300 rounded px-2.5 py-1.5 focus:outline-none focus:border-stone-900"
                  >
                    <option value="Packing">Packing & Gear</option>
                    <option value="Safety">Safety & Health</option>
                    <option value="Culture">Local Customs & Culture</option>
                    <option value="Weather">Weather & Seasons</option>
                    <option value="Transportation">Transportation & Commute</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-stone-700 mb-1">Recommended Season</label>
                  <select
                    value={season}
                    onChange={(e) => setSeason(e.target.value)}
                    className="w-full bg-white border border-stone-300 rounded px-2.5 py-1.5 focus:outline-none focus:border-stone-900"
                  >
                    <option value="Year-round">Year-round</option>
                    <option value="Winter (Nov-Feb)">Winter (Nov-Feb)</option>
                    <option value="Monsoon (Jun-Aug)">Monsoon (Jun-Aug)</option>
                    <option value="Autumn (Sep-Oct)">Autumn (Sep-Oct)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-medium text-stone-700 mb-1">Brief Summary</label>
                <input
                  type="text"
                  required
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  placeholder="One sentence key takeaway for travelers..."
                  className="w-full bg-white border border-stone-300 rounded px-2.5 py-1.5 focus:outline-none focus:border-stone-900"
                />
              </div>

              <div>
                <label className="block font-medium text-stone-700 mb-1">Detailed Content</label>
                <textarea
                  rows={4}
                  required
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Write step-by-step guidance, essential checklists, contacts, or tips..."
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
                  {creating ? "Publishing..." : "Publish Advisory"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
