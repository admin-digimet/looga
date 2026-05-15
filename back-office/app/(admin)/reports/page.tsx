import { TopNav } from '@/components/layout/TopNav'
import { ReportsTable } from './ReportsTable'

export default function ReportsPage() {
  return (
    <div className="flex flex-col h-full">
      <TopNav title="Signalements" />
      <div className="flex-1 p-6 flex flex-col gap-4">
        <ReportsTable />
      </div>
    </div>
  )
}
