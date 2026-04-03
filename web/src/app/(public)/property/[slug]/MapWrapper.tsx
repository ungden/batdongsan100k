"use client";

import dynamic from "next/dynamic";

const PropertyMap = dynamic(() => import("@/components/PropertyMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[400px] rounded-xl bg-gray-100 animate-pulse flex items-center justify-center">
      <span className="material-symbols-outlined text-4xl text-gray-400">map</span>
    </div>
  ),
});

interface MapWrapperProps {
  latitude: number;
  longitude: number;
  title: string;
  address: string;
}

export default function MapWrapper(props: MapWrapperProps) {
  return <PropertyMap {...props} />;
}
