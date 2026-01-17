import { useState, useEffect } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import Header from '../components/Header'
import LayerDetail from '../components/LayerDetail'

function LayersPage({ allLayers, layersInfo, maps }) {
  const { mapName } = useParams()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const [selectedLayer, setSelectedLayer] = useState(null)
  
  const map = maps.find(m => m.name === mapName)
  const mapLayers = allLayers.filter(layer => layer.map === mapName)
  
  // Load layer from URL parameter on mount or when mapLayers change
  useEffect(() => {
    if (mapLayers.length === 0) return
    
    const layerName = searchParams.get('layer')
    if (layerName) {
      const layer = mapLayers.find(l => l.name === layerName)
      if (layer) {
        setSelectedLayer(layer)
        return
      }
    }
    // If no layer in URL or layer not found, select first layer and update URL
    const firstLayer = mapLayers[0]
    setSelectedLayer(firstLayer)
    setSearchParams({ layer: firstLayer.name }, { replace: true })
  }, [mapLayers, searchParams, setSearchParams])
  
  // Update URL when layer changes
  const handleLayerSelect = (layer) => {
    setSelectedLayer(layer)
    setSearchParams({ layer: layer.name })
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


  if (!map) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4">
        <h2 className="text-2xl font-bold text-gray-800">Map not found</h2>
        <button
          onClick={() => navigate('/')}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Back to Maps
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-white">
      <Header />
      <div className="flex-1 overflow-hidden flex">
        {/* Sidebar */}
        <div className="w-80 bg-white shadow-xl border-r border-gray-200 flex flex-col">
          <div className="p-4 border-b border-gray-200 bg-white">
            <button
              onClick={() => navigate('/')}
              className="mb-3 flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold text-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Maps
            </button>
            <div>
              <h1 className="text-xl font-bold text-gray-800">{map.name}</h1>
              <p className="text-sm text-gray-600">{map.attribution || 'OpenHistoricalMap'}</p>
              <p className="text-xs text-gray-500 mt-1">{mapLayers.length} layers</p>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            <div className="divide-y divide-gray-200">
              {mapLayers.map(layer => (
                <button
                  key={layer.id}
                  onClick={() => handleLayerSelect(layer)}
                  className={`w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors relative ${
                    selectedLayer?.id === layer.id ? 'bg-blue-50 border-l-4 border-l-blue-600' : ''
                  }`}
                >
                  <span className={`absolute top-2 right-2 px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase border ${getGeometryBadgeClass(layer.geometryType)}`}>
                    {formatGeometryType(layer.geometryType)}
                  </span>
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${getGeometryBadgeClass(layer.geometryType)}`}>
                      {getGeometryIcon(layer.geometryType)}
                    </div>
                    <div className="flex-1 min-w-0 pr-12">
                      <div className="text-sm font-semibold text-gray-800 truncate">{layer.name}</div>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <span className="text-xs text-gray-500">z{layer.minzoom}-{layer.maxzoom}</span>
                        {layer.fields && Object.keys(layer.fields).length > 0 && (
                          <span className="text-xs text-gray-500">
                            {Object.keys(layer.fields).length} fields
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto">
          <LayerDetail layer={selectedLayer} layersInfo={layersInfo} />
        </div>
      </div>
    </div>
  )
}

export default LayersPage
