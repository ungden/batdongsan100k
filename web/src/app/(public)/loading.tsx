export default function HomeLoading() {
  return (
    <div className="animate-pulse">
      {/* Hero skeleton */}
      <div className="h-[500px] bg-slate-200" />

      {/* Nav tabs skeleton */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 md:px-8 flex gap-4 py-4">
          <div className="h-6 w-20 bg-slate-200 rounded" />
          <div className="h-6 w-20 bg-slate-200 rounded" />
        </div>
      </div>

      {/* Properties grid skeleton */}
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="h-8 w-64 bg-slate-200 rounded mb-8" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-xl overflow-hidden bg-white shadow-sm">
                <div className="aspect-[16/10] bg-slate-200" />
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-slate-200 rounded w-3/4" />
                  <div className="h-3 bg-slate-100 rounded w-1/2" />
                  <div className="h-3 bg-slate-100 rounded w-1/3" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
