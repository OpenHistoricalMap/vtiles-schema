import { useEffect, useRef, useState } from 'react'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'

const LANGUAGES_GEOJSON_URL = 'http://planet-staging.openhistoricalmap.org.s3.amazonaws.com/vtiles_languages.geojson'
const MAP_STYLE_URL = 'https://www.staging.openhistoricalmap.org/map-styles/historical/historical.json'

function LocalesMap({ onClose }) {
  const mapContainer = useRef(null)
  const map = useRef(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [locales, setLocales] = useState([])
  const [selectedLocale, setSelectedLocale] = useState(null)

  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await fetch(LANGUAGES_GEOJSON_URL)
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
      style: MAP_STYLE_URL,
      center: [0, 20],
      zoom: 2,
      attributionControl: true
    })

    map.current.on('load', async () => {
      try {
        const response = await fetch(LANGUAGES_GEOJSON_URL)
        if (!response.ok) throw new Error('Failed to load languages data')
        
        const geojson = await response.json()

        // Add source
        if (!map.current.getSource('languages')) {
          map.current.addSource('languages', {
            type: 'geojson',
            data: geojson
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
                ${properties.is_new ? '<p class="text-xs text-green-600 mt-1">New</p>' : ''}
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

  const handleLocaleClick = (locale) => {
    setSelectedLocale(locale)
    // Optionally fly to the feature on the map
    if (map.current) {
      // Find the feature in the source
      const source = map.current.getSource('languages')
      if (source && source._data) {
        const feature = source._data.features.find(
          f => f.properties.key_name === locale.key_name
        )
        if (feature && feature.geometry.type === 'Polygon') {
          const coordinates = feature.geometry.coordinates[0]
          const bounds = coordinates.reduce((bounds, coord) => {
            return bounds.extend(coord)
          }, new maplibregl.LngLatBounds(coordinates[0], coordinates[0]))
          
          map.current.fitBounds(bounds, {
            padding: 50,
            duration: 1000
          })
        }
      }
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-white flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between flex-shrink-0">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Language Locales Map</h2>
          <p className="text-sm text-gray-500">Distribution of name locale fields across regions</p>
        </div>
        <button
          onClick={onClose}
          className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors text-sm font-medium"
        >
          Close
        </button>
      </div>

      {/* Content: Sidebar + Map */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar with locales list */}
        <div className="w-80 bg-white border-r border-gray-200 flex flex-col overflow-hidden">
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <h3 className="text-sm font-semibold text-gray-700 mb-1">Locales ({locales.length})</h3>
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
                {locales.map((locale) => (
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

export default LocalesMap
