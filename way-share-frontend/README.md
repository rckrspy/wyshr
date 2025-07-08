# Way-Share Frontend

React Progressive Web Application (PWA) for anonymous traffic incident reporting.

## Tech Stack

- **React 18** with TypeScript
- **Vite** for build tooling and development
- **Material-UI (MUI)** for UI components and theming
- **Redux Toolkit** with RTK Query for state management
- **Mapbox GL JS** for heat map visualization
- **Workbox** for PWA functionality and offline support

## Development

### Prerequisites
- Node.js 18+ LTS
- Mapbox API token

### Setup
```bash
# Install dependencies
npm install

# Set environment variables
cp .env.example .env
# Add your Mapbox token to .env

# Start development server
npm run dev
```

### Available Scripts
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm test             # Run tests
```

## Key Features

- **Offline-First**: Full functionality when offline with sync when online
- **PWA**: Installable on mobile devices with native app experience
- **Privacy Protection**: All data anonymized before leaving device
- **Responsive Design**: Works seamlessly on mobile and desktop
- **Real-time Updates**: Live heat map with incident data

## Project Structure

```
src/
├── components/         # Reusable UI components
│   ├── common/        # Shared components
│   └── layout/        # Layout components
├── features/          # Feature-specific components
│   ├── education/     # Educational content
│   ├── map/          # Heat map components
│   └── report/       # Report submission flow
├── pages/            # Page components
├── store/            # Redux store and slices
├── services/         # API and utility services
├── styles/           # Theme and global styles
└── types/            # TypeScript type definitions
```

## Environment Variables

```bash
VITE_API_URL=http://localhost:3001/api/v1
VITE_MAPBOX_TOKEN=your_mapbox_token_here
VITE_ENV=development
```

## Building for Production

```bash
npm run build
```

The build artifacts will be stored in the `dist/` directory and can be served by any static file server.

## PWA Features

- Service Worker for offline functionality
- App manifest for installability
- Background sync for report queue
- Push notifications (future feature)

---

Part of the [Way-Share](../README.md) project.