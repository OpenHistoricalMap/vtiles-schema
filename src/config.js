// Centralized configuration for URLs and application values supporting staging and production environments

const getEnvironment = () => {
  if (import.meta.env.PROD) {
    return import.meta.env.VITE_ENV || 'production'
  }
  return import.meta.env.VITE_ENV || 'staging'
}

const environment = getEnvironment()

const stagingConfig = {
  api: {
    capabilitiesBaseUrl: 'https://vtiles.staging.openhistoricalmap.org/capabilities',
    layersInfoUrl: 'http://planet-staging.openhistoricalmap.org.s3.amazonaws.com/vtiles_layers_info.json',
    languagesGeojsonUrl: 'http://planet-staging.openhistoricalmap.org.s3.amazonaws.com/vtiles_languages.geojson',
    mapStyleUrl: 'https://www.staging.openhistoricalmap.org/map-styles/historical/historical.json',
  },
  links: {
    openHistoricalMap: 'https://staging.openhistoricalmap.org',
    vectorTiles: 'https://vtiles.staging.openhistoricalmap.org',
    github: {
      base: 'https://github.com/OpenHistoricalMap/ohm-deploy',
      branch: 'staging',
      tegolaConfigPath: 'images/tiler-server',
    }
  }
}

const productionConfig = {
  api: {
    capabilitiesBaseUrl: 'https://vtiles.openhistoricalmap.org/capabilities',
    layersInfoUrl: 'https://planet.openhistoricalmap.org.s3.amazonaws.com/vtiles_layers_info.json',
    languagesGeojsonUrl: 'https://planet.openhistoricalmap.org.s3.amazonaws.com/vtiles_languages.geojson',
    mapStyleUrl: 'https://www.openhistoricalmap.org/map-styles/historical/historical.json',
  },
  links: {
    openHistoricalMap: 'https://openhistoricalmap.org',
    vectorTiles: 'https://vtiles.openhistoricalmap.org',
    github: {
      base: 'https://github.com/OpenHistoricalMap/ohm-deploy',
      branch: 'main',
      tegolaConfigPath: 'images/tiler-server',
    }
  }
}

const envConfig = environment === 'production' ? productionConfig : stagingConfig

const baseConfig = {
  app: {
    name: 'Vector Tiles Schema',
    organization: 'OpenHistoricalMap'
  }
}

const config = {
  ...baseConfig,
  api: {
    ...envConfig.api,
    getMapCapabilitiesUrl: (mapName) => {
      return `${envConfig.api.capabilitiesBaseUrl}/${mapName}.json`
    }
  },
  links: {
    ...envConfig.links,
    github: {
      ...envConfig.links.github,
      getTegolaConfigUrl: (configPath) => {
        return `${envConfig.links.github.base}/blob/${envConfig.links.github.branch}/${envConfig.links.github.tegolaConfigPath}/${configPath}`
      }
    }
  },
  environment: environment
}

export default config
