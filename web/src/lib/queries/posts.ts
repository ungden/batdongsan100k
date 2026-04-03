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

function mapToPost(row: Record<string, unknown>): Post {
  return {
    id: row.id as string,
    title: row.title as string,
    slug: row.slug as string,
    excerpt: (row.excerpt as string) || '',
    content: (row.content as string) || '',
    coverImage: (row.cover_image as string) || '',
    isPublished: row.is_published as boolean,
    publishedAt: row.published_at as string,
    viewsCount: (row.views_count as number) || 0,
  }
}

export async function getPublishedPosts(limit = 6): Promise<Post[]> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('is_published', true)
      .order('published_at', { ascending: false })
      .limit(limit)

    if (error || !data?.length) throw error
    return data.map(mapToPost)
  } catch {
    // No mock posts in data.ts, return empty array
    return []
  }
}
