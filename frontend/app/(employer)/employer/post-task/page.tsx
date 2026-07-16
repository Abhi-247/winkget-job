import { TaskPostForm } from "@/components/employer/TaskPostForm";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Post a Task" };

export default function PostTaskPage() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <TaskPostForm />
    </div>
  );
}
