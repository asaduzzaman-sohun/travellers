"use client";

import React, { useEffect, useState } from "react";
import {
  Tag,
  Plus,
  Trash2,
  CheckCircle2,
  XCircle,
  Clock,
  Users,
  Percent,
  Banknote,
  X,
  Search,
} from "lucide-react";
import { PromoItem, fetchPromos, createPromo, togglePromo, deletePromo } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/lib/toast-context";

export function PromosTab() {
  const { token } = useAuth();
  const { toast } = useToast();
  const [promos, setPromos] = useState<PromoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);

  // Form state
  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");
  const [discountType, setDiscountType] = useState<"Percentage" | "Flat">("Percentage");
  const [discountValue, setDiscountValue] = useState<number>(10);
  const [maxDiscountAmount, setMaxDiscountAmount] = useState<string>("");
  const [minimumTravelers, setMinimumTravelers] = useState<number>(1);
  const [maxUses, setMaxUses] = useState<number>(50);
  const [expiresInDays, setExpiresInDays] = useState<number>(30);
  const [applicableCategory, setApplicableCategory] = useState<string>("");

  const loadPromos = React.useCallback(async () => {
    if (!token) return;
    try {
      setLoading(true);
      const data = await fetchPromos(token);
      setPromos(data);
    } catch (err: unknown) {
      toast.error(
        "Could Not Load Promos",
        err instanceof Error ? err.message : "Failed to load promo codes"
      );
    } finally {
      setLoading(false);
    }
  }, [token, toast]);

  useEffect(() => {
    if (!token) return;
    let ignore = false;
    const fetchAsync = async () => {
      try {
        const data = await fetchPromos(token);
        if (!ignore) {
          setPromos(data);
          setLoading(false);
        }
      } catch (err: unknown) {
        if (!ignore) {
          setLoading(false);
          toast.error(
            "Could Not Load Promos",
            err instanceof Error ? err.message : "Failed to load promo codes"
          );
        }
      }
    };
    fetchAsync();
    return () => {
      ignore = true;
    };
  }, [token, toast]);

  const handleToggle = async (promo: PromoItem) => {
    if (!token) return;
    try {
      await togglePromo(promo.id, token);
      setPromos((prev) =>
        prev.map((p) => (p.id === promo.id ? { ...p, isActive: !p.isActive } : p))
      );
      toast.success(
        "Promo Updated",
        `Promo ${promo.code} is now ${!promo.isActive ? "Active" : "Inactive"}.`
      );
    } catch (err: unknown) {
      toast.error(
        "Update Failed",
        err instanceof Error ? err.message : "Could not toggle promo status"
      );
    }
  };

  const handleDelete = async (promo: PromoItem) => {
    if (!token) return;
    if (!confirm(`Are you sure you want to delete promo code "${promo.code}"?`)) return;
    try {
      await deletePromo(promo.id, token);
      setPromos((prev) => prev.filter((p) => p.id !== promo.id));
      toast.success("Promo Deleted", `Code ${promo.code} has been removed.`);
    } catch (err: unknown) {
      toast.error(
        "Deletion Failed",
        err instanceof Error ? err.message : "Could not delete promo code"
      );
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    if (!code.trim()) {
      toast.warning("Missing Code", "Please enter a valid promotional code.");
      return;
    }

    try {
      setCreating(true);
      const expiry = new Date();
      expiry.setDate(expiry.getDate() + (expiresInDays || 30));

      const created = await createPromo(
        {
          code: code.trim().toUpperCase(),
          description: description.trim() || "Promotional seasonal discount",
          discountType,
          discountValue: Number(discountValue),
          maxDiscountAmount: maxDiscountAmount ? Number(maxDiscountAmount) : undefined,
          minimumTravelers: Number(minimumTravelers) || 1,
          maxUses: Number(maxUses) || 50,
          expiresAtUtc: expiry.toISOString(),
          isActive: true,
          applicableCategory: applicableCategory.trim() || undefined,
        },
        token
      );

      toast.success("Promo Created", `Promo code ${created.code} is now live!`);
      setShowCreateModal(false);
      // Reset form
      setCode("");
      setDescription("");
      setDiscountValue(10);
      setMaxDiscountAmount("");
      setApplicableCategory("");
      loadPromos();
    } catch (err: unknown) {
      toast.error(
        "Creation Failed",
        err instanceof Error ? err.message : "Failed to create promo code"
      );
    } finally {
      setCreating(false);
    }
  };

  const filteredPromos = promos.filter((p) =>
    p.code.toLowerCase().includes(search.toLowerCase()) ||
    p.description.toLowerCase().includes(search.toLowerCase()) ||
    (p.applicableCategory && p.applicableCategory.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-stone-900 flex items-center gap-2">
            <Tag className="h-4 w-4 text-emerald-700" />
            <span>Seasonal Promo Codes & Discount Vouchers</span>
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            Create and regulate instant discounts, flat cashbacks, and group promo deals.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md bg-[#111827] text-white text-xs font-semibold hover:bg-black transition-colors shadow-xs"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>New Promo Code</span>
        </button>
      </div>

      <div className="bg-white border border-stone-200 rounded-lg overflow-hidden shadow-xs">
        {/* Search Bar */}
        <div className="p-3.5 border-b border-stone-200 bg-stone-50/60 flex items-center justify-between gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-stone-400" />
            <input
              type="text"
              placeholder="Search code, category, description..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white border border-stone-300 rounded-md pl-9 pr-3 py-1.5 text-xs text-stone-900 focus:outline-none focus:border-stone-900"
            />
          </div>
          <div className="text-xs text-stone-500">
            Total Promos: <span className="font-semibold text-stone-900">{promos.length}</span>
          </div>
        </div>

        {/* Promos Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-stone-600">
            <thead className="bg-stone-50 dark:bg-[#141720] border-b border-stone-200 dark:border-[#1e2434] text-stone-900 dark:text-stone-200 font-semibold">
              <tr>
                <th className="py-3 px-5">Promo Code</th>
                <th className="py-3 px-5">Discount</th>
                <th className="py-3 px-5">Min Travelers</th>
                <th className="py-3 px-5">Usage</th>
                <th className="py-3 px-5">Category</th>
                <th className="py-3 px-5">Status</th>
                <th className="py-3 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200 dark:divide-[#1e2434]">
              {filteredPromos.map((p) => {
                const isExpired = p.expiresAtUtc && new Date(p.expiresAtUtc) < new Date();
                return (
                  <tr key={p.id} className="hover:bg-stone-50/80 dark:hover:bg-[#161a25] transition-colors">
                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded">
                          {p.code}
                        </span>
                      </div>
                      <div className="text-[11px] text-stone-500 mt-0.5 line-clamp-1">
                        {p.description}
                      </div>
                    </td>
                    <td className="py-3.5 px-5">
                      <div className="font-semibold text-stone-900 flex items-center gap-1">
                        {p.discountType === "Percentage" ? (
                          <>
                            <Percent className="h-3 w-3 text-stone-400" />
                            <span>{p.discountValue}% OFF</span>
                          </>
                        ) : (
                          <>
                            <Banknote className="h-3 w-3 text-stone-400" />
                            <span>BDT {p.discountValue.toLocaleString()} Flat</span>
                          </>
                        )}
                      </div>
                      {p.maxDiscountAmount && (
                        <div className="text-[10px] text-stone-500">
                          Max: BDT {p.maxDiscountAmount.toLocaleString()}
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-1 text-stone-700">
                        <Users className="h-3 w-3 text-stone-400" />
                        <span>{p.minimumTravelers} pax min</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-5">
                      <div className="font-mono text-stone-800">
                        {p.timesUsed} / {p.maxUses}
                      </div>
                      {isExpired ? (
                        <span className="text-[10px] text-rose-600 flex items-center gap-0.5 mt-0.5">
                          <Clock className="h-2.5 w-2.5" /> Expired
                        </span>
                      ) : p.expiresAtUtc ? (
                        <span className="text-[10px] text-stone-400 flex items-center gap-0.5 mt-0.5">
                          <Clock className="h-2.5 w-2.5" />
                          {new Date(p.expiresAtUtc).toLocaleDateString()}
                        </span>
                      ) : null}
                    </td>
                    <td className="py-3.5 px-5">
                      <span className="text-stone-700 font-medium">
                        {p.applicableCategory || "All Expeditions"}
                      </span>
                    </td>
                    <td className="py-3.5 px-5">
                      <button
                        type="button"
                        onClick={() => handleToggle(p)}
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium border transition-colors ${
                          p.isActive
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                            : "bg-stone-100 text-stone-600 border-stone-200 hover:bg-stone-200"
                        }`}
                      >
                        {p.isActive ? (
                          <>
                            <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                            <span>Active</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="h-3 w-3 text-stone-400" />
                            <span>Inactive</span>
                          </>
                        )}
                      </button>
                    </td>
                    <td className="py-3.5 px-5 text-right">
                      <button
                        type="button"
                        onClick={() => handleDelete(p)}
                        className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                        title="Delete Promo Code"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
              {filteredPromos.length === 0 && !loading && (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-stone-400 text-xs">
                    No promo codes found. Create one to begin offering campaign vouchers.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Promo Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full border border-stone-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 border-b border-stone-200 flex items-center justify-between bg-stone-50">
              <div className="flex items-center gap-2">
                <Tag className="h-4 w-4 text-emerald-700" />
                <h3 className="text-sm font-semibold text-stone-900">Create New Promo Code</h3>
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
                <label className="block font-medium text-stone-700 mb-1">
                  Promo Code (e.g. SAJEK2026, MONSOON15)
                </label>
                <input
                  type="text"
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="CODE2026"
                  className="w-full font-mono uppercase bg-white border border-stone-300 rounded px-2.5 py-1.5 focus:outline-none focus:border-stone-900"
                />
              </div>

              <div>
                <label className="block font-medium text-stone-700 mb-1">Description</label>
                <input
                  type="text"
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. 15% discount for Hill Tracts expeditions"
                  className="w-full bg-white border border-stone-300 rounded px-2.5 py-1.5 focus:outline-none focus:border-stone-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-stone-700 mb-1">Discount Type</label>
                  <select
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value as "Percentage" | "Flat")}
                    className="w-full bg-white border border-stone-300 rounded px-2.5 py-1.5 focus:outline-none focus:border-stone-900"
                  >
                    <option value="Percentage">Percentage (%)</option>
                    <option value="Flat">Flat Cash (BDT)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-stone-700 mb-1">
                    Value {discountType === "Percentage" ? "(%)" : "(BDT)"}
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={discountType === "Percentage" ? 100 : 50000}
                    required
                    value={discountValue}
                    onChange={(e) => setDiscountValue(Number(e.target.value))}
                    className="w-full bg-white border border-stone-300 rounded px-2.5 py-1.5 focus:outline-none focus:border-stone-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-stone-700 mb-1">
                    Max Discount (BDT) <span className="text-stone-400 font-normal">Optional</span>
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 3000"
                    value={maxDiscountAmount}
                    onChange={(e) => setMaxDiscountAmount(e.target.value)}
                    className="w-full bg-white border border-stone-300 rounded px-2.5 py-1.5 focus:outline-none focus:border-stone-900"
                  />
                </div>

                <div>
                  <label className="block font-medium text-stone-700 mb-1">Min Travelers</label>
                  <input
                    type="number"
                    min={1}
                    value={minimumTravelers}
                    onChange={(e) => setMinimumTravelers(Number(e.target.value))}
                    className="w-full bg-white border border-stone-300 rounded px-2.5 py-1.5 focus:outline-none focus:border-stone-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-stone-700 mb-1">Max Redemptions</label>
                  <input
                    type="number"
                    min={1}
                    value={maxUses}
                    onChange={(e) => setMaxUses(Number(e.target.value))}
                    className="w-full bg-white border border-stone-300 rounded px-2.5 py-1.5 focus:outline-none focus:border-stone-900"
                  />
                </div>

                <div>
                  <label className="block font-medium text-stone-700 mb-1">Valid Days</label>
                  <input
                    type="number"
                    min={1}
                    value={expiresInDays}
                    onChange={(e) => setExpiresInDays(Number(e.target.value))}
                    className="w-full bg-white border border-stone-300 rounded px-2.5 py-1.5 focus:outline-none focus:border-stone-900"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-stone-700 mb-1">
                  Target Division / Category <span className="text-stone-400 font-normal">Optional</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Chittagong, Sylhet, Coastal, or blank for all"
                  value={applicableCategory}
                  onChange={(e) => setApplicableCategory(e.target.value)}
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
                  {creating ? "Creating..." : "Save & Activate"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
