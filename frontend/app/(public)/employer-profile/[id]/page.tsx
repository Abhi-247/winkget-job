"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { freelancersApi } from "@/lib/api";
import { User } from "@/types";
import { Avatar } from "@/components/ui/Avatar";
import { MapPin, Building, Globe, Mail, User as UserIcon } from "lucide-react";
import { Linkedin, Twitter } from "@/components/ui/BrandIcons";

export default function PublicEmployerProfilePage() {
  const params = useParams();
  const employerId = params.id as string;
  
  const [employer, setEmployer] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEmployerProfile = async () => {
      try {
        setLoading(true);
        const res = (await freelancersApi.getById(employerId)) as { data: User };
        setEmployer(res.data);
      } catch (err) {
        setError("Failed to load employer profile");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (employerId) {
      fetchEmployerProfile();
    }
  }, [employerId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#1e3a5f]"></div>
      </div>
    );
  }

  if (error || !employer) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-gray-500">{error || "Employer profile not found"}</p>
        </div>
      </div>
    );
  }

  const displayCompany = employer.company || employer.name || "Company";
  const displayContact = employer.name || "Contact Person";

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
        {/* Banner */}
        <div className="h-48 bg-gradient-to-r from-[#152a45] via-[#1e3a5f] to-[#2c5282]" />
        
        <div className="px-6 pb-6 relative">
          {/* Avatar */}
          <div className="absolute -top-12 left-6 w-24 h-24 rounded-full ring-4 ring-white overflow-hidden bg-white shadow flex items-center justify-center">
            {employer.avatar ? (
              <img src={employer.avatar} alt={displayCompany} className="w-full h-full object-cover" />
            ) : (
              <Avatar name={displayCompany} size="xl" className="w-full h-full rounded-full" />
            )}
          </div>

          <div className="pt-16">
            <h1 className="text-2xl font-bold text-gray-900">{displayCompany}</h1>
            <p className="text-gray-500 font-medium text-sm mt-0.5">
              {employer.title ? `${employer.title} — ${displayContact}` : displayContact}
            </p>
            <div className="flex flex-wrap gap-y-1 gap-x-4 mt-3 text-xs text-gray-400">
              {employer.location && (
                <span className="flex items-center gap-1">
                  <MapPin size={13} /> {employer.location}
                </span>
              )}
              {employer.socialLinks?.website && (
                <a
                  href={employer.socialLinks.website.startsWith("http") ? employer.socialLinks.website : `https://${employer.socialLinks.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 hover:text-[#1e3a5f] transition-colors"
                >
                  <Globe size={13} /> {employer.socialLinks.website}
                </a>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-[1fr_280px] gap-8 mt-8 border-t border-gray-100 pt-6">
            {/* Left info column */}
            <div className="space-y-6">
              {/* About */}
              <div>
                <h3 className="text-sm font-bold text-gray-900 mb-2.5">About Us</h3>
                <p className="text-sm text-gray-500 leading-relaxed whitespace-pre-wrap">
                  {employer.bio || "No description provided."}
                </p>
              </div>
            </div>

            {/* Right metadata column */}
            <div className="space-y-6 border-t md:border-t-0 md:border-l border-gray-100 pt-6 md:pt-0 md:pl-6">
              <div>
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
                  Contact Info
                </h3>
                <ul className="space-y-3">
                  <li className="flex items-center gap-2 text-sm text-gray-600">
                    <UserIcon size={15} className="text-gray-400" />
                    <div>
                      <p className="font-semibold text-gray-900 leading-none">{displayContact}</p>
                      <p className="text-[10px] text-gray-400 mt-1">{employer.title || "Representative"}</p>
                    </div>
                  </li>
                  {employer.email && (
                    <li className="flex items-center gap-2 text-sm text-gray-600">
                      <Mail size={15} className="text-gray-400" />
                      <span className="truncate">{employer.email}</span>
                    </li>
                  )}
                </ul>
              </div>

              <div>
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
                  Social Handles
                </h3>
                <div className="flex gap-2.5">
                  {employer.socialLinks?.linkedin ? (
                    <a
                      href={employer.socialLinks.linkedin.startsWith("http") ? employer.socialLinks.linkedin : `https://${employer.socialLinks.linkedin}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-8 h-8 rounded-lg bg-gray-50 border border-gray-200 flex items-center justify-center text-gray-450 hover:text-[#0077b5] hover:bg-blue-50 transition-colors"
                    >
                      <Linkedin size={15} />
                    </a>
                  ) : null}
                  {employer.socialLinks?.twitter && (
                    <a
                      href={employer.socialLinks.twitter.startsWith("http") ? employer.socialLinks.twitter : `https://${employer.socialLinks.twitter}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-8 h-8 rounded-lg bg-gray-50 border border-gray-200 flex items-center justify-center text-gray-450 hover:text-[#1da1f2] hover:bg-blue-50 transition-colors"
                    >
                      <Twitter size={15} />
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
