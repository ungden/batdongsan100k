'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function submitPropertyAction(
  _prev: { success: boolean; error?: string } | null,
  formData: FormData,
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Bạn cần đăng nhập để đăng tin.' }
  }

  const title = formData.get('title') as string
  const type = formData.get('type') as string
  const priceRaw = parseFloat(formData.get('price') as string || '0')
  const area = parseFloat(formData.get('area') as string || '0')
  const description = formData.get('description') as string
  const city = formData.get('city') as string
  const district = formData.get('district') as string
  const address = formData.get('address') as string
  const category = (formData.get('category') as string) || 'sale'
  const bedrooms = parseInt(formData.get('bedrooms') as string || '0', 10)
  const bathrooms = parseInt(formData.get('bathrooms') as string || '0', 10)
  const direction = (formData.get('direction') as string) || ''
  const imagesRaw = (formData.get('images') as string) || ''
  const images = imagesRaw.split('\n').map(s => s.trim()).filter(s => s.startsWith('http')).slice(0, 12)

  if (!title || !type || !priceRaw || !area) {
    return { success: false, error: 'Vui lòng nhập đầy đủ thông tin bắt buộc' }
  }

  // Generate slug from title
  const slug = title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    + '-' + Date.now().toString(36)

  // Price is entered in tỷ for sale, triệu for rent
  const price = category === 'rent'
    ? priceRaw * 1_000_000
    : priceRaw * 1_000_000_000

  try {
    const { error } = await supabase.from('properties').insert({
      title,
      slug,
      price,
      price_formatted: String(priceRaw),
      price_unit: category === 'rent' ? 'trieu/thang' : (priceRaw >= 1 ? 'ty' : 'trieu'),
      type,
      category,
      status: 'pending_review',
      address: address || '',
      district: district || '',
      city: city || '',
      area,
      bedrooms,
      bathrooms,
      direction: direction || null,
      description: description || '',
      images,
      features: [],
      created_by: user.id,
    })

    if (error) {
      console.error("Supabase Insert Error:", error)
      throw error
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return { success: false, error: `Lỗi khi đăng tin: ${message}` }
  }

  redirect('/post/success')
}
