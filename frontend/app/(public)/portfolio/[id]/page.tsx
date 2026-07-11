"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { freelancersApi, messagesApi } from "@/lib/api";
import { User } from "@/types";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  MapPin,
  Clock,
  Briefcase,
  GraduationCap,
  Globe,
  FileText,
  Mail,
  MessageSquare,
  Award,
  Building,
  Calendar,
  ChevronLeft,
} from "lucide-react";
import { Linkedin, Github, Twitter } from "@/components/ui/BrandIcons";

export default function PublicPortfolioPage() {
  const params = useParams();
  const { data: session } = useSession();
  const router = useRouter();
  const { success, error, info } = useToast();

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [messageLoading, setMessageLoading] = useState(false);

  useEffect(() => {
    const fetchPortfolio = async () => {
      const id = params?.id as string;
      if (!id) return;
      try {
        const res = (await freelancersApi.getById(id)) as {
          success: boolean;
          data: User;
        };
        if (res.success && res.data) {
          setUser(res.data);
        } else {
          error("Failed to load portfolio details");
        }
      } catch (err) {
        error("Portfolio not found");
      } finally {
        setLoading(false);
      }
    };
    fetchPortfolio();
  }, [params]);

  const handleContact = async () => {
    if (!session?.user.accessToken) {
      info("Please sign in to message this candidate directly");
      router.push(`/sign-in?callbackUrl=/portfolio/${user?._id}`);
      return;
    }
    if (session.user.id === user?._id) {
      info("This is your own profile!");
      return;
    }

    setMessageLoading(true);
    try {
      const res = (await messagesApi.getOrCreateConversation(session.user.accessToken, {
        participantId: user!._id,
      })) as { success: boolean; data?: { _id: string } };

      if (res.success && res.data?._id) {
        success("Starting conversation...");
        router.push(`/jobseeker/messages?conv=${res.data._id}`);
      } else {
        error("Could not initiate conversation");
      }
    } catch (err) {
      error("Failed to start message conversation");
    } finally {
      setMessageLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#1e3a5f]"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-md mx-auto text-center py-16 px-4">
        <h2 className="text-xl font-bold text-gray-900">Portfolio Not Found</h2>
        <p className="text-gray-500 mt-2 text-sm">The user ID may be incorrect or the profile has been deactivated.</p>
        <div className="mt-6">
          <Button onClick={() => router.push("/")} className="bg-[#1e3a5f]">
            Return Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-[family-name:var(--font-poppins)] pb-12 relative">
      {/* ── Header banner ── */}
      <div className="relative h-48 sm:h-64 bg-gradient-to-r from-[#152a45] via-[#1e3a5f] to-[#2c5282] bg-cover bg-center print:hidden" />

      {/* ── Main card container ── */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 relative -mt-20 print:mt-0 print:p-0">
        <div className="bg-white rounded-3xl border border-gray-200 shadow-xl overflow-hidden print:border-none print:shadow-none print:rounded-none">
          <div className="p-6 sm:p-8">
            {/* ── Top row info ── */}
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 print:hidden">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left">
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden bg-white ring-4 ring-white shadow-md shrink-0">
                  {user.avatar ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    <Avatar name={user.name} size="xl" className="w-full h-full rounded-full" />
                  )}
                </div>
                <div className="pt-2">
                  <h1 className="text-2xl sm:text-3xl font-black text-gray-900 leading-tight">{user.name}</h1>
                  <p className="text-[#1e3a5f] font-semibold text-sm sm:text-base mt-1">{user.title || "Freelancer"}</p>
                  <div className="flex flex-wrap justify-center sm:justify-start gap-x-4 gap-y-1 mt-3 text-xs text-gray-400 font-medium">
                    {user.location && (
                      <span className="flex items-center gap-1">
                        <MapPin size={13} /> {user.location}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Clock size={13} /> Available: <span className="text-emerald-600 font-semibold">{user.availability || "Immediately"}</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-2.5 justify-center shrink-0">
                <Button
                  onClick={handlePrint}
                  variant="outline"
                  className="flex items-center gap-1.5 text-xs py-2"
                >
                  <FileText size={14} /> Download Resume
                </Button>
                <Button
                  onClick={handleContact}
                  loading={messageLoading}
                  className="flex items-center gap-1.5 text-xs py-2 bg-[#1e3a5f] hover:bg-[#152a45]"
                >
                  <MessageSquare size={14} /> Message Candidate
                </Button>
                {user.email && (
                  <a
                    href={`mailto:${user.email}`}
                    className="inline-flex items-center justify-center gap-1.5 px-4 py-2 border border-gray-200 bg-white hover:bg-gray-50 rounded-lg text-xs font-semibold text-gray-700 transition-colors shadow-sm"
                  >
                    <Mail size={14} /> Email
                  </a>
                )}
              </div>
            </div>

            {/* ── 2-Column Details Grid ── */}
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-8 mt-8 border-t border-gray-100 pt-8 print:border-none print:pt-0 print:mt-0 print:grid-cols-1">
              
              {/* Left Column: Bio and Work History */}
              <div className="space-y-8">
                {/* About Me */}
                <div>
                  <h3 className="text-base font-bold text-gray-900 mb-3 border-l-4 border-[#1e3a5f] pl-3 leading-none print:text-sm print:border-gray-800 print:mb-2">
                    Professional Summary
                  </h3>
                  <p className="text-sm text-gray-500 leading-relaxed whitespace-pre-wrap pl-4 print:pl-0 print:text-xs">
                    {user.bio || "No summary provided."}
                  </p>
                </div>

                {/* Work Experience */}
                <div>
                  <h3 className="text-base font-bold text-gray-900 mb-4 border-l-4 border-[#1e3a5f] pl-3 leading-none flex items-center gap-1.5 print:text-sm print:border-gray-800 print:mb-2">
                    <Briefcase size={17} className="text-[#1e3a5f] print:hidden" /> Work History
                  </h3>
                  {!user.workExperience || user.workExperience.length === 0 ? (
                    <p className="text-xs text-gray-400 italic pl-4">No work experience listed.</p>
                  ) : (
                    <div className="space-y-4 pl-4 print:pl-0">
                      {user.workExperience.map((exp, idx) => (
                        <div key={idx} className="flex gap-3.5 items-start p-4 bg-gray-50 rounded-2xl border border-gray-100 print:bg-white print:border-none print:p-0 print:rounded-none">
                          <Building size={18} className="text-gray-400 mt-1 shrink-0 print:hidden" />
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start gap-2">
                              <h4 className="text-sm font-bold text-gray-900 truncate print:text-xs">{exp.position}</h4>
                              <span className="text-[10px] bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full font-medium shrink-0 flex items-center gap-1 print:bg-white print:text-gray-500">
                                <Calendar size={10} className="print:hidden" /> {exp.startYear} - {exp.endYear || "Present"}
                              </span>
                            </div>
                            <p className="text-xs text-[#1e3a5f] font-semibold mt-0.5">{exp.company}</p>
                            {exp.description && (
                              <p className="text-xs text-gray-400 mt-2 leading-relaxed whitespace-pre-wrap print:text-gray-600">
                                {exp.description}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Education */}
                <div>
                  <h3 className="text-base font-bold text-gray-900 mb-4 border-l-4 border-[#1e3a5f] pl-3 leading-none flex items-center gap-1.5 print:text-sm print:border-gray-800 print:mb-2">
                    <GraduationCap size={18} className="text-[#1e3a5f] print:hidden" /> Education
                  </h3>
                  {!user.education || user.education.length === 0 ? (
                    <p className="text-xs text-gray-400 italic pl-4">No education information listed.</p>
                  ) : (
                    <div className="space-y-4 pl-4 print:pl-0">
                      {user.education.map((edu, idx) => (
                        <div key={idx} className="flex gap-3.5 items-start p-4 bg-gray-50 rounded-2xl border border-gray-100 print:bg-white print:border-none print:p-0 print:rounded-none">
                          <GraduationCap size={18} className="text-gray-400 mt-1 shrink-0 print:hidden" />
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start gap-2">
                              <h4 className="text-sm font-bold text-gray-900 truncate print:text-xs">{edu.degree}</h4>
                              <span className="text-[10px] bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full font-medium shrink-0 flex items-center gap-1 print:bg-white print:text-gray-500">
                                <Calendar size={10} className="print:hidden" /> {edu.startYear} - {edu.endYear}
                              </span>
                            </div>
                            <p className="text-xs text-[#1e3a5f] font-semibold mt-0.5">{edu.school}</p>
                            {edu.fieldOfStudy && (
                              <p className="text-xs text-gray-400 mt-1">Field of Study: {edu.fieldOfStudy}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: Sidebar Metrics, Skills, Achievements */}
              <div className="space-y-6 border-t lg:border-t-0 lg:border-l border-gray-100 pt-6 lg:pt-0 lg:pl-6 print:border-none print:pl-0 print:pt-0">
                {/* Visual Stats Row */}
                <div className="grid grid-cols-2 gap-4 print:grid-cols-2">
                  <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 text-center sm:text-left print:bg-white print:border-none print:p-0">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Hourly Rate</span>
                    <span className="text-xl font-black text-[#1e3a5f] mt-1 block print:text-xs">
                      {user.hourlyRate ? `₹${user.hourlyRate}/hr` : "N/A"}
                    </span>
                  </div>
                  <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 text-center sm:text-left print:bg-white print:border-none print:p-0">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Experience</span>
                    <span className="text-xl font-black text-[#1e3a5f] mt-1 block print:text-xs">
                      {user.yearsOfExperience ? `${user.yearsOfExperience} Years` : "N/A"}
                    </span>
                  </div>
                </div>

                {/* Skills badged pill list */}
                <div>
                  <h3 className="text-sm font-bold text-gray-900 mb-3 border-l-4 border-[#1e3a5f] pl-2.5 leading-none print:border-gray-800 print:text-xs">
                    Technical Skills
                  </h3>
                  {!user.skills || user.skills.length === 0 ? (
                    <p className="text-xs text-gray-400 italic">No skills listed.</p>
                  ) : (
                    <div className="flex flex-wrap gap-1.5">
                      {user.skills.map((s) => (
                        <Badge key={s} variant="outline" className="px-2.5 py-1 text-xs font-semibold bg-[#edf2f7] text-[#1e3a5f] border-gray-200 print:bg-white print:text-black">
                          {s}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                {/* Achievements List */}
                <div>
                  <h3 className="text-sm font-bold text-gray-900 mb-3 border-l-4 border-[#1e3a5f] pl-2.5 leading-none flex items-center gap-1.5 print:border-gray-800 print:text-xs">
                    <Award size={15} className="text-[#1e3a5f] print:hidden" /> Achievements
                  </h3>
                  {!user.achievements || user.achievements.length === 0 ? (
                    <p className="text-xs text-gray-400 italic">No achievements added.</p>
                  ) : (
                    <ul className="space-y-2">
                      {user.achievements.map((ach, idx) => (
                        <li key={idx} className="flex gap-2 items-start text-xs text-gray-500">
                          <span className="text-amber-500 font-bold flex-shrink-0">•</span>
                          <span className="leading-normal print:text-xs print:text-gray-600">{ach}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* Social Links List */}
                <div className="print:hidden">
                  <h3 className="text-sm font-bold text-gray-900 mb-3 border-l-4 border-[#1e3a5f] pl-2.5 leading-none">
                    Social Links
                  </h3>
                  <div className="space-y-2">
                    {user.socialLinks?.website && (
                      <a href={user.socialLinks.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2.5 text-xs text-gray-500 hover:text-[#1e3a5f] transition-colors">
                        <Globe size={15} className="text-gray-400" />
                        <span className="truncate flex-1">{user.socialLinks.website}</span>
                      </a>
                    )}
                    {user.socialLinks?.linkedin && (
                      <a href={user.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2.5 text-xs text-gray-500 hover:text-[#1e3a5f] transition-colors">
                        <Linkedin size={15} className="text-gray-400" />
                        <span className="truncate flex-1">{user.socialLinks.linkedin}</span>
                      </a>
                    )}
                    {user.socialLinks?.github && (
                      <a href={user.socialLinks.github} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2.5 text-xs text-gray-500 hover:text-[#1e3a5f] transition-colors">
                        <Github size={15} className="text-gray-400" />
                        <span className="truncate flex-1">{user.socialLinks.github}</span>
                      </a>
                    )}
                    {user.socialLinks?.twitter && (
                      <a href={user.socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2.5 text-xs text-gray-500 hover:text-[#1e3a5f] transition-colors">
                        <Twitter size={15} className="text-gray-400" />
                        <span className="truncate flex-1">{user.socialLinks.twitter}</span>
                      </a>
                    )}
                    {(!user.socialLinks || (!user.socialLinks.website && !user.socialLinks.linkedin && !user.socialLinks.github && !user.socialLinks.twitter)) && (
                      <p className="text-xs text-gray-400 italic">No social profiles configured.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── High-Fidelity Printable Resume Layout (ONLY Visible on Print/Print-Preview) ── */}
      <div id="printable-resume-container" className="hidden print:block bg-white text-black p-10 font-serif leading-relaxed max-w-[21cm] mx-auto">
        <style jsx global>{`
          @media print {
            body * {
              visibility: hidden;
            }
            #printable-resume-container, #printable-resume-container * {
              visibility: visible;
            }
            #printable-resume-container {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
              padding: 0;
              margin: 0;
            }
            @page {
              size: A4 portrait;
              margin: 1.5cm 2cm;
            }
          }
        `}</style>

        <div className="space-y-5 text-xs text-gray-800">
          {/* Main header block */}
          <div className="text-center border-b-2 border-gray-800 pb-4">
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">{user.name}</h1>
            <p className="text-sm font-semibold tracking-wide text-gray-700 uppercase mt-0.5">{user.title || "Developer"}</p>
            <div className="flex flex-wrap justify-center gap-x-5 gap-y-1 text-[11px] text-gray-500 mt-2 font-medium">
              {user.location && <span>📍 {user.location}</span>}
              <span>✉️ {user.email}</span>
              {user.socialLinks?.website && <span>🌐 {user.socialLinks.website}</span>}
              {user.socialLinks?.linkedin && <span>💼 {user.socialLinks.linkedin}</span>}
              {user.socialLinks?.github && <span>💻 {user.socialLinks.github}</span>}
            </div>
          </div>

          {/* Bio block */}
          {user.bio && (
            <div className="space-y-1">
              <h2 className="text-[11px] font-bold text-gray-900 uppercase tracking-widest border-b border-gray-300 pb-0.5">Professional Summary</h2>
              <p className="text-xs text-gray-700 leading-relaxed whitespace-pre-wrap">{user.bio}</p>
            </div>
          )}

          {/* Experience block */}
          {user.workExperience && user.workExperience.length > 0 && (
            <div className="space-y-2">
              <h2 className="text-[11px] font-bold text-gray-900 uppercase tracking-widest border-b border-gray-300 pb-0.5">Work History</h2>
              <div className="space-y-3.5">
                {user.workExperience.map((exp, idx) => (
                  <div key={idx} className="space-y-0.5">
                    <div className="flex justify-between items-baseline font-bold text-gray-900">
                      <span>{exp.position} — <span className="font-semibold text-gray-700">{exp.company}</span></span>
                      <span className="font-medium text-gray-500 text-[10px]">{exp.startYear} - {exp.endYear || "Present"}</span>
                    </div>
                    {exp.description && (
                      <p className="text-xs text-gray-600 leading-relaxed whitespace-pre-wrap pl-2.5 border-l border-gray-200">
                        {exp.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Education block */}
          {user.education && user.education.length > 0 && (
            <div className="space-y-2">
              <h2 className="text-[11px] font-bold text-gray-900 uppercase tracking-widest border-b border-gray-300 pb-0.5">Education</h2>
              <div className="space-y-2">
                {user.education.map((edu, idx) => (
                  <div key={idx} className="flex justify-between items-baseline text-gray-900">
                    <div>
                      <span className="font-bold">{edu.degree}</span> {edu.fieldOfStudy ? `in ${edu.fieldOfStudy}` : ""}
                      <p className="text-[10px] text-gray-500 font-medium mt-0.5">{edu.school}</p>
                    </div>
                    <span className="text-[10px] font-semibold text-gray-500">{edu.startYear} - {edu.endYear}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Skills block */}
          {user.skills && user.skills.length > 0 && (
            <div className="space-y-1">
              <h2 className="text-[11px] font-bold text-gray-900 uppercase tracking-widest border-b border-gray-300 pb-0.5">Technical & Professional Skills</h2>
              <p className="text-xs text-gray-700 leading-relaxed font-semibold">
                {user.skills.join("  •  ")}
              </p>
            </div>
          )}

          {/* Achievements block */}
          {user.achievements && user.achievements.length > 0 && (
            <div className="space-y-1">
              <h2 className="text-[11px] font-bold text-gray-900 uppercase tracking-widest border-b border-gray-300 pb-0.5">Key Achievements</h2>
              <ul className="list-disc pl-4 space-y-1 text-xs text-gray-700">
                {user.achievements.map((ach, idx) => (
                  <li key={idx} className="leading-relaxed">
                    {ach}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
