import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
// import { VitePWA } from 'vite-plugin-pwa';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // PWA Configuration (enable when dependency is available)
    // VitePWA configuration is commented out due to current dependency conflicts
    // Uncomment and configure when vite-plugin-pwa is compatible with current Vite version
  ],
  cacheDir: '/tmp/vite-cache',
  server: {
    port: 5173,
    host: true, // Enable network access for testing on devices
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'mui-core': ['@mui/material', '@emotion/react', '@emotion/styled'],
          'mui-icons': ['@mui/icons-material'],
          'redux-toolkit': ['@reduxjs/toolkit', 'react-redux'],
          
          // Feature chunks
          'maps': ['maplibre-gl'],
          'stripe': ['@stripe/react-stripe-js', '@stripe/stripe-js'],
          
          // Utility chunks
          'date-utils': ['date-fns'],
        },
      },
    },
    target: 'es2020',
    chunkSizeWarningLimit: 600,
    sourcemap: false, // Disable in production for smaller builds
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      '@mui/material',
      '@emotion/react',
      '@emotion/styled',
    ],
  },
});