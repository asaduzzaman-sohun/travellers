"use client";

import React from "react";
import { X, Upload, CheckCircle2, Trash2 } from "lucide-react";
import { uploadPostImage } from "@/lib/api";
import { useToast } from "@/lib/toast-context";

interface CreateStoryModalProps {
  createStoryOpen: boolean;
  setCreateStoryOpen: (open: boolean) => void;
  newStoryTitle: string;
  setNewStoryTitle: (title: string) => void;
  newStoryDivision: string;
  setNewStoryDivision: (div: string) => void;
  newStoryCategory: string;
  setNewStoryCategory: (cat: string) => void;
  newStoryContent: string;
  setNewStoryContent: (content: string) => void;
  newStoryCover: string;
  setNewStoryCover: (url: string) => void;
  uploadingStoryCover: boolean;
  setUploadingStoryCover: (uploading: boolean) => void;
  creatingStory: boolean;
  handleCreateStory: (e: React.FormEvent) => void;
}

export function CreateStoryModal({
  createStoryOpen,
  setCreateStoryOpen,
  newStoryTitle,
  setNewStoryTitle,
  newStoryDivision,
  setNewStoryDivision,
  newStoryCategory,
  setNewStoryCategory,
  newStoryContent,
  setNewStoryContent,
  newStoryCover,
  uploadingStoryCover,
  setUploadingStoryCover,
  setNewStoryCover,
  creatingStory,
  handleCreateStory,
}: CreateStoryModalProps) {
  const { toast } = useToast();

  if (!createStoryOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[#FFFFFF] border border-[#E5E7EB] rounded-lg max-w-lg w-full p-6 text-xs space-y-4 shadow-xl">
        <div className="flex items-center justify-between pb-3 border-b border-[#E5E7EB]">
          <div>
            <h3 className="font-semibold text-sm text-[#111827]">Publish Travel Narrative</h3>
            <p className="text-[11px] text-[#6B7280]">Share insights, trail notes, and advice with the community.</p>
          </div>
          <button
            onClick={() => setCreateStoryOpen(false)}
            className="text-[#6B7280] hover:text-[#111827] p-1 rounded transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleCreateStory} className="space-y-3.5">
          <div className="space-y-1">
            <label className="font-medium text-[#111827]">Story Title *</label>
            <input
              type="text"
              required
              placeholder="e.g. Navigating Tanguar Haor during Monsoon"
              value={newStoryTitle}
              onChange={(e) => setNewStoryTitle(e.target.value)}
              className="w-full bg-[#FFFFFF] border border-[#D1D5DB] rounded-md p-2 text-xs focus:outline-none focus:border-[#111827]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-medium text-[#111827]">Division *</label>
              <select
                value={newStoryDivision}
                onChange={(e) => setNewStoryDivision(e.target.value)}
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
            <div className="space-y-1">
              <label className="font-medium text-[#111827]">Category *</label>
              <select
                value={newStoryCategory}
                onChange={(e) => setNewStoryCategory(e.target.value)}
                className="w-full bg-[#FFFFFF] border border-[#D1D5DB] rounded-md p-2 text-xs focus:outline-none focus:border-[#111827]"
              >
                <option value="Travel Guide">Travel Guide</option>
                <option value="Hidden Gems">Hidden Gems</option>
                <option value="Budget Travel">Budget Travel</option>
                <option value="Tips & Safety">Tips & Safety</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="font-medium text-[#111827]">Cover Photo (Cloudinary CDN)</label>
            {newStoryCover ? (
              <div className="relative rounded-md overflow-hidden border border-stone-200 h-28 w-full group">
                <img
                  src={newStoryCover}
                  alt="Cover Preview"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <span className="text-[11px] text-white font-medium flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                    Uploaded
                  </span>
                  <button
                    type="button"
                    onClick={() => setNewStoryCover("")}
                    className="px-2 py-1 bg-rose-600 hover:bg-rose-700 text-white text-[10px] font-medium rounded transition-colors flex items-center gap-1"
                  >
                    <Trash2 className="h-3 w-3" />
                    Remove
                  </button>
                </div>
              </div>
            ) : (
              <div className="border border-dashed border-stone-300 rounded-md p-3 text-center bg-stone-50/50 hover:bg-stone-50 transition-colors">
                <input
                  type="file"
                  id="story-cover-input"
                  accept="image/*"
                  onChange={async (e) => {
                    const f = e.target.files?.[0];
                    if (!f) return;
                    setUploadingStoryCover(true);
                    try {
                      const res = await uploadPostImage(f);
                      setNewStoryCover(res.url);
                      toast.success("Cover photo uploaded to CDN");
                    } catch (err: unknown) {
                      toast.error(
                        "Upload failed",
                        err instanceof Error ? err.message : "Image could not be uploaded."
                      );
                    } finally {
                      setUploadingStoryCover(false);
                    }
                  }}
                  className="hidden"
                />
                <label
                  htmlFor="story-cover-input"
                  className="cursor-pointer flex flex-col items-center justify-center gap-1"
                >
                  <Upload className="h-4 w-4 text-stone-500" />
                  <span className="text-[11px] font-medium text-stone-700">
                    {uploadingStoryCover ? "Uploading to Cloudinary..." : "Click to upload cover photo"}
                  </span>
                  <span className="text-[10px] text-stone-400">PNG, JPG or WebP up to 5MB</span>
                </label>
              </div>
            )}
          </div>

          <div className="space-y-1">
            <label className="font-medium text-[#111827]">Narrative Content *</label>
            <textarea
              rows={4}
              required
              placeholder="Share details on transport routes, homestays, and leave-no-trace ethics..."
              value={newStoryContent}
              onChange={(e) => setNewStoryContent(e.target.value)}
              className="w-full bg-[#FFFFFF] border border-[#D1D5DB] rounded-md p-2 text-xs focus:outline-none focus:border-[#111827]"
            />
          </div>

          <div className="pt-3 border-t border-[#E5E7EB] flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setCreateStoryOpen(false)}
              className="px-3.5 py-1.5 border border-[#D1D5DB] rounded-md text-[#4B5563] hover:text-[#111827] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={creatingStory || uploadingStoryCover}
              className="px-4 py-1.5 bg-[#111827] hover:bg-black text-white font-semibold rounded-md transition-colors disabled:opacity-50"
            >
              {creatingStory ? "Publishing..." : "Publish Narrative"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
