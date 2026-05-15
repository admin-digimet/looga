import { TopNav } from '@/components/layout/TopNav'
import { ContentEditor } from './ContentEditor'

export default async function ContentEditPage({
  params,
}: {
  params: Promise<{ key: string }>
}) {
  const { key } = await params
  return (
    <div className="flex flex-col h-full">
      <TopNav title="Éditer la page" />
      <div className="flex-1 p-6 flex flex-col gap-4">
        <ContentEditor pageKey={key} />
      </div>
    </div>
  )
}
