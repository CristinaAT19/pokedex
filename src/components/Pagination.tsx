interface Props {
  page: number
  totalPages: number
  onChange: (page: number) => void
}

// First, last and the neighbours of the current page, with gaps in between.
function pageItems(page: number, totalPages: number): (number | null)[] {
  const pages = [...new Set([1, page - 1, page, page + 1, totalPages])]
    .filter((p) => p >= 1 && p <= totalPages)
    .sort((a, b) => a - b)

  const items: (number | null)[] = []
  pages.forEach((p, i) => {
    if (i > 0 && p - pages[i - 1] > 1) items.push(null)
    items.push(p)
  })
  return items
}

const stepButton =
  'flex h-12 cursor-pointer items-center gap-2 rounded-xl border border-line-strong bg-white px-3.5 text-[15px] font-semibold hover:border-ink disabled:cursor-default disabled:border-line disabled:bg-ground disabled:text-muted sm:px-4.5'

function Chevron({ direction }: { direction: 'left' | 'right' }) {
  return (
    <svg
      aria-hidden="true"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={direction === 'left' ? 'M15 5l-7 7 7 7' : 'M9 5l7 7-7 7'} />
    </svg>
  )
}

export default function Pagination({ page, totalPages, onChange }: Props) {
  if (totalPages <= 1) return null

  return (
    <nav aria-label="Paginación" className="mt-2 flex items-center justify-center gap-2">
      <button
        type="button"
        disabled={page <= 1}
        onClick={() => onChange(page - 1)}
        aria-label="Página anterior"
        className={stepButton}
      >
        <Chevron direction="left" />
        <span className="hidden sm:inline">Anterior</span>
      </button>

      <span className="flex h-12 grow items-center justify-center rounded-xl border border-line bg-white font-mono text-sm font-semibold sm:hidden">
        Página {page} de {totalPages}
      </span>

      <div className="hidden items-center gap-2 sm:flex">
        {pageItems(page, totalPages).map((item, i) =>
          item === null ? (
            <span key={`gap-${i}`} aria-hidden="true" className="w-8 text-center font-mono text-muted">
              …
            </span>
          ) : (
            <button
              key={item}
              type="button"
              onClick={() => onChange(item)}
              aria-current={item === page ? 'page' : undefined}
              aria-label={`Página ${item}`}
              className={`h-12 min-w-12 cursor-pointer rounded-xl border px-2 font-mono text-[15px] font-semibold ${
                item === page
                  ? 'border-ink bg-ink text-white'
                  : 'border-line bg-white hover:border-ink'
              }`}
            >
              {item}
            </button>
          ),
        )}
      </div>

      <button
        type="button"
        disabled={page >= totalPages}
        onClick={() => onChange(page + 1)}
        aria-label="Página siguiente"
        className={stepButton}
      >
        <span className="hidden sm:inline">Siguiente</span>
        <Chevron direction="right" />
      </button>
    </nav>
  )
}
