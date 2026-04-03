export const dynamic = "force-dynamic";

import Link from "next/link";
import { Suspense } from "react";
import PropertyCard from "@/components/PropertyCard";
import { getPublishedProperties } from "@/lib/queries/properties";
import ListingsSidebar from "@/components/ListingsSidebar";

const ITEMS_PER_PAGE = 12;

interface ListingsPageProps {
  searchParams: Promise<{
    q?: string;
    type?: string;
    city?: string;
    district?: string;
    category?: string;
    direction?: string;
    feature?: string;
    bedrooms?: string;
    bathrooms?: string;
    area?: string;
    price?: string;
    sort?: string;
    page?: string;
  }>;
}

export default async function ListingsPage({ searchParams }: ListingsPageProps) {
  const params = await searchParams;
  const currentPage = Math.max(1, parseInt(params.page || "1", 10));
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;

  const filters: {
    q?: string;
    type?: string;
    city?: string;
    district?: string;
    category?: string;
    direction?: string;
    feature?: string;
    bedroomsMin?: number;
    bathroomsMin?: number;
    areaMin?: number;
    areaMax?: number;
    priceMin?: number;
    priceMax?: number;
    sort?: 'latest' | 'price_asc' | 'price_desc' | 'area_desc';
  } = {};
  
  if (params.q) filters.q = params.q;
  if (params.type) filters.type = params.type;
  if (params.city) filters.city = params.city;
  if (params.district) filters.district = params.district;
  if (params.category) filters.category = params.category;
  if (params.direction) filters.direction = params.direction;
  if (params.feature) filters.feature = params.feature;
  if (params.bedrooms) filters.bedroomsMin = Number(params.bedrooms) || undefined;
  if (params.bathrooms) filters.bathroomsMin = Number(params.bathrooms) || undefined;
  
  if (params.price) {
    const [min, max] = params.price.split("-").map(Number);
    if (Number.isFinite(min) && min >= 0) filters.priceMin = min;
    if (Number.isFinite(max) && max > 0) filters.priceMax = max;
  }
  
  if (params.area) {
    const [min, max] = params.area.split('-').map(Number);
    if (Number.isFinite(min) && min >= 0) filters.areaMin = min;
    if (Number.isFinite(max) && max > 0) filters.areaMax = max;
  }
  
  filters.sort = (params.sort as 'latest' | 'price_asc' | 'price_desc' | 'area_desc') || 'latest';

  const { properties, count } = await getPublishedProperties(filters, ITEMS_PER_PAGE, offset);
  const totalPages = Math.max(1, Math.ceil(count / ITEMS_PER_PAGE));

  function buildQuery(overrides: Record<string, string | undefined>) {
    const sp = new URLSearchParams();
    const next = {
      q: params.q,
      type: params.type,
      city: params.city,
      district: params.district,
      category: params.category,
      direction: params.direction,
      feature: params.feature,
      bedrooms: params.bedrooms,
      bathrooms: params.bathrooms,
      area: params.area,
      price: params.price,
      sort: params.sort,
      ...overrides,
    };

    Object.entries(next).forEach(([key, value]) => {
      if (value) sp.set(key, value);
    });
    return sp;
  }

  // Build URL for pagination links
  function pageUrl(page: number) {
    const sp = buildQuery({});
    sp.set("page", String(page));
    return `/listings?${sp.toString()}`;
  }

  // Generate page numbers to display
  const pageNumbers: (number | "...")[] = [];
  if (totalPages <= 5) {
    for (let i = 1; i <= totalPages; i++) pageNumbers.push(i);
  } else {
    pageNumbers.push(1);
    if (currentPage > 3) pageNumbers.push("...");
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
      pageNumbers.push(i);
    }
    if (currentPage < totalPages - 2) pageNumbers.push("...");
    pageNumbers.push(totalPages);
  }

  return (
    <div className="pt-24 pb-16 min-h-screen">
      <div className="max-w-7xl mx-auto px-8">
        {/* Breadcrumb */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-xs font-label tracking-widest uppercase text-on-surface-variant mb-4">
            <span>Vietnam</span>
            <span className="material-symbols-outlined text-xs">chevron_right</span>
            <span>{params.city || "Tất cả"}</span>
            {params.type && (
              <>
                <span className="material-symbols-outlined text-xs">chevron_right</span>
                <span className="text-primary font-bold">{params.type}</span>
              </>
            )}
          </div>
          <h1 className="text-4xl font-headline font-extrabold tracking-tighter text-on-surface mb-2">
            Bất động sản {params.city ? `tại ${params.city}` : "toàn quốc"}
          </h1>
          <p className="text-on-surface-variant">
            Tìm thấy {count} kết quả phù hợp với nhu cầu của bạn
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Sidebar: Filters */}
          <Suspense fallback={<div className="w-full lg:w-72 flex-shrink-0 animate-pulse bg-surface-container-lowest h-[800px] rounded-xl border border-outline-variant/20"></div>}>
            <ListingsSidebar />
          </Suspense>

          {/* Main Content Area */}
          <section className="flex-1 flex flex-col h-full">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-8">
              {properties.map((property, index) => (
                <PropertyCard key={property.id} property={property} priority={index < 4} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-16 flex justify-center">
                <nav className="flex items-center gap-2">
                  {currentPage > 1 && (
                    <Link
                      href={pageUrl(currentPage - 1)}
                      className="w-10 h-10 flex items-center justify-center rounded-lg border border-outline-variant/30 text-on-surface-variant hover:bg-surface-container-low transition-colors"
                    >
                      <span className="material-symbols-outlined">chevron_left</span>
                    </Link>
                  )}
                  {pageNumbers.map((p, i) =>
                    p === "..." ? (
                      <span key={`ellipsis-${i}`} className="px-2 text-outline-variant">...</span>
                    ) : (
                      <Link
                        key={p}
                        href={pageUrl(p as number)}
                        className={`w-10 h-10 flex items-center justify-center rounded-lg font-bold ${
                          p === currentPage
                            ? "bg-primary text-white"
                            : "border border-outline-variant/30 text-on-surface-variant hover:bg-surface-container-low transition-colors"
                        }`}
                      >
                        {p}
                      </Link>
                    )
                  )}
                  {currentPage < totalPages && (
                    <Link
                      href={pageUrl(currentPage + 1)}
                      className="w-10 h-10 flex items-center justify-center rounded-lg border border-outline-variant/30 text-on-surface-variant hover:bg-surface-container-low transition-colors"
                    >
                      <span className="material-symbols-outlined">chevron_right</span>
                    </Link>
                  )}
                </nav>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
