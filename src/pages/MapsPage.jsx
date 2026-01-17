import { Link } from 'react-router-dom'

function MapsPage({ maps, loading }) {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-6 bg-white">
        <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
        <p className="text-xl font-semibold text-gray-800">Loading maps...</p>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto p-8 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-3">Vector Tiles Maps</h1>
          <p className="text-gray-600 text-lg">Select a map to view its layers and configurations</p>
        </div>

        <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
          <div className="divide-y divide-gray-200">
            {maps.map(map => (
              <Link
                key={map.name}
                to={`/map/${map.name}`}
                className="block hover:bg-blue-50 transition-colors"
              >
                <div className="px-6 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h2 className="text-lg font-bold text-gray-800 truncate">{map.name}</h2>
                      <p className="text-sm text-gray-600 truncate">{map.attribution || 'OpenHistoricalMap'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6 flex-shrink-0">
                    <div className="text-right">
                      <div className="text-sm text-gray-500">Layers</div>
                      <div className="text-lg font-bold text-blue-600">{map.layers?.length || 0}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-500">Zoom</div>
                      <div className="text-sm font-semibold text-gray-700">{map.minzoom || 0} - {map.maxzoom || 20}</div>
                    </div>
                    <div className="text-blue-600">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default MapsPage
