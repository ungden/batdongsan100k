'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

function mapTypeToCategory(type: string) {
  switch (type) {
    case 'apartment':
      return 'apartment'
    case 'land':
      return 'land'
    case 'room':
      return 'room'
    case 'house':
    default:
      return 'house'
  }
}

function formatDistrict(address: string, district: string) {
  return district || address || ''
}

export async function createProperty(formData: FormData) {
  const supabase = await createClient()

  const title = String(formData.get('title') || '').trim()
  const type = String(formData.get('type') || 'house')
  const category = String(formData.get('category') || 'sale')
  const price = Number(formData.get('price') || 0)
  const area = Number(formData.get('area') || 0)
  const address = String(formData.get('address') || '').trim()
  const city = String(formData.get('city') || '').trim()
  const district = String(formData.get('district') || '').trim()
  const description = String(formData.get('description') || '').trim()
  const status = String(formData.get('status') || 'pending')
  const imagesRaw = String(formData.get('images') || '')
  const images = imagesRaw ? imagesRaw.split('\n').map((x) => x.trim()).filter(Boolean) : []

  if (!title || title.length < 3) throw new Error('Tiêu đề phải có ít nhất 3 ký tự')
  if (!price || price <= 0) throw new Error('Giá phải lớn hơn 0')
  if (!area || area <= 0) throw new Error('Diện tích phải lớn hơn 0')

  const { error } = await supabase.from('properties').insert({
    user_id: null,
    title,
    description,
    price,
    address,
    district: formatDistrict(address, district),
    city,
    province: city,
    category: mapTypeToCategory(type),
    transaction_type: category === 'rent' ? 'cho-thue' : 'mua-ban',
    area,
    status,
    images,
    is_vip: false,
    priority_level: 0,
    sort_date: new Date().toISOString(),
    contact_name: 'Admin',
    contact_phone: '',
  })

  if (error) throw new Error(error.message)

  revalidatePath('/admin/properties')
  redirect('/admin/properties')
}

export async function updateProperty(id: string, formData: FormData) {
  const supabase = await createClient()
  const title = String(formData.get('title') || '').trim()
  const type = String(formData.get('type') || 'house')
  const category = String(formData.get('category') || 'sale')
  const price = Number(formData.get('price') || 0)
  const area = Number(formData.get('area') || 0)
  const address = String(formData.get('address') || '').trim()
  const city = String(formData.get('city') || '').trim()
  const district = String(formData.get('district') || '').trim()
  const description = String(formData.get('description') || '').trim()
  const status = String(formData.get('status') || 'pending')
  const imagesRaw = String(formData.get('images') || '')
  const images = imagesRaw ? imagesRaw.split('\n').map((x) => x.trim()).filter(Boolean) : []

  if (!id) throw new Error('Thiếu ID tin đăng')
  if (!title || title.length < 3) throw new Error('Tiêu đề phải có ít nhất 3 ký tự')

  const { error } = await supabase
    .from('properties')
    .update({
      title,
      description,
      price,
      address,
      district: formatDistrict(address, district),
      city,
      province: city,
      category: mapTypeToCategory(type),
      transaction_type: category === 'rent' ? 'cho-thue' : 'mua-ban',
      area,
      status,
      images,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)

  if (error) throw new Error(error.message)

  revalidatePath('/admin/properties')
  redirect('/admin/properties')
}

export async function deleteProperty(id: string) {
  if (!id) throw new Error('Thiếu ID tin đăng')
  const supabase = await createClient()
  const { error } = await supabase.from('properties').delete().eq('id', id)
  if (error) throw new Error(error.message)

  revalidatePath('/admin/properties')
  redirect('/admin/properties')
}

export async function bulkUpdateStatus(ids: string[], status: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('properties').update({ status, updated_at: new Date().toISOString() }).in('id', ids)
  if (error) throw new Error(error.message)
  revalidatePath('/admin/properties')
}

export async function bulkDelete(ids: string[]) {
  const supabase = await createClient()
  const { error } = await supabase.from('properties').delete().in('id', ids)
  if (error) throw new Error(error.message)
  revalidatePath('/admin/properties')
}

export async function toggleFeatured(id: string) {
  const supabase = await createClient()
  const { data } = await supabase.from('properties').select('is_vip').eq('id', id).single()
  if (!data) throw new Error('Listing not found')
  const nextVip = !data.is_vip
  const { error } = await supabase.from('properties').update({ is_vip: nextVip, priority_level: nextVip ? 1 : 0 }).eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/admin/properties')
}
