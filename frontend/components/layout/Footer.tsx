import Link from "next/link";
import { Mail, Phone, MapPin } from "lucide-react";
import { Linkedin, Twitter, Github } from "@/components/ui/BrandIcons";

const footerLinks = {
  "For Clients": [
    { label: "Post a Job", href: "/register?role=employer" },
    { label: "Browse Freelancers", href: "/#freelancers" },
    { label: "How It Works", href: "/#how-it-works" },
    { label: "Employer Dashboard", href: "/employer/dashboard" },
  ],
  "For Freelancers": [
    { label: "Browse Jobs", href: "/jobs" },
    { label: "Create Profile", href: "/register?role=jobseeker" },
    { label: "Proposals", href: "/jobseeker/proposals" },
    { label: "Earnings", href: "/jobseeker/earnings" },
  ],
  Company: [
    { label: "About Us", href: "/about" },
    { label: "Blog", href: "/blog" },
    { label: "Careers", href: "/careers" },
  ],
};

export function Footer() {
  return (
    <footer className="bg-[#0f172a] text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand */}
          <div>
            <Link
              href="/"
              className="flex items-center gap-2 font-bold text-xl mb-4"
            >
              <div className="w-8 h-8 bg-[#1e3a5f] rounded-lg flex items-center justify-center text-white font-black text-sm">
                W
              </div>
              <span className="text-white">
                Wink<span className="text-[#d4a017]">Get</span>Job
              </span>
            </Link>
            <p className="text-sm text-gray-400 leading-relaxed mb-4 max-w-xs">
              Connecting skilled freelancers with great employers across India.
              Find work, grow your career, and build great products together.
            </p>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([heading, links]) => (
            <div key={heading}>
              <h3 className="font-semibold text-white text-sm mb-4">
                {heading}
              </h3>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-gray-400 hover:text-[#d4a017] transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Contact Details */}
          <div>
            <h3 className="font-semibold text-white text-sm mb-4">
              Contact Us
            </h3>
            <div className="space-y-3 text-sm text-gray-400">
              <div className="flex items-center gap-2">
                <Mail size={14} className="text-gray-400" />
                <span>hello@winkgetjob.com</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone size={14} className="text-gray-400" />
                <span>+91 98765 43210</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin size={14} className="text-gray-400" />
                <span>Bengaluru, India</span>
              </div>
            </div>
            <div className="flex items-center gap-3 mt-5">
              <a
                href="#"
                aria-label="LinkedIn"
                className="p-2 rounded-lg bg-[#1e293b] hover:bg-[#334155] transition-colors"
              >
                <Linkedin size={16} />
              </a>
              <a
                href="#"
                aria-label="Twitter"
                className="p-2 rounded-lg bg-[#1e293b] hover:bg-[#334155] transition-colors"
              >
                <Twitter size={16} />
              </a>
              <a
                href="#"
                aria-label="GitHub"
                className="p-2 rounded-lg bg-[#1e293b] hover:bg-[#334155] transition-colors"
              >
                <Github size={16} />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-[#1e293b] flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-500">
          <p>© {new Date().getFullYear()} WinkGetJob. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="hover:text-gray-300 transition-colors">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-gray-300 transition-colors">
              Terms
            </Link>
            <Link href="/cookies" className="hover:text-gray-300 transition-colors">
              Cookies
            </Link>
            {/* Admin login — subtle link, not shown to regular users */}
            <Link
              href="/sign-in?role=admin"
              className="flex items-center gap-1 text-gray-600 hover:text-gray-400 transition-colors border-l border-gray-700 pl-4"
              title="Admin Login"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              Admin
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
