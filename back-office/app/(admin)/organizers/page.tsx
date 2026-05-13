import { TopNav } from '@/components/layout/TopNav'
import { OrganizersTable } from './OrganizersTable'

export default function OrganizersPage() {
  return (
    <div className="flex flex-col h-full">
      <TopNav title="Organisateurs" />
      <div className="flex-1 p-6 flex flex-col gap-4">
        <OrganizersTable />
      </div>
    </div>
  )
}
