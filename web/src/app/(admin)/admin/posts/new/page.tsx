'use client'

import PageHeader from '@/components/admin/PageHeader'
import PostForm from '../PostForm'

export default function NewPostPage() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-on-surface">Them bai viet</h1>
          <p className="text-sm text-on-surface/60 mt-1">
            Tao bai viet moi cho trang web
          </p>
        </div>
      </div>

      <PostForm />
    </div>
  )
}
