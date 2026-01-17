import { Link, useLocation } from 'react-router-dom'

function Header() {
  const location = useLocation()
  const isLocalesMap = location.pathname === '/locales-map'

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm z-50">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-semibold text-gray-900 tracking-tight">Vector Tiles Schema</h1>
              <p className="text-xs text-gray-500 font-medium">OpenHistoricalMap</p>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-6 text-sm text-gray-600">
            <a href="https://openhistoricalmap.org" target="_blank" rel="noopener noreferrer" className="hover:text-indigo-600 transition-colors">
              OpenHistoricalMap
            </a>
            <span className="text-gray-300">|</span>
            <a href="https://vtiles.staging.openhistoricalmap.org" target="_blank" rel="noopener noreferrer" className="hover:text-indigo-600 transition-colors">
              Vector Tiles
            </a>
            <span className="text-gray-300">|</span>
            <Link
              to="/locales-map"
              className={`hover:text-indigo-600 transition-colors flex items-center gap-1 ${
                isLocalesMap ? 'text-indigo-600 font-medium' : ''
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
              Locales Map
            </Link>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header
