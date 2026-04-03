'use client'

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
      <div className="bg-white rounded-xl shadow-sm p-8 max-w-md w-full text-center">
        <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="material-symbols-outlined text-red-500 text-3xl">
            error
          </span>
        </div>
        <h2 className="text-xl font-bold text-[#001e40] mb-2">
          Da xay ra loi
        </h2>
        <p className="text-sm text-gray-600 mb-6">
          {error.message || 'Co loi khong mong muon da xay ra. Vui long thu lai.'}
        </p>
        <button
          onClick={reset}
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#001e40] text-white rounded-lg text-sm font-medium hover:bg-[#002d5e] transition-colors"
        >
          <span className="material-symbols-outlined text-lg">refresh</span>
          Thu lai
        </button>
      </div>
    </div>
  )
}
