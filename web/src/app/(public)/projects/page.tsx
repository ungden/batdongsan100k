export const dynamic = "force-dynamic";

import Link from 'next/link'
import { getProjectSummaries } from '@/lib/queries/properties'

export const metadata = {
  title: 'Dự án nổi bật | TitanHome',
  description: 'Khám phá các dự án bất động sản nổi bật đang được TitanHome tuyển chọn.',
}

export default async function ProjectsPage() {
  const projects = await getProjectSummaries(60)

  return (
    <div className="min-h-screen bg-surface pt-24 pb-16">
      <section className="max-w-7xl mx-auto px-4 md:px-8 mb-10">
        <div className="rounded-3xl overflow-hidden bg-gradient-to-r from-[#001e40] to-[#006c47] text-white p-8 md:p-12 shadow-xl">
          <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] bg-white/15 px-3 py-1 rounded-full mb-4">
            <span className="material-symbols-outlined text-sm">apartment</span>
            TitanHome Projects
          </span>
          <h1 className="text-3xl md:text-5xl font-black tracking-tight mb-4">Dự án nổi bật</h1>
          <p className="text-white/85 max-w-2xl text-sm md:text-base leading-7">
            Danh sách các dự án đang thu hút nhiều sự quan tâm, ưu tiên vị trí đẹp, pháp lý rõ ràng và tiềm năng khai thác tốt.
          </p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-on-surface">Danh mục dự án</h2>
            <p className="text-on-surface-variant mt-1">{projects.length} dự án đang hiển thị</p>
          </div>
          <Link href="/listings" className="text-primary font-semibold hover:underline text-sm">
            Xem toàn bộ bất động sản
          </Link>
        </div>

        {projects.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {projects.map((project) => (
              <Link key={project.slug} href={`/projects/${project.slug}`} className="block rounded-2xl bg-white border border-outline-variant/20 p-6 hover:shadow-xl transition-shadow">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-bold text-on-surface">{project.name}</h3>
                    <p className="text-on-surface-variant mt-2 text-sm">{project.propertyCount} sản phẩm • {project.district}, {project.city}</p>
                    <p className="text-primary font-bold mt-4">Giá từ {project.minPriceFormatted}</p>
                  </div>
                  <span className="material-symbols-outlined text-primary">arrow_forward</span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-outline-variant/20 bg-white p-12 text-center">
            <span className="material-symbols-outlined text-5xl text-outline mb-4">apartment</span>
            <p className="text-lg font-bold text-on-surface mb-2">Chưa có dự án nào</p>
            <p className="text-on-surface-variant">Dữ liệu dự án sẽ hiển thị tại đây khi có thêm bất động sản nổi bật.</p>
          </div>
        )}
      </section>
    </div>
  )
}
