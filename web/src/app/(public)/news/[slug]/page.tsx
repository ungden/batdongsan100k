export const revalidate = 1800;

import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getPostBySlug, getRelatedPosts, incrementPostViewCount } from "@/lib/queries/posts";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return { title: "Không tìm thấy bài viết" };

  return {
    title: post.title,
    description: post.excerpt || post.content?.slice(0, 160),
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: "article",
      publishedTime: post.publishedAt,
      images: post.coverImage ? [{ url: post.coverImage, width: 1200, height: 630 }] : undefined,
    },
  };
}

export default async function NewsDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) notFound();

  // Track views (non-blocking)
  incrementPostViewCount(post.id);

  const relatedPosts = await getRelatedPosts(slug, 3);
  const publishedDate = post.publishedAt ? new Date(post.publishedAt) : null;
  const readingTime = Math.max(1, Math.ceil((post.content?.length || 0) / 1000));

  return (
    <div className="min-h-screen bg-surface pt-24 pb-16">
      {/* Breadcrumb */}
      <div className="max-w-4xl mx-auto px-4 md:px-8 mb-6">
        <div className="flex items-center gap-2 text-xs text-on-surface-variant">
          <Link href="/" className="hover:text-primary">Trang chủ</Link>
          <span className="material-symbols-outlined text-xs">chevron_right</span>
          <Link href="/news" className="hover:text-primary">Tin tức</Link>
          <span className="material-symbols-outlined text-xs">chevron_right</span>
          <span className="text-primary font-bold line-clamp-1">{post.title}</span>
        </div>
      </div>

      {/* Article */}
      <article className="max-w-4xl mx-auto px-4 md:px-8">
        {/* Header */}
        <header className="mb-8">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-on-surface tracking-tight leading-tight mb-4">
            {post.title}
          </h1>
          {post.excerpt && (
            <p className="text-lg text-on-surface-variant leading-relaxed mb-6">{post.excerpt}</p>
          )}
          <div className="flex flex-wrap items-center gap-4 text-sm text-on-surface-variant border-b border-outline-variant/20 pb-6">
            <span className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px] text-secondary">person</span>
              TitanHome
            </span>
            {publishedDate && (
              <span className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-secondary">calendar_today</span>
                {publishedDate.toLocaleDateString('vi-VN', { day: 'numeric', month: 'long', year: 'numeric' })}
              </span>
            )}
            <span className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px] text-secondary">schedule</span>
              {readingTime} phút đọc
            </span>
            <span className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px] text-secondary">visibility</span>
              {post.viewsCount} lượt xem
            </span>
          </div>
        </header>

        {/* Cover Image */}
        {post.coverImage && (
          <div className="relative w-full aspect-[2/1] rounded-2xl overflow-hidden mb-10">
            <Image
              src={post.coverImage}
              alt={post.title}
              fill
              className="object-cover"
              sizes="(max-width: 896px) 100vw, 896px"
              priority
            />
          </div>
        )}

        {/* Content */}
        <div className="prose prose-lg max-w-none mb-16
          prose-headings:font-bold prose-headings:text-on-surface prose-headings:tracking-tight
          prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4 prose-h2:border-b prose-h2:border-outline-variant/20 prose-h2:pb-3
          prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3
          prose-p:text-on-surface/90 prose-p:leading-relaxed prose-p:mb-4
          prose-a:text-primary prose-a:font-semibold prose-a:no-underline hover:prose-a:underline
          prose-strong:text-on-surface prose-strong:font-bold
          prose-ul:my-4 prose-li:text-on-surface/90
          prose-img:rounded-xl prose-img:shadow-md
          prose-blockquote:border-l-4 prose-blockquote:border-secondary prose-blockquote:bg-surface-container-lowest prose-blockquote:py-2 prose-blockquote:px-4 prose-blockquote:rounded-r-lg
        ">
          <div dangerouslySetInnerHTML={{ __html: post.content }} />
        </div>

        {/* Share & CTA */}
        <div className="bg-primary/5 rounded-2xl p-6 md:p-8 mb-16 text-center">
          <h3 className="text-xl font-bold text-on-surface mb-2">Bạn đang tìm kiếm bất động sản?</h3>
          <p className="text-on-surface-variant mb-4">Khám phá hơn 16,000+ tin đăng BĐS trên TitanHome</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/listings" className="bg-primary text-white px-6 py-3 rounded-lg font-bold text-sm hover:bg-primary/90 transition-colors">
              Tìm BĐS mua bán
            </Link>
            <Link href="/listings?category=rent" className="bg-white text-primary border border-primary/20 px-6 py-3 rounded-lg font-bold text-sm hover:bg-primary/5 transition-colors">
              Tìm BĐS cho thuê
            </Link>
          </div>
        </div>
      </article>

      {/* Related Posts */}
      {relatedPosts.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 md:px-8">
          <h2 className="text-2xl font-bold text-on-surface mb-6">Bài viết liên quan</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {relatedPosts.map((rp) => (
              <Link key={rp.id} href={`/news/${rp.slug}`} className="group block bg-white rounded-2xl border border-outline-variant/20 overflow-hidden hover:shadow-xl transition-all">
                <div className="relative h-44 overflow-hidden">
                  {rp.coverImage ? (
                    <Image src={rp.coverImage} alt={rp.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" sizes="33vw" />
                  ) : (
                    <div className="w-full h-full bg-primary/5 flex items-center justify-center">
                      <span className="material-symbols-outlined text-4xl text-primary/20">article</span>
                    </div>
                  )}
                </div>
                <div className="p-5">
                  <h3 className="font-bold text-on-surface group-hover:text-primary transition-colors line-clamp-2 mb-2">{rp.title}</h3>
                  <p className="text-sm text-on-surface-variant line-clamp-2">{rp.excerpt}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* JSON-LD Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            headline: post.title,
            description: post.excerpt,
            image: post.coverImage || undefined,
            datePublished: post.publishedAt,
            author: { "@type": "Organization", name: "TitanHome" },
            publisher: { "@type": "Organization", name: "TitanHome" },
          }),
        }}
      />
    </div>
  );
}
