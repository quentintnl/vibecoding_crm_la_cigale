/**
 * Composant de chargement (Skeleton)
 * Affiche un placeholder animé pendant le chargement
 */

export function SkeletonCard() {
  return (
    <div className="bg-white p-4 rounded-lg shadow border border-slate-200">
      <div className="animate-pulse space-y-3">
        <div className="h-4 bg-slate-200 rounded w-3/4"></div>
        <div className="h-3 bg-slate-200 rounded w-1/2"></div>
        <div className="h-3 bg-slate-200 rounded w-2/3"></div>
      </div>
    </div>
  );
}

export function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="bg-white rounded-lg shadow border border-slate-200 overflow-hidden">
      <div className="animate-pulse">
        {/* Header */}
        <div className="bg-slate-50 px-4 py-3 border-b border-slate-200">
          <div className="flex gap-4">
            <div className="h-3 bg-slate-200 rounded w-24"></div>
            <div className="h-3 bg-slate-200 rounded w-32"></div>
            <div className="h-3 bg-slate-200 rounded w-20"></div>
            <div className="h-3 bg-slate-200 rounded w-16"></div>
          </div>
        </div>
        {/* Rows */}
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="px-4 py-3 border-b border-slate-200">
            <div className="flex gap-4">
              <div className="h-4 bg-slate-200 rounded w-24"></div>
              <div className="h-4 bg-slate-200 rounded w-32"></div>
              <div className="h-4 bg-slate-200 rounded w-20"></div>
              <div className="h-4 bg-slate-200 rounded w-16"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function SkeletonKanban() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {[1, 2].map((col) => (
        <div key={col} className="bg-slate-50 rounded-lg p-4">
          <div className="animate-pulse space-y-3">
            <div className="h-6 bg-slate-200 rounded w-32 mb-4"></div>
            {[1, 2, 3].map((card) => (
              <div key={card} className="bg-white p-3 rounded-md shadow-sm">
                <div className="h-4 bg-slate-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-slate-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

