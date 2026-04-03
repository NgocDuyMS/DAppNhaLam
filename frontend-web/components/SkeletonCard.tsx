'use client';

export default function SkeletonCard() {
  return (
    <div className="p-6 bg-white border border-gray-100 rounded-2xl shadow-sm animate-pulse flex flex-col h-full">
      {/* Header Skeleton */}
      <div className="flex items-start justify-between mb-4">
        <div className="w-2/3 h-6 bg-gray-200 rounded-md"></div>
        <div className="w-20 h-6 bg-gray-200 rounded-full"></div>
      </div>
      
      {/* Body Skeleton (Mô tả) */}
      <div className="space-y-2 mb-6 grow">
        <div className="w-full h-4 bg-gray-100 rounded"></div>
        <div className="w-5/6 h-4 bg-gray-100 rounded"></div>
        <div className="w-4/6 h-4 bg-gray-100 rounded"></div>
      </div>

      {/* Footer Skeleton */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-50 mt-auto">
        <div className="w-24 h-4 bg-gray-200 rounded"></div>
        <div className="w-20 h-4 bg-blue-100 rounded"></div>
      </div>
    </div>
  );
}