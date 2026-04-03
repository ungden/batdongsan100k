'use client';

import { useState } from 'react';
import PropertyCard from '@/components/PropertyCard';
import MapContainer from '@/components/map/MapContainer';
import { Property } from '@/lib/types';

interface ListingViewToggleProps {
  properties: Property[];
}

export default function ListingViewToggle({ properties }: ListingViewToggleProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'map'>('grid');

  return (
    <div className="w-full flex flex-col h-full">
      {/* Sorting and View Toggles */}
      <div className="flex flex-col sm:flex-row items-center justify-between mb-6 gap-4">
        <div className="flex items-center gap-1 bg-surface-container-low p-1 rounded-lg">
          <button 
            onClick={() => setViewMode('grid')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md shadow-sm text-sm font-bold transition-all ${viewMode === 'grid' ? 'bg-white text-primary' : 'text-on-surface-variant hover:bg-white/50'}`}
          >
            <span className="material-symbols-outlined text-lg">grid_view</span>
            <span className="hidden sm:inline">Lưới</span>
          </button>
          <button 
            onClick={() => setViewMode('list')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md shadow-sm text-sm font-bold transition-all ${viewMode === 'list' ? 'bg-white text-primary' : 'text-on-surface-variant hover:bg-white/50'}`}
          >
            <span className="material-symbols-outlined text-lg">format_list_bulleted</span>
            <span className="hidden sm:inline">Danh sách</span>
          </button>
          <button 
            onClick={() => setViewMode('map')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md shadow-sm text-sm font-bold transition-all ${viewMode === 'map' ? 'bg-white text-primary' : 'text-on-surface-variant hover:bg-white/50'}`}
          >
            <span className="material-symbols-outlined text-lg">map</span>
            <span className="hidden sm:inline">Bản đồ</span>
          </button>
        </div>
      </div>

      {/* Content based on view mode */}
      <div className={`flex-1 ${viewMode === 'map' ? 'min-h-[700px]' : ''}`}>
        {properties.length > 0 ? (
          <>
            {viewMode === 'grid' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {properties.map((property, index) => (
                  <PropertyCard key={property.id} property={property} priority={index < 4} />
                ))}
              </div>
            )}
            
            {viewMode === 'list' && (
              <div className="flex flex-col gap-6">
                {properties.map((property, index) => (
                  <div key={property.id} className="h-auto md:h-64">
                    <PropertyCard property={property} layout="list" priority={index < 4} />
                  </div>
                ))}
              </div>
            )}
            
            {viewMode === 'map' && (
              <div className="w-full h-full min-h-[700px] bg-white rounded-xl shadow-sm border border-outline-variant/20 p-2 relative overflow-hidden z-0">
                <MapContainer properties={properties} />
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-20 bg-surface-container-lowest rounded-xl border border-outline-variant/20">
            <span className="material-symbols-outlined text-6xl text-outline mb-4">search_off</span>
            <p className="text-xl font-bold text-on-surface mb-2">Không tìm thấy kết quả</p>
            <p className="text-on-surface-variant">Hãy thử thay đổi bộ lọc để xem thêm bất động sản</p>
          </div>
        )}
      </div>
    </div>
  );
}