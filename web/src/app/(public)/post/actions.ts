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

  if (!title || !type || !priceRaw || !area) {
    return { success: false, error: 'Vui lòng nhập đầy đủ thông tin bắt buộc' }
  }

  try {
    const categoryMap: Record<string, string> = {
      'chung-cu': 'apartment',
      'nha-pho': 'house',
      'biet-thu': 'house',
      'dat-nen': 'land',
      'phong-tro': 'room',
    }

    const { error } = await supabase.from('listings').insert({
      user_id: user.id,
      title,
      price: priceRaw * 1000000000,
      category: categoryMap[type] || 'house',
      transaction_type: category === 'rent' ? 'cho-thue' : 'mua-ban',
      address: address || '',
      district: district || '',
      city: city || '',
      area,
      description: description || '',
      images: ['https://images.unsplash.com/photo-1564013799919-ab600027ffc6'],
      status: 'pending',
      contact_name: user.user_metadata?.full_name || user.email,
      contact_phone: '',
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
