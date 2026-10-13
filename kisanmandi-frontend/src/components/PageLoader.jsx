import { Loader2 } from 'lucide-react';

export default function PageLoader() {
  return (
    <div
      role="status"
      aria-label="Loading page"
      className="flex flex-col items-center justify-center min-h-[60vh] py-12 gap-3"
    >
      <Loader2 className="w-10 h-10 text-green-700 animate-spin" />
      <span className="text-sm font-medium text-gray-500">Loading...</span>
    </div>
  );
}
