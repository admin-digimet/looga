import { TopNav } from '@/components/layout/TopNav'
import { PayoutsTable } from './PayoutsTable'

export default function PayoutsPage() {
  return (
    <div className="flex flex-col h-full">
      <TopNav title="Demandes de payout" />
      <div className="flex-1 p-6 flex flex-col gap-4">
        <PayoutsTable />
      </div>
    </div>
  )
}
