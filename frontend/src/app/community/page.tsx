"use client";

import { useState } from "react";
import Link from "next/link";
import {
  MessageSquare,
  ThumbsUp,
  Share2,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  User,
  X,
  Send,
  AlertCircle
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";

interface ForumPost {
  id: string;
  author: string;
  authorLocation: string;
  category: string;
  title: string;
  content: string;
  upvotes: number;
  repliesCount: number;
  timeAgo: string;
  userUpvoted?: boolean;
}

export default function CommunityForumPage() {
  const { user, isLoggedIn, openAuthModal } = useAuth();

  const [posts, setPosts] = useState<ForumPost[]>([
    {
      id: "1",
      author: "Nayeemur Rahman",
      authorLocation: "Mirpur, Dhaka",
      category: "Transport",
      title: "Best bus service from Dhaka to Khagrachhari for reaching morning escort?",
      content: "Planning a Sajek trip next weekend. Need to catch the 10:30 AM army escort from Dighinala. Which bus operator has the most punctual departure from Dhaka (Sayedabad / Gabtoli)? How is Saintmartin Paribahan or Shanti Paribahan lately?",
      upvotes: 18,
      repliesCount: 14,
      timeAgo: "2 hours ago"
    },
    {
      id: "2",
      author: "Rumana Sharmin",
      authorLocation: "Sylhet",
      category: "Family Travel",
      title: "Can elderly parents comfortably stay on Tanguar Haor houseboats?",
      content: "I want to take my mother (62 yrs old) to Tanguar Haor. Are the stairs on modern bajra houseboats safe? Which boats have western attached washrooms with good hot water and low engine noise?",
      upvotes: 24,
      repliesCount: 9,
      timeAgo: "Yesterday"
    },
    {
      id: "3",
      author: "Shakil Ahmed",
      authorLocation: "Chittagong",
      category: "Budget & Cost",
      title: "Actual breakdown of 3-day Sajek trip budget for 4 friends (2026)",
      content: "Total spent: ৳28,400 (৳7,100 per person). Included Non-AC bus from CTG, private Chander Gari for 2 days (৳9,500), Megh Kabbo cottage twin room (৳9,000 for 2 nights), and all meals including Bamboo Chicken and Khasir rezala.",
      upvotes: 45,
      repliesCount: 22,
      timeAgo: "3 days ago"
    },
    {
      id: "4",
      author: "Kazi Farhan",
      authorLocation: "Khulna",
      category: "Wildlife & Safety",
      title: "Essential precautions when taking children on Sundarbans 3-day vessel tour",
      content: "Ensure the vessel has safety railings on the top deck. Bring child-friendly motion sickness pills, mosquito coils, and full-sleeve cotton clothing. The forest department guards are very helpful during shore excursions.",
      upvotes: 16,
      repliesCount: 7,
      timeAgo: "4 days ago"
    }
  ]);

  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const categories = ["All", "Transport", "Family Travel", "Budget & Cost", "Wildlife & Safety"];

  const handleUpvote = (id: string) => {
    if (!isLoggedIn) {
      openAuthModal("login");
      return;
    }

    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          const upvoted = !p.userUpvoted;
          return {
            ...p,
            upvotes: upvoted ? p.upvotes + 1 : p.upvotes - 1,
            userUpvoted: upvoted
          };
        }
        return p;
      })
    );
  };

  const filteredPosts = posts.filter((p) => {
    const matchesCat = selectedCategory === "All" || p.category === selectedCategory;
    const matchesSearch =
      !searchQuery ||
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.content.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="w-full max-w-[1536px] mx-auto px-4 sm:px-8 lg:px-12 2xl:px-16 py-12 space-y-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-white/[0.08]">
        <div className="space-y-3">
          <div className="text-xs font-bold uppercase tracking-widest text-teal-400">
            Traveler Exchange
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            Community Discussions &amp; Forum
          </h1>
          <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
            Real questions, road condition updates, and budget breakdowns from fellow Bangladeshi travelers on the ground.
          </p>
        </div>

        <Link
          href="/write-post"
          className="px-5 py-3 rounded-xl bg-gradient-to-r from-teal-500 to-sky-600 hover:from-teal-400 hover:to-sky-500 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2 self-start md:self-auto shrink-0"
        >
          <Plus className="h-4 w-4" />
          <span>+ Write a Post</span>
        </Link>
      </div>

      {/* Search and Category Filter Bar */}
      <div className="bg-[#080d1d] border border-white/[0.08] rounded-3xl p-5 space-y-4 shadow-lg">
        <div className="relative">
          <Search className="absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search discussions (e.g. Chander Gari, budget, escort, cottage)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-black/40 border border-white/[0.1] rounded-2xl pl-11 pr-4 py-3 text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-teal-500"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? "bg-teal-600 text-white shadow-md shadow-teal-600/20"
                  : "bg-white/[0.04] text-slate-300 hover:text-white hover:bg-white/[0.08]"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Post Threads */}
      <div className="space-y-5">
        {filteredPosts.length === 0 ? (
          <div className="py-20 text-center bg-[#080d1d] rounded-3xl border border-white/[0.08] p-8 space-y-3">
            <p className="text-sm text-slate-400">No discussions found matching this category.</p>
            <button
              onClick={() => {
                setSelectedCategory("All");
                setSearchQuery("");
              }}
              className="px-4 py-2 rounded-xl bg-teal-600 text-white text-xs font-bold"
            >
              Clear Filter
            </button>
          </div>
        ) : (
          filteredPosts.map((post) => (
            <div
              key={post.id}
              className="bg-[#080d1d] border border-white/[0.08] rounded-3xl p-6 sm:p-8 space-y-4 shadow-lg hover:border-teal-500/30 transition-all"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded-full bg-gradient-to-tr from-teal-500 to-sky-500 flex items-center justify-center text-white text-xs font-bold">
                    {post.author[0]}
                  </div>
                  <div>
                    <span className="font-bold text-white">{post.author}</span>
                    <span className="text-slate-400 text-[11px] ml-2">• {post.authorLocation}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-slate-400 text-[11px]">
                  <span className="px-2.5 py-0.5 rounded-full bg-white/[0.05] border border-white/[0.06] text-teal-300 font-medium">
                    {post.category}
                  </span>
                  <span>{post.timeAgo}</span>
                </div>
              </div>

              <h3 className="text-base sm:text-lg font-bold text-white hover:text-teal-300 transition-colors cursor-pointer">
                {post.title}
              </h3>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed whitespace-pre-line">
                {post.content}
              </p>

              <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs">
                <button
                  onClick={() => handleUpvote(post.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition-all ${
                    post.userUpvoted
                      ? "bg-teal-500/20 border-teal-500 text-teal-300 font-bold"
                      : "bg-white/[0.03] border-white/[0.08] text-slate-400 hover:text-white"
                  }`}
                >
                  <ThumbsUp className="h-3.5 w-3.5" />
                  <span>Helpful ({post.upvotes})</span>
                </button>

                <div className="flex items-center gap-4 text-slate-400 text-xs">
                  <span className="flex items-center gap-1.5">
                    <MessageSquare className="h-3.5 w-3.5 text-sky-400" />
                    <span>{post.repliesCount} replies</span>
                  </span>
                  <button
                    onClick={() => {
                      if (navigator.clipboard) {
                        navigator.clipboard.writeText(window.location.href);
                        alert("Thread link copied!");
                      }
                    }}
                    className="hover:text-white transition-colors"
                    title="Share discussion"
                  >
                    <Share2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
