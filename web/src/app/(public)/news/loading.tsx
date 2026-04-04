export default function NewsLoading() {
  return (
    <div className="min-h-screen bg-surface pt-24 pb-16 animate-pulse">
      <section className="max-w-7xl mx-auto px-4 md:px-8 mb-10">
        <div className="rounded-3xl h-48 bg-slate-200" />
      </section>
      <section className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="h-6 w-24 bg-slate-200 rounded mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          <div className="h-64 bg-slate-200 rounded-2xl" />
          <div className="p-8 space-y-4">
            <div className="h-4 w-24 bg-slate-200 rounded" />
            <div className="h-8 bg-slate-200 rounded w-3/4" />
            <div className="h-4 bg-slate-100 rounded w-full" />
            <div className="h-4 bg-slate-100 rounded w-2/3" />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-outline-variant/20 overflow-hidden">
              <div className="h-48 bg-slate-200" />
              <div className="p-5 space-y-3">
                <div className="h-5 bg-slate-200 rounded w-3/4" />
                <div className="h-3 bg-slate-100 rounded w-full" />
                <div className="h-3 bg-slate-100 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
