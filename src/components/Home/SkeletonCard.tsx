// components/SkeletonCard.tsx
export function SkeletonCard() {
  return (
    <div className="animate-pulse">
      <div className="bg-gray-800 rounded-2xl overflow-hidden">
        <div className="aspect-square bg-gray-700" />
        <div className="p-3 md:p-4">
          <div className="h-4 bg-gray-700 rounded-full w-3/4 mx-auto" />
        </div>
      </div>
    </div>
  )
}