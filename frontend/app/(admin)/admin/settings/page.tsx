import { Settings as SettingsIcon } from "lucide-react";

export default function AdminSettingsPage() {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-900">Admin Settings</h2>
      <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <SettingsIcon size={24} className="text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-700 mb-2">Platform Settings</h3>
        <p className="text-sm text-gray-400 max-w-sm mx-auto">
          Admin configuration panel coming soon.
        </p>
      </div>
    </div>
  );
}
