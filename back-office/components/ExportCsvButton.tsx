'use client'

import { useState } from 'react'
import { Download } from 'lucide-react'
import { toCSV, downloadCSV, fileDateSuffix, type CsvColumn } from '@/lib/csv'

interface ExportCsvButtonProps<T> {
  /** Nom de base du fichier (la date + .csv sont ajoutés). */
  filename: string
  /** Colonnes du CSV. */
  columns: CsvColumn<T>[]
  /**
   * Récupère TOUTES les lignes à exporter (pas seulement la page affichée).
   * Pour les tables paginées, cette fonction boucle sur toutes les pages.
   */
  getRows: () => Promise<T[]>
  disabled?: boolean
  label?: string
}

export function ExportCsvButton<T>({
  filename,
  columns,
  getRows,
  disabled,
  label = 'Exporter CSV',
}: ExportCsvButtonProps<T>) {
  const [loading, setLoading] = useState(false)

  async function handleExport() {
    setLoading(true)
    try {
      const rows = await getRows()
      if (rows.length === 0) {
        alert('Aucune donnée à exporter.')
        return
      }
      const csv = toCSV(rows, columns)
      downloadCSV(`${filename}-${fileDateSuffix()}`, csv)
    } catch (e) {
      alert(`Export impossible : ${(e as Error).message ?? 'erreur'}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      type="button"
      className="btn btn-sm btn-outline gap-2 whitespace-nowrap"
      onClick={handleExport}
      disabled={loading || disabled}
      title="Télécharger les données au format CSV (Excel)"
    >
      {loading ? (
        <span className="loading loading-spinner loading-xs" />
      ) : (
        <Download size={15} />
      )}
      {label}
    </button>
  )
}

export default ExportCsvButton
