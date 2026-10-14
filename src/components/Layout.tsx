import { Link, Outlet } from 'react-router-dom'

export default function Layout() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-line bg-white">
        <div className="mx-auto flex min-h-18 max-w-[1120px] flex-wrap items-center justify-between gap-3 px-4 sm:px-6">
          <Link to="/" className="flex min-h-11 items-center gap-3">
            <svg aria-hidden="true" width="32" height="32" viewBox="0 0 32 32" fill="none">
              <circle cx="16" cy="16" r="14" className="fill-accent" />
              <path d="M2 16h28" stroke="#fff" strokeWidth="3" />
              <circle cx="16" cy="16" r="5" fill="#fff" className="stroke-ink" strokeWidth="2.5" />
            </svg>
            <span className="font-display text-2xl font-extrabold tracking-tight">Pokédex</span>
          </Link>
          <a
            href="https://pokeapi.co"
            target="_blank"
            rel="noreferrer"
            className="flex min-h-11 items-center text-sm font-semibold text-muted hover:text-accent"
          >
            Datos de PokéAPI
          </a>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[1120px] grow px-4 pt-8 pb-16 sm:px-6 sm:pt-12">
        <Outlet />
      </main>

      <footer className="border-t border-line bg-white">
        <div className="mx-auto max-w-[1120px] px-4 py-5 text-sm text-muted sm:px-6">
          Proyecto de práctica con datos de PokéAPI.
        </div>
      </footer>
    </div>
  )
}
