'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
}

// Cities
export async function createCity(formData: FormData) {
  const supabase = await createClient()

  const name = formData.get('name') as string
  const slug = slugify(name)
  const sort_order = Number(formData.get('sort_order')) || 0

  const { error } = await supabase.from('cities').insert({
    name,
    slug,
    sort_order,
  })

  if (error) throw new Error(error.message)
  revalidatePath('/admin/categories')
}

export async function deleteCity(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('cities').delete().eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/admin/categories')
}

// Districts
export async function createDistrict(formData: FormData) {
  const supabase = await createClient()

  const name = formData.get('name') as string
  const slug = slugify(name)
  const city_id = formData.get('city_id') as string

  const { error } = await supabase.from('districts').insert({
    name,
    slug,
    city_id,
  })

  if (error) throw new Error(error.message)
  revalidatePath('/admin/categories')
}

export async function deleteDistrict(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('districts').delete().eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/admin/categories')
}

// Features
export async function createFeature(formData: FormData) {
  const supabase = await createClient()

  const name = formData.get('name') as string
  const icon = formData.get('icon') as string

  const { error } = await supabase.from('features').insert({
    name,
    icon: icon || null,
  })

  if (error) throw new Error(error.message)
  revalidatePath('/admin/categories')
}

export async function deleteFeature(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('features').delete().eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/admin/categories')
}
