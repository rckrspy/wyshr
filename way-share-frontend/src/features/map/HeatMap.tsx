import React, { useEffect, useRef, useState } from 'react';
import { Box, Typography, Alert } from '@mui/material';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { HeatMapData } from '../../types';

// MapLibre GL JS doesn't require an access token

interface HeatMapProps {
  data?: HeatMapData;
}

const HeatMap: React.FC<HeatMapProps> = ({ data }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const [mapError, setMapError] = useState<string | null>(null);

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    try {
      // Use OpenStreetMap tiles as the base layer
      const mapStyle = {
        version: 8 as const,
        sources: {
          'osm-tiles': {
            type: 'raster' as const,
            tiles: [
              'https://tile.openstreetmap.org/{z}/{x}/{y}.png'
            ],
            tileSize: 256,
            attribution: '© OpenStreetMap contributors'
          }
        },
        layers: [{
          id: 'osm-tiles',
          type: 'raster' as const,
          source: 'osm-tiles',
          minzoom: 0,
          maxzoom: 19
        }]
      };

      // Initialize map centered on San Jose
      map.current = new maplibregl.Map({
        container: mapContainer.current,
        style: mapStyle,
        center: [-121.8863, 37.3382], // San Jose coordinates
        zoom: 11,
        pitch: 0,
        bearing: 0,
      });

      map.current.on('load', () => {
        if (!map.current) return;

        // Add navigation controls
        map.current.addControl(new maplibregl.NavigationControl(), 'top-right');

        // Add fullscreen control
        map.current.addControl(new maplibregl.FullscreenControl(), 'top-right');

        // Set bounds to San Jose area
        const bounds: maplibregl.LngLatBoundsLike = [
          [-122.2, 37.0], // Southwest
          [-121.6, 37.5], // Northeast
        ];
        map.current.setMaxBounds(bounds);
      });

      map.current.on('error', (e) => {
        console.error('Map error:', e);
        setMapError('Failed to load map. Please check your connection.');
      });
    } catch (error) {
      console.error('Error initializing map:', error);
      setMapError('Failed to initialize map.');
    }

    // Cleanup
    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!map.current || !data?.points) return;

    const addHeatmapLayers = () => {
      if (!map.current) return;

      // Remove existing heat map layer and source if they exist
      if (map.current.getLayer('heatmap-layer')) {
        map.current.removeLayer('heatmap-layer');
      }
      if (map.current.getLayer('heatmap-points')) {
        map.current.removeLayer('heatmap-points');
      }
      if (map.current.getSource('heatmap-source')) {
        map.current.removeSource('heatmap-source');
      }

      // Convert data to GeoJSON format
      const geojsonData: GeoJSON.FeatureCollection = {
        type: 'FeatureCollection',
        features: data.points.map((point) => ({
          type: 'Feature',
          properties: {
            count: point.count,
          },
          geometry: {
            type: 'Point',
            coordinates: [point.lng, point.lat],
          },
        })),
      };

      // Add heat map source
      map.current.addSource('heatmap-source', {
        type: 'geojson',
        data: geojsonData,
      });

      // Add heat map layer
      map.current.addLayer({
        id: 'heatmap-layer',
        type: 'heatmap',
        source: 'heatmap-source',
        paint: {
          // Increase weight based on count
          'heatmap-weight': [
            'interpolate',
            ['linear'],
            ['get', 'count'],
            0, 0,
            10, 1,
          ],
          // Color ramp for heatmap
          'heatmap-color': [
            'interpolate',
            ['linear'],
            ['heatmap-density'],
            0, 'rgba(33,102,172,0)',
            0.2, 'rgb(103,169,207)',
            0.4, 'rgb(209,229,240)',
            0.6, 'rgb(253,219,199)',
            0.8, 'rgb(239,138,98)',
            1, 'rgb(178,24,43)',
          ],
          // Adjust radius based on zoom
          'heatmap-radius': [
            'interpolate',
            ['linear'],
            ['zoom'],
            0, 2,
            9, 20,
            22, 60,
          ],
          // Transition from heatmap to points at high zoom
          'heatmap-opacity': [
            'interpolate',
            ['linear'],
            ['zoom'],
            7, 1,
            15, 0.8,
          ],
        },
      });

      // Add point layer for high zoom levels
      map.current.addLayer({
        id: 'heatmap-points',
        type: 'circle',
        source: 'heatmap-source',
        minzoom: 14,
        paint: {
          'circle-radius': [
            'interpolate',
            ['linear'],
            ['get', 'count'],
            1, 5,
            10, 10,
            50, 20,
          ],
          'circle-color': [
            'interpolate',
            ['linear'],
            ['get', 'count'],
            1, 'rgb(253,219,199)',
            5, 'rgb(239,138,98)',
            10, 'rgb(178,24,43)',
          ],
          'circle-stroke-color': 'white',
          'circle-stroke-width': 1,
          'circle-opacity': [
            'interpolate',
            ['linear'],
            ['zoom'],
            14, 0,
            15, 1,
          ],
        },
      });

      // Add popup on click
      map.current.on('click', 'heatmap-points', (e) => {
        if (!e.features || !e.features[0]) return;

        const feature = e.features[0];
        const coordinates = (feature.geometry as GeoJSON.Point).coordinates.slice();
        const count = feature.properties?.count || 0;

        new maplibregl.Popup()
          .setLngLat(coordinates as [number, number])
          .setHTML(`<strong>${count} incident${count > 1 ? 's' : ''}</strong><br/>at this location`)
          .addTo(map.current!);
      });

      // Change cursor on hover
      map.current.on('mouseenter', 'heatmap-points', () => {
        if (map.current) map.current.getCanvas().style.cursor = 'pointer';
      });

      map.current.on('mouseleave', 'heatmap-points', () => {
        if (map.current) map.current.getCanvas().style.cursor = '';
      });
    };

    // Check if style is loaded
    if (map.current.isStyleLoaded()) {
      addHeatmapLayers();
    } else {
      // Wait for style to load
      map.current.once('style.load', addHeatmapLayers);
    }
  }, [data]);

  if (mapError) {
    return (
      <Box sx={{ p: 3, height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Alert severity="error">
          <Typography>{mapError}</Typography>
        </Alert>
      </Box>
    );
  }

  // Remove the token check since we now have OpenStreetMap fallback

  return (
    <Box
      ref={mapContainer}
      sx={{
        width: '100%',
        height: '100%',
        minHeight: 400,
        maxHeight: 'calc(100vh - 300px)',
        position: 'relative',
      }}
    />
  );
};

export default HeatMap;