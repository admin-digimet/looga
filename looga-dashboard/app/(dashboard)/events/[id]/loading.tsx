import { SkeletonStatsCard } from '@/components/dashboard/SkeletonCard'

export default function EventDetailLoading() {
  return (
    <div className="p-8 flex flex-col gap-6">
      <div className="flex flex-col gap-2 animate-pulse">
        <div className="h-8 w-64 bg-base-300 rounded" />
        <div className="h-4 w-40 bg-base-300 rounded" />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonStatsCard key={i} />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card bg-base-200 border border-base-300 lg:col-span-2 animate-pulse">
          <div className="card-body gap-4">
            <div className="h-5 w-36 bg-base-300 rounded" />
            <div className="flex flex-col gap-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-4 bg-base-300 rounded w-full" />
              ))}
            </div>
          </div>
        </div>
        <div className="card bg-base-200 border border-base-300 animate-pulse">
          <div className="card-body gap-4">
            <div className="h-5 w-28 bg-base-300 rounded" />
            <div className="flex flex-col gap-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex gap-3 items-center">
                  <div className="h-9 w-9 bg-base-300 rounded-full" />
                  <div className="flex flex-col gap-1 flex-1">
                    <div className="h-3 w-28 bg-base-300 rounded" />
                    <div className="h-3 w-20 bg-base-300 rounded" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
