// Simple pulse-animation skeleton placeholder for loading states
export function SkeletonLine({ className = '' }) {
  return <div className={`bg-gray-200 rounded animate-pulse ${className}`} />;
}

// Card-shaped skeleton
export function SkeletonCard() {
  return (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
      <div className="aspect-square bg-gray-200 animate-pulse" />
      <div className="p-3 space-y-2">
        <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
        <div className="h-5 bg-gray-200 rounded animate-pulse w-1/2" />
        <div className="h-3 bg-gray-200 rounded animate-pulse w-2/3" />
      </div>
    </div>
  );
}

// Row skeleton for lists
export function SkeletonRow() {
  return (
    <div className="bg-white rounded-lg border p-4 flex items-center gap-4 animate-pulse">
      <div className="w-16 h-16 bg-gray-200 rounded-lg shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-gray-200 rounded w-1/2" />
        <div className="h-3 bg-gray-200 rounded w-1/3" />
      </div>
      <div className="h-5 bg-gray-200 rounded w-16" />
    </div>
  );
}
