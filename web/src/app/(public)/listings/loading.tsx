export default function ListingsLoading() {
  return (
    <div className="pt-24 pb-16 min-h-screen animate-pulse">
      <div className="max-w-7xl mx-auto px-8">
        <div className="mb-8">
          <div className="h-4 w-32 bg-slate-200 rounded mb-4" />
          <div className="h-10 w-96 bg-slate-200 rounded mb-2" />
          <div className="h-4 w-48 bg-slate-100 rounded" />
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar skeleton */}
          <div className="w-full lg:w-72 flex-shrink-0">
            <div className="bg-white p-6 rounded-xl border border-outline-variant/20 space-y-6">
              <div className="h-6 w-32 bg-slate-200 rounded" />
              <div className="h-10 bg-slate-100 rounded-lg" />
              <div className="space-y-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="h-8 bg-slate-100 rounded" />
                ))}
              </div>
              <div className="h-10 bg-slate-100 rounded-lg" />
              <div className="h-10 bg-slate-100 rounded-lg" />
            </div>
          </div>

          {/* Grid skeleton */}
          <div className="flex-1">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="rounded-xl overflow-hidden bg-white shadow-sm">
                  <div className="aspect-[16/10] bg-slate-200" />
                  <div className="p-4 space-y-3">
                    <div className="h-4 bg-slate-200 rounded w-3/4" />
                    <div className="h-3 bg-slate-100 rounded w-1/2" />
                    <div className="flex gap-4 pt-3 border-t border-slate-100">
                      <div className="h-3 bg-slate-100 rounded w-12" />
                      <div className="h-3 bg-slate-100 rounded w-12" />
                      <div className="h-3 bg-slate-100 rounded w-12" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
