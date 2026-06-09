'use client'

interface Props {
  page: number
  totalPages: number
  onPageChange: (p: number) => void
}

export default function Pagination({ page, totalPages, onPageChange }: Props) {
  if (totalPages <= 1) return null

  const pages = Array.from({ length: Math.min(totalPages, 10) }, (_, i) => {
    if (totalPages <= 10) return i + 1
    if (page <= 5) return i + 1
    if (page >= totalPages - 4) return totalPages - 9 + i
    return page - 4 + i
  })

  return (
    <div className="flex items-center justify-center gap-1 pt-2">
      <button
        className="btn btn-ghost btn-xs"
        disabled={page === 1}
        onClick={() => onPageChange(page - 1)}
      >
        ‹ Précédent
      </button>
      {pages[0] > 1 && <span className="px-1 text-base-content/40 text-xs">…</span>}
      {pages.map((p) => (
        <button
          key={p}
          className={`btn btn-xs ${p === page ? 'btn-primary' : 'btn-ghost'}`}
          onClick={() => onPageChange(p)}
        >
          {p}
        </button>
      ))}
      {pages[pages.length - 1] < totalPages && <span className="px-1 text-base-content/40 text-xs">…</span>}
      <button
        className="btn btn-ghost btn-xs"
        disabled={page === totalPages}
        onClick={() => onPageChange(page + 1)}
      >
        Suivant ›
      </button>
    </div>
  )
}
