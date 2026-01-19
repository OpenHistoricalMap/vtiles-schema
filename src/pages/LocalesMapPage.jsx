import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import Header from '../components/Header'
import config from '../config'

function LocalesMapPage() {
  const mapContainer = useRef(null)
  const map = useRef(null)
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [locales, setLocales] = useState([])
  const [selectedLocale, setSelectedLocale] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await fetch(config.api.languagesGeojsonUrl)
        if (!response.ok) throw new Error('Failed to load languages data')
        
        const geojson = await response.json()
        
        // Extract and sort locales
        const localesList = geojson.features.map(feature => ({
          ...feature.properties,
          id: feature.properties.key_name
        })).sort((a, b) => {
          // Sort by count descending, then by key_name
          if (b.count !== a.count) return b.count - a.count
          return a.key_name.localeCompare(b.key_name)
        })
        
        setLocales(localesList)
      } catch (err) {
        setError(err.message)
        setLoading(false)
      }
    }
    
    loadData()
  }, [])

  useEffect(() => {
    if (!mapContainer.current || locales.length === 0) return

    // Initialize map
    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: config.api.mapStyleUrl,
      center: [0, 20],
      zoom: 2,
      attributionControl: true
    })

    let geojsonData = null

    map.current.on('load', async () => {
      try {
        const response = await fetch(config.api.languagesGeojsonUrl)
        if (!response.ok) throw new Error('Failed to load languages data')
        
        geojsonData = await response.json()

        // Add source
        if (!map.current.getSource('languages')) {
          map.current.addSource('languages', {
            type: 'geojson',
            data: geojsonData
          })
        }

        // Add layer for outlines only (no fill)
        if (!map.current.getLayer('languages-outline')) {
          map.current.addLayer({
            id: 'languages-outline',
            type: 'line',
            source: 'languages',
            paint: {
              'line-color': [
                'interpolate',
                ['linear'],
                ['get', 'count'],
                0,
                '#90caf9',
                100,
                '#42a5f5',
                500,
                '#1e88e5',
                1000,
                '#1565c0',
                2000,
                '#0d47a1'
              ],
              'line-width': [
                'interpolate',
                ['linear'],
                ['get', 'count'],
                0,
                1,
                100,
                1.5,
                500,
                2,
                1000,
                2.5,
                2000,
                3
              ],
              'line-opacity': 0.8
            }
          })
        }

        // Add filtered layer for search results
        if (!map.current.getSource('languages-filtered')) {
          map.current.addSource('languages-filtered', {
            type: 'geojson',
            data: {
              type: 'FeatureCollection',
              features: []
            }
          })
        }

        if (!map.current.getLayer('languages-filtered-outline')) {
          map.current.addLayer({
            id: 'languages-filtered-outline',
            type: 'line',
            source: 'languages-filtered',
            paint: {
              'line-color': '#4caf50',
              'line-width': 3,
              'line-opacity': 0.9
            }
          })
        }

        // Add highlight layer (will be shown on top when a locale is selected)
        if (!map.current.getSource('languages-highlight')) {
          map.current.addSource('languages-highlight', {
            type: 'geojson',
            data: {
              type: 'FeatureCollection',
              features: []
            }
          })
        }

        if (!map.current.getLayer('languages-highlight')) {
          map.current.addLayer({
            id: 'languages-highlight',
            type: 'line',
            source: 'languages-highlight',
            paint: {
              'line-color': '#ff9800',
              'line-width': 5,
              'line-opacity': 1
            }
          })
        }

        // Add popup on click
        map.current.on('click', 'languages-outline', (e) => {
          const properties = e.features[0].properties
          const coordinates = e.lngLat

          new maplibregl.Popup()
            .setLngLat(coordinates)
            .setHTML(`
              <div class="p-2">
                <h3 class="font-semibold text-gray-900 mb-1">${properties.key_name}</h3>
                <p class="text-sm text-gray-600">Alias: <code class="text-xs">${properties.alias}</code></p>
                <p class="text-sm text-gray-600">Count: <span class="font-medium">${properties.count}</span></p>
              </div>
            `)
            .addTo(map.current)
        })

        // Change cursor on hover
        map.current.on('mouseenter', 'languages-outline', () => {
          map.current.getCanvas().style.cursor = 'pointer'
        })

        map.current.on('mouseleave', 'languages-outline', () => {
          map.current.getCanvas().style.cursor = ''
        })

        // Also handle clicks on highlight layer
        map.current.on('click', 'languages-highlight', (e) => {
          const properties = e.features[0].properties
          const coordinates = e.lngLat

          new maplibregl.Popup()
            .setLngLat(coordinates)
            .setHTML(`
              <div class="p-2">
                <h3 class="font-semibold text-gray-900 mb-1">${properties.key_name}</h3>
                <p class="text-sm text-gray-600">Alias: <code class="text-xs">${properties.alias}</code></p>
                <p class="text-sm text-gray-600">Count: <span class="font-medium">${properties.count}</span></p>
              </div>
            `)
            .addTo(map.current)
        })

        setLoading(false)
      } catch (err) {
        setError(err.message)
        setLoading(false)
      }
    })

    return () => {
      if (map.current) {
        map.current.remove()
      }
    }
  }, [locales])

  // Filter locales based on search query and update map
  useEffect(() => {
    if (!map.current || !map.current.isStyleLoaded()) return

    const filteredLocales = locales.filter(locale => {
      if (!searchQuery.trim()) return true
      const query = searchQuery.toLowerCase()
      return (
        locale.key_name.toLowerCase().includes(query) ||
        locale.alias.toLowerCase().includes(query)
      )
    })

    // Update filtered layer on map
    if (map.current.getSource('languages-filtered')) {
      fetch(config.api.languagesGeojsonUrl)
        .then(response => response.json())
        .then(geojson => {
          const filteredFeatures = geojson.features.filter(feature => {
            const locale = locales.find(l => l.key_name === feature.properties.key_name)
            return locale && filteredLocales.includes(locale)
          })

          map.current.getSource('languages-filtered').setData({
            type: 'FeatureCollection',
            features: filteredFeatures
          })
        })
        .catch(err => console.error('Error updating filtered layer:', err))
    }
  }, [searchQuery, locales])

  const handleLocaleClick = (locale) => {
    setSelectedLocale(locale)
    
    if (!map.current || !map.current.isStyleLoaded()) {
      return
    }

    // Fetch the geojson again to get the feature
    fetch(config.api.languagesGeojsonUrl)
      .then(response => response.json())
      .then(geojson => {
        // Find the feature
        const feature = geojson.features.find(
          f => f.properties.key_name === locale.key_name
        )
        
        if (!feature) {
          console.error('Feature not found:', locale.key_name)
          return
        }

        // Update highlight source
        const highlightSource = map.current.getSource('languages-highlight')
        if (highlightSource) {
          highlightSource.setData({
            type: 'FeatureCollection',
            features: [feature]
          })
        }

        // Calculate bounds and zoom
        if (feature.geometry && feature.geometry.type === 'Polygon') {
          const coordinates = feature.geometry.coordinates[0]
          
          if (!coordinates || coordinates.length === 0) {
            console.error('Invalid coordinates')
            return
          }
          
          // Calculate bounding box
          let minLng = coordinates[0][0]
          let maxLng = coordinates[0][0]
          let minLat = coordinates[0][1]
          let maxLat = coordinates[0][1]
          
          coordinates.forEach(coord => {
            if (coord && coord.length >= 2) {
              minLng = Math.min(minLng, coord[0])
              maxLng = Math.max(maxLng, coord[0])
              minLat = Math.min(minLat, coord[1])
              maxLat = Math.max(maxLat, coord[1])
            }
          })
          
          // Create bounds
          const bounds = new maplibregl.LngLatBounds(
            [minLng, minLat],
            [maxLng, maxLat]
          )
          
          // Fly to bounds
          map.current.fitBounds(bounds, {
            padding: { top: 50, bottom: 50, left: 50, right: 50 },
            duration: 1500,
            maxZoom: 10
          })
        }
      })
      .catch(err => {
        console.error('Error loading feature:', err)
      })
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-white">
      <Header />
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar with locales list */}
        <div className="w-80 bg-white border-r border-gray-200 flex flex-col overflow-hidden">
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <button
              onClick={() => navigate('/')}
              className="mb-3 flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold text-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Maps
            </button>
            <h3 className="text-sm font-semibold text-gray-700 mb-2">
              Locales ({searchQuery.trim() 
                ? locales.filter(locale => {
                    const query = searchQuery.toLowerCase()
                    return locale.key_name.toLowerCase().includes(query) || locale.alias.toLowerCase().includes(query)
                  }).length 
                : locales.length})
            </h3>
            <div className="relative mb-2">
              <input
                type="text"
                placeholder="Search locales..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-3 py-2 pl-9 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <svg
                className="absolute left-2.5 top-2.5 w-4 h-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <p className="text-xs text-gray-500">Click to highlight on map</p>
          </div>
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-2"></div>
                  <p className="text-xs text-gray-600">Loading...</p>
                </div>
              </div>
            ) : error ? (
              <div className="p-4 text-center">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {locales
                  .filter(locale => {
                    if (!searchQuery.trim()) return true
                    const query = searchQuery.toLowerCase()
                    return (
                      locale.key_name.toLowerCase().includes(query) ||
                      locale.alias.toLowerCase().includes(query)
                    )
                  })
                  .map((locale) => (
                  <button
                    key={locale.id}
                    onClick={() => handleLocaleClick(locale)}
                    className={`w-full px-4 py-2.5 text-left hover:bg-gray-50 transition-colors ${
                      selectedLocale?.id === locale.id ? 'bg-blue-50 border-l-4 border-l-blue-600' : ''
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <code className="text-xs font-medium text-gray-700">{locale.alias}</code>
                      <span className="text-xs text-gray-400">•</span>
                      <span className="text-xs font-semibold text-blue-600">{locale.count}</span>
                      <span className="text-xs text-gray-400">features</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Map Container */}
        <div className="flex-1 relative">
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-50 z-10">
              <div className="text-center">
                <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600">Loading map...</p>
              </div>
            </div>
          )}
          
          {error && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-50 z-10">
              <div className="text-center">
                <p className="text-red-600 mb-4">Error: {error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Retry
                </button>
              </div>
            </div>
          )}

          <div ref={mapContainer} className="w-full h-full" />
        </div>
      </div>
    </div>
  )
}

export default LocalesMapPage
