import { TopNav } from '@/components/layout/TopNav'
import { getAdminOrganizers } from '@/lib/api/admin'
import { Building2, CheckCircle, XCircle } from 'lucide-react'

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
}

export default async function OrganizersPage() {
  const organizers = await getAdminOrganizers('').catch(() => [])

  return (
    <div className="flex flex-col h-full">
      <TopNav title="Organisateurs" />

      <div className="flex-1 p-6 flex flex-col gap-4">
        <div className="alert alert-info py-2 text-sm">
          <span>
            Données mockées — API <code className="font-mono text-xs">GET /admin/organizers</code> non encore disponible.
          </span>
        </div>

        <div className="flex items-center justify-between">
          <p className="text-sm text-base-content/60">{organizers.length} organisateur{organizers.length > 1 ? 's' : ''}</p>
        </div>

        <div className="card bg-base-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="table table-zebra text-sm">
              <thead>
                <tr className="text-base-content/60 text-xs uppercase">
                  <th>Organisation</th>
                  <th>Description</th>
                  <th>Statut</th>
                  <th>Membre depuis</th>
                </tr>
              </thead>
              <tbody>
                {organizers.length === 0 && (
                  <tr>
                    <td colSpan={4} className="text-center py-10 text-base-content/40">
                      Aucun organisateur trouvé
                    </td>
                  </tr>
                )}
                {organizers.map((org) => (
                  <tr key={org.id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="bg-secondary/10 text-secondary p-2 rounded-lg">
                          <Building2 size={16} />
                        </div>
                        <div>
                          <p className="font-medium">{org.name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="text-base-content/60 max-w-[200px]">
                      <p className="truncate">{org.description ?? '—'}</p>
                    </td>
                    <td>
                      {org.is_suspended ? (
                        <span className="flex items-center gap-1 text-error text-xs">
                          <XCircle size={14} /> Suspendu
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-success text-xs">
                          <CheckCircle size={14} /> Actif
                        </span>
                      )}
                    </td>
                    <td className="text-base-content/50">{formatDate(org.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
