import { SkeletonStatsCard, SkeletonEventRow } from '@/components/dashboard/SkeletonCard'

export default function DashboardLoading() {
  return (
    <div className="p-8 flex flex-col gap-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonStatsCard key={i} />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card bg-base-200 border border-base-300 lg:col-span-2 animate-pulse">
          <div className="card-body gap-3">
            <div className="h-5 w-48 bg-base-300 rounded" />
            <div className="h-48 bg-base-300 rounded-xl" />
          </div>
        </div>
        <div className="card bg-base-200 border border-base-300">
          <div className="card-body gap-3">
            <div className="h-5 w-36 bg-base-300 rounded animate-pulse" />
            <div className="flex flex-col">
              {Array.from({ length: 5 }).map((_, i) => (
                <SkeletonEventRow key={i} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
