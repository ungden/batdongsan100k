'use client';

import dynamic from 'next/dynamic';
import { Property } from '@/lib/types';

const MapView = dynamic(() => import('./MapView'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[calc(100vh-200px)] rounded-xl bg-surface-container flex items-center justify-center animate-pulse">
      <div className="text-center">
        <span className="material-symbols-outlined text-4xl text-outline mb-2">map</span>
        <p className="text-on-surface-variant font-medium">Đang tải bản đồ...</p>
      </div>
    </div>
  ),
});

interface MapContainerProps {
  properties: Property[];
  className?: string;
}

export default function MapContainer({ properties, className = "" }: MapContainerProps) {
  return (
    <div className={`w-full h-full ${className}`}>
      <MapView properties={properties} />
    </div>
  );
}
