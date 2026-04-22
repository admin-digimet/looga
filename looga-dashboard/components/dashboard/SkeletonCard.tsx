export function SkeletonStatsCard() {
  return (
    <div className="card bg-base-200 border border-base-300 animate-pulse">
      <div className="card-body gap-3">
        <div className="flex items-center justify-between">
          <div className="h-4 w-28 bg-base-300 rounded" />
          <div className="h-8 w-8 bg-base-300 rounded-lg" />
        </div>
        <div className="h-8 w-20 bg-base-300 rounded" />
        <div className="h-3 w-24 bg-base-300 rounded" />
      </div>
    </div>
  )
}

export function SkeletonEventRow() {
  return (
    <div className="flex items-center justify-between py-3 px-4 rounded-xl animate-pulse">
      <div className="flex flex-col gap-2 min-w-0 flex-1">
        <div className="h-4 w-40 bg-base-300 rounded" />
        <div className="h-3 w-24 bg-base-300 rounded" />
      </div>
      <div className="h-5 w-16 bg-base-300 rounded-full ml-2" />
    </div>
  )
}

export function SkeletonScanRow() {
  return (
    <div className="flex items-center gap-3 py-3 px-4 rounded-xl animate-pulse">
      <div className="h-9 w-9 bg-base-300 rounded-full flex-shrink-0" />
      <div className="flex flex-col gap-2 flex-1">
        <div className="h-4 w-32 bg-base-300 rounded" />
        <div className="h-3 w-20 bg-base-300 rounded" />
      </div>
      <div className="h-5 w-12 bg-base-300 rounded-full" />
    </div>
  )
}
