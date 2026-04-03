'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { updateProperty, deleteProperty } from '../actions'
import ConfirmDialog from '@/components/admin/ConfirmDialog'

const typeOptions = [
  { value: 'apartment', label: 'Căn hộ' },
  { value: 'house', label: 'Nhà phố' },
  { value: 'land', label: 'Đất nền' },
  { value: 'room', label: 'Phòng trọ' },
]

const categoryOptions = [
  { value: 'sale', label: 'Bán' },
  { value: 'rent', label: 'Cho thuê' },
]

const statusOptions = [
  { value: 'pending', label: 'Chờ duyệt' },
  { value: 'approved', label: 'Đã duyệt' },
  { value: 'rejected', label: 'Từ chối' },
]

type ListingData = {
  id: string
  title: string
  category: string
  transaction_type: string | null
  price: number
  area: number
  description: string
  city: string
  district: string
  address: string
  status: string
  images: string[]
}

export default function EditPropertyPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const [listing, setListing] = useState<ListingData | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [showDelete, setShowDelete] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase.from('properties').select('*').eq('id', params.id).single().then(({ data }) => {
      setListing(data as ListingData | null)
      setLoading(false)
    })
  }, [params.id])

  if (loading) return <div className="flex items-center justify-center py-20"><span className="material-symbols-outlined animate-spin text-3xl text-on-surface/30">progress_activity</span></div>
  if (!listing) return <div className="text-center py-20 text-on-surface/50">Không tìm thấy tin đăng</div>

  const inputClass = 'w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary'
  const labelClass = 'block text-sm font-medium text-on-surface mb-1.5'
  const initialType = listing.category === 'apartment' ? 'apartment' : listing.category === 'land' ? 'land' : listing.category === 'room' ? 'room' : 'house'
  const initialTransaction = listing.transaction_type === 'cho-thue' ? 'rent' : 'sale'

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-on-surface">Chỉnh sửa tin đăng</h1>
          <p className="text-sm text-on-surface/60 mt-1">{listing.title}</p>
        </div>
        <button onClick={() => setShowDelete(true)} className="inline-flex items-center gap-2 px-4 py-2.5 bg-red-50 text-red-600 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors">
          <span className="material-symbols-outlined text-lg">delete</span>
          Xóa
        </button>
      </div>

      <form action={async (formData) => {
        setSubmitting(true)
        setError(null)
        try {
          await updateProperty(listing.id, formData)
        } catch (e) {
          setError(e instanceof Error ? e.message : 'Có lỗi xảy ra')
          setSubmitting(false)
        }
      }} className="bg-white rounded-xl shadow-sm p-6">
        {error && <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-4">{error}</div>}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className={labelClass}>Tiêu đề *</label>
            <input name="title" required className={inputClass} defaultValue={listing.title} />
          </div>
          <div>
            <label className={labelClass}>Loại hình</label>
            <select name="type" className={inputClass} defaultValue={initialType}>
              {typeOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
          <div>
            <label className={labelClass}>Hình thức</label>
            <select name="category" className={inputClass} defaultValue={initialTransaction}>
              {categoryOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
          <div>
            <label className={labelClass}>Giá</label>
            <input name="price" type="number" className={inputClass} defaultValue={listing.price} />
          </div>
          <div>
            <label className={labelClass}>Diện tích (m²)</label>
            <input name="area" type="number" className={inputClass} defaultValue={listing.area} />
          </div>
          <div>
            <label className={labelClass}>Thành phố</label>
            <input name="city" className={inputClass} defaultValue={listing.city} />
          </div>
          <div>
            <label className={labelClass}>Quận/Huyện</label>
            <input name="district" className={inputClass} defaultValue={listing.district} />
          </div>
          <div className="md:col-span-2">
            <label className={labelClass}>Địa chỉ</label>
            <input name="address" className={inputClass} defaultValue={listing.address} />
          </div>
          <div>
            <label className={labelClass}>Trạng thái</label>
            <select name="status" className={inputClass} defaultValue={listing.status}>
              {statusOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
          <div className="md:col-span-2">
            <label className={labelClass}>Mô tả</label>
            <textarea name="description" rows={6} className={inputClass} defaultValue={listing.description?.trim()} />
          </div>
          <div className="md:col-span-2">
            <label className={labelClass}>Hình ảnh</label>
            <textarea name="images" rows={4} className={inputClass} defaultValue={(listing.images || []).join('\n')} />
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-100">
          <button type="button" onClick={() => router.push('/admin/properties')} className="px-6 py-2.5 border border-gray-200 text-on-surface/70 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">Hủy</button>
          <button type="submit" disabled={submitting} className="px-6 py-2.5 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-container transition-colors disabled:opacity-50">{submitting ? 'Đang lưu...' : 'Lưu thay đổi'}</button>
        </div>
      </form>

      <ConfirmDialog
        open={showDelete}
        title="Xóa tin đăng"
        message="Bạn có chắc chắn muốn xóa tin đăng này? Hành động này không thể hoàn tác."
        confirmLabel="Xóa"
        danger
        loading={deleteLoading}
        onConfirm={async () => {
          setDeleteLoading(true)
          await deleteProperty(listing.id)
        }}
        onCancel={() => setShowDelete(false)}
      />
    </div>
  )
}
