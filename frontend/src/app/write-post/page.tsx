"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  Lock,
  Upload,
  Image as ImageIcon,
  Loader2,
  X,
  Compass,
  Heart,
  ShieldCheck,
  Trees
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { createBlogPost, updateBlogPost, getBlogPost, uploadPostImage } from "@/lib/api";
import ImageWithFallback from "@/components/ImageWithFallback";

function WritePostContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("edit");
  const { user, isLoggedIn, openAuthModal } = useAuth();

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Travel Guide");
  const [division, setDivision] = useState("Chattogram");
  const [content, setContent] = useState("");
  const [summary, setSummary] = useState("");
  const [coverImageUrl, setCoverImageUrl] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const [loadingInitial, setLoadingInitial] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const categories = [
    "Travel Guide",
    "Hidden Gems",
    "Budget Travel",
    "Photography",
    "Nature & Wildlife",
    "Tips & Safety",
  ];

  const divisions = [
    "Chattogram",
    "Sylhet",
    "Dhaka",
    "Khulna",
    "Barishal",
    "Rajshahi",
    "Rangpur",
    "Mymensingh",
  ];

  // If editId is provided, fetch existing post
  useEffect(() => {
    if (editId) {
      setLoadingInitial(true);
      getBlogPost(editId)
        .then((post) => {
          setTitle(post.title);
          setCategory(post.category);
          setDivision(post.division);
          setContent(post.content);
          setSummary(post.summary || "");
          setCoverImageUrl(post.coverImageUrl);
        })
        .catch((err) => {
          console.error(err);
          setErrorMessage("Failed to load existing post for editing.");
        })
        .finally(() => setLoadingInitial(false));
    }
  }, [editId]);

  // Handle image upload to backend
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    setUploadError(null);

    try {
      const res = await uploadPostImage(file);
      setCoverImageUrl(res.url);
    } catch (err: unknown) {
      console.error(err);
      setUploadError(err instanceof Error ? err.message : "Failed to upload image. Please try another file.");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoggedIn) {
      openAuthModal("login");
      return;
    }

    if (!title.trim() || !content.trim()) {
      setErrorMessage("Please enter both a title and story content.");
      return;
    }

    setSubmitting(true);
    setErrorMessage(null);

    try {
      if (editId) {
        await updateBlogPost(editId, {
          title: title.trim(),
          content: content.trim(),
          summary: summary.trim() || undefined,
          category,
          division,
          coverImageUrl: coverImageUrl.trim() || undefined,
        });
      } else {
        await createBlogPost({
          title: title.trim(),
          content: content.trim(),
          summary: summary.trim() || undefined,
          category,
          division,
          authorName: user?.fullName || "Traveler",
          authorEmail: user?.email || "",
          coverImageUrl: coverImageUrl.trim() || undefined,
        });
      }

      setSubmitted(true);
    } catch (err: unknown) {
      console.error(err);
      setErrorMessage(err instanceof Error ? err.message : "Failed to save story. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="w-full min-h-[70vh] bg-[#FAF8F5] flex items-center justify-center py-20 px-6 sm:px-10">
        <div className="max-w-xl w-full bg-white border border-[#EBE6DC] rounded-3xl p-8 sm:p-12 shadow-sm text-center space-y-6">
          <div className="h-16 w-16 mx-auto rounded-3xl bg-[#F5F2EB] border border-[#E5DFD5] text-stone-800 flex items-center justify-center">
            <Lock className="h-8 w-8" />
          </div>
          <div className="space-y-3">
            <span className="text-xs sm:text-sm font-semibold tracking-widest uppercase text-amber-800">
              Community Journal
            </span>
            <h1 className="text-3xl sm:text-4xl font-serif font-bold text-stone-900 tracking-tight">
              Sign In to Share Your Journey
            </h1>
            <p className="text-sm sm:text-base text-stone-600 leading-relaxed max-w-md mx-auto">
              Join the domestic community of travelers across Bangladesh to write stories, share real-time road conditions, and review hidden destinations.
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => openAuthModal("login")}
              className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-stone-900 hover:bg-stone-800 text-stone-50 text-sm font-semibold shadow-xs transition-all"
            >
              Sign In Now
            </button>
            <button
              onClick={() => openAuthModal("register")}
              className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-[#F5F2EB] hover:bg-stone-200 border border-[#E5DFD5] text-stone-800 text-sm font-semibold transition-all"
            >
              Register Account
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (loadingInitial) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-stone-400" />
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-[#FAF8F5] pb-24">
      {/* Editorial Header Banner */}
      <section className="border-b border-[#EBE6DC] bg-[#FAF8F5] py-14 sm:py-16">
        <div className="w-full max-w-[1720px] mx-auto px-6 sm:px-10 lg:px-14 2xl:px-20 space-y-4">
          <div className="flex items-center gap-2 text-xs sm:text-sm text-stone-500">
            <Link href="/community" className="hover:text-stone-900 transition-colors inline-flex items-center gap-1.5">
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Community Journal</span>
            </Link>
          </div>

          <span className="text-xs sm:text-sm font-semibold tracking-widest uppercase text-amber-800 block">
            Traveller&apos;s Journal Contribution
          </span>
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-serif font-bold text-stone-900 tracking-tight">
            {editId ? "Edit Travel Story" : "Write a Travel Story"}
          </h1>
          <p className="text-base sm:text-lg text-stone-600 max-w-3xl leading-relaxed">
            Contributing as <strong className="text-stone-900 font-semibold">{user?.fullName}</strong> ({user?.email}).
            Share your routes, budget tips, homestay discoveries, and leave-no-trace guidelines with fellow Bangladeshi explorers.
          </p>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="w-full max-w-[1720px] mx-auto px-6 sm:px-10 lg:px-14 2xl:px-20 mt-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
          {/* Left Column: Form (8 cols) */}
          <div className="lg:col-span-8 bg-white border border-[#EBE6DC] rounded-3xl p-6 sm:p-10 lg:p-12 shadow-sm space-y-8">
            {submitted ? (
              <div className="py-16 text-center space-y-5">
                <div className="h-16 w-16 mx-auto rounded-3xl bg-[#F5F2EB] border border-[#E5DFD5] text-stone-900 flex items-center justify-center">
                  <CheckCircle2 className="h-8 w-8 text-amber-800" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900">
                    {editId ? "Story Updated Successfully" : "Your Travel Story Has Been Published!"}
                  </h2>
                  <p className="text-sm sm:text-base text-stone-600 max-w-md mx-auto leading-relaxed">
                    Thank you for documenting your journey. Your insights will help fellow domestic travelers explore Bangladesh responsibly and peacefully.
                  </p>
                </div>
                <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
                  <button
                    onClick={() => router.push("/community")}
                    className="px-8 py-3.5 rounded-full bg-stone-900 hover:bg-stone-800 text-stone-50 text-sm font-semibold transition-all shadow-xs"
                  >
                    View Community Feed
                  </button>
                  <button
                    onClick={() => {
                      setSubmitted(false);
                      setTitle("");
                      setContent("");
                      setSummary("");
                      setCoverImageUrl("");
                    }}
                    className="px-8 py-3.5 rounded-full bg-[#FAF8F5] hover:bg-[#F5F2EB] border border-[#E5DFD5] text-stone-800 text-sm font-semibold transition-all"
                  >
                    Write Another Story
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {errorMessage && (
                  <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-sm">
                    {errorMessage}
                  </div>
                )}

                {/* Story Title */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-stone-800 block">
                    Story Title <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Walking along the quiet coral shores of Saint Martin at dawn"
                    className="w-full px-5 py-3.5 rounded-2xl border border-[#E5DFD5] bg-[#FAF8F5] text-stone-900 text-base focus:outline-none focus:bg-white focus:border-stone-900 transition-colors"
                  />
                </div>

                {/* Category & Division */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-stone-800 block">Category</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-4 py-3.5 rounded-2xl border border-[#E5DFD5] text-stone-900 text-sm sm:text-base bg-[#FAF8F5] focus:outline-none focus:bg-white focus:border-stone-900 transition-colors cursor-pointer"
                    >
                      {categories.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-stone-800 block">Division / Region</label>
                    <select
                      value={division}
                      onChange={(e) => setDivision(e.target.value)}
                      className="w-full px-4 py-3.5 rounded-2xl border border-[#E5DFD5] text-stone-900 text-sm sm:text-base bg-[#FAF8F5] focus:outline-none focus:bg-white focus:border-stone-900 transition-colors cursor-pointer"
                    >
                      {divisions.map((d) => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Cover Image Upload & Preview */}
                <div className="space-y-2.5">
                  <label className="text-sm font-semibold text-stone-800 flex items-center justify-between">
                    <span>Cover Photo</span>
                    <span className="text-xs text-stone-400 font-normal">Optional</span>
                  </label>

                  {coverImageUrl ? (
                    <div className="relative rounded-2xl overflow-hidden border border-[#EBE6DC] h-56 bg-stone-100 group shadow-2xs">
                      <ImageWithFallback
                        src={coverImageUrl}
                        alt="Cover preview"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => setCoverImageUrl("")}
                        className="absolute top-3 right-3 p-2 rounded-full bg-stone-900/80 text-white hover:bg-stone-900 transition-colors shadow-sm"
                        title="Remove image"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="border border-dashed border-[#E5DFD5] rounded-2xl p-8 text-center space-y-4 bg-[#FAF8F5]/80 hover:bg-[#FAF8F5] transition-colors">
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileUpload}
                        accept="image/png,image/jpeg,image/webp,image/gif"
                        className="hidden"
                      />
                      <div className="h-12 w-12 mx-auto rounded-2xl bg-white border border-[#E5DFD5] text-stone-600 flex items-center justify-center shadow-2xs">
                        <ImageIcon className="h-6 w-6" />
                      </div>
                      <div className="space-y-1">
                        <button
                          type="button"
                          disabled={uploadingImage}
                          onClick={() => fileInputRef.current?.click()}
                          className="px-6 py-2.5 rounded-full bg-stone-900 hover:bg-stone-800 text-stone-50 text-xs sm:text-sm font-semibold inline-flex items-center gap-2 shadow-xs"
                        >
                          {uploadingImage ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin" />
                              <span>Uploading...</span>
                            </>
                          ) : (
                            <>
                              <Upload className="h-4 w-4" />
                              <span>Upload Photo from Device</span>
                            </>
                          )}
                        </button>
                        <p className="text-xs text-stone-400">
                          PNG, JPG, or WEBP up to 10MB
                        </p>
                      </div>

                      {/* Or enter URL */}
                      <div className="pt-2 max-w-md mx-auto">
                        <input
                          type="url"
                          value={coverImageUrl}
                          onChange={(e) => setCoverImageUrl(e.target.value)}
                          placeholder="Or paste an image URL..."
                          className="w-full px-4 py-2.5 rounded-xl border border-[#E5DFD5] bg-white text-xs sm:text-sm text-stone-800 focus:outline-none focus:border-stone-900"
                        />
                      </div>
                    </div>
                  )}

                  {uploadError && (
                    <p className="text-xs text-rose-600 mt-1">{uploadError}</p>
                  )}
                </div>

                {/* Short Summary */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-stone-800 flex items-center justify-between">
                    <span>Brief Summary</span>
                    <span className="text-xs text-stone-400 font-normal">Shown in feed card</span>
                  </label>
                  <input
                    type="text"
                    value={summary}
                    onChange={(e) => setSummary(e.target.value)}
                    placeholder="One or two sentences highlighting what this journey or tip is about..."
                    className="w-full px-5 py-3.5 rounded-2xl border border-[#E5DFD5] bg-[#FAF8F5] text-stone-900 text-sm sm:text-base focus:outline-none focus:bg-white focus:border-stone-900 transition-colors"
                  />
                </div>

                {/* Story Content */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-stone-800 block">
                    Story Content <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    required
                    rows={12}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Share your detailed itinerary, memorable encounters, route directions, cost estimates, or local food recommendations..."
                    className="w-full px-5 py-4 rounded-2xl border border-[#E5DFD5] bg-[#FAF8F5] text-stone-900 text-base leading-relaxed focus:outline-none focus:bg-white focus:border-stone-900 transition-colors resize-y"
                  />
                </div>

                {/* Submit Action */}
                <div className="pt-4 flex items-center justify-between border-t border-[#F0EBE1]">
                  <Link
                    href="/community"
                    className="text-sm font-medium text-stone-500 hover:text-stone-900 transition-colors"
                  >
                    Cancel
                  </Link>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-8 py-3.5 rounded-full bg-stone-900 hover:bg-stone-800 text-stone-50 text-sm font-semibold transition-all shadow-xs inline-flex items-center gap-2 disabled:opacity-50"
                  >
                    {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                    <span>{editId ? "Update Travel Story" : "Publish Story"}</span>
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Right Column: Writing & Ethics Guidance (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white border border-[#EBE6DC] rounded-3xl p-6 sm:p-8 space-y-5 shadow-sm">
              <h3 className="text-xl font-serif font-bold text-stone-900 flex items-center gap-2.5">
                <Compass className="h-5 w-5 text-amber-800" />
                <span>Story Guidelines</span>
              </h3>
              <ul className="space-y-3.5 text-sm text-stone-600 leading-relaxed">
                <li className="flex items-start gap-2.5">
                  <div className="h-1.5 w-1.5 rounded-full bg-amber-800 mt-2 shrink-0" />
                  <span><strong>Accurate Routes:</strong> Mention exact departure points, bus/train counters, and auto-rickshaw or boat ghat fares in BDT.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <div className="h-1.5 w-1.5 rounded-full bg-amber-800 mt-2 shrink-0" />
                  <span><strong>Checkpost Clearances:</strong> Include helpful advice on Army checkposts (e.g. Dighinala, Ruma, Thanchi) and NID photocopy requirements.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <div className="h-1.5 w-1.5 rounded-full bg-amber-800 mt-2 shrink-0" />
                  <span><strong>Seasonal Reality:</strong> Note the month of travel—weather and water levels vary drastically between monsoon and winter.</span>
                </li>
              </ul>
            </div>

            <div className="bg-white border border-[#EBE6DC] rounded-3xl p-6 sm:p-8 space-y-4 shadow-sm">
              <h4 className="text-xl font-serif font-bold text-stone-900 flex items-center gap-2.5">
                <Heart className="h-5 w-5 text-amber-800" />
                <span>Respect &amp; Ecotourism</span>
              </h4>
              <p className="text-stone-600 text-sm leading-relaxed">
                Always ask for permission before photographing indigenous families or sacred village shrines. Never reveal fragile nesting grounds or encourage plastic pollution in protected haors and forests.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function WritePostPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[50vh] flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-stone-400" />
        </div>
      }
    >
      <WritePostContent />
    </Suspense>
  );
}
