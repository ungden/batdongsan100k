const statusMap: Record<string, { label: string; className: string }> = {
  published: { label: 'Đang đăng', className: 'bg-green-100 text-green-700' },
  active: { label: 'Đang đăng', className: 'bg-green-100 text-green-700' },
  pending_review: { label: 'Chờ duyệt', className: 'bg-amber-100 text-amber-700' },
  draft: { label: 'Nháp', className: 'bg-gray-100 text-gray-600' },
  sold: { label: 'Đã bán', className: 'bg-blue-100 text-blue-700' },
  archived: { label: 'Lưu trữ', className: 'bg-red-100 text-red-700' },
  rented: { label: 'Đã thuê', className: 'bg-purple-100 text-purple-700' },
  // Lead statuses
  new: { label: 'Mới', className: 'bg-blue-100 text-blue-700' },
  contacted: { label: 'Đã liên hệ', className: 'bg-amber-100 text-amber-700' },
  converted: { label: 'Thành công', className: 'bg-green-100 text-green-700' },
  lost: { label: 'Thất bại', className: 'bg-red-100 text-red-700' },
}

export default function StatusBadge({ status }: { status: string }) {
  const config = statusMap[status] || {
    label: status,
    className: 'bg-gray-100 text-gray-600',
  }
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.className}`}
    >
      {config.label}
    </span>
  )
}
