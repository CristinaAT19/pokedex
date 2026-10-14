import type { FormEvent } from 'react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import Pagination from '../components/Pagination.tsx'
import PokemonCard, { PokemonCardSkeleton } from '../components/PokemonCard.tsx'
import StateMessage, { StateButton } from '../components/StateMessage.tsx'
import { PAGE_SIZE, TYPES } from '../lib/pokemon.ts'
import type { PokemonRef } from '../services/pokeApi.ts'
import {
  useGetPokemonByTypeQuery,
  useGetPokemonIndexQuery,
  useGetPokemonPageQuery,
} from '../services/pokeApi.ts'

const SEARCH_DEBOUNCE_MS = 350

function matches(pokemon: PokemonRef, query: string): boolean {
  const term = query.toLowerCase().replace(/^#/, '').replace(/\s+/g, '-')
  if (/^\d+$/.test(term)) return pokemon.id === Number(term)
  return pokemon.name.includes(term)
}

export default function ListPage() {
  const [params, setParams] = useSearchParams()
  const query = params.get('q') ?? ''
  const typeParam = params.get('type') ?? ''
  const type = typeParam in TYPES ? typeParam : ''
  const requestedPage = Math.max(1, Math.floor(Number(params.get('page'))) || 1)
  const isFiltered = query !== '' || type !== ''

  const [text, setText] = useState(query)
  const [syncedQuery, setSyncedQuery] = useState(query)
  if (query !== syncedQuery) {
    // The URL changed elsewhere (back button, "limpiar"): bring the input along.
    setSyncedQuery(query)
    if (text.trim() !== query) setText(query)
  }

  const updateParams = useCallback(
    (changes: Record<string, string>, replace = false) => {
      setParams(
        (previous) => {
          const next = new URLSearchParams(previous)
          for (const [key, value] of Object.entries(changes)) {
            if (value) next.set(key, value)
            else next.delete(key)
          }
          return next
        },
        { replace },
      )
    },
    [setParams],
  )

  useEffect(() => {
    const term = text.trim()
    if (term === query) return
    const timer = setTimeout(() => updateParams({ q: term, page: '' }, true), SEARCH_DEBOUNCE_MS)
    return () => clearTimeout(timer)
  }, [text, query, updateParams])

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    updateParams({ q: text.trim(), page: '' })
  }

  // Unfiltered browsing pages on the server; search and type filters page on the client.
  const pageQuery = useGetPokemonPageQuery(
    { limit: PAGE_SIZE, offset: (requestedPage - 1) * PAGE_SIZE },
    { skip: isFiltered },
  )
  const indexQuery = useGetPokemonIndexQuery(undefined, { skip: !isFiltered || type !== '' })
  const typeQuery = useGetPokemonByTypeQuery(type, { skip: type === '' })
  const active = !isFiltered ? pageQuery : type ? typeQuery : indexQuery

  const filtered = useMemo(() => {
    const source = type ? typeQuery.currentData : indexQuery.currentData
    if (!isFiltered || !source) return undefined
    return query ? source.filter((pokemon) => matches(pokemon, query)) : source
  }, [isFiltered, type, query, typeQuery.currentData, indexQuery.currentData])

  const total = isFiltered ? filtered?.length : pageQuery.currentData?.count
  const totalPages = total === undefined ? 0 : Math.ceil(total / PAGE_SIZE)
  const page = totalPages > 0 ? Math.min(requestedPage, totalPages) : requestedPage
  const start = (page - 1) * PAGE_SIZE
  const items = isFiltered
    ? filtered?.slice(start, start + PAGE_SIZE)
    : pageQuery.currentData?.results

  function goToPage(next: number) {
    updateParams({ page: next > 1 ? String(next) : '' })
    window.scrollTo({ top: 0 })
  }

  let countLabel = ''
  if (total !== undefined && items && items.length > 0) {
    countLabel = isFiltered
      ? `${total} ${total === 1 ? 'resultado' : 'resultados'}`
      : `Mostrando ${start + 1}–${start + items.length} de ${total} Pokémon`
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-3">
        <h1 className="font-display text-4xl leading-[1.05] font-extrabold tracking-tight sm:text-[56px]">
          Encuentra tu Pokémon
        </h1>
        <p className="max-w-[560px] text-lg text-muted">
          Busca por nombre o número y abre la ficha para ver tipos, estadísticas y evoluciones.
        </p>
      </div>

      <div className="flex flex-col gap-5">
        <form onSubmit={handleSubmit} role="search" className="flex gap-2 sm:gap-3">
          <div className="relative min-w-0 flex-1">
            <label htmlFor="buscar" className="sr-only">
              Buscar Pokémon
            </label>
            <svg
              aria-hidden="true"
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              className="pointer-events-none absolute top-1/2 left-4.5 -translate-y-1/2 text-muted"
            >
              <circle cx="11" cy="11" r="7" />
              <path d="M20 20l-3.8-3.8" />
            </svg>
            <input
              id="buscar"
              type="search"
              value={text}
              onChange={(event) => setText(event.target.value)}
              placeholder="Buscar por nombre o número…"
              autoComplete="off"
              className="h-14 w-full rounded-[14px] border border-line-strong bg-white pr-5 pl-13 text-[17px] outline-none placeholder:text-muted focus:border-ink focus:ring-2 focus:ring-ink/15"
            />
          </div>
          <button
            type="submit"
            className="h-14 cursor-pointer rounded-[14px] bg-accent px-5 font-bold sm:px-7 text-white hover:brightness-90"
          >
            Buscar
          </button>
        </form>

        <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 sm:pb-0">
          <TypeChip label="Todos" active={type === ''} onClick={() => updateParams({ type: '', page: '' })} />
          {Object.entries(TYPES).map(([key, info]) => (
            <TypeChip
              key={key}
              label={info.label}
              color={info.color}
              active={type === key}
              onClick={() => updateParams({ type: type === key ? '' : key, page: '' })}
            />
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex min-h-6 flex-wrap items-center justify-between gap-2">
          <p className="text-[15px] text-muted" aria-live="polite">
            {countLabel}
          </p>
          <p className="font-mono text-[13px] font-medium text-muted">{PAGE_SIZE} por página</p>
        </div>

        {active.isError ? (
          <StateMessage
            title="No se pudo cargar"
            action={<StateButton onClick={() => active.refetch()}>Reintentar</StateButton>}
          >
            Hubo un problema al consultar PokéAPI. Revisa tu conexión e inténtalo de nuevo.
          </StateMessage>
        ) : !items ? (
          <div className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: PAGE_SIZE }, (_, i) => (
              <PokemonCardSkeleton key={i} />
            ))}
          </div>
        ) : items.length === 0 ? (
          <StateMessage
            title="Sin resultados"
            action={
              <StateButton
                onClick={() => {
                  setText('')
                  updateParams({ q: '', type: '', page: '' })
                }}
              >
                Limpiar búsqueda
              </StateButton>
            }
          >
            Ningún Pokémon coincide con tu búsqueda. Revisa el nombre o prueba con otro tipo.
          </StateMessage>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
            {items.map((pokemon) => (
              <PokemonCard key={pokemon.name} pokemon={pokemon} />
            ))}
          </div>
        )}
      </div>

      {!active.isError && items && items.length > 0 && (
        <Pagination page={page} totalPages={totalPages} onChange={goToPage} />
      )}
    </div>
  )
}

interface TypeChipProps {
  label: string
  color?: string
  active: boolean
  onClick: () => void
}

function TypeChip({ label, color, active, onClick }: TypeChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`flex min-h-11 shrink-0 cursor-pointer items-center gap-2 rounded-full border px-4 text-[15px] font-semibold ${
        active ? 'border-ink bg-ink text-white' : 'border-line-strong bg-white hover:border-ink'
      }`}
    >
      {color && (
        <span aria-hidden="true" className="size-2.5 rounded-full" style={{ background: color }} />
      )}
      {label}
    </button>
  )
}
