export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      <div className="container mx-auto px-4 py-8 pt-24">
        <div className="max-w-4xl mx-auto space-y-4 animate-pulse">
          <div className="h-10 bg-white/5 rounded-lg w-1/3" />
          <div className="h-[400px] bg-white/5 rounded-lg" />
        </div>
      </div>
    </div>
  )
}