export default function ProjectsLoading() {
  return (
    <div className="min-h-screen bg-surface pt-24 pb-16 animate-pulse">
      <section className="max-w-7xl mx-auto px-4 md:px-8 mb-10">
        <div className="rounded-3xl h-48 bg-slate-200" />
      </section>

      <section className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="h-8 w-48 bg-slate-200 rounded mb-2" />
            <div className="h-4 w-32 bg-slate-100 rounded" />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="rounded-2xl bg-white border border-outline-variant/20 p-6 space-y-3">
              <div className="h-6 w-3/4 bg-slate-200 rounded" />
              <div className="h-4 w-1/2 bg-slate-100 rounded" />
              <div className="h-5 w-1/3 bg-slate-200 rounded mt-4" />
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
