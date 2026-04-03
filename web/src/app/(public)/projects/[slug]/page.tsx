import Link from 'next/link'
import { notFound } from 'next/navigation'
import PropertyCard from '@/components/PropertyCard'
import { getProjectSummaries, getProjectListingsBySlug } from '@/lib/queries/properties'

export default async function ProjectDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const projects = await getProjectSummaries(120)
  const project = projects.find((item) => item.slug === slug)
  const projectListings = await getProjectListingsBySlug(slug)

  if (!project) notFound()

  return (
    <div className="min-h-screen bg-surface pt-24 pb-16">
      <section className="max-w-7xl mx-auto px-4 md:px-8 mb-8">
        <Link href="/projects" className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline mb-4">
          <span className="material-symbols-outlined text-base">arrow_back</span>
          Quay lại dự án
        </Link>
        <div className="rounded-3xl overflow-hidden bg-gradient-to-r from-[#001e40] to-[#006c47] text-white p-8 md:p-12 shadow-xl">
          <h1 className="text-3xl md:text-5xl font-black tracking-tight mb-3">{project.name}</h1>
          <p className="text-white/85 text-sm md:text-base leading-7">
            {project.propertyCount} bất động sản • {project.district}, {project.city} • Giá từ {project.minPriceFormatted}
          </p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 md:px-8">
        {projectListings.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {projectListings.map((property, index) => (
              <PropertyCard key={property.id} property={property} isVip={property.isFeatured} priority={index < 4} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-outline-variant/20 bg-white p-12 text-center">
            <p className="text-lg font-bold text-on-surface mb-2">Chưa có sản phẩm trong dự án này</p>
          </div>
        )}
      </section>
    </div>
  )
}
