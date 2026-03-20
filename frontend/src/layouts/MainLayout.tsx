import * as React from "react"
// NavigationMenu component removed; will be re-added from docs example when available.

type Props = {
  children: React.ReactNode
}

export default function MainLayout({ children }: Props) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="w-full border-b bg-background/50">
        <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
          <a href="#" onClick={(e) => e.preventDefault()} className="flex items-center gap-3" aria-disabled>
            <img src="/static/balonrank-logo.png" alt="BalonRank logo" className="h-12 w-auto object-contain" />
            <span className="font-semibold text-sm">BalonRank</span>
          </a>
          <nav className="flex items-center gap-4">
            <button className="px-3 py-1.5 text-sm rounded-md bg-muted/10" onClick={(e) => e.preventDefault()} aria-disabled>
              Supported Competitions
            </button>
            <button className="px-3 py-1.5 text-sm rounded-md bg-muted/10" onClick={(e) => e.preventDefault()} aria-disabled>
              FAQs
            </button>
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">
        {children}
      </main>
    </div>
  )
}
