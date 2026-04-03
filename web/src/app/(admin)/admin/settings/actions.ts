'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getSettings() {
  const supabase = await createClient()
  const { data } = await supabase.from('site_settings').select('*')

  const settings: Record<string, string> = {}
  data?.forEach((row) => {
    settings[row.key] = row.value
  })
  return settings
}

export async function updateSettings(formData: FormData) {
  const supabase = await createClient()

  const keys = [
    'site_name',
    'site_description',
    'contact_email',
    'contact_phone',
    'contact_address',
  ]

  for (const key of keys) {
    const value = formData.get(key) as string

    const { error } = await supabase
      .from('site_settings')
      .upsert(
        { key, value: value || '' },
        { onConflict: 'key' }
      )

    if (error) throw new Error(error.message)
  }

  revalidatePath('/admin/settings')
}
