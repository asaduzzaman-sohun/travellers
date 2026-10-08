"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import {
  MessageSquare,
  ThumbsUp,
  Search,
  PenSquare,
  Trash2,
  Edit3,
  Loader2,
  Calendar,
  MapPin,
  Send,
  Eye,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Compass
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import {
  getBlogPosts,
  upvoteBlogPost,
  addBlogComment,
  deleteBlogPost,
  deleteBlogComment,
  getBlogPost,
  BlogPost,
  BlogComment,
} from "@/lib/api";
import ImageWithFallback from "@/components/ImageWithFallback";
import { useToast } from "@/lib/toast-context";
import { StoryCardSkeleton } from "@/components/ui/Skeletons";

export default function CommunityPage() {
  const { user, isLoggedIn, openAuthModal } = useAuth();
  const { toast } = useToast();

  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedDivision, setSelectedDivision] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  // Upvote local tracking
  const [upvotedIds, setUpvotedIds] = useState<Set<string>>(new Set());

  // Active post for comments modal
  const [activePost, setActivePost] = useState<BlogPost | null>(null);
  const [loadingActivePost, setLoadingActivePost] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);

  // Post delete state
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 6;

  const categories = [
    "All",
    "Travel Guide",
    "Hidden Gems",
    "Budget Travel",
    "Photography",
    "Nature & Wildlife",
    "Tips & Safety",
  ];

  const divisions = [
    "All",
    "Chattogram",
    "Sylhet",
    "Dhaka",
    "Khulna",
    "Barishal",
    "Rajshahi",
    "Rangpur",
    "Mymensingh",
  ];

  // Fetch posts from backend API
  const fetchPosts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getBlogPosts({
        category: selectedCategory,
        division: selectedDivision,
        search: searchQuery.trim() || undefined,
      });
      setPosts(data);
    } catch (err: unknown) {
      console.error(err);
      setError("Unable to load travel stories. Please ensure the backend is active.");
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, selectedDivision, searchQuery]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  // Reset page when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, selectedDivision, searchQuery]);

  // Pagination Slice
  const totalPages = Math.ceil(posts.length / postsPerPage);
  const startIndex = (currentPage - 1) * postsPerPage;
  const paginatedPosts = posts.slice(startIndex, startIndex + postsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 350, behavior: "smooth" });
  };

  // Handle Upvote
  const handleUpvote = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isLoggedIn) {
      openAuthModal("login");
      return;
    }

    if (upvotedIds.has(id)) return;

    setUpvotedIds((prev) => new Set(prev).add(id));
    setPosts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, upvotes: p.upvotes + 1 } : p))
    );
    if (activePost && activePost.id === id) {
      setActivePost((prev) => (prev ? { ...prev, upvotes: prev.upvotes + 1 } : null));
    }

    try {
      await upvoteBlogPost(id);
    } catch (err) {
      console.error("Upvote failed", err);
    }
  };

  // Open comments
  const handleOpenComments = async (post: BlogPost) => {
    setLoadingActivePost(true);
    setActivePost(post);
    try {
      const full = await getBlogPost(post.id);
      setActivePost(full);
      setPosts((prev) =>
        prev.map((p) => (p.id === post.id ? { ...p, views: full.views } : p))
      );
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingActivePost(false);
    }
  };

  // Submit comment
  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activePost || !commentText.trim()) return;

    if (!isLoggedIn) {
      openAuthModal("login");
      return;
    }

    setSubmittingComment(true);
    try {
      const newComment = await addBlogComment(activePost.id, {
        authorName: user?.fullName || "Fellow Traveler",
        authorEmail: user?.email || "",
        content: commentText.trim(),
      });

      setActivePost((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          comments: [...(prev.comments || []), newComment],
          commentCount: (prev.commentCount || 0) + 1,
        };
      });

      setPosts((prev) =>
        prev.map((p) =>
          p.id === activePost.id
            ? { ...p, commentCount: (p.commentCount || 0) + 1 }
            : p
        )
      );

      setCommentText("");
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingComment(false);
    }
  };

  // Delete Comment
  const handleDeleteComment = async (commentId: string) => {
    if (!activePost) return;
    try {
      await deleteBlogComment(activePost.id, commentId);
      setActivePost((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          comments: prev.comments?.filter((c) => c.id !== commentId),
          commentCount: Math.max(0, (prev.commentCount || 1) - 1),
        };
      });
      setPosts((prev) =>
        prev.map((p) =>
          p.id === activePost.id
            ? { ...p, commentCount: Math.max(0, (p.commentCount || 1) - 1) }
            : p
        )
      );
    } catch (err) {
      console.error(err);
    }
  };

  // Delete Post
  const handleDeletePost = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this travel story?")) return;

    setDeletingId(id);
    try {
      await deleteBlogPost(id);
      setPosts((prev) => prev.filter((p) => p.id !== id));
      if (activePost && activePost.id === id) {
        setActivePost(null);
      }
      toast.success("Story Removed", "Your post was successfully deleted.");
    } catch (err) {
      console.error(err);
      toast.error("Deletion Failed", "Failed to delete post. Please try again.");
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (isoStr: string) => {
    try {
      const d = new Date(isoStr);
      return d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return "Recent";
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#FAF8F5] pb-24">
      {/* Header Banner */}
      <section className="border-b border-[#EBE6DC] bg-[#FAF8F5] py-14 sm:py-16">
        <div className="w-full max-w-[1720px] mx-auto px-6 sm:px-10 lg:px-14 2xl:px-20 space-y-4">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-3 max-w-3xl">
              <span className="text-xs sm:text-sm font-semibold uppercase tracking-widest text-amber-800">
                Traveller&apos;s Journal &amp; Community Forum
              </span>
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-serif font-bold text-stone-900 tracking-tight">
                Authentic Travel Stories &amp; Insights
              </h1>
              <p className="text-base sm:text-lg text-stone-600 leading-relaxed">
                First-hand routes, packing advice, hidden waterways, and honest reviews written by domestic travelers exploring every division of Bangladesh.
              </p>
            </div>

            {/* Write Story Button */}
            <div className="shrink-0">
              <Link
                href="/write-post"
                className="inline-flex items-center gap-2.5 px-6 py-3 rounded-full bg-stone-900 hover:bg-stone-800 text-stone-50 text-sm font-semibold transition-all shadow-sm"
              >
                <PenSquare className="h-4 w-4" />
                <span>Write a Story</span>
              </Link>
            </div>
          </div>

          {/* Search & Filter Controls */}
          <div className="mt-8 pt-6 border-t border-[#F0EBE1] flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between">
            {/* Search */}
            <div className="relative flex-1 max-w-lg">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-stone-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search stories, destinations, writers..."
                className="w-full pl-12 pr-4 py-3 rounded-2xl bg-white border border-[#E5DFD5] text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-stone-900 transition-colors"
              />
            </div>

            {/* Division select */}
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-stone-500 whitespace-nowrap">Division:</span>
              <select
                value={selectedDivision}
                onChange={(e) => setSelectedDivision(e.target.value)}
                className="px-4 py-2.5 rounded-2xl bg-white border border-[#E5DFD5] text-sm font-semibold text-stone-900 focus:outline-none cursor-pointer"
              >
                {divisions.map((d) => (
                  <option key={d} value={d}>
                    {d === "All" ? "All Divisions" : d}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Category Pill Filters */}
          <div className="mt-4 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {categories.map((c) => {
              const active = selectedCategory === c;
              return (
                <button
                  key={c}
                  onClick={() => setSelectedCategory(c)}
                  className={`px-4 py-2 rounded-full text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${
                    active
                      ? "bg-stone-900 text-stone-50 shadow-xs"
                      : "bg-white border border-[#E5DFD5] text-stone-700 hover:text-stone-900 hover:bg-stone-50"
                  }`}
                >
                  {c}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Main Content Feed */}
      <section className="w-full max-w-[1720px] mx-auto px-6 sm:px-10 lg:px-14 2xl:px-20 mt-10">
        <div className="flex items-center justify-between text-sm text-stone-600 mb-6 px-1">
          <span>
            Showing <strong className="text-stone-900 font-bold">{posts.length}</strong> community stories
          </span>
          <span className="text-xs sm:text-sm text-stone-500">Share your adventures with fellow travelers</span>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <StoryCardSkeleton />
            <StoryCardSkeleton />
            <StoryCardSkeleton />
            <StoryCardSkeleton />
            <StoryCardSkeleton />
            <StoryCardSkeleton />
          </div>
        ) : error ? (
          <div className="p-8 rounded-3xl bg-white border border-rose-200 text-center space-y-4 max-w-md mx-auto shadow-sm">
            <AlertCircle className="h-10 w-10 text-rose-500 mx-auto" />
            <p className="text-sm text-rose-700">{error}</p>
            <button
              onClick={fetchPosts}
              className="px-6 py-2 rounded-full bg-stone-900 text-stone-50 text-sm font-semibold"
            >
              Try Again
            </button>
          </div>
        ) : posts.length === 0 ? (
          <div className="py-24 text-center bg-white rounded-3xl border border-[#EBE6DC] p-10 space-y-4 max-w-xl mx-auto shadow-sm">
            <h3 className="text-2xl font-serif font-bold text-stone-900">No stories found</h3>
            <p className="text-sm text-stone-600 leading-relaxed">
              No articles match the current filter or search criteria. Be the first to share an authentic experience!
            </p>
            <Link
              href="/write-post"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-stone-900 text-stone-50 text-sm font-semibold shadow-xs"
            >
              <PenSquare className="h-4 w-4" />
              <span>Write a Story</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {paginatedPosts.map((post) => {
              const isAuthor = user?.email && post.authorEmail === user.email;
              const hasUpvoted = upvotedIds.has(post.id);

              return (
                <article
                  key={post.id}
                  className="group bg-white rounded-3xl border border-[#EBE6DC] overflow-hidden hover:border-[#C4BAA9] hover-lift transition-smooth flex flex-col shadow-xs"
                >
                  {/* Image Cover */}
                  <Link href={`/community/${post.id}`} className="relative h-60 w-full overflow-hidden bg-stone-100 block">
                    <ImageWithFallback
                      src={post.coverImageUrl}
                      fallbackSrc="https://images.unsplash.com/photo-1596895111956-bf1cf0599ce5?auto=format&fit=crop&w=1200&q=80"
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute top-4 left-4 flex gap-2">
                      <span className="px-3 py-1 rounded-full bg-white/95 backdrop-blur-md text-xs font-semibold text-stone-900 shadow-sm border border-stone-200/60">
                        {post.category}
                      </span>
                      {post.division && post.division !== "All" && (
                        <span className="px-3 py-1 rounded-full bg-stone-900/80 backdrop-blur-md text-xs font-semibold text-stone-100 shadow-sm border border-white/20">
                          {post.division}
                        </span>
                      )}
                    </div>
                  </Link>

                  {/* Body Content */}
                  <div className="p-6 sm:p-7 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-3">
                      <Link href={`/community/${post.id}`} className="block">
                        <h2 className="text-xl sm:text-2xl font-serif font-bold text-stone-900 group-hover:text-amber-800 leading-snug line-clamp-2 transition-colors">
                          {post.title}
                        </h2>
                      </Link>
                      <p className="text-sm text-stone-600 line-clamp-3 leading-relaxed">
                        {post.summary}
                      </p>
                    </div>

                    {/* Metadata & Actions */}
                    <div className="pt-4 border-t border-[#F0EBE1] flex items-center justify-between text-xs sm:text-sm text-stone-500">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-stone-800">{post.authorName}</span>
                        <span>•</span>
                        <span>{formatDate(post.createdAtUtc)}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Upvote button */}
                        <button
                          type="button"
                          onClick={(e) => handleUpvote(post.id, e)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-colors ${
                            hasUpvoted
                              ? "bg-amber-100 text-amber-900 font-bold"
                              : "hover:bg-stone-100 text-stone-600"
                          }`}
                          title="Upvote story"
                        >
                          <ThumbsUp className="h-4 w-4" />
                          <span>{post.upvotes}</span>
                        </button>

                        {/* Comments button / Quick view modal */}
                        <button
                          type="button"
                          onClick={() => handleOpenComments(post)}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full hover:bg-stone-100 text-stone-600 transition-colors"
                          title="Quick discussion"
                        >
                          <MessageSquare className="h-4 w-4" />
                          <span>{post.commentCount ?? 0}</span>
                        </button>

                        {/* Author delete button */}
                        {(isAuthor || user?.role === "Admin") && (
                          <button
                            type="button"
                            disabled={deletingId === post.id}
                            onClick={(e) => handleDeletePost(post.id, e)}
                            className="p-1 hover:text-rose-600 rounded transition-colors"
                            title="Delete story"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Read Story link */}
                    <div className="pt-2">
                      <Link
                        href={`/community/${post.id}`}
                        className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-amber-900 hover:text-amber-800 transition-colors"
                      >
                        <span>Read Full Story</span>
                        <span>&rarr;</span>
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-[#EBE6DC]">
            <span className="text-xs sm:text-sm text-stone-600">
              Showing <strong className="text-stone-900 font-bold">{startIndex + 1}</strong> to{" "}
              <strong className="text-stone-900 font-bold">
                {Math.min(startIndex + postsPerPage, posts.length)}
              </strong>{" "}
              of <strong className="text-stone-900 font-bold">{posts.length}</strong> stories
            </span>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3.5 py-2 rounded-xl bg-white border border-[#E5DFD5] text-stone-700 hover:bg-stone-50 disabled:opacity-40 disabled:pointer-events-none transition-colors flex items-center gap-1 text-xs sm:text-sm font-medium"
              >
                <ChevronLeft className="h-4 w-4" />
                <span>Previous</span>
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                <button
                  key={pageNum}
                  onClick={() => handlePageChange(pageNum)}
                  className={`h-9 w-9 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                    currentPage === pageNum
                      ? "bg-stone-900 text-stone-50 shadow-xs"
                      : "bg-white border border-[#E5DFD5] text-stone-700 hover:bg-stone-50"
                  }`}
                >
                  {pageNum}
                </button>
              ))}

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3.5 py-2 rounded-xl bg-white border border-[#E5DFD5] text-stone-700 hover:bg-stone-50 disabled:opacity-40 disabled:pointer-events-none transition-colors flex items-center gap-1 text-xs sm:text-sm font-medium"
              >
                <span>Next</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </section>

      {/* Story Details & Discussion Modal */}
      {activePost && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-stone-900/50 backdrop-blur-xs"
          onClick={() => setActivePost(null)}
        >
          <div
            className="bg-white rounded-3xl border border-[#EBE6DC] max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 sm:p-10 space-y-6"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header info */}
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs sm:text-sm text-stone-500">
                  <span className="font-semibold text-stone-900">{activePost.category}</span>
                  <span>•</span>
                  <span>{activePost.division}</span>
                  <span>•</span>
                  <span>{formatDate(activePost.createdAtUtc)}</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 leading-snug">
                  {activePost.title}
                </h2>
                <p className="text-xs sm:text-sm text-stone-500">
                  Written by <strong className="text-stone-800">{activePost.authorName}</strong>
                </p>
              </div>

              <button
                onClick={() => setActivePost(null)}
                className="px-4 py-1.5 rounded-full text-xs font-semibold bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors"
              >
                Close
              </button>
            </div>

            {/* Cover image if available */}
            {activePost.coverImageUrl && (
              <div className="h-72 rounded-2xl overflow-hidden bg-stone-100 border border-stone-200">
                <ImageWithFallback
                  src={activePost.coverImageUrl}
                  fallbackSrc="https://images.unsplash.com/photo-1596895111956-bf1cf0599ce5?auto=format&fit=crop&w=1200&q=80"
                  alt={activePost.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Full text content */}
            <div className="prose prose-stone text-sm sm:text-base text-stone-700 leading-relaxed whitespace-pre-line border-b border-[#F0EBE1] pb-6">
              {activePost.content}
            </div>

            {/* Post actions: Upvote & View count */}
            <div className="flex items-center justify-between text-sm text-stone-500">
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={(e) => handleUpvote(activePost.id, e)}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border transition-colors ${
                    upvotedIds.has(activePost.id)
                      ? "bg-amber-100 border-amber-300 text-amber-900 font-bold"
                      : "border-stone-200 hover:bg-stone-50 text-stone-700"
                  }`}
                >
                  <ThumbsUp className="h-4 w-4" />
                  <span>Upvote ({activePost.upvotes})</span>
                </button>

                <span className="inline-flex items-center gap-1.5">
                  <Eye className="h-4 w-4 text-stone-400" />
                  <span>{activePost.views} views</span>
                </span>
              </div>

              {(user?.email === activePost.authorEmail || user?.role === "Admin") && (
                <div className="flex items-center gap-2">
                  <Link
                    href={`/write-post?edit=${activePost.id}`}
                    className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold"
                  >
                    <Edit3 className="h-3.5 w-3.5" />
                    <span>Edit</span>
                  </Link>
                  <button
                    onClick={(e) => handleDeletePost(activePost.id, e)}
                    className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Delete</span>
                  </button>
                </div>
              )}
            </div>

            {/* Discussion / Comments Section */}
            <div className="space-y-5 pt-4 border-t border-[#F0EBE1]">
              <h3 className="text-base sm:text-lg font-serif font-bold text-stone-900 flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-amber-800" />
                <span>Discussion ({activePost.comments?.length || 0})</span>
              </h3>

              {/* Add comment form */}
              <form onSubmit={handleAddComment} className="flex gap-2">
                <input
                  type="text"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder={
                    isLoggedIn
                      ? "Add a comment, tip or question..."
                      : "Please login to leave a comment"
                  }
                  disabled={!isLoggedIn}
                  className="flex-1 px-4 py-3 rounded-2xl bg-[#FAF8F5] border border-[#E5DFD5] text-sm text-stone-900 focus:outline-none focus:border-stone-900"
                />
                <button
                  type="submit"
                  disabled={submittingComment || !commentText.trim() || !isLoggedIn}
                  className="px-5 py-3 rounded-2xl bg-stone-900 hover:bg-stone-800 text-white text-sm font-semibold transition-all disabled:opacity-50 inline-flex items-center gap-2"
                >
                  {submittingComment ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                  <span>Post</span>
                </button>
              </form>

              {/* Comments List */}
              <div className="space-y-3 pt-2">
                {activePost.comments && activePost.comments.length > 0 ? (
                  activePost.comments.map((comment) => (
                    <div
                      key={comment.id}
                      className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#E5DFD5] space-y-1.5 text-sm"
                    >
                      <div className="flex items-center justify-between text-stone-500">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-stone-900">{comment.authorName}</span>
                          <span>•</span>
                          <span>{formatDate(comment.createdAtUtc)}</span>
                        </div>
                        {(user?.email === comment.authorEmail || user?.role === "Admin") && (
                          <button
                            onClick={() => handleDeleteComment(comment.id)}
                            className="text-stone-400 hover:text-rose-600 transition-colors"
                            title="Remove comment"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                      <p className="text-stone-700 leading-relaxed">{comment.content}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-stone-400 italic py-2">
                    No comments yet. Start the conversation!
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
