"use client";

import { useState } from "react";
import {
  MessageSquare,
  ThumbsUp,
  Share2,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  User,
  X
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
}

export default function CommunityForumPage() {
  const { isLoggedIn, login } = useAuth();

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
      content: "Sharing our recent expense sheet: AC bus return (৳3,200), Chander Gari 2-day reserve with Alutila & Risang (৳9,500 total, split by 4 = ৳2,375), 2 nights wooden cottage (৳7,000 total = ৳1,750 each), Food including bamboo chicken (৳2,500 each). Total came to around ৳9,800 per person.",
      upvotes: 42,
      repliesCount: 21,
      timeAgo: "3 days ago"
    },
    {
      id: "4",
      author: "Tahmid Chowdhury",
      authorLocation: "Uttara, Dhaka",
      category: "Trekking & Camping",
      title: "Is camping permitted at Marayan Thong hill peak right now?",
      content: "Heard local administration required guide permits for overnight camping on Marayan Thong. Does anyone have verified contact details for Alikadam local indigenous guides?",
      upvotes: 15,
      repliesCount: 8,
      timeAgo: "4 days ago"
    }
  ]);

  const [selectedCategory, setSelectedCategory] = useState("All");
  const [newPostModalOpen, setNewPostModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState("Transport");
  const [newContent, setNewContent] = useState("");

  const categories = ["All", "Transport", "Family Travel", "Budget & Cost", "Trekking & Camping"];

  const filteredPosts = posts.filter((p) => selectedCategory === "All" || p.category === selectedCategory);

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    const newPost: ForumPost = {
      id: Date.now().toString(),
      author: "Tanvir Ahmed",
      authorLocation: "Dhaka",
      category: newCategory,
      title: newTitle,
      content: newContent,
      upvotes: 1,
      repliesCount: 0,
      timeAgo: "Just now"
    };

    setPosts([newPost, ...posts]);
    setNewPostModalOpen(false);
    setNewTitle("");
    setNewContent("");
  };

  const handleUpvote = (id: string) => {
    setPosts(posts.map((p) => (p.id === id ? { ...p, upvotes: p.upvotes + 1 } : p)));
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <span className="text-xs font-bold text-teal-400 uppercase tracking-wider">
            Traveler Community
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Community Forum & Discussions
          </h1>
          <p className="text-xs text-slate-400">
            Ask questions, share real expenses, and get road updates from fellow Bangladeshi travelers.
          </p>
        </div>

        <button
          onClick={() => {
            if (!isLoggedIn) {
              login();
            }
            setNewPostModalOpen(true);
          }}
          className="px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold shadow-sm transition-all flex items-center gap-2 self-start sm:self-auto shrink-0"
        >
          <Plus className="h-4 w-4" />
          <span>Ask Question / Share Tip</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3.5 py-1.5 rounded-xl transition-all whitespace-nowrap ${
              selectedCategory === cat
                ? "bg-teal-600 text-white font-semibold"
                : "bg-slate-900 text-slate-400 border border-slate-800 hover:text-white"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Posts List */}
      <div className="space-y-4">
        {filteredPosts.map((post) => (
          <div
            key={post.id}
            className="bg-[#0b1120] border border-slate-800/80 rounded-2xl p-5 sm:p-6 space-y-3 shadow-sm hover:border-slate-700 transition-colors"
          >
            <div className="flex items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 rounded-full bg-teal-600/30 text-teal-300 flex items-center justify-center font-bold text-[10px]">
                  {post.author[0]}
                </div>
                <span className="font-semibold text-white">{post.author}</span>
                <span className="text-[11px] text-slate-500">• {post.authorLocation}</span>
                <span className="text-[11px] text-slate-500">• {post.timeAgo}</span>
              </div>

              <span className="text-[10px] font-semibold text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded border border-sky-500/20">
                {post.category}
              </span>
            </div>

            <h3 className="text-sm sm:text-base font-bold text-white leading-snug">
              {post.title}
            </h3>

            <p className="text-xs text-slate-300 leading-relaxed">
              {post.content}
            </p>

            <div className="pt-2 flex items-center gap-4 text-xs text-slate-400 border-t border-slate-800/60">
              <button
                onClick={() => handleUpvote(post.id)}
                className="flex items-center gap-1.5 hover:text-teal-400 transition-colors"
              >
                <ThumbsUp className="h-3.5 w-3.5 text-teal-400" />
                <span>{post.upvotes} Helpful</span>
              </button>

              <div className="flex items-center gap-1.5">
                <MessageSquare className="h-3.5 w-3.5 text-sky-400" />
                <span>{post.repliesCount} Replies</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Ask Question Modal */}
      {newPostModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#0b1120] border border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setNewPostModalOpen(false)}
              className="absolute top-4 right-4 h-8 w-8 rounded-full bg-slate-900 text-slate-400 hover:text-white flex items-center justify-center"
            >
              <X className="h-4 w-4" />
            </button>

            <h3 className="text-lg font-bold text-white mb-1">Post a Question or Travel Update</h3>
            <p className="text-xs text-slate-400 mb-4">Connect with travelers who have visited recently.</p>

            <form onSubmit={handleCreatePost} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 mb-1 font-medium">Topic Category</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-teal-500"
                >
                  <option value="Transport">Transport & Bus</option>
                  <option value="Family Travel">Family Travel</option>
                  <option value="Budget & Cost">Budget & Cost Breakdown</option>
                  <option value="Trekking & Camping">Trekking & Camping</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-medium">Question Title</label>
                <input
                  type="text"
                  placeholder="e.g. Current condition of Dhaka-Sylhet highway road work?"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-teal-500"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-medium">Details</label>
                <textarea
                  rows={4}
                  placeholder="Provide context so fellow travelers can answer accurately..."
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-teal-500"
                  required
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setNewPostModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-950 text-slate-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold"
                >
                  Publish Discussion
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
