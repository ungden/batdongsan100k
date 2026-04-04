export default function PropertyLoading() {
  return (
    <div className="pt-20 min-h-screen animate-pulse">
      {/* Image gallery skeleton */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 pt-8">
        <div className="grid grid-cols-4 gap-2 rounded-2xl overflow-hidden">
          <div className="col-span-4 md:col-span-2 aspect-[4/3] bg-slate-200" />
          <div className="hidden md:block aspect-[4/3] bg-slate-200" />
          <div className="hidden md:block aspect-[4/3] bg-slate-200" />
        </div>
      </div>

      {/* Content skeleton */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main */}
          <div className="lg:col-span-2 space-y-6">
            <div className="h-8 bg-slate-200 rounded w-3/4" />
            <div className="h-6 bg-slate-200 rounded w-1/3" />
            <div className="h-4 bg-slate-100 rounded w-1/2" />
            <div className="flex gap-6 pt-4">
              <div className="h-10 w-24 bg-slate-100 rounded" />
              <div className="h-10 w-24 bg-slate-100 rounded" />
              <div className="h-10 w-24 bg-slate-100 rounded" />
            </div>
            <div className="space-y-3 pt-6">
              <div className="h-4 bg-slate-100 rounded w-full" />
              <div className="h-4 bg-slate-100 rounded w-full" />
              <div className="h-4 bg-slate-100 rounded w-3/4" />
            </div>
          </div>
          {/* Sidebar */}
          <div className="space-y-4">
            <div className="h-48 bg-slate-200 rounded-2xl" />
            <div className="h-32 bg-slate-100 rounded-2xl" />
          </div>
        </div>
      </div>
    </div>
  )
}
