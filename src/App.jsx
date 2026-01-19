import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import MapsPage from './pages/MapsPage'
import LayersPage from './pages/LayersPage'
import LayerDetailPage from './pages/LayerDetailPage'
import LocalesMapPage from './pages/LocalesMapPage'
import Header from './components/Header'
import config from './config'

function App() {
  const [allLayers, setAllLayers] = useState([])
  const [maps, setMaps] = useState([])
  const [layersInfo, setLayersInfo] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        
        // Fetch capabilities and layers info
        const [capabilitiesRes, layersInfoRes] = await Promise.all([
          fetch(config.api.capabilitiesBaseUrl),
          fetch(config.api.layersInfoUrl)
        ])

        if (!capabilitiesRes.ok || !layersInfoRes.ok) {
          throw new Error('Failed to fetch data')
        }

        const capabilities = await capabilitiesRes.json()
        const layersInfoData = await layersInfoRes.json()

        // Fetch capabilities for all maps
        const mapCapabilitiesPromises = capabilities.maps?.map(map => 
          fetch(config.api.getMapCapabilitiesUrl(map.name))
            .then(res => res.ok ? res.json() : null)
            .catch(() => null)
        ) || []

        const mapCapabilitiesResults = await Promise.all(mapCapabilitiesPromises)

        // Create a map of detailed layer info from all map capabilities
        const allMapLayersMap = {}
        capabilities.maps?.forEach((map, index) => {
          const mapCapabilities = mapCapabilitiesResults[index]
          if (mapCapabilities && mapCapabilities.vector_layers) {
            mapCapabilities.vector_layers.forEach(vl => {
              // Use map name + layer name as key to avoid conflicts
              const key = `${map.name}:${vl.id}`
              allMapLayersMap[key] = {
                geometryType: vl.geometry_type || vl.geometryType,
                fields: vl.fields || {}
              }
            })
          }
        })

        // Process capabilities to extract layers
        const allLayers = []
        const infoMap = {}

        // Create a map of layer info by layer name
        if (layersInfoData.by_layer_name) {
          Object.keys(layersInfoData.by_layer_name).forEach(layerName => {
            const layerInfo = layersInfoData.by_layer_name[layerName]
            if (layerInfo && layerInfo.length > 0) {
              infoMap[layerName] = layerInfo[0] // Take first entry
            }
          })
        }

        // Process each map in capabilities
        capabilities.maps?.forEach(map => {
          map.layers?.forEach(layer => {
            const layerName = layer.name
            const layerInfo = infoMap[layerName] || {}
            
            // Get geometry type and fields from map capabilities if available
            let geometryType = 'unknown'
            let fields = {}
            
            const mapLayerKey = `${map.name}:${layerName}`
            if (allMapLayersMap[mapLayerKey]) {
              // Use detailed info from map capabilities (ohm.json, ohm_admin.json, etc.)
              geometryType = allMapLayersMap[mapLayerKey].geometryType || 'unknown'
              fields = allMapLayersMap[mapLayerKey].fields || {}
            } else {
              // Infer geometry type from layer name
              if (layerName.includes('centroids') || layerName.includes('points')) {
                geometryType = 'point'
              } else if (layerName.includes('lines') || layerName.includes('_lines')) {
                geometryType = 'linestring'
              } else if (layerName.includes('areas') || layerName.includes('_areas') || 
                        !layerName.includes('_')) {
                geometryType = 'multipolygon'
              }
            }

            allLayers.push({
              id: layerName,
              name: layerName,
              map: map.name,
              minzoom: layer.minzoom || 0,
              maxzoom: layer.maxzoom || 20,
              tiles: layer.tiles || [],
              geometryType: geometryType,
              fields: fields,
              description: layerInfo.description || `${layerName.replace(/_/g, ' ')} layer`,
              details: layerInfo.details || [],
              filtersPerZoomLevel: layerInfo.filters_per_zoom_level || [],
              tegolaConfig: layerInfo.tegola_config || null
            })
          })
        })

        setAllLayers(allLayers)
        setMaps(capabilities.maps || [])
        setLayersInfo(infoMap)
        setLoading(false)
      } catch (err) {
        setError(err.message)
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-6 bg-white">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
          <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Error loading data</h2>
          <p className="text-red-600 mb-6 max-w-md">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold shadow-lg hover:shadow-xl"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route 
          path="/" 
          element={
            <div className="flex flex-col h-screen overflow-hidden bg-white">
              <Header />
              <MapsPage maps={maps} loading={loading} />
            </div>
          } 
        />
        <Route 
          path="/map/:mapName" 
          element={
            <LayersPage 
              allLayers={allLayers} 
              layersInfo={layersInfo}
              maps={maps}
            />
          } 
        />
        <Route 
          path="/layer/:mapName/:layerName" 
          element={
            <LayerDetailPage 
              allLayers={allLayers} 
              layersInfo={layersInfo}
            />
          } 
        />
        <Route 
          path="/locales-map" 
          element={<LocalesMapPage />} 
        />
      </Routes>
    </BrowserRouter>
  )
}

export default App
