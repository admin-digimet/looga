import { TopNav } from '@/components/layout/TopNav'
import { JournalTable } from './JournalTable'

export default function JournalPage() {
  return (
    <>
      <TopNav title="Journal d'activité" />
      <div className="p-6 flex flex-col gap-4">
        <JournalTable />
      </div>
    </>
  )
}
