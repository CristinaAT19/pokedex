import { typeInfo } from '../lib/pokemon.ts'

interface Props {
  type: string
  size?: 'sm' | 'md'
}

export default function TypeBadge({ type, size = 'sm' }: Props) {
  const info = typeInfo(type)
  const sizing =
    size === 'md' ? 'gap-2 py-1.5 pr-3.5 pl-3 text-[15px]' : 'gap-1.5 py-0.5 pr-2.5 pl-2 text-[13px]'
  const dot = size === 'md' ? 'size-2.5' : 'size-2'

  return (
    <span
      className={`inline-flex items-center rounded-full border border-line bg-white font-semibold ${sizing}`}
    >
      <span aria-hidden="true" className={`rounded-full ${dot}`} style={{ background: info.color }} />
      {info.label}
    </span>
  )
}
