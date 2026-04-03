'use client'

import { useState, useCallback } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'
import StatusBadge from '@/components/admin/StatusBadge'
import PropertyBulkActions from './PropertyBulkActions'

interface Property {
  id: string
  title: string
  address: string
  type: string
  price: number
  price_formatted: string | null
  status: string
  views_count: number
  created_at: string
  images: string[] | null
  agents: { name: string } | null
}

interface PropertiesTableProps {
  properties: Property[]
}

type SortField = 'title' | 'price' | 'views_count' | 'created_at' | 'type'

export default function PropertiesTable({ properties }: PropertiesTableProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  const currentSort = (searchParams.get('sort') as SortField) || 'created_at'
  const currentOrder = searchParams.get('order') || 'desc'

  const handleSort = useCallback(
    (field: SortField) => {
      const params = new URLSearchParams(searchParams.toString())
      if (currentSort === field) {
        params.set('order', currentOrder === 'asc' ? 'desc' : 'asc')
      } else {
        params.set('sort', field)
        params.set('order', 'asc')
      }
      router.push(`/admin/properties?${params.toString()}`)
    },
    [currentSort, currentOrder, searchParams, router]
  )

  const toggleSelect = useCallback(
    (id: string) => {
      setSelectedIds((prev) =>
        prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
      )
    },
    []
  )

  const toggleAll = useCallback(() => {
    if (selectedIds.length === properties.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(properties.map((p) => p.id))
    }
  }, [selectedIds.length, properties])

  const SortIcon = ({ field }: { field: SortField }) => {
    if (currentSort !== field)
      return (
        <span className="material-symbols-outlined text-xs text-on-surface/20 ml-1">
          unfold_more
        </span>
      )
    return (
      <span className="material-symbols-outlined text-xs text-primary ml-1">
        {currentOrder === 'asc' ? 'arrow_upward' : 'arrow_downward'}
      </span>
    )
  }

  const thClass =
    'px-4 py-3 text-left text-xs font-semibold text-on-surface/60 uppercase cursor-pointer hover:text-on-surface select-none'

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="px-4 py-3 w-10">
                  <input
                    type="checkbox"
                    checked={
                      properties.length > 0 &&
                      selectedIds.length === properties.length
                    }
                    onChange={toggleAll}
                    className="rounded"
                  />
                </th>
                <th
                  className={thClass}
                  onClick={() => handleSort('title')}
                >
                  Bat dong san
                  <SortIcon field="title" />
                </th>
                <th
                  className={thClass}
                  onClick={() => handleSort('type')}
                >
                  Loai
                  <SortIcon field="type" />
                </th>
                <th
                  className={thClass}
                  onClick={() => handleSort('price')}
                >
                  Gia
                  <SortIcon field="price" />
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-on-surface/60 uppercase">
                  Trang thai
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-on-surface/60 uppercase">
                  Nhan vien
                </th>
                <th
                  className={thClass}
                  onClick={() => handleSort('views_count')}
                >
                  Luot xem
                  <SortIcon field="views_count" />
                </th>
                <th
                  className={thClass}
                  onClick={() => handleSort('created_at')}
                >
                  Ngay tao
                  <SortIcon field="created_at" />
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-on-surface/60 uppercase">
                  Thao tac
                </th>
              </tr>
            </thead>
            <tbody>
              {properties.length === 0 && (
                <tr>
                  <td
                    colSpan={9}
                    className="px-4 py-12 text-center text-on-surface/40"
                  >
                    Khong co bat dong san nao
                  </td>
                </tr>
              )}
              {properties.map((p, i) => (
                <tr
                  key={p.id}
                  className={`border-b border-gray-50 hover:bg-primary/5 ${
                    i % 2 === 1 ? 'bg-gray-50/50' : ''
                  } ${selectedIds.includes(p.id) ? 'bg-primary/10' : ''}`}
                >
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(p.id)}
                      onChange={() => toggleSelect(p.id)}
                      className="rounded"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {p.images?.[0] ? (
                        <Image
                          width={800}
                          height={600}
                          src={p.images[0]}
                          alt=""
                          className="w-10 h-10 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                          <span className="material-symbols-outlined text-gray-400 text-lg">
                            image
                          </span>
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="font-medium text-on-surface truncate max-w-[200px]">
                          {p.title}
                        </p>
                        <p className="text-xs text-on-surface/50 truncate max-w-[200px]">
                          {p.address}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-on-surface/70">{p.type}</td>
                  <td className="px-4 py-3 font-medium text-on-surface">
                    {p.price_formatted || p.price?.toLocaleString('vi-VN')}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={p.status} />
                  </td>
                  <td className="px-4 py-3 text-on-surface/70">
                    {p.agents?.name ?? '\u2014'}
                  </td>
                  <td className="px-4 py-3 text-on-surface/70">
                    {p.views_count ?? 0}
                  </td>
                  <td className="px-4 py-3 text-on-surface/50 text-xs">
                    {new Date(p.created_at).toLocaleDateString('vi-VN')}
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/properties/${p.id}`}
                      className="inline-flex items-center gap-1 text-primary hover:underline text-sm"
                    >
                      <span className="material-symbols-outlined text-base">
                        edit
                      </span>
                      Sua
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <PropertyBulkActions
        selectedIds={selectedIds}
        onClear={() => setSelectedIds([])}
      />
    </>
  )
}
