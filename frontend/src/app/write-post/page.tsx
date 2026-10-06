"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  PenSquare,
  Compass,
  ArrowLeft,
  CheckCircle2,
  Lock,
  Tag,
  MapPin,
  Send,
  AlertCircle
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";

export default function WritePostPage() {
  const router = useRouter();
  const { user, isLoggedIn, openAuthModal } = useAuth();

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Travel Tips");
  const [division, setDivision] = useState("Chittagong");
  const [content, setContent] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoggedIn) {
      openAuthModal("login");
      return;
    }

    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
    }, 600);
  };

  if (!isLoggedIn) {
    return (
      <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center space-y-6">
        <div className="h-16 w-16 mx-auto rounded-3xl bg-teal-500/10 border border-teal-500/20 text-teal-400 flex items-center justify-center">
          <Lock className="h-8 w-8" />
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-white tracking-tight">Authentication Required</h1>
          <p className="text-sm text-slate-400 max-w-md mx-auto">
            You must be logged in to author a post, submit road condition updates, or ask the Bangladesh travel community.
          </p>
        </div>

        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => openAuthModal("login")}
            className="px-6 py-3 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold shadow-lg transition-all"
          >
            Sign In Now
          </button>
          <Link
            href="/register"
            className="px-6 py-3 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-slate-200 text-xs font-semibold transition-all"
          >
            Create New Account
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      {/* Top back link */}
      <div>
        <Link
          href="/community"
          className="inline-flex items-center gap-2 text-xs text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Community Discussions</span>
        </Link>
      </div>

      <div className="bg-[#090f1e] border border-white/[0.08] rounded-3xl p-6 sm:p-10 shadow-2xl space-y-8">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-teal-400">
            Community Knowledge Exchange
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1">
            Share a Travel Experience or Query
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Author: <strong className="text-white">{user?.fullName}</strong> ({user?.homeCity || "Dhaka"})
          </p>
        </div>

        {submitted ? (
          <div className="py-12 text-center space-y-4">
            <div className="h-16 w-16 mx-auto rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 flex items-center justify-center">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <h3 className="text-2xl font-bold text-white">Post Successfully Shared!</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Your guidance has been submitted to the domestic travelers forum and will help fellow travelers exploring Bangladesh.
            </p>
            <div className="pt-4 flex justify-center gap-3">
              <Link
                href="/community"
                className="px-6 py-3 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold transition-all shadow-md"
              >
                View Community Forum
              </Link>
              <button
                onClick={() => {
                  setSubmitted(false);
                  setTitle("");
                  setContent("");
                }}
                className="px-6 py-3 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-slate-200 text-xs font-semibold"
              >
                Write Another Post
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-300 mb-1.5 font-medium">Post Topic / Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-black/40 border border-white/[0.1] rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:ring-1 focus:ring-teal-500 cursor-pointer"
                >
                  <option value="Travel Tips">Travel Tips & Packing</option>
                  <option value="Road Conditions">Highway & Road Conditions</option>
                  <option value="Budget Breakdown">Cost & Fare Breakdown</option>
                  <option value="Hotel Review">Resort & Cottage Review</option>
                  <option value="Question">Ask the Community</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 mb-1.5 font-medium">Relevant Division</label>
                <select
                  value={division}
                  onChange={(e) => setDivision(e.target.value)}
                  className="w-full bg-black/40 border border-white/[0.1] rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:ring-1 focus:ring-teal-500 cursor-pointer"
                >
                  <option value="Chittagong">Chittagong Hill Tracts & Coast</option>
                  <option value="Sylhet">Sylhet & Sunamganj Haors</option>
                  <option value="Khulna">Khulna & Sundarbans</option>
                  <option value="Dhaka">Dhaka Division</option>
                  <option value="Barisal">Barisal & River Waterways</option>
                  <option value="Rajshahi">Rajshahi & North Bengal</option>
                  <option value="Rangpur">Rangpur Division</option>
                  <option value="Mymensingh">Mymensingh & Garo Hills</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-slate-300 mb-1.5 font-medium">Post Title</label>
              <input
                type="text"
                placeholder="e.g. Current Chander Gari fare from Khagrachhari to Sajek (October 2026 update)"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-black/40 border border-white/[0.1] rounded-xl px-3.5 py-3 text-white text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                required
              />
            </div>

            <div>
              <label className="block text-slate-300 mb-1.5 font-medium">Detailed Narrative / Guidance</label>
              <textarea
                rows={7}
                placeholder="Share specific road milestones, pricing breakdown, local driver contacts, or safety recommendations..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full bg-black/40 border border-white/[0.1] rounded-xl p-3.5 text-white leading-relaxed focus:outline-none focus:ring-1 focus:ring-teal-500"
                required
              />
            </div>

            <div className="pt-2 flex justify-end gap-3">
              <Link
                href="/community"
                className="px-5 py-2.5 rounded-xl bg-white/[0.04] text-slate-400 hover:text-white"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={submitting}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-sky-600 hover:from-teal-400 hover:to-sky-500 text-white font-bold transition-all shadow-md shadow-teal-500/20 disabled:opacity-50"
              >
                <Send className="h-4 w-4" />
                <span>{submitting ? "Publishing..." : "Publish Post"}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
