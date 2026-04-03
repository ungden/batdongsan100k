'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createAgent(formData: FormData) {
  const name = formData.get('name') as string
  if (!name || name.trim().length < 2) {
    throw new Error('Ten phai co it nhat 2 ky tu')
  }

  const email = formData.get('email') as string
  if (!email || !email.includes('@')) {
    throw new Error('Email khong hop le')
  }

  const supabase = await createClient()

  const { error } = await supabase.from('agents').insert({
    name,
    email,
    phone: formData.get('phone') as string,
    bio: formData.get('bio') as string,
    avatar: formData.get('avatar') as string,
    is_active: formData.get('is_active') === 'on',
  })

  if (error) throw new Error(error.message)

  revalidatePath('/admin/agents')
  redirect('/admin/agents')
}

export async function updateAgent(id: string, formData: FormData) {
  if (!id) throw new Error('Thieu ID nhan vien')

  const name = formData.get('name') as string
  if (!name || name.trim().length < 2) {
    throw new Error('Ten phai co it nhat 2 ky tu')
  }

  const email = formData.get('email') as string
  if (!email || !email.includes('@')) {
    throw new Error('Email khong hop le')
  }

  const supabase = await createClient()

  const { error } = await supabase
    .from('agents')
    .update({
      name,
      email,
      phone: formData.get('phone') as string,
      bio: formData.get('bio') as string,
      avatar: formData.get('avatar') as string,
      is_active: formData.get('is_active') === 'on',
    })
    .eq('id', id)

  if (error) throw new Error(error.message)

  revalidatePath('/admin/agents')
  redirect('/admin/agents')
}

export async function deleteAgent(id: string) {
  if (!id) throw new Error('Thieu ID nhan vien')
  const supabase = await createClient()
  const { error } = await supabase.from('agents').delete().eq('id', id)
  if (error) throw new Error(error.message)

  revalidatePath('/admin/agents')
  redirect('/admin/agents')
}

export async function toggleActive(id: string) {
  const supabase = await createClient()

  const { data } = await supabase
    .from('agents')
    .select('is_active')
    .eq('id', id)
    .single()

  if (!data) throw new Error('Agent not found')

  const { error } = await supabase
    .from('agents')
    .update({ is_active: !data.is_active })
    .eq('id', id)

  if (error) throw new Error(error.message)
  revalidatePath('/admin/agents')
}
