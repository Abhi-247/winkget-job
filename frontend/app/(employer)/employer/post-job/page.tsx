import { JobPostForm } from "@/components/employer/JobPostForm";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Post a Job" };

export default function PostJobPage() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <JobPostForm />
    </div>
  );
}
