"use client";

import React from "react";
import { X, Compass } from "lucide-react";

interface CreateTourModalProps {
  createTourOpen: boolean;
  setCreateTourOpen: (open: boolean) => void;
  newTourTitle: string;
  setNewTourTitle: (title: string) => void;
  newTourLocation: string;
  setNewTourLocation: (loc: string) => void;
  newTourDivision: string;
  setNewTourDivision: (div: string) => void;
  newTourCategory: string;
  setNewTourCategory: (cat: string) => void;
  newTourPrice: number;
  setNewTourPrice: (p: number) => void;
  newTourDays: number;
  setNewTourDays: (d: number) => void;
  newTourNights: number;
  setNewTourNights: (n: number) => void;
  newTourDescription: string;
  setNewTourDescription: (desc: string) => void;
  creatingTour: boolean;
  handleCreateTour: (e: React.FormEvent) => void;
}

export function CreateTourModal({
  createTourOpen,
  setCreateTourOpen,
  newTourTitle,
  setNewTourTitle,
  newTourLocation,
  setNewTourLocation,
  newTourDivision,
  setNewTourDivision,
  newTourPrice,
  setNewTourPrice,
  newTourDays,
  setNewTourDays,
  newTourNights,
  setNewTourNights,
  newTourDescription,
  setNewTourDescription,
  creatingTour,
  handleCreateTour,
}: CreateTourModalProps) {
  if (!createTourOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[#FFFFFF] border border-[#E5E7EB] rounded-lg max-w-lg w-full p-6 text-xs space-y-4 shadow-xl">
        <div className="flex items-center justify-between pb-3 border-b border-[#E5E7EB]">
          <div>
            <h3 className="font-semibold text-sm text-[#111827] flex items-center gap-1.5">
              <Compass className="h-4 w-4 text-stone-700" />
              <span>Create New Tour Expedition</span>
            </h3>
            <p className="text-[11px] text-[#6B7280]">
              Add a new curated domestic travel package to the public catalog.
            </p>
          </div>
          <button
            onClick={() => setCreateTourOpen(false)}
            className="text-[#6B7280] hover:text-[#111827] p-1 rounded transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleCreateTour} className="space-y-3.5">
          <div className="space-y-1">
            <label className="font-medium text-[#111827]">Tour Package Title *</label>
            <input
              type="text"
              required
              placeholder="e.g. Sajek Valley Cloud Trail Expedition"
              value={newTourTitle}
              onChange={(e) => setNewTourTitle(e.target.value)}
              className="w-full bg-[#FFFFFF] border border-[#D1D5DB] rounded-md p-2 text-xs focus:outline-none focus:border-[#111827]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-medium text-[#111827]">Location / Hub *</label>
              <input
                type="text"
                required
                placeholder="e.g. Sajek & Ruilui Para"
                value={newTourLocation}
                onChange={(e) => setNewTourLocation(e.target.value)}
                className="w-full bg-[#FFFFFF] border border-[#D1D5DB] rounded-md p-2 text-xs focus:outline-none focus:border-[#111827]"
              />
            </div>
            <div className="space-y-1">
              <label className="font-medium text-[#111827]">Division *</label>
              <select
                value={newTourDivision}
                onChange={(e) => setNewTourDivision(e.target.value)}
                className="w-full bg-[#FFFFFF] border border-[#D1D5DB] rounded-md p-2 text-xs focus:outline-none focus:border-[#111827]"
              >
                <option value="Chittagong">Chittagong</option>
                <option value="Sylhet">Sylhet</option>
                <option value="Khulna">Khulna</option>
                <option value="Barishal">Barishal</option>
                <option value="Dhaka">Dhaka</option>
                <option value="Rajshahi">Rajshahi</option>
                <option value="Rangpur">Rangpur</option>
                <option value="Mymensingh">Mymensingh</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="font-medium text-[#111827]">Price (BDT) *</label>
              <input
                type="number"
                min="1000"
                value={newTourPrice}
                onChange={(e) => setNewTourPrice(Number(e.target.value))}
                className="w-full bg-[#FFFFFF] border border-[#D1D5DB] rounded-md p-2 text-xs focus:outline-none focus:border-[#111827]"
              />
            </div>
            <div className="space-y-1">
              <label className="font-medium text-[#111827]">Days *</label>
              <input
                type="number"
                min="1"
                value={newTourDays}
                onChange={(e) => setNewTourDays(Number(e.target.value))}
                className="w-full bg-[#FFFFFF] border border-[#D1D5DB] rounded-md p-2 text-xs focus:outline-none focus:border-[#111827]"
              />
            </div>
            <div className="space-y-1">
              <label className="font-medium text-[#111827]">Nights *</label>
              <input
                type="number"
                min="0"
                value={newTourNights}
                onChange={(e) => setNewTourNights(Number(e.target.value))}
                className="w-full bg-[#FFFFFF] border border-[#D1D5DB] rounded-md p-2 text-xs focus:outline-none focus:border-[#111827]"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-medium text-[#111827]">Overview Description</label>
            <textarea
              rows={3}
              placeholder="Outline key logistics, scenic points, and schedule..."
              value={newTourDescription}
              onChange={(e) => setNewTourDescription(e.target.value)}
              className="w-full bg-[#FFFFFF] border border-[#D1D5DB] rounded-md p-2 text-xs focus:outline-none focus:border-[#111827]"
            />
          </div>

          <div className="pt-3 border-t border-[#E5E7EB] flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setCreateTourOpen(false)}
              className="px-3.5 py-1.5 border border-[#D1D5DB] rounded-md text-[#4B5563] hover:text-[#111827] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={creatingTour}
              className="px-4 py-1.5 bg-[#111827] hover:bg-black text-white font-semibold rounded-md transition-colors disabled:opacity-50"
            >
              {creatingTour ? "Creating..." : "Save Expedition"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
