import type { ReactNode } from 'react'

interface Props {
  title: string
  children: ReactNode
  action?: ReactNode
}

export default function StateMessage({ title, children, action }: Props) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-[18px] border border-dashed border-line-strong bg-white px-6 py-14 text-center">
      <svg
        aria-hidden="true"
        width="40"
        height="40"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        className="text-muted"
      >
        <circle cx="11" cy="11" r="7" />
        <path d="M20 20l-3.8-3.8M8.5 8.5l5 5M13.5 8.5l-5 5" />
      </svg>
      <h2 className="font-display text-2xl font-bold">{title}</h2>
      <p className="max-w-sm text-muted">{children}</p>
      {action && <div className="mt-3">{action}</div>}
    </div>
  )
}

export function StateButton({ onClick, children }: { onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="min-h-11 cursor-pointer rounded-full border border-ink bg-white px-5 text-[15px] font-bold hover:bg-ground"
    >
      {children}
    </button>
  )
}
