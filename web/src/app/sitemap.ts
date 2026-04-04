import type { MetadataRoute } from 'next'
import { createClient } from '@/lib/supabase/server'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://batdongsan100k.vercel.app'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient()

  // Fetch all published property slugs
  const { data: properties } = await supabase
    .from('properties')
    .select('slug, updated_at')
    .eq('status', 'published')
    .order('created_at', { ascending: false })
    .limit(5000)

  // Fetch published post slugs
  const { data: posts } = await supabase
    .from('posts')
    .select('slug, updated_at')
    .eq('is_published', true)
    .limit(200)

  const staticPages: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified: new Date(), changeFrequency: 'daily', priority: 1.0 },
    { url: `${SITE_URL}/listings`, lastModified: new Date(), changeFrequency: 'hourly', priority: 0.9 },
    { url: `${SITE_URL}/listings?category=rent`, lastModified: new Date(), changeFrequency: 'hourly', priority: 0.9 },
    { url: `${SITE_URL}/projects`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
    { url: `${SITE_URL}/post`, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${SITE_URL}/login`, changeFrequency: 'monthly', priority: 0.3 },
    { url: `${SITE_URL}/register`, changeFrequency: 'monthly', priority: 0.3 },
  ]

  const propertyPages: MetadataRoute.Sitemap = (properties || []).map((p) => ({
    url: `${SITE_URL}/property/${p.slug}`,
    lastModified: p.updated_at ? new Date(p.updated_at) : new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }))

  const postPages: MetadataRoute.Sitemap = (posts || []).map((p) => ({
    url: `${SITE_URL}/news/${p.slug}`,
    lastModified: p.updated_at ? new Date(p.updated_at) : new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }))

  return [...staticPages, ...propertyPages, ...postPages]
}
