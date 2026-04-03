'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateLeadStatus(id: string, status: string) {
  if (!id) throw new Error('Thieu ID lien he')
  if (!status) throw new Error('Vui long chon trang thai')

  const supabase = await createClient()

  const { error } = await supabase
    .from('contact_leads')
    .update({ status })
    .eq('id', id)

  if (error) throw new Error(error.message)
  revalidatePath('/admin/leads')
}
