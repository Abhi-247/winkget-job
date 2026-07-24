"use client";

import {
  Calendar,
  Clock,
  ArrowRight,
  BookOpen,
  Search,
  Tag,
  User,
  X,
  Share2,
  CheckCircle,
  Sparkles,
  Send,
  ThumbsUp,
} from "lucide-react";
import Link from "next/link";
import { useState, useMemo } from "react";

interface BlogPost {
  id: string;
  title: string;
  category: string;
  excerpt: string;
  fullContent: string[];
  keyTakeaways: string[];
  author: string;
  authorRole: string;
  date: string;
  readTime: string;
  color: string;
  featured?: boolean;
}

const blogPosts: BlogPost[] = [
  {
    id: "ai-freelancing-2026",
    title: "The AI Revolution in Indian Freelancing: 2026 Strategy Guide",
    category: "Tech & AI",
    excerpt:
      "Explore how artificial intelligence tools are helping Indian developers and designers triple productivity without losing creative authenticity.",
    fullContent: [
      "Artificial intelligence is no longer just a buzzword in the freelance economy — it has become an indispensable daily toolkit for independent engineers, creators, and consultants across India.",
      "By leveraging AI-assisted coding, automated contract drafting, and intelligent design system generators, freelancers are completing projects up to 3x faster while delivering higher quality outcomes for international clients.",
      "However, standing out requires more than just using AI. The key lies in human orchestration — combining deep domain expertise, empathetic client communication, and rigorous quality verification alongside automated tools.",
    ],
    keyTakeaways: [
      "Use AI for repetitive scaffolding and boilerplate work, reserving human creativity for architecture.",
      "Highlight your AI-augmented workflow in client proposals to demonstrate speed and value.",
      "Continuously update your skill stack with modern LLM APIs and prompt engineering fundamentals.",
    ],
    author: "Abhishek Verma",
    authorRole: "Founder & CEO, WinkGetJob",
    date: "July 20, 2026",
    readTime: "6 min read",
    color: "text-amber-600 bg-amber-50 border-amber-200",
    featured: true,
  },
  {
    id: "portfolio-build-2026",
    title: "How to Build a High-Converting Freelance Portfolio in 2026",
    category: "Freelance Tips",
    excerpt:
      "Learn how to stand out from the crowd by organizing your skills, showcasing real problem-solving case studies, and collecting verified client reviews.",
    fullContent: [
      "Your portfolio is your single most important sales asset. Clients rarely hire based on resume claims alone — they want proof that you can solve their exact business problem.",
      "Instead of displaying static images or code snippets, structure your portfolio projects as case studies: Problem Statement, Solution Strategy, Technologies Used, and Measurable Business Impact.",
      "Include verified client testimonials, live deployment links, and clear pricing scopes so potential buyers can make an instant hiring decision.",
    ],
    keyTakeaways: [
      "Focus on 3-5 high-impact case studies rather than listing dozens of minor projects.",
      "Quantify your results (e.g., 'Boosted page speed by 65%' or 'Reduced API latency by 120ms').",
      "Keep your WinkGetJob profile badges and verified skill tags updated.",
    ],
    author: "Rohan Das",
    authorRole: "Senior UX Consultant",
    date: "July 12, 2026",
    readTime: "5 min read",
    color: "text-blue-600 bg-blue-50 border-blue-200",
  },
  {
    id: "top-tech-skills-remote",
    title: "Top 10 High-Demand Tech Skills for Remote Indian Developers",
    category: "Tech & AI",
    excerpt:
      "Discover the specific frameworks, backend architectures, and cloud services that global startups are actively paying top hourly rates for this year.",
    fullContent: [
      "The global demand for full-stack engineering talent in India has reached record highs. Modern tech stacks like Next.js 16, TypeScript, Node.js, Python AI frameworks, and cloud-native serverless deployments lead the hiring charts.",
      "Employers are prioritizing engineers who understand end-to-end delivery — from writing clean modular React components to deploying secure REST/GraphQL APIs and configuring PostgreSQL or MongoDB databases.",
    ],
    keyTakeaways: [
      "Master Next.js App Router, Tailwind CSS, and TypeScript for rapid web app creation.",
      "Understand containerization with Docker and deployment pipelines on Vercel or AWS.",
      "Practice clean code documentation and automated unit testing.",
    ],
    author: "Sneha Iyer",
    authorRole: "Tech Lead & Full Stack Architect",
    date: "June 28, 2026",
    readTime: "7 min read",
    color: "text-purple-600 bg-purple-50 border-purple-200",
  },
  {
    id: "safe-escrow-payments-guide",
    title: "The Complete Client Guide to Safe Milestone Escrow Payments",
    category: "Client Guides",
    excerpt:
      "Understand how milestone escrow guarantees project budget safety for employers while assuring freelancers get paid on time, every time.",
    fullContent: [
      "Payment anxiety is the #1 hurdle in online freelancing. Employers worry about paying upfront for incomplete work, while freelancers fear delivering code without receiving payment.",
      "Milestone escrow solves both issues simultaneously. The employer deposits funds into a secure WinkGetJob escrow account. The freelancer completes the milestone, submits work updates, and once approved, payment is instantly released.",
    ],
    keyTakeaways: [
      "Break complex projects into 2-4 clearly defined milestone deliverables.",
      "Use WinkGetJob's Work Update Drawer to review code and progress before releasing funds.",
      "Rely on our 24/7 Dispute Resolution team if scope changes arise.",
    ],
    author: "Amit Patel",
    authorRole: "Financial Ops Lead",
    date: "June 15, 2026",
    readTime: "4 min read",
    color: "text-emerald-600 bg-emerald-50 border-emerald-200",
  },
  {
    id: "freelance-taxes-gst-india",
    title: "Navigating Freelance Taxes & GST Registration in India",
    category: "Career Growth",
    excerpt:
      "Everything you need to know about Section 44ADA presumptive taxation, GST threshold limits, and invoicing as an independent contractor.",
    fullContent: [
      "Managing finances as an independent freelancer in India doesn't have to be complicated. Under Section 44ADA of the Income Tax Act, qualifying professionals can declare 50% of gross receipts as taxable income, drastically lowering tax liability.",
      "If your annual turnover crosses ₹20 Lakhs (or ₹10 Lakhs in specified states), registering for GST becomes mandatory. Keep proper digital records of every invoice generated on WinkGetJob for smooth annual filing.",
    ],
    keyTakeaways: [
      "Explore Section 44ADA to save on income tax if your turnover is under ₹50 Lakhs.",
      "Issue formal digital invoices with client details and clear milestone payment terms.",
      "Maintain a dedicated bank account for business transactions.",
    ],
    author: "Pooja Patel",
    authorRole: "Tax & Compliance Advisor",
    date: "June 02, 2026",
    readTime: "8 min read",
    color: "text-indigo-600 bg-indigo-50 border-indigo-200",
  },
  {
    id: "async-remote-teamwork",
    title: "Async Communication Mastery for Remote Project Teams",
    category: "Remote Work",
    excerpt:
      "How to work smoothly across time zones using clear documentation, video walkthroughs, and structured status updates.",
    fullContent: [
      "Working with global or multi-city project teams requires shifting from real-time meeting reliance to asynchronous communication mastery.",
      "By replacing 30-minute status meetings with concise 2-minute video walkthroughs and written progress logs, teams save hours of overhead while maintaining crystal-clear alignment.",
    ],
    keyTakeaways: [
      "Write detailed PR descriptions and explicit setup instructions.",
      "Summarize daily progress directly inside project work logs.",
      "Set expectations on response times for non-urgent messages.",
    ],
    author: "Karan Sharma",
    authorRole: "Agile Project Manager",
    date: "May 20, 2026",
    readTime: "5 min read",
    color: "text-teal-600 bg-teal-50 border-teal-200",
  },
];

export default function BlogPage() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeArticle, setActiveArticle] = useState<BlogPost | null>(null);
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);

  const categories = [
    "All",
    "Tech & AI",
    "Freelance Tips",
    "Client Guides",
    "Career Growth",
    "Remote Work",
  ];

  const filteredPosts = useMemo(() => {
    return blogPosts.filter((post) => {
      const matchesCategory =
        selectedCategory === "All" || post.category === selectedCategory;
      const matchesSearch =
        searchQuery.trim() === "" ||
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.author.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  const featuredPost = blogPosts.find((p) => p.featured) || blogPosts[0];

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newsletterEmail) {
      setNewsletterSubscribed(true);
      setTimeout(() => setNewsletterSubscribed(false), 4000);
      setNewsletterEmail("");
    }
  };

  return (
    <main
      className="bg-white min-h-screen relative"
      style={{ fontFamily: "var(--font-poppins), sans-serif" }}
    >
      {/* Hero Section */}
      <div className="bg-[#1e3a5f] text-white py-16 sm:py-20 relative overflow-hidden">
        <div className="absolute -top-20 -right-20 w-80 h-80 bg-white/5 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-64 h-64 bg-white/5 rounded-full blur-xl pointer-events-none" />
        <div className="relative max-w-6xl mx-auto px-6">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm mb-5 text-white/70">
            <Link href="/" className="hover:text-white transition-colors">
              Home
            </Link>
            <span>›</span>
            <span className="text-white font-medium">Blog</span>
          </div>
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 text-xs font-semibold mb-5">
            <BookOpen size={14} className="text-[#d4a017]" />
            <span>WinkGetJob Knowledge Hub &amp; Guides</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold leading-tight mb-4">
            Insights &amp; Guides for <span className="text-[#d4a017]">Remote Success</span>
          </h1>
          <p className="text-white/80 text-sm sm:text-base max-w-2xl leading-relaxed">
            Practical strategies, tech trends, tax tips, and hiring guides curated for India's independent creators and modern employers.
          </p>
        </div>
      </div>

      <div className="py-12 space-y-16">
        {/* Search & Category Filter Section */}
        <section className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-gray-50 border border-gray-200 rounded-3xl p-6 shadow-sm">
            {/* Search Bar */}
            <div className="relative w-full md:w-80">
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder="Search articles, topics, authors..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-2xl pl-11 pr-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 outline-none focus:border-[#1e3a5f] transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            {/* Category Pills */}
            <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 no-scrollbar">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer whitespace-nowrap border ${
                    selectedCategory === cat
                      ? "bg-[#1e3a5f] text-white border-[#1e3a5f] shadow-sm"
                      : "bg-white text-gray-700 border-gray-200 hover:bg-gray-100"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Article Banner (Show only when 'All' category and no search query) */}
        {selectedCategory === "All" && !searchQuery && (
          <section className="max-w-6xl mx-auto px-6">
            <div className="bg-gradient-to-br from-slate-900 via-[#1e3a5f] to-[#152a45] rounded-3xl p-8 sm:p-12 text-white shadow-xl relative overflow-hidden grid md:grid-cols-3 gap-8 items-center">
              <div className="md:col-span-2 space-y-4">
                <div className="inline-flex items-center gap-2 bg-[#d4a017] text-[#1e3a5f] font-bold text-xs px-3 py-1 rounded-full uppercase tracking-wider">
                  <Sparkles size={12} />
                  Featured Article
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold leading-tight">
                  {featuredPost.title}
                </h2>
                <p className="text-white/80 text-sm sm:text-base leading-relaxed">
                  {featuredPost.excerpt}
                </p>
                <div className="flex flex-wrap items-center gap-4 text-xs text-white/70 pt-2">
                  <span className="flex items-center gap-1.5">
                    <User size={14} className="text-[#d4a017]" />
                    {featuredPost.author} ({featuredPost.authorRole})
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1.5">
                    <Calendar size={14} />
                    {featuredPost.date}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1.5">
                    <Clock size={14} />
                    {featuredPost.readTime}
                  </span>
                </div>
                <div className="pt-4">
                  <button
                    onClick={() => setActiveArticle(featuredPost)}
                    className="bg-[#d4a017] hover:bg-[#c29213] text-[#1e3a5f] font-bold px-6 py-3 rounded-xl transition-all shadow-md flex items-center gap-2 text-sm cursor-pointer"
                  >
                    Read Full Story
                    <ArrowRight size={16} />
                  </button>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 space-y-4 hidden md:block">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#d4a017]">
                  Key Takeaways
                </h4>
                <ul className="space-y-2.5 text-xs text-white/90">
                  {featuredPost.keyTakeaways.map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle size={14} className="text-[#d4a017] flex-shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>
        )}

        {/* Blog Posts Grid */}
        <section className="max-w-6xl mx-auto px-6">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-2xl font-bold text-gray-900">
              {selectedCategory === "All" ? "All Articles" : `${selectedCategory} Articles`}
            </h3>
            <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
              Showing {filteredPosts.length} post{filteredPosts.length === 1 ? "" : "s"}
            </span>
          </div>

          {filteredPosts.length === 0 ? (
            <div className="text-center py-16 bg-gray-50 border border-gray-200 rounded-3xl">
              <BookOpen size={40} className="mx-auto text-gray-400 mb-3" />
              <h4 className="text-lg font-bold text-gray-800">No articles found</h4>
              <p className="text-sm text-gray-500 mt-1">
                Try searching for another keyword or change your category filter.
              </p>
              <button
                onClick={() => {
                  setSelectedCategory("All");
                  setSearchQuery("");
                }}
                className="mt-4 bg-[#1e3a5f] text-white text-xs font-bold px-5 py-2.5 rounded-xl"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredPosts.map((post) => (
                <article
                  key={post.id}
                  className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between hover:-translate-y-1"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-bold border ${post.color}`}
                      >
                        {post.category}
                      </span>
                      <span className="text-[11px] text-gray-400 flex items-center gap-1">
                        <Clock size={12} />
                        {post.readTime}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-gray-900 mb-3 line-clamp-2 hover:text-[#1e3a5f] transition-colors">
                      {post.title}
                    </h3>
                    <p className="text-xs text-gray-500 leading-relaxed mb-6 line-clamp-3">
                      {post.excerpt}
                    </p>
                  </div>

                  <div>
                    <div className="flex items-center justify-between border-t border-gray-100 pt-4 mt-2">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-gray-200 text-gray-700 font-bold text-[10px] flex items-center justify-center">
                          {post.author
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-gray-800">
                            {post.author}
                          </div>
                          <div className="text-[10px] text-gray-400">{post.date}</div>
                        </div>
                      </div>

                      <button
                        onClick={() => setActiveArticle(post)}
                        className="text-xs text-[#1e3a5f] font-bold flex items-center gap-1 hover:underline cursor-pointer"
                      >
                        Read More
                        <ArrowRight size={14} />
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        {/* Newsletter Subscription Box */}
        <section className="max-w-6xl mx-auto px-6">
          <div className="bg-gradient-to-r from-[#1e3a5f] to-slate-900 rounded-3xl p-8 sm:p-12 text-white shadow-xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="space-y-3 text-center md:text-left max-w-xl">
              <span className="text-xs font-bold text-[#d4a017] bg-white/10 px-3 py-1 rounded-full uppercase tracking-wider">
                Stay Ahead of the Market
              </span>
              <h3 className="text-2xl sm:text-3xl font-extrabold">
                Subscribe to WinkGetJob Digest
              </h3>
              <p className="text-white/80 text-xs sm:text-sm leading-relaxed">
                Get weekly freelance opportunities, salary benchmarks, and tech trends delivered straight to your inbox. No spam, ever.
              </p>
            </div>

            <form
              onSubmit={handleNewsletterSubmit}
              className="w-full md:w-auto flex flex-col sm:flex-row gap-3 min-w-[300px]"
            >
              <input
                type="email"
                placeholder="Enter your email address"
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                required
                className="bg-white/10 border border-white/20 text-white placeholder-white/50 px-4 py-3 rounded-xl text-sm outline-none focus:border-[#d4a017] transition-colors w-full"
              />
              <button
                type="submit"
                className="bg-[#d4a017] hover:bg-[#c29213] text-[#1e3a5f] font-bold px-6 py-3 rounded-xl transition-all shadow-md text-sm whitespace-nowrap flex items-center justify-center gap-2 cursor-pointer"
              >
                Subscribe
                <Send size={14} />
              </button>
            </form>
          </div>

          {newsletterSubscribed && (
            <div className="mt-4 p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold text-center flex items-center justify-center gap-2">
              <CheckCircle size={16} />
              Thank you for subscribing! Check your inbox for confirmation.
            </div>
          )}
        </section>
      </div>

      {/* Article Full Reader Modal */}
      {activeArticle && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative border border-gray-100">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-100 px-6 sm:px-8 py-5 flex items-center justify-between z-10">
              <span className="text-xs font-bold text-[#1e3a5f] bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
                {activeArticle.category}
              </span>
              <button
                onClick={() => setActiveArticle(null)}
                className="w-8 h-8 rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 sm:p-8 space-y-6">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 leading-tight">
                {activeArticle.title}
              </h2>

              <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 pb-4 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-[#1e3a5f] text-white font-bold text-xs flex items-center justify-center">
                    {activeArticle.author
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">
                      {activeArticle.author}
                    </div>
                    <div className="text-[10px] text-gray-400">
                      {activeArticle.authorRole}
                    </div>
                  </div>
                </div>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Calendar size={13} />
                  {activeArticle.date}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Clock size={13} />
                  {activeArticle.readTime}
                </span>
              </div>

              {/* Key Takeaways Box */}
              <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-5 space-y-3">
                <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles size={14} className="text-[#d4a017]" />
                  Executive Summary &amp; Takeaways
                </h4>
                <ul className="space-y-2 text-xs text-amber-950">
                  {activeArticle.keyTakeaways.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <CheckCircle
                        size={14}
                        className="text-[#d4a017] flex-shrink-0 mt-0.5"
                      />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Full Paragraphs */}
              <div className="space-y-4 text-sm text-gray-700 leading-relaxed font-normal">
                {activeArticle.fullContent.map((paragraph, idx) => (
                  <p key={idx}>{paragraph}</p>
                ))}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-100 px-6 sm:px-8 py-4 flex items-center justify-between">
              <span className="text-xs text-gray-500">
                Found this helpful? Share with your network.
              </span>
              <button
                onClick={() => {
                  if (navigator.clipboard) {
                    navigator.clipboard.writeText(window.location.href);
                    alert("Article link copied to clipboard!");
                  }
                }}
                className="bg-white border border-gray-200 text-gray-700 font-semibold text-xs px-4 py-2 rounded-xl hover:bg-gray-100 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Share2 size={14} />
                Share Link
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
