export const revalidate = 300;

import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { getPublishedPosts } from "@/lib/queries/posts";

export const metadata: Metadata = {
  title: "Tin Tức Bất Động Sản | Blog",
  description: "Cập nhật tin tức, xu hướng thị trường bất động sản Việt Nam. Kinh nghiệm mua bán, cho thuê nhà đất, phân tích dự án và tư vấn đầu tư BĐS.",
};

const ITEMS_PER_PAGE = 12;

interface PageProps {
  searchParams: Promise<{ page?: string }>;
}

export default async function NewsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const currentPage = Math.max(1, parseInt(params.page || "1", 10));
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;

  const { posts, count } = await getPublishedPosts(ITEMS_PER_PAGE, offset);
  const totalPages = Math.max(1, Math.ceil(count / ITEMS_PER_PAGE));

  return (
    <div className="min-h-screen bg-surface pt-24 pb-16">
      {/* Hero */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 mb-10">
        <div className="rounded-3xl overflow-hidden bg-gradient-to-r from-[#001e40] to-[#1a3a5c] text-white p-8 md:p-12 shadow-xl relative">
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] bg-white/15 px-3 py-1 rounded-full mb-4">
              <span className="material-symbols-outlined text-sm">newspaper</span>
              Blog & Tin Tức
            </div>
            <h1 className="text-3xl md:text-5xl font-black tracking-tight mb-3">Tin Tức Bất Động Sản</h1>
            <p className="text-white/80 max-w-2xl text-sm md:text-base leading-7">
              Cập nhật xu hướng thị trường, kinh nghiệm mua bán, và phân tích chuyên sâu từ đội ngũ chuyên gia TitanHome.
            </p>
          </div>
        </div>
      </section>

      {/* Articles Grid */}
      <section className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-xl font-bold text-on-surface">{count} bài viết</h2>
        </div>

        {posts.length > 0 ? (
          <>
            {/* Featured first post */}
            {currentPage === 1 && posts[0] && (
              <Link href={`/news/${posts[0].slug}`} className="group block mb-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white rounded-2xl border border-outline-variant/20 overflow-hidden hover:shadow-xl transition-all">
                  <div className="relative h-64 md:h-80 overflow-hidden">
                    {posts[0].coverImage ? (
                      <Image
                        src={posts[0].coverImage}
                        alt={posts[0].title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        sizes="(max-width: 768px) 100vw, 50vw"
                        priority
                      />
                    ) : (
                      <div className="w-full h-full bg-primary/5 flex items-center justify-center">
                        <span className="material-symbols-outlined text-6xl text-primary/20">article</span>
                      </div>
                    )}
                  </div>
                  <div className="p-6 md:p-8 flex flex-col justify-center">
                    <span className="text-xs font-bold uppercase tracking-widest text-secondary mb-3">Bài viết nổi bật</span>
                    <h3 className="text-2xl md:text-3xl font-black text-on-surface mb-3 group-hover:text-primary transition-colors line-clamp-3">
                      {posts[0].title}
                    </h3>
                    <p className="text-on-surface-variant line-clamp-3 mb-4">{posts[0].excerpt}</p>
                    <div className="flex items-center gap-4 text-xs text-on-surface-variant">
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">calendar_today</span>
                        {posts[0].publishedAt ? new Date(posts[0].publishedAt).toLocaleDateString('vi-VN') : ''}
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">visibility</span>
                        {posts[0].viewsCount} lượt xem
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            )}

            {/* Rest of posts */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {(currentPage === 1 ? posts.slice(1) : posts).map((post) => (
                <Link key={post.id} href={`/news/${post.slug}`} className="group block bg-white rounded-2xl border border-outline-variant/20 overflow-hidden hover:shadow-xl transition-all">
                  <div className="relative h-48 overflow-hidden">
                    {post.coverImage ? (
                      <Image
                        src={post.coverImage}
                        alt={post.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />
                    ) : (
                      <div className="w-full h-full bg-primary/5 flex items-center justify-center">
                        <span className="material-symbols-outlined text-4xl text-primary/20">article</span>
                      </div>
                    )}
                  </div>
                  <div className="p-5">
                    <h3 className="text-lg font-bold text-on-surface mb-2 group-hover:text-primary transition-colors line-clamp-2">
                      {post.title}
                    </h3>
                    <p className="text-sm text-on-surface-variant line-clamp-2 mb-3">{post.excerpt}</p>
                    <div className="flex items-center gap-3 text-xs text-on-surface-variant">
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">calendar_today</span>
                        {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString('vi-VN') : ''}
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">visibility</span>
                        {post.viewsCount}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-12 flex justify-center">
                <nav className="flex items-center gap-2">
                  {currentPage > 1 && (
                    <Link href={`/news?page=${currentPage - 1}`} className="w-10 h-10 flex items-center justify-center rounded-lg border border-outline-variant/30 text-on-surface-variant hover:bg-surface-container-low transition-colors">
                      <span className="material-symbols-outlined">chevron_left</span>
                    </Link>
                  )}
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((p) => (
                    <Link key={p} href={`/news?page=${p}`} className={`w-10 h-10 flex items-center justify-center rounded-lg font-bold ${p === currentPage ? "bg-primary text-white" : "border border-outline-variant/30 text-on-surface-variant hover:bg-surface-container-low"}`}>
                      {p}
                    </Link>
                  ))}
                  {currentPage < totalPages && (
                    <Link href={`/news?page=${currentPage + 1}`} className="w-10 h-10 flex items-center justify-center rounded-lg border border-outline-variant/30 text-on-surface-variant hover:bg-surface-container-low transition-colors">
                      <span className="material-symbols-outlined">chevron_right</span>
                    </Link>
                  )}
                </nav>
              </div>
            )}
          </>
        ) : (
          <div className="rounded-2xl border border-outline-variant/20 bg-white p-12 text-center">
            <span className="material-symbols-outlined text-5xl text-outline mb-4">article</span>
            <p className="text-lg font-bold text-on-surface mb-2">Chưa có bài viết nào</p>
            <p className="text-on-surface-variant">Các bài viết sẽ được cập nhật tại đây.</p>
          </div>
        )}
      </section>
    </div>
  );
}
