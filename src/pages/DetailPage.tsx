import { skipToken } from '@reduxjs/toolkit/query'
import type { ReactNode } from 'react'
import { useEffect } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import StateMessage, { StateButton } from '../components/StateMessage.tsx'
import TypeBadge from '../components/TypeBadge.tsx'
import {
  MAX_BASE_STAT,
  STAT_LABELS,
  artworkUrl,
  formatHeight,
  formatName,
  formatNumber,
  formatWeight,
  typeInfo,
} from '../lib/pokemon.ts'
import type { EvolutionNode, Pokemon } from '../services/pokeApi.ts'
import {
  useGetAbilityNameQuery,
  useGetEvolutionChainQuery,
  useGetPokemonIndexQuery,
  useGetPokemonQuery,
  useGetSpeciesQuery,
} from '../services/pokeApi.ts'

export default function DetailPage() {
  const { name = '' } = useParams()
  const location = useLocation()
  // Cards pass the list's query string along so "Volver" restores search, filter and page.
  const from = (location.state as { from?: string } | null)?.from ?? ''

  const {
    currentData: pokemon,
    isError,
    error,
    refetch,
  } = useGetPokemonQuery(name.toLowerCase())
  const { currentData: species } = useGetSpeciesQuery(pokemon?.speciesId ?? skipToken)
  const { currentData: stages } = useGetEvolutionChainQuery(
    species?.evolutionChainId ?? skipToken,
  )

  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [name])

  const backLink = (
    <Link
      to={`/${from}`}
      className="flex min-h-11 items-center gap-2 self-start rounded-full border border-line-strong bg-white pr-4 pl-3 text-[15px] font-semibold hover:border-ink"
    >
      <Chevron direction="left" />
      Volver al listado
    </Link>
  )

  if (isError) {
    const notFound = 'status' in error && error.status === 404
    return (
      <div className="flex flex-col gap-7">
        {backLink}
        {notFound ? (
          <StateMessage title="Pokémon no encontrado">
            No existe ningún Pokémon llamado «{name}». Vuelve al listado y prueba con otro.
          </StateMessage>
        ) : (
          <StateMessage
            title="No se pudo cargar"
            action={<StateButton onClick={() => refetch()}>Reintentar</StateButton>}
          >
            Hubo un problema al consultar PokéAPI. Revisa tu conexión e inténtalo de nuevo.
          </StateMessage>
        )}
      </div>
    )
  }

  if (!pokemon) {
    return (
      <div className="flex flex-col gap-7">
        {backLink}
        <DetailSkeleton />
      </div>
    )
  }

  const mainType = typeInfo(pokemon.types[0])
  const displayName = formatName(pokemon.name)
  const statTotal = pokemon.stats.reduce((sum, stat) => sum + stat.value, 0)

  return (
    <div className="flex flex-col gap-7">
      {backLink}

      <section className="flex flex-wrap items-stretch gap-6 sm:gap-8">
        <div
          className="flex min-h-60 min-w-0 flex-[1_1_380px] items-center justify-center rounded-3xl p-6 sm:min-h-[420px]"
          style={{ background: mainType.tint }}
        >
          <img
            src={pokemon.image ?? artworkUrl(pokemon.id)}
            alt={displayName}
            className="aspect-square w-full max-w-54 object-contain sm:max-w-95"
          />
        </div>

        <div className="flex min-w-0 flex-[1_1_420px] flex-col justify-center gap-4">
          <span className="font-mono font-semibold text-muted">{formatNumber(pokemon.id)}</span>
          <h1 className="font-display text-[40px] leading-none font-extrabold tracking-tight sm:text-[68px]">
            {displayName}
          </h1>
          {species?.genus && <p className="text-[17px] font-semibold text-muted">{species.genus}</p>}
          <div className="flex flex-wrap gap-2">
            {pokemon.types.map((type) => (
              <TypeBadge key={type} type={type} size="md" />
            ))}
          </div>
          {species?.description && (
            <p className="max-w-[520px] text-lg leading-relaxed">{species.description}</p>
          )}

          <dl className="mt-2 grid grid-cols-2 gap-3">
            <Fact label="Altura">{formatHeight(pokemon.height)}</Fact>
            <Fact label="Peso">{formatWeight(pokemon.weight)}</Fact>
            <Fact label="Experiencia base">{pokemon.baseExperience ?? '—'}</Fact>
            <Fact label="Habilidades" plain>
              {pokemon.abilities.map((ability, i) => (
                <span key={ability.name}>
                  {i > 0 && ' · '}
                  <AbilityName name={ability.name} />
                  {ability.hidden && <span className="font-medium text-muted"> (oculta)</span>}
                </span>
              ))}
            </Fact>
          </dl>
        </div>
      </section>

      <section className="flex flex-wrap items-stretch gap-5">
        <Panel title="Estadísticas base">
          <dl className="flex flex-col gap-3">
            {pokemon.stats.map((stat) => (
              <div key={stat.name} className="flex items-center gap-3">
                <dt className="w-26 shrink-0 text-[15px] font-semibold text-muted">
                  {STAT_LABELS[stat.name] ?? formatName(stat.name)}
                </dt>
                <dd className="w-9 shrink-0 text-right font-mono text-[15px] font-semibold">
                  {stat.value}
                </dd>
                <div aria-hidden="true" className="h-2.5 grow overflow-hidden rounded-full bg-track">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${Math.min(100, (stat.value / MAX_BASE_STAT) * 100)}%`,
                      background: mainType.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </dl>
          <div className="flex items-center justify-between border-t border-line pt-3.5">
            <span className="text-[15px] font-bold">Total</span>
            <span className="font-mono text-lg font-semibold">{statTotal}</span>
          </div>
        </Panel>

        <Panel title="Línea evolutiva">
          {stages ? (
            <Evolution stages={stages} currentId={pokemon.speciesId} tint={mainType.tint} />
          ) : (
            <div className="h-36 grow animate-pulse rounded-2xl bg-track" />
          )}
        </Panel>
      </section>

      <Neighbours pokemon={pokemon} />
    </div>
  )
}

function Fact({ label, plain, children }: { label: string; plain?: boolean; children: ReactNode }) {
  return (
    <div className="rounded-[14px] border border-line bg-white px-4 py-3.5">
      <dt className="text-[13px] font-semibold text-muted">{label}</dt>
      <dd
        className={`mt-0.5 font-semibold ${plain ? 'leading-snug' : 'font-mono text-lg sm:text-xl'}`}
      >
        {children}
      </dd>
    </div>
  )
}

function Panel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="flex min-w-0 flex-[1_1_420px] flex-col gap-4.5 rounded-[20px] border border-line bg-white p-4 sm:p-6">
      <h2 className="font-display text-2xl font-bold tracking-tight">{title}</h2>
      {children}
    </div>
  )
}

// The pokemon endpoint only has English slugs; the Spanish name lives on the ability itself.
function AbilityName({ name }: { name: string }) {
  const { data } = useGetAbilityNameQuery(name)
  return <>{data ?? formatName(name)}</>
}

interface EvolutionProps {
  stages: EvolutionNode[][]
  currentId: number
  tint: string
}

function Evolution({ stages, currentId, tint }: EvolutionProps) {
  const location = useLocation()

  if (stages.length === 1) {
    return <p className="text-muted">Este Pokémon no evoluciona.</p>
  }

  return (
    <div className="flex grow flex-wrap items-center justify-center gap-1 sm:gap-2">
      {stages.map((stage, i) => (
        <div key={i} className="contents">
          {i > 0 && (
            <span className="shrink-0 text-muted">
              <Chevron direction="right" />
            </span>
          )}
          <div className="flex min-w-0 flex-wrap justify-center gap-2 max-sm:flex-1 sm:max-w-70">
            {stage.map((node) => (
              <Link
                key={node.id}
                to={`/pokemon/${node.id}`}
                state={location.state}
                aria-current={node.id === currentId ? 'page' : undefined}
                className={`flex w-full max-w-31 flex-col items-center gap-1 rounded-2xl border px-1 py-2.5 hover:border-ink sm:w-31 ${
                  node.id === currentId ? 'border-ink ring-1 ring-ink' : 'border-line'
                }`}
              >
                <span
                  className="flex size-16 items-center justify-center rounded-full sm:size-22"
                  style={{ background: tint }}
                >
                  <img
                    src={artworkUrl(node.id)}
                    alt=""
                    loading="lazy"
                    className="size-13 object-contain sm:size-18"
                  />
                </span>
                <span className="max-w-full truncate text-[13px] font-bold sm:text-[15px]">
                  {formatName(node.name)}
                </span>
                <span className="font-mono text-[11px] font-semibold text-muted sm:text-xs">
                  {node.trigger}
                </span>
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

function Neighbours({ pokemon }: { pokemon: Pokemon }) {
  const location = useLocation()
  const { data: index } = useGetPokemonIndexQuery()
  if (!index) return null

  const position = index.findIndex((entry) => entry.name === pokemon.name)
  if (position === -1) return null
  const previous = index[position - 1]
  const next = index[position + 1]

  const card =
    'flex min-h-18 min-w-0 flex-[1_1_0] items-center gap-3.5 rounded-2xl border border-line bg-white px-4 hover:border-ink sm:px-5'
  const caption = 'hidden font-mono text-xs font-semibold text-muted sm:block'

  return (
    <nav aria-label="Pokémon anterior y siguiente" className="flex gap-3">
      {previous ? (
        <Link to={`/pokemon/${previous.name}`} state={location.state} className={card}>
          <Chevron direction="left" />
          <span className="flex min-w-0 flex-col">
            <span className={caption}>Anterior · {formatNumber(previous.id)}</span>
            <span className="truncate text-[15px] font-bold sm:text-[17px]">
              {formatName(previous.name)}
            </span>
          </span>
        </Link>
      ) : (
        <span className="flex-[1_1_0]" />
      )}
      {next ? (
        <Link
          to={`/pokemon/${next.name}`}
          state={location.state}
          className={`${card} justify-end text-right`}
        >
          <span className="flex min-w-0 flex-col">
            <span className={caption}>Siguiente · {formatNumber(next.id)}</span>
            <span className="truncate text-[15px] font-bold sm:text-[17px]">
              {formatName(next.name)}
            </span>
          </span>
          <Chevron direction="right" />
        </Link>
      ) : (
        <span className="flex-[1_1_0]" />
      )}
    </nav>
  )
}

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
      className="shrink-0"
    >
      <path d={direction === 'left' ? 'M15 5l-7 7 7 7' : 'M9 5l7 7-7 7'} />
    </svg>
  )
}

function DetailSkeleton() {
  return (
    <div className="flex animate-pulse flex-wrap gap-6 sm:gap-8" aria-busy="true">
      <div className="min-h-60 flex-[1_1_380px] rounded-3xl bg-track sm:min-h-[420px]" />
      <div className="flex flex-[1_1_420px] flex-col justify-center gap-4">
        <div className="h-5 w-16 rounded bg-track" />
        <div className="h-14 w-64 max-w-full rounded bg-track" />
        <div className="h-8 w-40 rounded-full bg-track" />
        <div className="h-20 max-w-[520px] rounded bg-track" />
        <div className="grid grid-cols-2 gap-3">
          <div className="h-18 rounded-[14px] bg-track" />
          <div className="h-18 rounded-[14px] bg-track" />
        </div>
      </div>
    </div>
  )
}
