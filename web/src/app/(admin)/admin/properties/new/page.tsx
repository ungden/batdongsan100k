'use client'

import { useState } from 'react'
import { createProperty } from '../actions'
import PageHeader from '@/components/admin/PageHeader'

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

export default function NewPropertyPage() {
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputClass = 'w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary'
  const labelClass = 'block text-sm font-medium text-on-surface mb-1.5'

  return (
    <div>
      <PageHeader title="Thêm tin đăng mới" />

      <form
        action={async (formData) => {
          setSubmitting(true)
          setError(null)
          try {
            await createProperty(formData)
          } catch (e) {
            setError(e instanceof Error ? e.message : 'Có lỗi xảy ra')
            setSubmitting(false)
          }
        }}
        className="bg-white rounded-xl shadow-sm p-6"
      >
        {error && <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-4">{error}</div>}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className={labelClass}>Tiêu đề *</label>
            <input name="title" required className={inputClass} placeholder="Nhập tiêu đề tin đăng" />
          </div>

          <div>
            <label className={labelClass}>Loại hình *</label>
            <select name="type" required className={inputClass} defaultValue="house">
              {typeOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>

          <div>
            <label className={labelClass}>Hình thức *</label>
            <select name="category" required className={inputClass} defaultValue="sale">
              {categoryOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>

          <div>
            <label className={labelClass}>Giá (VND) *</label>
            <input name="price" type="number" required className={inputClass} placeholder="0" />
          </div>

          <div>
            <label className={labelClass}>Diện tích (m²) *</label>
            <input name="area" type="number" required className={inputClass} placeholder="0" />
          </div>

          <div>
            <label className={labelClass}>Thành phố</label>
            <input name="city" className={inputClass} placeholder="Ví dụ: Hà Nội" />
          </div>

          <div>
            <label className={labelClass}>Quận/Huyện</label>
            <input name="district" className={inputClass} placeholder="Ví dụ: Long Biên" />
          </div>

          <div className="md:col-span-2">
            <label className={labelClass}>Địa chỉ *</label>
            <input name="address" required className={inputClass} placeholder="Số nhà, đường, phường..." />
          </div>

          <div>
            <label className={labelClass}>Trạng thái</label>
            <select name="status" className={inputClass} defaultValue="pending">
              {statusOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>

          <div className="md:col-span-2">
            <label className={labelClass}>Mô tả</label>
            <textarea name="description" rows={5} className={inputClass} placeholder="Nhập mô tả chi tiết..." />
          </div>

          <div className="md:col-span-2">
            <label className={labelClass}>Hình ảnh</label>
            <textarea name="images" rows={4} className={inputClass} placeholder="Mỗi dòng là một URL ảnh" />
          </div>
        </div>

        <div className="flex justify-end mt-6">
          <button type="submit" disabled={submitting} className="px-6 py-2.5 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-container transition-colors disabled:opacity-50">
            {submitting ? 'Đang lưu...' : 'Tạo tin đăng'}
          </button>
        </div>
      </form>
    </div>
  )
}
