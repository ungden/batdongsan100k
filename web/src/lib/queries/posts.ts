import { createClient } from '@/lib/supabase/server'

export interface Post {
  id: string
  title: string
  slug: string
  excerpt: string
  content: string
  coverImage: string
  isPublished: boolean
  publishedAt: string
  viewsCount: number
}

const POST_LIST_COLUMNS = 'id, title, slug, excerpt, cover_image, is_published, published_at, views_count'
const POST_DETAIL_COLUMNS = 'id, title, slug, excerpt, content, cover_image, is_published, published_at, views_count, created_at, updated_at'

function mapToPost(row: Record<string, unknown>): Post {
  return {
    id: row.id as string,
    title: row.title as string,
    slug: row.slug as string,
    excerpt: (row.excerpt as string) || '',
    content: (row.content as string) || '',
    coverImage: (row.cover_image as string) || '',
    isPublished: row.is_published as boolean,
    publishedAt: (row.published_at as string) || (row.created_at as string) || '',
    viewsCount: (row.views_count as number) || 0,
  }
}

export async function getPublishedPosts(limit = 6, offset?: number): Promise<{ posts: Post[]; count: number }> {
  try {
    const supabase = await createClient()
    let query = supabase
      .from('posts')
      .select(POST_LIST_COLUMNS, { count: 'estimated' })
      .eq('is_published', true)
      .order('published_at', { ascending: false })

    if (offset !== undefined) {
      query = query.range(offset, offset + limit - 1)
    } else {
      query = query.limit(limit)
    }

    const { data, error, count } = await query
    if (error) throw error
    return { posts: (data || []).map(mapToPost), count: count || 0 }
  } catch {
    return { posts: [], count: 0 }
  }
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('posts')
      .select(POST_DETAIL_COLUMNS)
      .eq('slug', slug)
      .eq('is_published', true)
      .single()

    if (error || !data) return null
    return mapToPost(data)
  } catch {
    return null
  }
}

export async function getRelatedPosts(currentSlug: string, limit = 3): Promise<Post[]> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('posts')
      .select(POST_LIST_COLUMNS)
      .eq('is_published', true)
      .neq('slug', currentSlug)
      .order('published_at', { ascending: false })
      .limit(limit)

    if (error) throw error
    return (data || []).map(mapToPost)
  } catch {
    return []
  }
}

export async function incrementPostViewCount(postId: string) {
  try {
    const supabase = await createClient()
    const { data } = await supabase.from('posts').select('views_count').eq('id', postId).single()
    if (data) {
      await supabase.from('posts').update({ views_count: (data.views_count || 0) + 1 }).eq('id', postId)
    }
  } catch {
    // no-op
  }
}
