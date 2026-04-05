"use client"

import Link from "next/link"
import Image from "next/image"
import { useCompare } from "@/components/CompareContext"

const TYPE_LABELS: Record<string, string> = {
  "chung-cu": "Chung cư", "nha-pho": "Nhà phố", "biet-thu": "Biệt thự",
  "dat-nen": "Đất nền", "phong-tro": "Phòng trọ", "van-phong": "Văn phòng", "kho-xuong": "Kho/Nhà xưởng",
}

function bestValue(items: { value: number; id: string }[], mode: "min" | "max") {
  if (items.length === 0) return ""
  const best = items.reduce((a, b) => (mode === "min" ? (a.value < b.value ? a : b) : (a.value > b.value ? a : b)))
  return best.value > 0 ? best.id : ""
}

export default function ComparePage() {
  const { items, removeItem } = useCompare()

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-20 text-center">
        <span className="material-symbols-outlined mb-4 text-6xl text-on-surface-variant/40">compare_arrows</span>
        <h1 className="mb-2 text-2xl font-bold text-on-surface">Chưa có BĐS nào để so sánh</h1>
        <p className="mb-6 text-on-surface-variant">Thêm BĐS vào danh sách so sánh từ trang tìm kiếm.</p>
        <Link href="/listings" className="rounded-xl bg-primary px-6 py-3 font-semibold text-white hover:bg-primary/90">
          Tìm bất động sản
        </Link>
      </div>
    )
  }

  const priceBest = bestValue(items.map((p) => ({ value: p.price, id: p.id })), "min")
  const areaBest = bestValue(items.map((p) => ({ value: p.area, id: p.id })), "max")

  const rows: { label: string; key: string; render: (p: typeof items[0]) => string; best?: string }[] = [
    { label: "Giá", key: "price", render: (p) => p.priceFormatted ? `${p.priceFormatted} ${p.priceUnit}` : "Liên hệ", best: priceBest },
    { label: "Diện tích", key: "area", render: (p) => p.area > 0 ? `${p.area} m²` : "-", best: areaBest },
    { label: "Phòng ngủ", key: "bedrooms", render: (p) => p.bedrooms > 0 ? `${p.bedrooms} PN` : "-" },
    { label: "Phòng tắm", key: "bathrooms", render: (p) => p.bathrooms > 0 ? `${p.bathrooms} WC` : "-" },
    { label: "Loại hình", key: "type", render: (p) => TYPE_LABELS[p.type] || p.type },
    { label: "Hướng", key: "direction", render: (p) => p.direction || "-" },
    { label: "Quận/Huyện", key: "district", render: (p) => p.district || "-" },
    { label: "Thành phố", key: "city", render: (p) => p.city || "-" },
    { label: "Địa chỉ", key: "address", render: (p) => p.address || "-" },
  ]

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-on-surface">So sánh bất động sản</h1>

      <div className="overflow-x-auto rounded-2xl border border-outline-variant">
        <table className="w-full min-w-[600px]">
          <thead>
            <tr className="border-b border-outline-variant bg-surface-container-low">
              <th className="w-36 px-4 py-3 text-left text-sm font-semibold text-on-surface-variant" />
              {items.map((p) => (
                <th key={p.id} className="px-4 py-3 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <div className="relative h-24 w-full overflow-hidden rounded-xl">
                      <Image src={p.images[0] || "/placeholder.jpg"} alt={p.title} fill className="object-cover" />
                    </div>
                    <Link href={`/property/${p.slug}`} className="line-clamp-2 text-sm font-semibold text-on-surface hover:text-primary">
                      {p.title}
                    </Link>
                    <button onClick={() => removeItem(p.id)} className="text-xs text-error hover:underline">
                      Xóa
                    </button>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={row.key} className={i % 2 === 0 ? "bg-surface" : "bg-surface-container-low/50"}>
                <td className="px-4 py-3 text-sm font-medium text-on-surface-variant">{row.label}</td>
                {items.map((p) => (
                  <td key={p.id} className="px-4 py-3 text-center text-sm text-on-surface">
                    <span className={row.best === p.id ? "font-bold text-primary" : ""}>
                      {row.best === p.id && <span className="mr-1">&#127942;</span>}
                      {row.render(p)}
                    </span>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
