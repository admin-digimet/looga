import { TopNav } from '@/components/layout/TopNav'
import { SupportTable } from './SupportTable'

export default function SupportPage() {
  return (
    <div className="flex flex-col h-full">
      <TopNav title="Messages de contact" />
      <div className="flex-1 p-6 flex flex-col gap-4">
        <SupportTable />
      </div>
    </div>
  )
}
