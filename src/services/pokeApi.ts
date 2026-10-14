import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { idFromUrl } from '../lib/pokemon.ts'

export interface PokemonRef {
  id: number
  name: string
}

export interface PokemonPage {
  count: number
  results: PokemonRef[]
}

export interface Pokemon {
  id: number
  name: string
  speciesId: number
  image: string | null
  types: string[]
  height: number
  weight: number
  baseExperience: number | null
  stats: { name: string; value: number }[]
  abilities: { name: string; hidden: boolean }[]
}

export interface Species {
  genus: string | null
  description: string | null
  evolutionChainId: number | null
}

export interface EvolutionNode {
  id: number
  name: string
  trigger: string
}

interface NamedResource {
  name: string
  url: string
}

interface LocalizedEntry {
  language: NamedResource
}

interface ListResponse {
  count: number
  results: NamedResource[]
}

interface TypeResponse {
  pokemon: { pokemon: NamedResource }[]
}

interface PokemonResponse {
  id: number
  name: string
  species: NamedResource
  height: number
  weight: number
  base_experience: number | null
  types: { type: NamedResource }[]
  stats: { base_stat: number; stat: NamedResource }[]
  abilities: { is_hidden: boolean; ability: NamedResource }[]
  sprites: {
    front_default: string | null
    other?: { 'official-artwork'?: { front_default: string | null } }
  }
}

interface SpeciesResponse {
  genera: (LocalizedEntry & { genus: string })[]
  flavor_text_entries: (LocalizedEntry & { flavor_text: string })[]
  evolution_chain: { url: string } | null
}

interface EvolutionDetail {
  min_level: number | null
  min_happiness: number | null
  item: NamedResource | null
  trigger: NamedResource | null
}

interface ChainLink {
  species: NamedResource
  evolution_details: EvolutionDetail[]
  evolves_to: ChainLink[]
}

interface AbilityResponse {
  names: (LocalizedEntry & { name: string })[]
}

const toRef = (resource: NamedResource): PokemonRef => ({
  id: idFromUrl(resource.url),
  name: resource.name,
})

// Spanish first, English as a fallback for entries the API has not translated.
function localized<T extends LocalizedEntry>(entries: T[]): T | undefined {
  return (
    entries.findLast((entry) => entry.language.name === 'es') ??
    entries.findLast((entry) => entry.language.name === 'en')
  )
}

function triggerLabel(details: EvolutionDetail[]): string {
  const detail = details[0]
  if (!detail) return 'Base'
  if (detail.min_level) return `Nv. ${detail.min_level}`
  if (detail.item) return 'Objeto'
  if (detail.trigger?.name === 'trade') return 'Intercambio'
  if (detail.min_happiness) return 'Amistad'
  return 'Especial'
}

export const pokeApi = createApi({
  reducerPath: 'pokeApi',
  baseQuery: fetchBaseQuery({ baseUrl: 'https://pokeapi.co/api/v2/' }),
  // PokéAPI data is static, so keep it cached while browsing back and forth.
  keepUnusedDataFor: 600,
  endpoints: (build) => ({
    getPokemonPage: build.query<PokemonPage, { limit: number; offset: number }>({
      query: ({ limit, offset }) => `pokemon?limit=${limit}&offset=${offset}`,
      transformResponse: (response: ListResponse) => ({
        count: response.count,
        results: response.results.map(toRef),
      }),
    }),
    // The API has no search endpoint, so searching filters this full index on the client.
    getPokemonIndex: build.query<PokemonRef[], void>({
      query: () => 'pokemon?limit=100000',
      transformResponse: (response: ListResponse) => response.results.map(toRef),
    }),
    getPokemonByType: build.query<PokemonRef[], string>({
      query: (type) => `type/${type}`,
      transformResponse: (response: TypeResponse) =>
        response.pokemon.map((entry) => toRef(entry.pokemon)),
    }),
    getPokemon: build.query<Pokemon, string>({
      query: (nameOrId) => `pokemon/${nameOrId}`,
      transformResponse: (response: PokemonResponse) => ({
        id: response.id,
        name: response.name,
        speciesId: idFromUrl(response.species.url),
        image:
          response.sprites.other?.['official-artwork']?.front_default ??
          response.sprites.front_default,
        types: response.types.map((entry) => entry.type.name),
        height: response.height,
        weight: response.weight,
        baseExperience: response.base_experience,
        stats: response.stats.map((entry) => ({
          name: entry.stat.name,
          value: entry.base_stat,
        })),
        abilities: response.abilities.map((entry) => ({
          name: entry.ability.name,
          hidden: entry.is_hidden,
        })),
      }),
    }),
    getSpecies: build.query<Species, number>({
      query: (id) => `pokemon-species/${id}`,
      transformResponse: (response: SpeciesResponse) => ({
        genus: localized(response.genera)?.genus ?? null,
        description:
          localized(response.flavor_text_entries)?.flavor_text.replace(/\s+/g, ' ') ?? null,
        evolutionChainId: response.evolution_chain
          ? idFromUrl(response.evolution_chain.url)
          : null,
      }),
    }),
    // Flattened into stages so branching chains (Eevee) render as columns.
    getEvolutionChain: build.query<EvolutionNode[][], number>({
      query: (id) => `evolution-chain/${id}`,
      transformResponse: (response: { chain: ChainLink }) => {
        const stages: EvolutionNode[][] = []
        let level = [response.chain]
        while (level.length > 0) {
          stages.push(
            level.map((link) => ({
              id: idFromUrl(link.species.url),
              name: link.species.name,
              trigger: triggerLabel(link.evolution_details),
            })),
          )
          level = level.flatMap((link) => link.evolves_to)
        }
        return stages
      },
    }),
    getAbilityName: build.query<string | null, string>({
      query: (name) => `ability/${name}`,
      transformResponse: (response: AbilityResponse) => localized(response.names)?.name ?? null,
    }),
  }),
})

export const {
  useGetPokemonPageQuery,
  useGetPokemonIndexQuery,
  useGetPokemonByTypeQuery,
  useGetPokemonQuery,
  useGetSpeciesQuery,
  useGetEvolutionChainQuery,
  useGetAbilityNameQuery,
} = pokeApi
