'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Property } from '@/lib/types';
import { useRouter } from 'next/navigation';

interface MapViewProps {
  properties: Property[];
  center?: [number, number];
  zoom?: number;
}

const TYPE_LABELS: Record<string, string> = {
  "biet-thu": "Biệt thự",
  "chung-cu": "Căn hộ",
  "nha-pho": "Nhà phố",
  "dat-nen": "Đất nền",
  "phong-tro": "Phòng trọ",
  "van-phong": "Văn phòng",
  "kho-xuong": "Kho xưởng",
};

const TYPE_COLORS: Record<string, string> = {
  "biet-thu": "#d97706", // amber-600
  "chung-cu": "#2563eb", // blue-600
  "nha-pho": "#059669", // emerald-600
  "dat-nen": "#f97316", // orange-500
  "phong-tro": "#a855f7", // purple-500
  "van-phong": "#0d9488", // teal-600
  "kho-xuong": "#475569", // slate-600
};

export default function MapView({ properties, center = [10.762622, 106.660172], zoom = 12 }: MapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (typeof window === 'undefined' || !mapRef.current) return;

    // Initialize map if not exists
    if (!mapInstanceRef.current) {
      mapInstanceRef.current = L.map(mapRef.current).setView(center, zoom);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
      }).addTo(mapInstanceRef.current);
    }

    const map = mapInstanceRef.current;

    // Clear existing markers
    map.eachLayer((layer) => {
      if (layer instanceof L.Marker) {
        map.removeLayer(layer);
      }
    });

    // Calculate bounds if we have properties with coordinates
    const markers: L.LatLng[] = [];

    // Add markers for properties with coordinates
    properties.forEach((property) => {
      if (property.latitude && property.longitude) {
        const latLng = L.latLng(property.latitude, property.longitude);
        markers.push(latLng);

        const typeColor = TYPE_COLORS[property.type] || "#475569";
        
        // Format price for marker
        let shortPrice = "";
        if (property.category === "rent") {
          if (property.price >= 1000000) shortPrice = `${Math.round(property.price / 1000000)} Tr/th`;
          else shortPrice = `${property.price / 1000}K`;
        } else {
          if (property.price >= 1000000000) shortPrice = `${(property.price / 1000000000).toFixed(1).replace(/\.0$/, "")} Tỷ`;
          else shortPrice = `${Math.round(property.price / 1000000)} Tr`;
        }

        // Create custom price marker
        const icon = L.divIcon({
          className: 'custom-div-icon',
          html: `
            <div style="background-color: ${typeColor}; color: white; padding: 4px 8px; border-radius: 8px; font-weight: bold; font-size: 12px; white-space: nowrap; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); position: relative; border: 2px solid white;">
              ${shortPrice}
              <div style="position: absolute; bottom: -6px; left: 50%; transform: translateX(-50%); width: 0; height: 0; border-left: 6px solid transparent; border-right: 6px solid transparent; border-top: 6px solid white;"></div>
              <div style="position: absolute; bottom: -4px; left: 50%; transform: translateX(-50%); width: 0; height: 0; border-left: 4px solid transparent; border-right: 4px solid transparent; border-top: 4px solid ${typeColor};"></div>
            </div>
          `,
          iconSize: [60, 24],
          iconAnchor: [30, 28],
          popupAnchor: [0, -30],
        });

        const marker = L.marker(latLng, { icon }).addTo(map);

        // Create popup content
        const popupContent = document.createElement('div');
        popupContent.className = 'w-64 p-0 m-0';
        popupContent.innerHTML = `
          <div class="relative h-32 w-full mb-2">
            <img src="${property.images[0] || '/placeholder.jpg'}" class="w-full h-full object-cover rounded-t-lg" alt="${property.title}" />
            <div class="absolute top-2 left-2 bg-[${typeColor}] text-white text-[10px] font-bold px-2 py-1 rounded shadow-sm">
              ${TYPE_LABELS[property.type] || property.type}
            </div>
            <div class="absolute bottom-2 right-2 bg-black/70 text-white text-xs font-bold px-2 py-1 rounded">
              ${shortPrice}
            </div>
          </div>
          <div class="p-2 pt-0 pb-3">
            <h3 class="font-bold text-sm leading-tight text-[#001e40] line-clamp-2 mb-1 hover:text-[#006c47] transition-colors cursor-pointer" id="title-${property.id}">${property.title}</h3>
            <p class="text-xs text-gray-500 mb-2 truncate">${property.district}, ${property.city}</p>
            <div class="flex items-center gap-3 text-xs text-gray-600">
              ${property.bedrooms > 0 ? `<span><span class="material-symbols-outlined text-[14px] align-middle">bed</span> ${property.bedrooms}</span>` : ''}
              ${property.bathrooms > 0 ? `<span><span class="material-symbols-outlined text-[14px] align-middle">shower</span> ${property.bathrooms}</span>` : ''}
              <span><span class="material-symbols-outlined text-[14px] align-middle">square_foot</span> ${property.area}m²</span>
            </div>
          </div>
        `;

        // Add click event to title in popup
        marker.bindPopup(popupContent, {
          closeButton: false,
          className: 'property-popup',
          minWidth: 256,
        });

        marker.on('popupopen', () => {
          const titleEl = document.getElementById(`title-${property.id}`);
          if (titleEl) {
            titleEl.onclick = () => {
              router.push(`/property/${property.slug}`);
            };
          }
        });
      }
    });

    // Auto fit bounds if markers exist
    if (markers.length > 0) {
      const bounds = L.latLngBounds(markers);
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
    }

    // Add global styles for popup if not exists
    if (!document.getElementById('map-popup-styles')) {
      const style = document.createElement('style');
      style.id = 'map-popup-styles';
      style.innerHTML = `
        .property-popup .leaflet-popup-content-wrapper {
          padding: 0;
          overflow: hidden;
          border-radius: 0.5rem;
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
        }
        .property-popup .leaflet-popup-content {
          margin: 0;
          width: 256px !important;
        }
        .property-popup .leaflet-popup-tip-container {
          margin-top: -1px;
        }
      `;
      document.head.appendChild(style);
    }

  }, [properties, center, zoom, router]);

  return (
    <div 
      ref={mapRef} 
      className="w-full h-full rounded-xl overflow-hidden shadow-sm border border-outline-variant/20 z-0 relative"
    />
  );
}