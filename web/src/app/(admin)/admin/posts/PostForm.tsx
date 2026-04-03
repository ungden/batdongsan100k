'use client'

import { useTransition, useState } from 'react'
import { createPost, updatePost } from './actions'

type Post = {
  id: string
  title: string
  slug: string
  excerpt: string | null
  content: string | null
  cover_image: string | null
  is_published: boolean
}

export default function PostForm({ post }: { post?: Post }) {
  const [isPending, startTransition] = useTransition()
  const [title, setTitle] = useState(post?.title ?? '')
  const [slug, setSlug] = useState(post?.slug ?? '')
  const [error, setError] = useState<string | null>(null)

  function slugify(text: string): string {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '')
  }

  function handleTitleChange(value: string) {
    setTitle(value)
    if (!post) {
      setSlug(slugify(value))
    }
  }

  function handleSubmit(formData: FormData) {
    setError(null)
    startTransition(async () => {
      try {
        if (post) {
          await updatePost(post.id, formData)
        } else {
          await createPost(formData)
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Co loi xay ra')
      }
    })
  }

  return (
    <form action={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
          {error}
        </div>
      )}
      <div className="bg-white rounded-xl shadow-sm p-6 space-y-5">
        <div>
          <label className="block text-sm font-medium text-on-surface mb-1.5">
            Tieu de <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="title"
            required
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            placeholder="Nhap tieu de bai viet"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-on-surface mb-1.5">
            Slug
          </label>
          <input
            type="text"
            name="slug"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            placeholder="url-bai-viet"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-on-surface mb-1.5">
            Tom tat
          </label>
          <textarea
            name="excerpt"
            rows={2}
            defaultValue={post?.excerpt ?? ''}
            className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
            placeholder="Mo ta ngan gon bai viet"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-on-surface mb-1.5">
            Noi dung <span className="text-red-500">*</span>
          </label>
          <textarea
            name="content"
            rows={12}
            required
            defaultValue={post?.content ?? ''}
            className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-y font-mono"
            placeholder="Noi dung bai viet..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-on-surface mb-1.5">
            Anh bia (URL)
          </label>
          <input
            type="url"
            name="cover_image"
            defaultValue={post?.cover_image ?? ''}
            className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            placeholder="https://example.com/image.jpg"
          />
        </div>

        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            name="is_published"
            id="is_published"
            defaultChecked={post?.is_published ?? false}
            className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary/20"
          />
          <label htmlFor="is_published" className="text-sm text-on-surface">
            Xuat ban ngay
          </label>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-container transition-colors disabled:opacity-50"
        >
          <span className="material-symbols-outlined text-lg">
            {isPending ? 'hourglass_empty' : 'save'}
          </span>
          {isPending ? 'Dang luu...' : post ? 'Cap nhat' : 'Tao bai viet'}
        </button>
        <a
          href="/admin/posts"
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-gray-100 text-on-surface/70 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
        >
          Huy
        </a>
      </div>
    </form>
  )
}
