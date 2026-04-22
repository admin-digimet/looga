import { SkeletonEventRow } from '@/components/dashboard/SkeletonCard'

export default function EventsLoading() {
  return (
    <div className="p-8 flex flex-col gap-6">
      <div className="flex items-center justify-between animate-pulse">
        <div className="h-8 w-40 bg-base-300 rounded" />
        <div className="h-10 w-36 bg-base-300 rounded-lg" />
      </div>
      <div className="card bg-base-200 border border-base-300">
        <div className="card-body p-0">
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  {['Événement', 'Date', 'Lieu', 'Statut', 'Prix', ''].map((h) => (
                    <th key={h}>
                      <div className="h-4 w-16 bg-base-300 rounded animate-pulse" />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i}>
                    <td><SkeletonEventRow /></td>
                    {[1, 2, 3, 4, 5].map((j) => (
                      <td key={j}>
                        <div className="h-4 w-20 bg-base-300 rounded animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
