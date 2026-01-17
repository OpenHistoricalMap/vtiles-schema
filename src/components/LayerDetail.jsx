function LayerDetail({ layer, layersInfo }) {
  if (!layer) {
    return (
      <div className="flex-1 overflow-y-auto bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500">Select a layer from the sidebar</p>
        </div>
      </div>
    )
  }

  const layerInfo = layersInfo[layer.name] || {}
  const getGeometryBadgeClass = (geometryType) => {
    const geom = (geometryType || 'unknown').toLowerCase().replace('multi', '')
    if (geom === 'point') return 'bg-orange-100 text-orange-800'
    if (geom === 'linestring' || geom === 'line') return 'bg-purple-100 text-purple-800'
    if (geom === 'polygon') return 'bg-blue-100 text-blue-800'
    return 'bg-gray-100 text-gray-800'
  }

  const formatGeometryType = (geometryType) => {
    if (!geometryType) return 'unknown'
    let formatted = geometryType.replace('multi', '')
    // Convert 'line' to 'linestring' for display
    if (formatted.toLowerCase() === 'line') {
      formatted = 'linestring'
    }
    return formatted
  }

  return (
    <div className="h-full bg-white">
      <div className="max-w-5xl mx-auto px-8 py-6">
        {/* Compact Header */}
        <div className="mb-6 pb-6 border-b border-gray-200">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{layer.name}</h1>
              <p className="text-gray-600 leading-relaxed">{layer.description}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3 items-center mt-4">
            <span className={`px-2.5 py-1 rounded text-xs font-semibold uppercase border ${getGeometryBadgeClass(layer.geometryType)}`}>
              {formatGeometryType(layer.geometryType)}
            </span>
            <span className="text-sm text-gray-500">Map: <span className="font-medium text-gray-700">{layer.map}</span></span>
            <span className="text-sm text-gray-500">Zoom: <span className="font-medium text-gray-700">z{layer.minzoom}-{layer.maxzoom}</span></span>
            {layer.filtersPerZoomLevel && layer.filtersPerZoomLevel.length > 0 && (
              <span className="text-sm text-gray-500">{layer.filtersPerZoomLevel.length} configurations</span>
            )}
            {layer.tegolaConfig && (
              <a
                href={`https://github.com/OpenHistoricalMap/ohm-deploy/blob/staging/images/tiler-server/${layer.tegolaConfig}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-2.5 py-1 text-xs font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded border border-blue-300 transition-colors flex items-center gap-1.5"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                View in GitHub
              </a>
            )}
          </div>
        </div>
        
        <div className="space-y-6">

          {layer.details && layer.details.length > 0 && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Details</h2>
              <ul className="space-y-1.5">
                {layer.details.map((detail, idx) => {
                  // Function to convert URLs in text to clickable links
                  const renderTextWithLinks = (text) => {
                    const urlRegex = /(https?:\/\/[^\s\)]+)/g;
                    const matches = [];
                    let lastIndex = 0;
                    let match;
                    
                    // Reset regex
                    urlRegex.lastIndex = 0;
                    
                    while ((match = urlRegex.exec(text)) !== null) {
                      // Add text before URL
                      if (match.index > lastIndex) {
                        matches.push({ type: 'text', content: text.substring(lastIndex, match.index) });
                      }
                      // Add URL
                      matches.push({ type: 'url', content: match[0] });
                      lastIndex = match.index + match[0].length;
                    }
                    
                    // Add remaining text
                    if (lastIndex < text.length) {
                      matches.push({ type: 'text', content: text.substring(lastIndex) });
                    }
                    
                    if (matches.length === 0) {
                      return text;
                    }
                    
                    return matches.map((item, i) => {
                      if (item.type === 'url') {
                        return (
                          <a
                            key={i}
                            href={item.content}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 underline"
                          >
                            {item.content}
                          </a>
                        );
                      }
                      return <span key={i}>{item.content}</span>;
                    });
                  };
                  
                  return (
                    <li key={idx} className="flex items-start gap-2 text-gray-700 text-sm">
                      <span className="text-gray-400 mt-1.5">•</span>
                      <span className="flex-1">{renderTextWithLinks(detail)}</span>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          {layer.fields && Object.keys(layer.fields).length > 0 && (() => {
            const fieldsArray = Object.entries(layer.fields);
            const fieldsWithoutLocale = fieldsArray.filter(([name]) => !name.startsWith('name_'));
            const fieldsWithLocale = fieldsArray.filter(([name]) => name.startsWith('name_'));
            
            return (
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-3">Fields ({Object.keys(layer.fields).length})</h2>
                <div className="border border-gray-200 rounded-lg bg-white">
                  <div className="max-h-96 overflow-y-auto p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                      {fieldsWithoutLocale.map(([fieldName, fieldType]) => (
                        <div key={fieldName} className="flex items-center justify-between p-2 bg-gray-50 rounded border border-gray-200">
                          <code className="text-sm font-medium text-gray-800">{fieldName}</code>
                          <span className="px-2 py-0.5 bg-gray-200 text-gray-700 rounded text-xs font-medium">
                            {fieldType}
                          </span>
                        </div>
                      ))}
                      
                      {fieldsWithLocale.length > 0 && (
                        <>
                          <div className="col-span-full my-3">
                            <div className="flex items-center gap-3">
                              <div className="flex-1 border-t border-gray-300"></div>
                              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                Locale Fields ({fieldsWithLocale.length})
                              </span>
                              <div className="flex-1 border-t border-gray-300"></div>
                            </div>
                          </div>
                          {fieldsWithLocale.map(([fieldName, fieldType]) => (
                            <div key={fieldName} className="flex items-center justify-between p-2 bg-gray-50 rounded border border-gray-200">
                              <code className="text-sm font-medium text-gray-800">{fieldName}</code>
                              <span className="px-2 py-0.5 bg-gray-200 text-gray-700 rounded text-xs font-medium">
                                {fieldType}
                              </span>
                            </div>
                          ))}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}

          {layer.filtersPerZoomLevel && layer.filtersPerZoomLevel.length > 0 && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Zoom Level Configurations And Filters</h2>
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="overflow-x-auto -mx-0.5">
                  <table className="w-full text-sm min-w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-3 py-2.5 text-left font-semibold text-gray-700 text-xs whitespace-nowrap">Zoom</th>
                        <th className="px-3 py-2.5 text-left font-semibold text-gray-700 text-xs whitespace-nowrap">Filter</th>
                        <th className="px-3 py-2.5 text-left font-semibold text-gray-700 text-xs whitespace-nowrap">Tolerance</th>
                        <th className="px-3 py-2.5 text-left font-semibold text-gray-700 text-xs whitespace-nowrap">Min Area</th>
                        <th className="px-3 py-2.5 text-left font-semibold text-gray-700 text-xs whitespace-nowrap">View</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {layer.filtersPerZoomLevel.map((filter, idx) => {
                        // Format min_area with commas if it's a number
                        const formatNumber = (value) => {
                          if (!value) return '-';
                          const num = parseFloat(value);
                          if (isNaN(num)) return value;
                          return num.toLocaleString('en-US');
                        };
                        
                        return (
                          <tr key={idx} className="hover:bg-gray-50">
                            <td className="px-3 py-2.5 whitespace-nowrap">
                              <span className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-semibold">
                                {filter.zoom_level}
                              </span>
                            </td>
                            <td className="px-3 py-2.5">
                              {filter.filter ? (
                                <span 
                                  className="inline-block text-xs font-mono text-gray-700 cursor-help" 
                                  title={filter.filter}
                                >
                                  {filter.filter}
                                </span>
                              ) : (
                                <span className="text-gray-400 text-xs">-</span>
                              )}
                            </td>
                            <td className="px-3 py-2.5 whitespace-nowrap">
                              {filter.tolerance ? (
                                <span className="text-xs text-gray-700">{filter.tolerance}</span>
                              ) : (
                                <span className="text-gray-400 text-xs">-</span>
                              )}
                            </td>
                            <td className="px-3 py-2.5 whitespace-nowrap">
                              {filter.min_area ? (
                                <span className="text-xs text-gray-700">{formatNumber(filter.min_area)}</span>
                              ) : (
                                <span className="text-gray-400 text-xs">-</span>
                              )}
                            </td>
                            <td className="px-3 py-2.5 whitespace-nowrap">
                              <code className="text-xs text-gray-700 font-mono">{filter.view_name}</code>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {layer.tiles && layer.tiles.length > 0 && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Tiles URL</h2>
              <div className="bg-gray-50 border border-gray-200 rounded p-3 overflow-x-auto">
                <code className="text-sm font-mono text-gray-800 break-all">{layer.tiles[0]}</code>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default LayerDetail
