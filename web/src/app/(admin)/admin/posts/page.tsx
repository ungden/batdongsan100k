import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import PageHeader from '@/components/admin/PageHeader'
import PostActions from './PostActions'
import Image from "next/image";

const PAGE_SIZE = 20

export default async function PostsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>
}) {
  const params = await searchParams
  const page = Math.max(1, parseInt(params.page || '1'))
  const offset = (page - 1) * PAGE_SIZE
  const supabase = await createClient()

  const { data: posts, count } = await supabase
    .from('posts')
    .select('*', { count: 'estimated' })
    .order('created_at', { ascending: false })
    .range(offset, offset + PAGE_SIZE - 1)

  const totalPages = Math.ceil((count || 0) / PAGE_SIZE)

  return (
    <div>
      <PageHeader
        title="Bai viet"
        subtitle={`${count ?? 0} bai viet`}
        action={{
          label: 'Them bai viet',
          href: '/admin/posts/new',
          icon: 'add',
        }}
      />

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="px-4 py-3 text-left text-xs font-semibold text-on-surface/60 uppercase">
                  Tieu de
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-on-surface/60 uppercase">
                  Trang thai
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-on-surface/60 uppercase">
                  Luot xem
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-on-surface/60 uppercase">
                  Ngay tao
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-on-surface/60 uppercase">
                  Thao tac
                </th>
              </tr>
            </thead>
            <tbody>
              {(!posts || posts.length === 0) && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-12 text-center text-on-surface/40"
                  >
                    Chua co bai viet nao
                  </td>
                </tr>
              )}
              {posts?.map((post, i) => (
                <tr
                  key={post.id}
                  className={`border-b border-gray-50 hover:bg-primary/5 ${
                    i % 2 === 1 ? 'bg-gray-50/50' : ''
                  }`}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {post.cover_image ? (
                        <Image width={800} height={600}
                          src={post.cover_image}
                          alt=""
                          className="w-10 h-10 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                          <span className="material-symbols-outlined text-gray-400 text-lg">
                            article
                          </span>
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="font-medium text-on-surface truncate max-w-[300px]">
                          {post.title}
                        </p>
                        <p className="text-xs text-on-surface/50 truncate max-w-[300px]">
                          /{post.slug}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                        post.is_published
                          ? 'bg-green-50 text-green-700'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          post.is_published ? 'bg-green-500' : 'bg-gray-400'
                        }`}
                      />
                      {post.is_published ? 'Da xuat ban' : 'Nhap'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-on-surface/70">
                    {post.views_count ?? 0}
                  </td>
                  <td className="px-4 py-3 text-on-surface/50 text-xs">
                    {new Date(post.created_at).toLocaleDateString('vi-VN')}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/admin/posts/${post.id}`}
                        className="inline-flex items-center gap-1 text-primary hover:underline text-sm"
                      >
                        <span className="material-symbols-outlined text-base">
                          edit
                        </span>
                        Sua
                      </Link>
                      <PostActions id={post.id} isPublished={post.is_published} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-6 px-4">
          <span className="text-sm text-gray-500">
            Hien thi {offset + 1}-{Math.min(offset + PAGE_SIZE, count || 0)} / {count} ket qua
          </span>
          <div className="flex gap-2">
            {page > 1 && (
              <Link
                href={`/admin/posts?page=${page - 1}`}
                className="px-3 py-1 bg-white border rounded text-sm hover:bg-gray-50"
              >
                Truoc
              </Link>
            )}
            <span className="px-3 py-1 bg-[#001e40] text-white rounded text-sm">
              {page}
            </span>
            {page < totalPages && (
              <Link
                href={`/admin/posts?page=${page + 1}`}
                className="px-3 py-1 bg-white border rounded text-sm hover:bg-gray-50"
              >
                Sau
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
