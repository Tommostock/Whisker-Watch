/**
 * MapEngine Component
 * Custom canvas-based map with Mercator projection
 * Handles rendering, clustering, heatmap, and user interactions
 */

'use client';

import React, { useEffect, useRef, useState, useCallback, useImperativeHandle } from 'react';
import { Incident } from '@/lib/types';
import {
  latLngToPixel,
  pixelToLatLng,
  getTilesToLoad,
  getTileUrl,
  clusterIncidents,
  pixelDistance,
  fitBounds,
  clampZoom,
  easeZoom,
  easePosition,
  PixelCoords,
  LatLng,
  MapState,
  Cluster,
} from '@/lib/mapMath';
import {
  TILE_SIZE,
  MIN_ZOOM,
  MAX_ZOOM,
  RENDER_INTERVALS,
  INTERACTION_TIMEOUT,
  CLUSTER_ZOOM_THRESHOLD,
  CLUSTER_RADIUS,
  HEATMAP_RADIUS,
  STATUS_COLORS,
  MOBILE_WIDTH_BREAKPOINT,
} from '@/lib/constants';

interface MapEngineProps {
  incidents: Incident[];
  selectedIncidentId?: string;
  onMapClick?: (lat: number, lng: number) => void;
  onIncidentClick?: (incidentId: string) => void;
  onMapStateChange?: (state: MapState) => void;
  showHeatmap?: boolean;
  showSatellite?: boolean;
}

interface MapEngineRef {
  flyTo: (lat: number, lng: number, zoom?: number) => void;
  fitAll: () => void;
  getMapState: () => MapState;
  setMapState: (state: MapState) => void;
}

/**
 * MapEngine - Custom canvas-based map renderer
 *
 * Features:
 * - Web Mercator projection
 * - CARTO/OSM tile rendering
 * - Pin clustering
 * - Heatmap overlay
 * - Satellite imagery
 * - Pan and zoom interactions
 * - Performance optimized rendering
 */
export const MapEngine = React.forwardRef<MapEngineRef, MapEngineProps>(
  (
    {
      incidents,
      selectedIncidentId,
      onMapClick,
      onIncidentClick,
      onMapStateChange,
      showHeatmap = true,
      showSatellite = false,
    },
    ref
  ) => {
    // Canvas references
    const mapCanvasRef = useRef<HTMLCanvasElement>(null);
    const heatCanvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // Map state
    const [mapState, setMapStateLocal] = useState<MapState>({
      lat: 51.505,
      lng: -0.09,
      zoom: 11,
    });

    // Interaction state
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState<PixelCoords | null>(null);
    const [isUserInteracting, setIsUserInteracting] = useState(false);

    // Performance state
    const [renderPending, setRenderPending] = useState(false);
    const lastRenderTimeRef = useRef(0);
    const interactionTimeoutRef = useRef<NodeJS.Timeout>();

    // Tile cache
    const tileCacheRef = useRef<Map<string, Promise<HTMLImageElement>>>(new Map());

    // Animation state
    const animationRef = useRef<{
      fromState: MapState;
      toState: MapState;
      startTime: number;
      duration: number;
    } | null>(null);

    // Utility function to set map state and notify listeners
    const setMapState = useCallback((newState: MapState) => {
      setMapStateLocal(newState);
      onMapStateChange?.(newState);
    }, [onMapStateChange]);

    // Mark user as interacting
    const markUserInteracting = useCallback(() => {
      setIsUserInteracting(true);
      clearTimeout(interactionTimeoutRef.current);
      interactionTimeoutRef.current = setTimeout(() => {
        setIsUserInteracting(false);
      }, INTERACTION_TIMEOUT);
    }, []);

    // Load tile image with caching
    const loadTile = useCallback((url: string): Promise<HTMLImageElement> => {
      const cached = tileCacheRef.current.get(url);
      if (cached) return cached;

      const promise = new Promise<HTMLImageElement>((resolve) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => resolve(img);
        img.onerror = () => {
          // Fallback to OSM
          const fallback = new Image();
          fallback.crossOrigin = 'anonymous';
          const parts = url.match(/\/(\d+)\/(\d+)\/(\d+)\.png$/);
          if (parts) {
            fallback.onload = () => resolve(fallback);
            fallback.src = `https://tile.openstreetmap.org/${parts[1]}/${parts[2]}/${parts[3]}.png`;
          } else {
            resolve(img); // Return blank
          }
        };
        img.src = url;
      });

      tileCacheRef.current.set(url, promise);

      // Clean up cache if too large
      if (tileCacheRef.current.size > 400) {
        const firstKey = tileCacheRef.current.keys().next().value;
        tileCacheRef.current.delete(firstKey);
      }

      return promise;
    }, []);

    // Render function
    const render = useCallback(() => {
      const canvas = mapCanvasRef.current;
      const heatCanvas = heatCanvasRef.current;
      if (!canvas || !heatCanvas) return;

      const ctx = canvas.getContext('2d');
      const heatCtx = heatCanvas.getContext('2d');
      if (!ctx || !heatCtx) return;

      const width = canvas.width;
      const height = canvas.height;

      // Clear canvases
      ctx.fillStyle = '#1a1a1a';
      ctx.fillRect(0, 0, width, height);
      heatCtx.clearRect(0, 0, width, height);

      // Get tiles to render
      const tiles = getTilesToLoad(mapState, width, height);

      // Load and render tiles
      tiles.forEach((tile) => {
        const variant = showSatellite
          ? 'satellite'
          : document.body.classList.contains('light-mode')
            ? 'light_all'
            : 'dark_all';

        const url = getTileUrl(tile.x, tile.y, tile.z, variant);

        loadTile(url).then((img) => {
          if (!img) return;

          const pixelX = (tile.x * TILE_SIZE - lng2x(mapState.lng, mapState.zoom)) + width / 2;
          const pixelY = (tile.y * TILE_SIZE - lat2y(mapState.lat, mapState.zoom)) + height / 2;

          ctx.drawImage(img, pixelX, pixelY, TILE_SIZE, TILE_SIZE);
        });
      });

      // Render heatmap if enabled
      if (showHeatmap && incidents.length > 0) {
        renderHeatmap(heatCtx, width, height);
      }

      // Render clusters and pins
      renderIncidents(ctx, width, height);

      lastRenderTimeRef.current = Date.now();
      setRenderPending(false);
    }, [mapState, incidents, showHeatmap, showSatellite, loadTile]);

    // Heatmap rendering
    const renderHeatmap = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
      // Simple heatmap: draw semi-transparent circles for each incident
      incidents.forEach((incident) => {
        const pixel = latLngToPixel(
          incident.lat,
          incident.lng,
          mapState,
          width,
          height
        );

        if (pixel.x < 0 || pixel.x > width || pixel.y < 0 || pixel.y > height) return;

        // Draw gradient circle
        const gradient = ctx.createRadialGradient(
          pixel.x,
          pixel.y,
          0,
          pixel.x,
          pixel.y,
          HEATMAP_RADIUS
        );

        const color = STATUS_COLORS[incident.status] || '#ff0000';
        gradient.addColorStop(0, `${color}40`); // 25% opacity
        gradient.addColorStop(1, `${color}00`); // Transparent

        ctx.fillStyle = gradient;
        ctx.fillRect(
          pixel.x - HEATMAP_RADIUS,
          pixel.y - HEATMAP_RADIUS,
          HEATMAP_RADIUS * 2,
          HEATMAP_RADIUS * 2
        );
      });
    };

    // Incident rendering (pins and clusters)
    const renderIncidents = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
      // Cluster incidents
      const clustered = clusterIncidents(
        incidents.map((i) => ({ id: i.id, lat: i.lat, lng: i.lng })),
        mapState,
        width,
        height,
        CLUSTER_RADIUS
      );

      clustered.forEach((item) => {
        const isCluster = 'count' in item && item.count > 1;
        const pixel = latLngToPixel(item.lat, item.lng, mapState, width, height);

        if (pixel.x < 0 || pixel.x > width || pixel.y < 0 || pixel.y > height) return;

        if (isCluster) {
          // Draw cluster circle
          const cluster = item as Cluster;
          const size = 20 + Math.log(cluster.count) * 5;
          ctx.fillStyle = '#e63946';
          ctx.beginPath();
          ctx.arc(pixel.x, pixel.y, size, 0, Math.PI * 2);
          ctx.fill();

          // Draw count text
          ctx.fillStyle = 'white';
          ctx.font = 'bold 12px Inter';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(String(cluster.count), pixel.x, pixel.y);
        } else {
          // Draw incident pin
          const incident = incidents.find((i) => i.id === item.id);
          if (!incident) return;

          const color = STATUS_COLORS[incident.status] || '#ff0000';
          const isSelected = incident.id === selectedIncidentId;

          // Pin circle
          ctx.fillStyle = color;
          ctx.beginPath();
          ctx.arc(pixel.x, pixel.y, isSelected ? 8 : 6, 0, Math.PI * 2);
          ctx.fill();

          // Selection ring
          if (isSelected) {
            ctx.strokeStyle = color;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(pixel.x, pixel.y, 10, 0, Math.PI * 2);
            ctx.stroke();
          }
        }
      });
    };

    // Schedule render
    const scheduleRender = useCallback(() => {
      if (renderPending) return;

      const now = Date.now();
      const timeSinceLastRender = now - lastRenderTimeRef.current;

      const targetInterval = isUserInteracting
        ? RENDER_INTERVALS.active
        : window.innerWidth <= MOBILE_WIDTH_BREAKPOINT
          ? RENDER_INTERVALS.idle_mobile
          : RENDER_INTERVALS.idle_desktop;

      if (timeSinceLastRender >= targetInterval) {
        setRenderPending(true);
        requestAnimationFrame(render);
      } else {
        setRenderPending(true);
        setTimeout(() => {
          requestAnimationFrame(render);
        }, targetInterval - timeSinceLastRender);
      }
    }, [render, renderPending, isUserInteracting]);

    // Animation loop
    useEffect(() => {
      if (!animationRef.current) return;

      const animate = () => {
        const anim = animationRef.current;
        if (!anim) return;

        const elapsed = Date.now() - anim.startTime;
        const progress = Math.min(elapsed / anim.duration, 1);

        const newLat = anim.fromState.lat + (anim.toState.lat - anim.fromState.lat) * progress;
        const newLng = anim.fromState.lng + (anim.toState.lng - anim.fromState.lng) * progress;
        const newZoom = easeZoom(anim.fromState.zoom, anim.toState.zoom, progress);

        setMapState({ lat: newLat, lng: newLng, zoom: clampZoom(newZoom) });
        scheduleRender();

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          animationRef.current = null;
        }
      };

      requestAnimationFrame(animate);
    }, [scheduleRender, setMapState]);

    // Render on state change
    useEffect(() => {
      scheduleRender();
    }, [mapState, incidents, showHeatmap, showSatellite, selectedIncidentId, scheduleRender]);

    // Mouse events
    const handleMouseDown = (e: React.MouseEvent) => {
      markUserInteracting();
      setIsDragging(true);
      setDragStart({ x: e.clientX, y: e.clientY });
    };

    const handleMouseMove = (e: React.MouseEvent) => {
      if (!isDragging || !dragStart) return;

      markUserInteracting();
      const canvas = mapCanvasRef.current;
      if (!canvas) return;

      const dx = e.clientX - dragStart.x;
      const dy = e.clientY - dragStart.y;

      const pixelsPerLat = lat2y(mapState.lat + 1, mapState.zoom) - lat2y(mapState.lat, mapState.zoom);
      const pixelsPerLng = lng2x(mapState.lng + 1, mapState.zoom) - lng2x(mapState.lng, mapState.zoom);

      const newLat = mapState.lat - dy / pixelsPerLat;
      const newLng = mapState.lng - dx / pixelsPerLng;

      setMapState({ ...mapState, lat: newLat, lng: newLng });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setDragStart(null);
    };

    const handleWheel = (e: React.WheelEvent) => {
      e.preventDefault();
      markUserInteracting();

      const zoomDelta = e.deltaY > 0 ? -1 : 1;
      const newZoom = clampZoom(mapState.zoom + zoomDelta);

      setMapState({ ...mapState, zoom: newZoom });
    };

    const handleClick = (e: React.MouseEvent) => {
      if (isDragging) return;

      const canvas = mapCanvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const { lat, lng } = pixelToLatLng(x, y, mapState, canvas.width, canvas.height);

      // Check if clicking on a pin
      const clustered = clusterIncidents(
        incidents.map((i) => ({ id: i.id, lat: i.lat, lng: i.lng })),
        mapState,
        canvas.width,
        canvas.height,
        CLUSTER_RADIUS
      );

      for (const item of clustered) {
        if (!('count' in item)) {
          const pixel = latLngToPixel(item.lat, item.lng, mapState, canvas.width, canvas.height);
          const dist = pixelDistance({ x, y }, pixel);
          if (dist < 10) {
            onIncidentClick?.(item.id);
            return;
          }
        }
      }

      onMapClick?.(lat, lng);
    };

    // Resize observer
    useEffect(() => {
      const container = containerRef.current;
      const mapCanvas = mapCanvasRef.current;
      const heatCanvas = heatCanvasRef.current;

      if (!container || !mapCanvas || !heatCanvas) return;

      const resizeObserver = new ResizeObserver(() => {
        const { width, height } = container.getBoundingClientRect();
        mapCanvas.width = width;
        mapCanvas.height = height;
        heatCanvas.width = width;
        heatCanvas.height = height;
        scheduleRender();
      });

      resizeObserver.observe(container);
      return () => resizeObserver.disconnect();
    }, [scheduleRender]);

    // Expose methods via ref
    useImperativeHandle(
      ref,
      () => ({
        flyTo: (lat: number, lng: number, zoom = 13) => {
          animationRef.current = {
            fromState: mapState,
            toState: { lat, lng, zoom: clampZoom(zoom) },
            startTime: Date.now(),
            duration: 1000,
          };
        },
        fitAll: () => {
          if (incidents.length === 0) return;
          const canvas = mapCanvasRef.current;
          if (!canvas) return;

          const bounds = fitBounds(
            incidents.map((i) => ({ lat: i.lat, lng: i.lng })),
            canvas.width,
            canvas.height
          );

          animationRef.current = {
            fromState: mapState,
            toState: bounds,
            startTime: Date.now(),
            duration: 1000,
          };
        },
        getMapState: () => mapState,
        setMapState,
      }),
      [mapState, incidents, setMapState]
    );

    // Import mercator functions
    const lng2x = (lng: number, z: number) =>
      ((lng + 180) / 360) * Math.pow(2, z) * TILE_SIZE;
    const lat2y = (lat: number, z: number) => {
      const r = (lat * Math.PI) / 180;
      return ((1 - Math.log(Math.tan(r) + 1 / Math.cos(r)) / Math.PI) / 2) *
        Math.pow(2, z) *
        TILE_SIZE;
    };

    return (
      <div
        ref={containerRef}
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          overflow: 'hidden',
          backgroundColor: '#1a1a1a',
          cursor: isDragging ? 'grabbing' : 'grab',
        }}
      >
        <canvas
          ref={mapCanvasRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onWheel={handleWheel}
          onClick={handleClick}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            display: 'block',
          }}
        />
        <canvas
          ref={heatCanvasRef}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            display: 'block',
            pointerEvents: 'none',
          }}
        />
      </div>
    );
  }
);

MapEngine.displayName = 'MapEngine';
