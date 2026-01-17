import { useState } from 'react'

function Sidebar({ layers, selectedLayer, onSelectLayer, searchQuery, onSearchChange }) {
  const [collapsed, setCollapsed] = useState(false)

  const getGeometryIcon = (geometryType) => {
    const geom = (geometryType || 'unknown').toLowerCase().replace('multi', '')
    if (geom === 'point') {
      // Circle/dot icon for point
      return (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <circle cx="10" cy="10" r="4" />
        </svg>
      )
    }
    if (geom === 'linestring') {
      // Line icon for linestring
      return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 20 20" strokeLinecap="round">
          <path d="M2 10 L18 10" />
          <path d="M2 6 L6 10 L2 14" />
          <path d="M18 6 L14 10 L18 14" />
        </svg>
      )
    }
    if (geom === 'polygon') {
      // Hexagon/polygon icon for polygon
      return (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path d="M10 2 L16 6 L16 14 L10 18 L4 14 L4 6 Z" />
        </svg>
      )
    }
    return null
  }

  const getGeometryBadgeClass = (geometryType) => {
    const geom = (geometryType || 'unknown').toLowerCase().replace('multi', '')
    if (geom === 'point') return 'bg-orange-100 text-orange-700 border-orange-300'
    if (geom === 'linestring' || geom === 'line') return 'bg-purple-100 text-purple-700 border-purple-300'
    if (geom === 'polygon') return 'bg-blue-100 text-blue-700 border-blue-300'
    return 'bg-gray-100 text-gray-700 border-gray-300'
  }

  const formatGeometryType = (geometryType) => {
    if (!geometryType) return '?'
    let formatted = geometryType.replace('multi', '')
    // Convert 'line' to 'linestring' for display
    if (formatted.toLowerCase() === 'line') {
      formatted = 'linestring'
    }
    return formatted
  }

  return (
    <div className={`bg-white shadow-xl flex flex-col relative transition-all duration-300 border-r border-gray-200 ${collapsed ? 'w-12' : 'w-80'}`}>
      <button 
        className="absolute -right-4 top-1/2 -translate-y-1/2 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm shadow-lg hover:bg-blue-700 z-20 transition-all hover:scale-110"
        onClick={() => setCollapsed(!collapsed)}
        title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {collapsed ? '▶' : '◀'}
      </button>
      
      {!collapsed && (
        <>
          <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-b-2 border-blue-200 sticky top-0 z-10">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-800">Layers</h2>
                <p className="text-xs text-gray-600">{layers.length} available</p>
              </div>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search layers..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-sm border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white"
              />
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {layers.length === 0 ? (
              <div className="p-8 text-center">
                <svg className="w-12 h-12 mx-auto text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-gray-500 font-medium">No layers found</p>
                <p className="text-gray-400 text-sm mt-1">Try a different search term</p>
              </div>
            ) : (
              <div className="py-2">
                {layers.map(layer => (
                  <div
                    key={layer.id}
                    className={`mx-2 my-1 px-4 py-3 cursor-pointer rounded-lg flex items-center gap-3 transition-all ${
                      selectedLayer?.id === layer.id 
                        ? 'bg-blue-50 border-2 border-blue-500 shadow-md' 
                        : 'border-2 border-transparent hover:bg-gray-50 hover:border-gray-200'
                    }`}
                    onClick={() => onSelectLayer(layer)}
                  >
                    <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${getGeometryBadgeClass(layer.geometryType)}`}>
                      {getGeometryIcon(layer.geometryType)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm text-gray-800 truncate">{layer.name}</div>
                      <div className="text-xs text-gray-500 mt-0.5">z{layer.minzoom}-{layer.maxzoom}</div>
                    </div>
                    <span className={`px-2 py-1 rounded-md text-xs font-semibold uppercase border ${getGeometryBadgeClass(layer.geometryType)} flex-shrink-0`}>
                      {formatGeometryType(layer.geometryType)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}

export default Sidebar
