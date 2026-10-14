export const PAGE_SIZE = 12

export interface TypeInfo {
  label: string
  color: string
  tint: string
}

export const TYPES: Record<string, TypeInfo> = {
  normal: { label: 'Normal', color: '#8A8F7A', tint: '#E9EAE3' },
  fire: { label: 'Fuego', color: '#E2622A', tint: '#FBE3D4' },
  water: { label: 'Agua', color: '#2F7FD6', tint: '#D9E8FA' },
  grass: { label: 'Planta', color: '#3F9B4B', tint: '#DDF0DC' },
  electric: { label: 'Eléctrico', color: '#D9A400', tint: '#FAEFC4' },
  ice: { label: 'Hielo', color: '#4FB5C4', tint: '#D8F0F3' },
  fighting: { label: 'Lucha', color: '#C2452F', tint: '#F6DAD4' },
  poison: { label: 'Veneno', color: '#9B4FB8', tint: '#EBDDF2' },
  ground: { label: 'Tierra', color: '#B8893A', tint: '#F2E6CE' },
  flying: { label: 'Volador', color: '#6C8FD9', tint: '#E0E8F8' },
  psychic: { label: 'Psíquico', color: '#E0558A', tint: '#FADDE8' },
  bug: { label: 'Bicho', color: '#8FA41F', tint: '#EAF0CC' },
  rock: { label: 'Roca', color: '#9C8B4F', tint: '#ECE6D0' },
  ghost: { label: 'Fantasma', color: '#6A5CA8', tint: '#E1DDF1' },
  dragon: { label: 'Dragón', color: '#5A5FD9', tint: '#DEDFF8' },
  dark: { label: 'Siniestro', color: '#5B5066', tint: '#E2DEE6' },
  steel: { label: 'Acero', color: '#6F8FA3', tint: '#DFE8EE' },
  fairy: { label: 'Hada', color: '#D97BC0', tint: '#F8E0F1' },
}

const UNKNOWN_TYPE: TypeInfo = { label: 'Desconocido', color: '#5A6070', tint: '#E9EBEF' }

export function typeInfo(type: string | undefined): TypeInfo {
  return (type && TYPES[type]) || UNKNOWN_TYPE
}

export const STAT_LABELS: Record<string, string> = {
  hp: 'PS',
  attack: 'Ataque',
  defense: 'Defensa',
  'special-attack': 'At. especial',
  'special-defense': 'Def. especial',
  speed: 'Velocidad',
}

export const MAX_BASE_STAT = 255

// "https://pokeapi.co/api/v2/pokemon/6/" -> 6
export function idFromUrl(url: string): number {
  return Number(url.split('/').filter(Boolean).pop())
}

export function artworkUrl(id: number): string {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`
}

export function formatNumber(id: number): string {
  return `#${String(id).padStart(4, '0')}`
}

// "mr-mime" -> "Mr Mime"
export function formatName(name: string): string {
  return name
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

const decimal = new Intl.NumberFormat('es-ES', { maximumFractionDigits: 1 })

// The API gives height in decimetres and weight in hectograms.
export function formatHeight(decimetres: number): string {
  return `${decimal.format(decimetres / 10)} m`
}

export function formatWeight(hectograms: number): string {
  return `${decimal.format(hectograms / 10)} kg`
}
