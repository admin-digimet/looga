import { TopNav } from '@/components/layout/TopNav'
import { TeamTable } from './TeamTable'

export default function TeamPage() {
  return (
    <div className="flex flex-col h-full">
      <TopNav title="Équipe" />
      <div className="flex-1 p-6 flex flex-col gap-4">
        <TeamTable />
      </div>
    </div>
  )
}
