export default function MarketOverviewLoading() {
  return (
    <div className="min-h-screen bg-surface pt-24 pb-16 animate-pulse">
      <section className="max-w-7xl mx-auto px-4 md:px-8 mb-8">
        <div className="rounded-3xl h-48 bg-slate-200" />
      </section>
      <section className="max-w-7xl mx-auto px-4 md:px-8 mb-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-outline-variant/20 p-5 h-28">
              <div className="h-4 w-16 bg-slate-200 rounded mb-4" />
              <div className="h-8 w-20 bg-slate-200 rounded" />
            </div>
          ))}
        </div>
      </section>
      <section className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-outline-variant/20 overflow-hidden">
              <div className="h-44 bg-slate-200" />
              <div className="p-5 space-y-3">
                <div className="h-5 w-3/4 bg-slate-200 rounded" />
                <div className="h-3 w-1/2 bg-slate-100 rounded" />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
