import { useParams, useNavigate, Link } from 'react-router-dom'
import LayerDetail from '../components/LayerDetail'
import Header from '../components/Header'

function LayerDetailPage({ allLayers, layersInfo }) {
  const { mapName, layerName } = useParams()
  const navigate = useNavigate()
  
  const layer = allLayers.find(l => l.map === mapName && l.name === layerName)

  const copyShareLink = () => {
    const url = window.location.href
    navigator.clipboard.writeText(url)
    alert(`Link copied to clipboard!\n${url}`)
  }

  if (!layer) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4">
        <h2 className="text-2xl font-bold text-gray-800">Layer not found</h2>
        <button
          onClick={() => navigate(`/map/${mapName}`)}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Back to Layers
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-white">
      <Header />
      <div className="flex-1 overflow-hidden">
        <div className="bg-white border-b border-gray-200 px-8 py-4">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/')}
                className="text-gray-600 hover:text-blue-600 font-semibold text-sm"
              >
                Maps
              </button>
              <span className="text-gray-400">/</span>
              <Link
                to={`/map/${mapName}`}
                className="text-gray-600 hover:text-blue-600 font-semibold text-sm"
              >
                {mapName}
              </Link>
              <span className="text-gray-400">/</span>
              <span className="text-gray-800 font-semibold text-sm">{layerName}</span>
            </div>
            <button
              onClick={copyShareLink}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-semibold"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
              Share Link
            </button>
          </div>
        </div>
        <LayerDetail layer={layer} layersInfo={layersInfo} />
      </div>
    </div>
  )
}

export default LayerDetailPage
