import { TopNav } from '@/components/layout/TopNav'
import { ContentList } from './ContentList'

export default function ContentPage() {
  return (
    <div className="flex flex-col h-full">
      <TopNav title="Contenu des pages" />
      <div className="flex-1 p-6 flex flex-col gap-4">
        <p className="text-sm text-base-content/60">
          Modifie les textes des pages publiques (à propos, carrières, sécurité, etc.).
          Tant qu&apos;une page n&apos;est pas configurée ici, c&apos;est le contenu par défaut
          du code qui s&apos;affiche côté webapp.
        </p>
        <ContentList />
      </div>
    </div>
  )
}
