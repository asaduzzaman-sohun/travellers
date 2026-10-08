"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ThumbsUp,
  MessageSquare,
  Calendar,
  MapPin,
  Share2,
  Bookmark,
  Send,
  Loader2,
  Trash2,
  Sparkles,
  Compass,
  CheckCircle2,
  AlertCircle,
  Eye,
  CornerDownRight
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import {
  getBlogPost,
  upvoteBlogPost,
  addBlogComment,
  deleteBlogComment,
  BlogPost,
  BlogComment
} from "@/lib/api";
import ImageWithFallback from "@/components/ImageWithFallback";
import { useToast } from "@/lib/toast-context";

export default function CommunityStoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const postId = resolvedParams.id;

  const { user, isLoggedIn, openAuthModal } = useAuth();
  const { toast } = useToast();

  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Upvote state
  const [hasUpvoted, setHasUpvoted] = useState(false);
  const [upvoteCount, setUpvoteCount] = useState(0);

  // Comments state
  const [commentText, setCommentText] = useState("");
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);
  const [commentSuccess, setCommentSuccess] = useState(false);

  // UI state
  const [copied, setCopied] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);

  useEffect(() => {
    async function fetchStory() {
      try {
        setLoading(true);
        setError(null);
        const data = await getBlogPost(postId);
        setPost(data);
        setUpvoteCount(data.upvotes || 0);
      } catch (err: any) {
        console.error(err);
        setError("Failed to load travel story. It may have been removed or the ID is incorrect.");
      } finally {
        setLoading(false);
      }
    }
    fetchStory();
  }, [postId]);

  const handleUpvote = async () => {
    if (!post) return;
    if (hasUpvoted) return;

    setHasUpvoted(true);
    setUpvoteCount((prev) => prev + 1);

    try {
      await upvoteBlogPost(post.id);
    } catch (err) {
      console.error(err);
      // Revert if API failed
      setHasUpvoted(false);
      setUpvoteCount((prev) => prev - 1);
    }
  };

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!post || !commentText.trim()) return;

    const authorNameToUse = isLoggedIn
      ? user?.fullName || "Traveler"
      : guestName.trim() || "Fellow Explorer";

    const authorEmailToUse = isLoggedIn ? user?.email : guestEmail.trim() || undefined;

    try {
      setSubmittingComment(true);
      const newComment = await addBlogComment(post.id, {
        authorName: authorNameToUse,
        authorEmail: authorEmailToUse,
        content: commentText.trim()
      });

      setPost((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          comments: [...(prev.comments || []), newComment],
          commentCount: (prev.commentCount || 0) + 1
        };
      });

      setCommentText("");
      setCommentSuccess(true);
      toast.success("Comment Published", "Your response has been added to the discussion.");
      setTimeout(() => setCommentSuccess(false), 3000);
    } catch (err) {
      console.error(err);
      toast.error("Publish Failed", "Unable to publish comment. Please verify your connection.");
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!post) return;

    try {
      await deleteBlogComment(post.id, commentId);
      setPost((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          comments: (prev.comments || []).filter((c) => c.id !== commentId),
          commentCount: Math.max(0, (prev.commentCount || 1) - 1)
        };
      });
      toast.success("Comment Removed", "The comment was deleted.");
    } catch (err) {
      console.error(err);
      toast.error("Deletion Error", "Could not remove comment.");
    }
  };

  const formatDate = (isoStr?: string) => {
    if (!isoStr) return "Recently published";
    try {
      const d = new Date(isoStr);
      return d.toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric"
      });
    } catch {
      return "Recent";
    }
  };

  if (loading) {
    return (
      <div className="w-full min-h-[60vh] bg-[#FAF8F5] flex flex-col items-center justify-center py-24 space-y-4">
        <Loader2 className="h-10 w-10 animate-spin text-stone-900" />
        <p className="text-sm text-stone-600 font-medium">Fetching field report &amp; traveler notes...</p>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="w-full min-h-[60vh] bg-[#FAF8F5] flex items-center justify-center py-20 px-6">
        <div className="max-w-md w-full bg-white border border-[#EBE6DC] rounded-3xl p-8 text-center space-y-4 shadow-sm">
          <AlertCircle className="h-10 w-10 text-rose-500 mx-auto" />
          <h1 className="text-2xl font-serif font-bold text-stone-900">Story Not Found</h1>
          <p className="text-sm text-stone-600">
            {error || "The travel story you requested could not be located."}
          </p>
          <Link
            href="/community"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-stone-900 text-stone-50 text-sm font-semibold hover:bg-stone-800 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Return to Community Feed</span>
          </Link>
        </div>
      </div>
    );
  }

  // Estimate read time (avg 200 words/min)
  const wordCount = (post.content || "").split(/\s+/).length;
  const readTime = Math.max(2, Math.ceil(wordCount / 200));

  return (
    <div className="w-full min-h-screen bg-[#FAF8F5] pb-28">
      {/* Top Header & Breadcrumb */}
      <div className="border-b border-[#EBE6DC] bg-white">
        <div className="w-full max-w-[1720px] mx-auto px-6 sm:px-10 lg:px-14 2xl:px-20 py-4 flex flex-wrap items-center justify-between gap-4">
          <Link
            href="/community"
            className="inline-flex items-center gap-2 text-sm font-semibold text-stone-600 hover:text-stone-900 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Community Journal</span>
          </Link>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setBookmarked(!bookmarked)}
              className={`p-2.5 rounded-full border transition-colors ${
                bookmarked
                  ? "bg-amber-100 border-amber-300 text-amber-900"
                  : "bg-stone-50 border-stone-200 text-stone-600 hover:text-stone-900"
              }`}
              title={bookmarked ? "Bookmarked" : "Bookmark Story"}
            >
              <Bookmark className={`h-4 w-4 ${bookmarked ? "fill-amber-900" : ""}`} />
            </button>

            <button
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-stone-200 bg-stone-50 text-xs sm:text-sm font-semibold text-stone-700 hover:bg-stone-100 transition-colors"
            >
              <Share2 className="h-4 w-4" />
              <span>{copied ? "Link Copied!" : "Share Story"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <article className="w-full max-w-[1720px] mx-auto px-6 sm:px-10 lg:px-14 2xl:px-20 pt-8 sm:pt-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 xl:gap-14">
          {/* Main Story Content (Col 8) */}
          <div className="lg:col-span-8 space-y-8">
            {/* Meta tags */}
            <div className="flex flex-wrap items-center gap-3">
              <span className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-900 border border-amber-200/80">
                {post.category}
              </span>
              {post.division && post.division !== "All" && (
                <span className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-stone-900 text-stone-100 border border-stone-800 flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5 text-amber-400" />
                  <span>{post.division} Division</span>
                </span>
              )}
              <span className="text-xs sm:text-sm text-stone-500 flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                <span>{formatDate(post.createdAtUtc)}</span>
              </span>
              <span className="text-xs sm:text-sm text-stone-500">•</span>
              <span className="text-xs sm:text-sm text-stone-500">{readTime} min read</span>
            </div>

            {/* Title */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-serif font-bold text-stone-900 leading-[1.15] tracking-tight">
              {post.title}
            </h1>

            {/* Summary Lead */}
            {post.summary && (
              <p className="text-lg sm:text-xl text-stone-600 font-serif italic border-l-4 border-amber-700 pl-4 py-1 leading-relaxed">
                &ldquo;{post.summary}&rdquo;
              </p>
            )}

            {/* Author Byline Bar */}
            <div className="flex items-center justify-between p-4 sm:p-5 rounded-2xl bg-white border border-[#EBE6DC] shadow-xs">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-stone-900 text-stone-50 flex items-center justify-center font-bold font-serif text-lg shrink-0">
                  {post.authorName?.charAt(0) || "T"}
                </div>
                <div>
                  <div className="text-base font-semibold text-stone-900">{post.authorName}</div>
                  <div className="text-xs text-stone-500">Verified Domestic Traveler &bull; Contributor</div>
                </div>
              </div>

              {/* Upvote Pill */}
              <button
                type="button"
                onClick={handleUpvote}
                disabled={hasUpvoted}
                className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all ${
                  hasUpvoted
                    ? "bg-amber-100 border border-amber-300 text-amber-900"
                    : "bg-stone-900 text-stone-50 hover:bg-stone-800 shadow-sm"
                }`}
              >
                <ThumbsUp className={`h-4 w-4 ${hasUpvoted ? "fill-amber-900" : ""}`} />
                <span>{hasUpvoted ? "Upvoted" : "Upvote"} ({upvoteCount})</span>
              </button>
            </div>

            {/* Cover Image */}
            <div className="relative aspect-[16/9] w-full rounded-3xl overflow-hidden bg-stone-200 border border-[#EBE6DC] shadow-sm">
              <ImageWithFallback
                src={post.coverImageUrl}
                fallbackSrc="https://images.unsplash.com/photo-1596895111956-bf1cf0599ce5?auto=format&fit=crop&w=1400&q=80"
                alt={post.title}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Narrative Body */}
            <div className="bg-white rounded-3xl border border-[#EBE6DC] p-8 sm:p-12 shadow-xs space-y-6">
              <div className="prose prose-stone max-w-none text-base sm:text-lg text-stone-700 leading-relaxed space-y-6">
                {post.content.split("\n\n").map((para, i) => {
                  const trimmed = para.trim();
                  if (!trimmed) return null;

                  // Sub-headings if starts with ### or ##
                  if (trimmed.startsWith("### ")) {
                    return (
                      <h3 key={i} className="text-2xl font-serif font-bold text-stone-900 pt-4 pb-2 border-b border-[#F0EBE1]">
                        {trimmed.replace("### ", "")}
                      </h3>
                    );
                  }
                  if (trimmed.startsWith("## ")) {
                    return (
                      <h2 key={i} className="text-3xl font-serif font-bold text-stone-900 pt-6 pb-2 border-b border-[#F0EBE1]">
                        {trimmed.replace("## ", "")}
                      </h2>
                    );
                  }

                  // Bullet points
                  if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
                    const bullets = trimmed.split("\n");
                    return (
                      <ul key={i} className="space-y-2 pl-4 list-disc marker:text-amber-800">
                        {bullets.map((b, idx) => (
                          <li key={idx} className="text-stone-700">
                            {b.replace(/^[-*]\s*/, "")}
                          </li>
                        ))}
                      </ul>
                    );
                  }

                  return (
                    <p key={i} className="leading-relaxed">
                      {trimmed}
                    </p>
                  );
                })}
              </div>

              {/* End of story signature */}
              <div className="pt-8 border-t border-[#F0EBE1] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs sm:text-sm text-stone-500">
                <div>
                  Filed under <strong className="text-stone-800">{post.category}</strong> &bull; {post.division} Division
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleUpvote}
                    disabled={hasUpvoted}
                    className="inline-flex items-center gap-1.5 text-stone-700 hover:text-stone-900 font-semibold"
                  >
                    <ThumbsUp className="h-4 w-4" />
                    <span>Helpful? Upvote ({upvoteCount})</span>
                  </button>
                  <span>&bull;</span>
                  <button onClick={handleShare} className="text-stone-700 hover:text-stone-900 font-semibold">
                    Share
                  </button>
                </div>
              </div>
            </div>

            {/* Comments & Discussion Section */}
            <div className="bg-white rounded-3xl border border-[#EBE6DC] p-8 sm:p-12 shadow-xs space-y-8">
              <div className="flex items-center justify-between border-b border-[#F0EBE1] pb-5">
                <div className="flex items-center gap-3">
                  <MessageSquare className="h-6 w-6 text-stone-900" />
                  <h3 className="text-2xl font-serif font-bold text-stone-900">
                    Traveler Discussions &amp; Updates ({post.comments?.length || 0})
                  </h3>
                </div>
              </div>

              {/* Add Comment Form */}
              <form onSubmit={handleCommentSubmit} className="space-y-4">
                <label className="block text-sm font-semibold text-stone-800">
                  Share your recent experience or ask a route question:
                </label>

                {!isLoggedIn && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <input
                        type="text"
                        placeholder="Your name or callsign"
                        value={guestName}
                        onChange={(e) => setGuestName(e.target.value)}
                        required
                        className="w-full px-4 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#E5DFD5] text-sm text-stone-900 placeholder:text-stone-400 focus:bg-white focus:outline-none focus:border-stone-900"
                      />
                    </div>
                    <div>
                      <input
                        type="email"
                        placeholder="Email (optional, kept private)"
                        value={guestEmail}
                        onChange={(e) => setGuestEmail(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#E5DFD5] text-sm text-stone-900 placeholder:text-stone-400 focus:bg-white focus:outline-none focus:border-stone-900"
                      />
                    </div>
                  </div>
                )}

                <div className="relative">
                  <textarea
                    rows={3}
                    placeholder="E.g., Has anyone taken this road during recent monsoon rains? Are CNWs available at the ferry ghat?"
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    required
                    className="w-full p-4 rounded-2xl bg-[#FAF8F5] border border-[#E5DFD5] text-sm text-stone-900 placeholder:text-stone-400 focus:bg-white focus:outline-none focus:border-stone-900 transition-colors"
                  />
                </div>

                <div className="flex items-center justify-between">
                  {commentSuccess ? (
                    <span className="text-xs sm:text-sm font-semibold text-emerald-700 flex items-center gap-1.5">
                      <CheckCircle2 className="h-4 w-4" />
                      Comment posted successfully!
                    </span>
                  ) : (
                    <span className="text-xs text-stone-500">
                      Be polite and share helpful domestic advice.
                    </span>
                  )}

                  <button
                    type="submit"
                    disabled={submittingComment || !commentText.trim()}
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-stone-900 hover:bg-stone-800 disabled:opacity-40 text-stone-50 text-sm font-semibold transition-colors shadow-xs"
                  >
                    {submittingComment ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Posting...</span>
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        <span>Post Comment</span>
                      </>
                    )}
                  </button>
                </div>
              </form>

              {/* Comments List */}
              <div className="space-y-4 pt-4">
                {(!post.comments || post.comments.length === 0) ? (
                  <div className="text-center py-8 text-stone-400 text-sm italic">
                    No comments yet. Be the first to start this conversation!
                  </div>
                ) : (
                  post.comments.map((comment) => {
                    const isMyComment =
                      user?.email &&
                      comment.authorEmail &&
                      comment.authorEmail.toLowerCase() === user.email.toLowerCase();
                    const canDelete = isMyComment || user?.role === "Admin";

                    return (
                      <div
                        key={comment.id}
                        className="p-5 rounded-2xl bg-[#FAF8F5] border border-[#E5DFD5] space-y-2.5"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-stone-800 text-stone-100 flex items-center justify-center font-bold text-xs">
                              {comment.authorName?.charAt(0) || "U"}
                            </div>
                            <span className="font-semibold text-stone-900 text-sm">
                              {comment.authorName}
                            </span>
                            <span className="text-xs text-stone-400">•</span>
                            <span className="text-xs text-stone-500">
                              {formatDate(comment.createdAtUtc)}
                            </span>
                          </div>

                          {canDelete && (
                            <button
                              type="button"
                              onClick={() => handleDeleteComment(comment.id)}
                              className="text-stone-400 hover:text-rose-600 transition-colors p-1"
                              title="Delete comment"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
                        <p className="text-sm text-stone-700 pl-10 leading-relaxed whitespace-pre-wrap">
                          {comment.content}
                        </p>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* Right Sidebar (Col 4) */}
          <div className="lg:col-span-4 space-y-6">
            {/* Quick Actions Card */}
            <div className="bg-white rounded-3xl border border-[#EBE6DC] p-6 sm:p-8 space-y-5 shadow-xs sticky top-24">
              <span className="text-xs font-semibold uppercase tracking-wider text-amber-800 flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-amber-700" />
                Community Insight
              </span>

              <h4 className="text-xl font-serif font-bold text-stone-900">
                Planning a trip to {post.division || "this region"}?
              </h4>

              <p className="text-sm text-stone-600 leading-relaxed">
                Connect with local boat captains, verified resort operators, and transport schedules curated by authentic Bangladeshi travel lovers.
              </p>

              <div className="space-y-3 pt-2">
                <Link
                  href="/destinations"
                  className="w-full flex items-center justify-between px-5 py-3 rounded-2xl bg-[#FAF8F5] hover:bg-stone-100 border border-[#E5DFD5] text-stone-800 font-semibold text-sm transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <Compass className="h-4 w-4 text-amber-800" />
                    <span>Explore Destinations</span>
                  </span>
                  <CornerDownRight className="h-4 w-4 text-stone-400" />
                </Link>

                <Link
                  href="/hotels"
                  className="w-full flex items-center justify-between px-5 py-3 rounded-2xl bg-[#FAF8F5] hover:bg-stone-100 border border-[#E5DFD5] text-stone-800 font-semibold text-sm transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-amber-800" />
                    <span>Verified Hotel Reviews</span>
                  </span>
                  <CornerDownRight className="h-4 w-4 text-stone-400" />
                </Link>

                <Link
                  href="/tips"
                  className="w-full flex items-center justify-between px-5 py-3 rounded-2xl bg-[#FAF8F5] hover:bg-stone-100 border border-[#E5DFD5] text-stone-800 font-semibold text-sm transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-amber-800" />
                    <span>Travel Tips &amp; Rules</span>
                  </span>
                  <CornerDownRight className="h-4 w-4 text-stone-400" />
                </Link>
              </div>

              {/* Write Story CTA */}
              <div className="pt-4 border-t border-[#F0EBE1]">
                <div className="rounded-2xl bg-amber-50/70 border border-amber-200/60 p-4 space-y-2">
                  <div className="text-xs font-bold uppercase tracking-wider text-amber-900">
                    Traveled somewhere recently?
                  </div>
                  <p className="text-xs text-stone-600 leading-relaxed">
                    Share your experience to help the community travel smarter and safer across Bangladesh.
                  </p>
                  <Link
                    href="/write-post"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-900 hover:text-amber-800 underline pt-1"
                  >
                    Write a story &rarr;
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </article>
    </div>
  );
}
