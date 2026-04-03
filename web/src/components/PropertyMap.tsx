"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface PropertyMapProps {
  latitude: number;
  longitude: number;
  title: string;
  address: string;
}

export default function PropertyMap({
  latitude,
  longitude,
  title,
  address,
}: PropertyMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const map = L.map(mapRef.current).setView([latitude, longitude], 15);
    mapInstanceRef.current = map;

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors",
      maxZoom: 19,
    }).addTo(map);

    const icon = L.divIcon({
      html: `<div style="background:#001e40;color:white;width:36px;height:36px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:18px;box-shadow:0 2px 8px rgba(0,0,0,0.3);border:3px solid white;">
        <span style="font-family:'Material Symbols Outlined';font-size:20px;">location_on</span>
      </div>`,
      className: "",
      iconSize: [36, 36],
      iconAnchor: [18, 36],
      popupAnchor: [0, -36],
    });

    L.marker([latitude, longitude], { icon })
      .addTo(map)
      .bindPopup(
        `<div style="font-family:'Be Vietnam Pro',sans-serif;padding:4px 0;">
          <strong style="color:#001e40;font-size:14px;">${title}</strong>
          <br/>
          <span style="color:#666;font-size:12px;">${address}</span>
        </div>`,
        { maxWidth: 250 }
      )
      .openPopup();

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [latitude, longitude, title, address]);

  return (
    <div
      ref={mapRef}
      className="w-full h-[400px] rounded-xl overflow-hidden shadow-sm border border-outline-variant/20"
      style={{ zIndex: 0 }}
    />
  );
}
