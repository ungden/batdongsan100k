'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
}

export async function createPost(formData: FormData) {
  const title = formData.get('title') as string
  if (!title || title.trim().length < 3) {
    throw new Error('Tieu de phai co it nhat 3 ky tu')
  }

  const content = formData.get('content') as string
  if (!content || content.trim().length < 10) {
    throw new Error('Noi dung phai co it nhat 10 ky tu')
  }

  const supabase = await createClient()

  const slugInput = formData.get('slug') as string
  const slug = slugInput || slugify(title) + '-' + Date.now()

  const { error } = await supabase.from('posts').insert({
    title,
    slug,
    excerpt: formData.get('excerpt') as string,
    content: formData.get('content') as string,
    cover_image: formData.get('cover_image') as string,
    is_published: formData.get('is_published') === 'on',
  })

  if (error) throw new Error(error.message)

  revalidatePath('/admin/posts')
  redirect('/admin/posts')
}

export async function updatePost(id: string, formData: FormData) {
  if (!id) throw new Error('Thieu ID bai viet')

  const title = formData.get('title') as string
  if (!title || title.trim().length < 3) {
    throw new Error('Tieu de phai co it nhat 3 ky tu')
  }

  const supabase = await createClient()

  const { error } = await supabase
    .from('posts')
    .update({
      title: formData.get('title') as string,
      slug: formData.get('slug') as string,
      excerpt: formData.get('excerpt') as string,
      content: formData.get('content') as string,
      cover_image: formData.get('cover_image') as string,
      is_published: formData.get('is_published') === 'on',
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)

  if (error) throw new Error(error.message)

  revalidatePath('/admin/posts')
  redirect('/admin/posts')
}

export async function deletePost(id: string) {
  if (!id) throw new Error('Thieu ID bai viet')
  const supabase = await createClient()
  const { error } = await supabase.from('posts').delete().eq('id', id)
  if (error) throw new Error(error.message)

  revalidatePath('/admin/posts')
  redirect('/admin/posts')
}

export async function togglePublished(id: string) {
  const supabase = await createClient()

  const { data } = await supabase
    .from('posts')
    .select('is_published')
    .eq('id', id)
    .single()

  if (!data) throw new Error('Post not found')

  const { error } = await supabase
    .from('posts')
    .update({ is_published: !data.is_published })
    .eq('id', id)

  if (error) throw new Error(error.message)
  revalidatePath('/admin/posts')
}
