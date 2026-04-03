import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import PostForm from '../PostForm'

export default async function EditPostPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: post } = await supabase
    .from('posts')
    .select('*')
    .eq('id', id)
    .single()

  if (!post) notFound()

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-on-surface">Sua bai viet</h1>
          <p className="text-sm text-on-surface/60 mt-1">{post.title}</p>
        </div>
      </div>

      <PostForm post={post} />
    </div>
  )
}
