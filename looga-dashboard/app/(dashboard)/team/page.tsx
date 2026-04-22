import TopNav from '@/components/layout/TopNav'
import TeamClient from './TeamClient'

export default function TeamPage() {
  return (
    <>
      <TopNav title="Mon équipe" subtitle="Comptes scanners pour l'app looga-scan" />
      <TeamClient />
    </>
  )
}
