# OpenHistoricalMap Vector Tiles Documentation

Sistema de documentación automática para el schema de vector tiles de OpenHistoricalMap, similar a [OpenMapTiles Schema](https://openmaptiles.org/schema/).

Esta aplicación React obtiene la información directamente de las APIs:
- **Capabilities API**: `https://vtiles.staging.openhistoricalmap.org/capabilities`
- **Layers Info**: `https://planet-staging.openhistoricalmap.org.s3.amazonaws.com/vtiles_layers_info.json`

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Start development server
npm run dev
# Open http://localhost:8081
```

### Build for Production

```bash
npm run build      # Build for production
npm run preview    # Preview production build
```

## Structure

```
vtiles-docs/
├── index.html           # Main HTML entry point
├── vite.config.js      # Vite configuration
├── package.json         # NPM dependencies
├── src/                 # React source code
│   ├── main.jsx         # React entry point
│   ├── App.jsx          # Main App component
│   ├── App.css          # App styles
│   └── components/      # React components
│       ├── Header.jsx   # Header component
│       ├── Sidebar.jsx  # Sidebar navigation
│       └── LayerDetail.jsx  # Layer details view
└── docs/                # Additional documentation
    ├── README.md        # Full documentation
    ├── QUICK_START.md   # Quick start guide
    ├── DEPLOYMENT.md    # Deployment guide
    └── SUMMARY.md       # Project summary
```

## Commands

### NPM Scripts

```bash
npm run dev       # Start Vite dev server (http://localhost:8081)
npm run build     # Build for production
npm run preview   # Preview production build
```

## Features

- **React Application**: Modern React app with Vite
- **Tailwind CSS**: Utility-first CSS framework for clean, maintainable styles
- **Live API Data**: Fetches data directly from APIs (no manual updates needed)
- **Left Sidebar Navigation**: Browse all available layers
- **Search**: Real-time search across layers and descriptions
- **Layer Details**: View zoom levels, filters, tolerance, and configuration
- **Responsive**: Works on desktop and mobile
- **Auto-updates**: Always shows latest data from APIs

## Documentation

- **[Full Documentation](docs/README.md)** - Complete technical guide
- **[Quick Start](docs/QUICK_START.md)** - Get started in 5 minutes
- **[Deployment](docs/DEPLOYMENT.md)** - Deploy to production
- **[Summary](docs/SUMMARY.md)** - Project overview

## Data Sources

The application automatically fetches data from:

1. **Capabilities API**: Provides map and layer information including:
   - Layer names
   - Zoom level ranges (minzoom/maxzoom)
   - Tile URLs
   - Map groupings

2. **Layers Info JSON**: Provides detailed layer information including:
   - Descriptions
   - Details (bullet points)
   - Filters per zoom level
   - Tolerance and min_area settings
   - Tegola configuration paths

## Requirements

- Node.js 16+
- npm or yarn

## Demo

Visit the live documentation at: [Your deployment URL]

---

For detailed documentation, see **[docs/README.md](docs/README.md)**
