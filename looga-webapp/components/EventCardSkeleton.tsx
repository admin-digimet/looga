export function EventCardSkeleton() {
  return (
    <div className="flex flex-col h-full animate-pulse">
      <div className="aspect-[16/10] rounded-xl bg-gray-200 mb-3" />
      <div className="h-3 bg-gray-200 rounded w-1/4 mb-2" />
      <div className="h-4 bg-gray-200 rounded w-full mb-1" />
      <div className="h-4 bg-gray-200 rounded w-3/4 mb-1" />
      <div className="h-3 bg-gray-200 rounded w-1/2 mb-1" />
      <div className="h-3 bg-gray-200 rounded w-2/3 mb-1" />
      <div className="h-3 bg-gray-200 rounded w-1/3 mt-auto" />
    </div>
  );
}
