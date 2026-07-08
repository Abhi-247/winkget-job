"use client";

import { Calendar, Clock, ArrowRight, BookOpen } from "lucide-react";
import Link from "next/link";

const blogPosts = [
  {
    title: "How to Build a Successful Freelance Portfolio in 2026",
    category: "Freelance Tips",
    excerpt: "Learn how to stand out from the crowd by organizing your skills, showcasing recent projects, and formatting reviews.",
    author: "Rohan Das",
    date: "July 2, 2026",
    readTime: "5 min read",
    color: "text-[#1e3a5f] bg-[#edf2f7]",
  },
  {
    title: "Top 10 High-Demand Skills for Remote Developers",
    category: "Tech Trends",
    excerpt: "Discover the technologies and tools that leading companies are actively searching for in this year's job market.",
    author: "Sneha Iyer",
    date: "June 28, 2026",
    readTime: "7 min read",
    color: "text-purple-600 bg-purple-50",
  },
  {
    title: "A Complete Guide to Safe Online Payments & Escrow",
    category: "Client Guides",
    excerpt: "Understand how the escrow process protects your payments and guarantees quality work delivery every single time.",
    author: "Amit Patel",
    date: "June 15, 2026",
    readTime: "4 min read",
    color: "text-[#1e3a5f] bg-[#edf2f7]",
  },
];

export default function BlogPage() {
  return (
    <main
      className="bg-white min-h-screen py-16"
      style={{ fontFamily: "var(--font-poppins), sans-serif" }}
    >
      {/* Blog Hero */}
      <section className="relative overflow-hidden mb-16 py-12">
        <div className="absolute inset-0 bg-gradient-to-br from-[#edf2f7] to-[#f8fafc] opacity-60 -z-10" />
        <div className="max-w-5xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-1.5 bg-[#edf2f7] text-[#1e3a5f] rounded-full px-4 py-1.5 text-xs font-semibold mb-6">
            <BookOpen size={12} className="text-[#1e3a5f]" />
            <span>WinkGetJob Resources & Stories</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-6 leading-tight">
            Latest from our <span className="text-[#1e3a5f]">Blog</span>
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Tips, guides, and tech trends to help you succeed in the remote work and freelancing landscape.
          </p>
        </div>
      </section>

      {/* Categories filter */}
      <section className="max-w-5xl mx-auto px-6 mb-12">
        <div className="flex flex-wrap items-center gap-2 justify-center">
          {["All", "Freelance Tips", "Tech Trends", "Client Guides", "Remote Work"].map((tag, idx) => (
            <button
              key={tag}
              className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                idx === 0
                  ? "bg-[#1e3a5f] text-white border-blue-600"
                  : "bg-white text-gray-600 border-gray-200 hover:border-blue-300"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </section>

      {/* Blog Posts Grid */}
      <section className="max-w-5xl mx-auto px-6 mb-12">
        <div className="grid md:grid-cols-3 gap-8">
          {blogPosts.map((post, index) => (
            <article
              key={index}
              className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div>
                <span
                  className={`inline-block px-2.5 py-0.5 rounded text-[11px] font-semibold mb-4 ${post.color}`}
                >
                  {post.category}
                </span>
                <h2 className="text-xl font-bold text-gray-900 mb-3 hover:text-[#1e3a5f] transition-colors">
                  {post.title}
                </h2>
                <p className="text-sm text-gray-500 leading-relaxed mb-6">
                  {post.excerpt}
                </p>
              </div>

              <div>
                <div className="flex items-center gap-4 text-xs text-gray-400 mb-4">
                  <span className="flex items-center gap-1">
                    <Calendar size={12} />
                    {post.date}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock size={12} />
                    {post.readTime}
                  </span>
                </div>
                <div className="flex items-center justify-between border-t border-gray-50 pt-4">
                  <span className="text-xs text-gray-500 font-medium">By {post.author}</span>
                  <Link
                    href="#"
                    className="text-xs text-[#1e3a5f] font-bold flex items-center gap-1 hover:underline"
                  >
                    Read More
                    <ArrowRight size={12} />
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
