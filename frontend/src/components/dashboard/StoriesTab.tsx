"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Plus, Trash2, Eye, ThumbsUp, Search, BookOpen, ExternalLink } from "lucide-react";
import { BlogPost } from "@/lib/api";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { useToast } from "@/lib/toast-context";

interface StoriesTabProps {
  storiesList: BlogPost[];
  isTraveller: boolean;
  setCreateStoryOpen: (open: boolean) => void;
  handleDeleteStory: (storyId: string) => Promise<void> | void;
}

export function StoriesTab({
  storiesList,
  isTraveller,
  setCreateStoryOpen,
  handleDeleteStory,
}: StoriesTabProps) {
  const { toast } = useToast();
  const [storySearch, setStorySearch] = useState("");
  const [divisionFilter, setDivisionFilter] = useState("all");
  const [pendingDeleteStory, setPendingDeleteStory] = useState<BlogPost | null>(null);
  const [deleting, setDeleting] = useState(false);

  const filteredStories = storiesList.filter((s) => {
    const matchesSearch =
      s.title.toLowerCase().includes(storySearch.toLowerCase()) ||
      s.authorName.toLowerCase().includes(storySearch.toLowerCase()) ||
      (s.category && s.category.toLowerCase().includes(storySearch.toLowerCase()));

    const matchesDivision =
      divisionFilter === "all" || s.division?.toLowerCase() === divisionFilter.toLowerCase();

    return matchesSearch && matchesDivision;
  });

  const confirmDelete = async () => {
    if (!pendingDeleteStory) return;
    setDeleting(true);
    try {
      await handleDeleteStory(pendingDeleteStory.id);
      toast.success("Story Removed", `"${pendingDeleteStory.title}" was deleted.`);
      setPendingDeleteStory(null);
    } catch {
      toast.error("Failed to Remove Story", "Please check your network connection and retry.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <div className="bg-[#FFFFFF] border border-[#E5E7EB] rounded-lg overflow-hidden shadow-xs">
        {/* Header */}
        <div className="p-4 border-b border-[#E5E7EB] flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#FAFAFA]">
          <div>
            <h3 className="text-sm font-semibold text-[#111827] flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-stone-700" />
              <span>{!isTraveller ? "Community Moderation & Narratives" : "My Travel Stories"}</span>
            </h3>
            <p className="text-xs text-[#6B7280] mt-0.5">
              {!isTraveller
                ? "Review, curate, and moderate verified traveler stories across Bangladesh."
                : "Your published trip experiences and reflections for fellow explorers."}
            </p>
          </div>
          <button
            onClick={() => setCreateStoryOpen(true)}
            className="px-3.5 py-1.5 bg-[#111827] hover:bg-black text-white rounded-md text-xs font-semibold transition-colors flex items-center gap-1.5 self-start sm:self-auto shrink-0 shadow-xs"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Publish Narrative</span>
          </button>
        </div>

        {/* Filter Toolbar */}
        <div className="p-4 border-b border-[#E5E7EB] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#9CA3AF]" />
            <input
              type="text"
              placeholder="Search stories by title, author, topic..."
              value={storySearch}
              onChange={(e) => setStorySearch(e.target.value)}
              className="w-full bg-[#FFFFFF] border border-[#D1D5DB] rounded-md pl-9 pr-3 py-1.5 text-xs text-[#111827] focus:outline-none focus:border-[#111827]"
            />
            {storySearch && (
              <button
                type="button"
                onClick={() => setStorySearch("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 text-[10px]"
              >
                Clear
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            {["all", "Chittagong", "Sylhet", "Khulna", "Barishal", "Dhaka"].map((div) => {
              const count =
                div === "all"
                  ? storiesList.length
                  : storiesList.filter((s) => s.division?.toLowerCase() === div.toLowerCase()).length;
              const isActive = divisionFilter.toLowerCase() === div.toLowerCase();

              return (
                <button
                  key={div}
                  onClick={() => setDivisionFilter(div)}
                  className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                    isActive
                      ? "bg-[#111827] text-white"
                      : "bg-white text-stone-600 hover:text-stone-900 border border-stone-200"
                  }`}
                >
                  {div === "all" ? "All Regions" : div} ({count})
                </button>
              );
            })}
          </div>
        </div>

        {/* Stories Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#4B5563]">
            <thead className="bg-[#F9FAFB] border-b border-[#E5E7EB] text-[#111827] font-semibold">
              <tr>
                <th className="py-3 px-5">Story Title</th>
                <th className="py-3 px-5">Author</th>
                <th className="py-3 px-5">Region</th>
                <th className="py-3 px-5">Views</th>
                <th className="py-3 px-5">Upvotes</th>
                <th className="py-3 px-5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E7EB]">
              {filteredStories.map((s) => (
                <tr key={s.id} className="hover:bg-[#F9FAFB] transition-colors">
                  <td className="py-3.5 px-5">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-14 rounded overflow-hidden bg-stone-100 border border-stone-200 shrink-0 relative">
                        {s.coverImageUrl ? (
                          <img
                            src={s.coverImageUrl}
                            alt={s.title}
                            className="h-full w-full object-cover"
                            loading="lazy"
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center text-stone-400">
                            <BookOpen className="h-4 w-4" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 max-w-sm">
                        <Link
                          href={`/community/${s.id}`}
                          className="font-semibold text-[#111827] hover:underline block truncate"
                        >
                          {s.title}
                        </Link>
                        {s.category && (
                          <span className="text-[11px] text-stone-500 mt-0.5 block">
                            {s.category}
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-5 font-medium text-stone-800">{s.authorName}</td>
                  <td className="py-3.5 px-5">
                    <span className="inline-block px-2 py-0.5 rounded text-[11px] font-medium bg-stone-100 text-stone-700 border border-stone-200">
                      {s.division || "National"}
                    </span>
                  </td>
                  <td className="py-3.5 px-5">
                    <span className="inline-flex items-center gap-1 text-stone-600">
                      <Eye className="h-3 w-3 text-stone-400" />
                      <span>{(s.views || 0).toLocaleString()}</span>
                    </span>
                  </td>
                  <td className="py-3.5 px-5">
                    <span className="inline-flex items-center gap-1 text-stone-600">
                      <ThumbsUp className="h-3 w-3 text-stone-400" />
                      <span>{(s.upvotes || 0).toLocaleString()}</span>
                    </span>
                  </td>
                  <td className="py-3.5 px-5 text-right">
                    <div className="inline-flex items-center justify-end gap-2">
                      <Link
                        href={`/community/${s.id}`}
                        className="p-1 text-stone-400 hover:text-stone-800 transition-colors"
                        title="Read Story"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </Link>
                      <button
                        type="button"
                        onClick={() => setPendingDeleteStory(s)}
                        className="p-1 text-rose-500 hover:text-rose-700 transition-colors"
                        title="Delete Story"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredStories.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 text-center">
                    <div className="max-w-xs mx-auto flex flex-col items-center justify-center text-center space-y-2">
                      <div className="h-10 w-10 rounded-full bg-stone-100 flex items-center justify-center text-stone-400">
                        <BookOpen className="h-5 w-5" />
                      </div>
                      <p className="text-xs font-semibold text-stone-900">No stories found</p>
                      <p className="text-[11px] text-stone-500">
                        {storySearch || divisionFilter !== "all"
                          ? "No narratives match your current query."
                          : "No travel narratives have been published yet."}
                      </p>
                      {storySearch || divisionFilter !== "all" ? (
                        <button
                          onClick={() => {
                            setStorySearch("");
                            setDivisionFilter("all");
                          }}
                          className="mt-2 text-xs font-medium text-stone-800 underline hover:text-stone-950"
                        >
                          Reset Filters
                        </button>
                      ) : (
                        <button
                          onClick={() => setCreateStoryOpen(true)}
                          className="mt-2 inline-flex items-center gap-1 px-3 py-1.5 rounded-md bg-[#111827] text-white text-xs font-medium hover:bg-black transition-colors"
                        >
                          <Plus className="h-3 w-3" />
                          <span>Write First Narrative</span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(pendingDeleteStory)}
        onClose={() => setPendingDeleteStory(null)}
        onConfirm={confirmDelete}
        title="Remove Travel Story"
        message={`Are you sure you want to permanently delete "${pendingDeleteStory?.title}"? This action cannot be reversed.`}
        confirmText="Remove Story"
        cancelText="Keep Story"
        isDestructive={true}
        loading={deleting}
      />
    </>
  );
}
