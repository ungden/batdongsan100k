export interface Property {
  id: string;
  title: string;
  slug: string;
  price: number;
  priceFormatted: string;
  priceUnit: 'tỷ' | 'triệu' | 'triệu/tháng';
  type: PropertyType;
  category: 'sale' | 'rent';
  address: string;
  district: string;
  city: string;
  bedrooms: number;
  bathrooms: number;
  area: number;
  floor?: number;
  direction?: string;
  description: string;
  images: string[];
  features: string[];
  agent: Agent;
  status: PropertyStatus;
  authorId: string;
  createdAt: string;
  updatedAt: string;
  isFeatured: boolean;
  latitude?: number;
  longitude?: number;
  priorityLevel?: number;
  sortDate?: string;
}

export type PropertyStatus = 'draft' | 'published' | 'sold' | 'rented' | 'hidden';

export type PropertyType = 'chung-cu' | 'nha-pho' | 'biet-thu' | 'dat-nen' | 'phong-tro' | 'van-phong' | 'kho-xuong';

export interface PropertyTypeInfo {
  value: PropertyType;
  label: string;
  icon: string;
}

export interface Agent {
  id: string;
  name: string;
  phone: string;
  email: string;
  avatar: string;
}

export interface SearchFilters {
  keyword?: string;
  type?: PropertyType;
  category?: 'sale' | 'rent';
  city?: string;
  district?: string;
  priceMin?: number;
  priceMax?: number;
  areaMin?: number;
  areaMax?: number;
  bedrooms?: number;
}

export const PROPERTY_TYPES: PropertyTypeInfo[] = [
  { value: 'chung-cu', label: 'Chung cư', icon: '🏢' },
  { value: 'nha-pho', label: 'Nhà phố', icon: '🏠' },
  { value: 'biet-thu', label: 'Biệt thự', icon: '🏡' },
  { value: 'dat-nen', label: 'Đất nền', icon: '🗺️' },
  { value: 'phong-tro', label: 'Phòng trọ', icon: '🏘️' },
  { value: 'van-phong', label: 'Văn phòng', icon: '🏬' },
  { value: 'kho-xuong', label: 'Kho/Nhà xưởng', icon: '🏭' },
];

export const CITIES = [
  'Hồ Chí Minh',
  'Hà Nội',
  'Đà Nẵng',
  'Bình Dương',
  'Đồng Nai',
  'Khánh Hòa',
  'Hải Phòng',
  'Cần Thơ',
  'Bà Rịa Vũng Tàu',
  'Long An',
];

export const FEATURES_LIST = [
  'Bãi đỗ xe', 'Hồ bơi', 'Phòng gym', 'Bảo vệ 24/7',
  'Thang máy', 'Ban công', 'Sân vườn', 'Gara ô tô',
  'Điều hòa', 'Nội thất cao cấp', 'View sông', 'Gần trường học',
];
