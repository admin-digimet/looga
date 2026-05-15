import TopNav from '@/components/layout/TopNav'
import { PayoutsClient } from './PayoutsClient'

export default function PayoutsPage() {
  return (
    <div className="flex flex-col h-full">
      <TopNav
        title="Reversements"
        subtitle="Demande et suivi de tes virements"
      />
      <div className="flex-1 p-6 flex flex-col gap-6 overflow-y-auto">
        <PayoutsClient />
      </div>
    </div>
  )
}
