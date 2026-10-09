import { PackageOpen } from 'lucide-react';

// Empty state display with icon, title, message, and optional action button
export default function EmptyState({ icon: Icon = PackageOpen, title, message, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="bg-gray-100 rounded-full p-4 mb-4">
        <Icon size={40} className="text-gray-400" />
      </div>
      <h3 className="text-lg font-semibold text-gray-700 mb-1">{title}</h3>
      {message && <p className="text-sm text-gray-500 mb-4 max-w-xs">{message}</p>}
      {action}
    </div>
  );
}
