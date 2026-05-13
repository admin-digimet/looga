import { TopNav } from '@/components/layout/TopNav'
import { UsersTable } from './UsersTable'

export default function UsersPage() {
  return (
    <div className="flex flex-col h-full">
      <TopNav title="Utilisateurs" />
      <div className="flex-1 p-6 flex flex-col gap-4">
        <UsersTable />
      </div>
    </div>
  )
}
