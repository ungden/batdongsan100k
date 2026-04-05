"use client"

import { useState } from "react"

interface SocialShareProps {
  url?: string
  title?: string
}

export default function SocialShare({ url, title }: SocialShareProps) {
  const [copied, setCopied] = useState(false)
  const [open, setOpen] = useState(false)

  const shareUrl = url || (typeof window !== "undefined" ? window.location.href : "")
  const shareTitle = title || (typeof document !== "undefined" ? document.title : "")
  const encoded = encodeURIComponent(shareUrl)
  const encodedTitle = encodeURIComponent(shareTitle)

  const platforms = [
    { name: "Facebook", icon: "share", url: `https://www.facebook.com/sharer/sharer.php?u=${encoded}` },
    { name: "Twitter", icon: "tag", url: `https://twitter.com/intent/tweet?url=${encoded}&text=${encodedTitle}` },
    { name: "Zalo", icon: "chat", url: `https://zalo.me/share?url=${encoded}&text=${encodedTitle}` },
  ]

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // fallback
    }
  }

  async function handleNativeShare() {
    if (navigator.share) {
      try {
        await navigator.share({ title: shareTitle, url: shareUrl })
        return
      } catch {
        // user cancelled or not supported
      }
    }
    setOpen((v) => !v)
  }

  return (
    <div className="relative">
      <button
        onClick={handleNativeShare}
        className="flex items-center gap-1.5 rounded-xl border border-outline-variant bg-surface-container-low px-3 py-2 text-sm font-medium text-on-surface-variant transition-colors hover:bg-surface-container"
      >
        <span className="material-symbols-outlined text-[18px]">share</span>
        <span className="hidden sm:inline">Chia sẻ</span>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full z-50 mt-2 w-48 rounded-xl border border-outline-variant bg-surface-container-low p-1 shadow-lg">
            {platforms.map((p) => (
              <a
                key={p.name}
                href={p.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-on-surface hover:bg-surface-container"
              >
                <span className="material-symbols-outlined text-[18px]">{p.icon}</span>
                {p.name}
              </a>
            ))}
            <button
              onClick={handleCopy}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-on-surface hover:bg-surface-container"
            >
              <span className="material-symbols-outlined text-[18px]">
                {copied ? "check" : "content_copy"}
              </span>
              {copied ? "Đã sao chép!" : "Sao chép liên kết"}
            </button>
          </div>
        </>
      )}
    </div>
  )
}
