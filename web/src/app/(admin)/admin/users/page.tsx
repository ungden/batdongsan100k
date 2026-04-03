import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import PageHeader from '@/components/admin/PageHeader'
import Image from "next/image";

const PAGE_SIZE = 20

export default async function UsersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>
}) {
  const params = await searchParams
  const page = Math.max(1, parseInt(params.page || '1'))
  const offset = (page - 1) * PAGE_SIZE
  const supabase = await createClient()

  const { data: users, count } = await supabase
    .from('user_profiles')
    .select('*', { count: 'estimated' })
    .order('created_at', { ascending: false })
    .range(offset, offset + PAGE_SIZE - 1)

  const totalPages = Math.ceil((count || 0) / PAGE_SIZE)

  const roleBadge = (role: string) => {
    const map: Record<string, string> = {
      admin: 'bg-purple-100 text-purple-700',
      user: 'bg-gray-100 text-gray-600',
      agent: 'bg-blue-100 text-blue-700',
    }
    return map[role] || 'bg-gray-100 text-gray-600'
  }

  return (
    <div>
      <PageHeader
        title="Nguoi dung"
        subtitle={`${count ?? 0} nguoi dung`}
      />

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="px-4 py-3 text-left text-xs font-semibold text-on-surface/60 uppercase">
                  Nguoi dung
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-on-surface/60 uppercase">
                  Dien thoai
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-on-surface/60 uppercase">
                  Vai tro
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-on-surface/60 uppercase">
                  Trang thai
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-on-surface/60 uppercase">
                  Ngay tham gia
                </th>
              </tr>
            </thead>
            <tbody>
              {(!users || users.length === 0) && (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-on-surface/40">
                    Chua co nguoi dung nao
                  </td>
                </tr>
              )}
              {users?.map((user, i) => (
                <tr
                  key={user.id}
                  className={`border-b border-gray-50 ${
                    i % 2 === 1 ? 'bg-gray-50/50' : ''
                  }`}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {user.avatar_url ? (
                        <Image width={800} height={600}
                          src={user.avatar_url}
                          alt=""
                          className="w-9 h-9 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-primary text-sm font-medium">
                            {user.full_name?.charAt(0)?.toUpperCase() || 'U'}
                          </span>
                        </div>
                      )}
                      <span className="font-medium text-on-surface">
                        {user.full_name || 'Chua dat ten'}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-on-surface/70">
                    {user.phone || '—'}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${roleBadge(user.role)}`}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {user.is_banned ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
                        Bi cam
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                        Binh thuong
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-on-surface/50 text-xs">
                    {new Date(user.created_at).toLocaleDateString('vi-VN')}
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
                href={`/admin/users?page=${page - 1}`}
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
                href={`/admin/users?page=${page + 1}`}
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
