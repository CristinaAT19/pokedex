import { Link, useLocation } from 'react-router-dom'
import { artworkUrl, formatName, formatNumber, typeInfo } from '../lib/pokemon.ts'
import type { PokemonRef } from '../services/pokeApi.ts'
import { useGetPokemonQuery } from '../services/pokeApi.ts'
import TypeBadge from './TypeBadge.tsx'

export default function PokemonCard({ pokemon }: { pokemon: PokemonRef }) {
  const location = useLocation()
  // The list endpoint only returns names, so each card asks for its own types.
  const { data } = useGetPokemonQuery(pokemon.name)
  const name = formatName(pokemon.name)

  return (
    <Link
      to={`/pokemon/${pokemon.name}`}
      state={{ from: location.search }}
      className="group flex flex-col overflow-hidden rounded-[18px] border border-line bg-white transition-colors hover:border-ink focus-visible:border-ink"
    >
      <div
        className="flex h-33 items-center justify-center transition-colors sm:h-44"
        style={{ background: typeInfo(data?.types[0]).tint }}
      >
        <img
          src={data?.image ?? artworkUrl(pokemon.id)}
          alt={name}
          loading="lazy"
          className="size-28 object-contain transition-transform group-hover:scale-105 sm:size-37"
        />
      </div>
      <div className="flex flex-col gap-1.5 p-3 sm:p-4">
        <span className="font-mono text-[13px] font-semibold text-muted">
          {formatNumber(pokemon.id)}
        </span>
        <span className="font-display text-lg leading-tight font-bold sm:text-[22px]">{name}</span>
        <div className="mt-1.5 flex min-h-6.5 flex-wrap gap-1.5">
          {data?.types.map((type) => <TypeBadge key={type} type={type} />)}
        </div>
      </div>
    </Link>
  )
}

export function PokemonCardSkeleton() {
  return (
    <div className="flex animate-pulse flex-col overflow-hidden rounded-[18px] border border-line bg-white">
      <div className="h-33 bg-track sm:h-44" />
      <div className="flex flex-col gap-2 p-3 sm:p-4">
        <div className="h-4 w-12 rounded bg-track" />
        <div className="h-6 w-28 rounded bg-track" />
        <div className="mt-1.5 h-6.5 w-20 rounded-full bg-track" />
      </div>
    </div>
  )
}
