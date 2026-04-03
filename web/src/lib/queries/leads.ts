import { createClient } from '@/lib/supabase/server'

export async function submitContactLead(data: {
  property_id: string
  agent_id: string
  name: string
  phone: string
  message: string
}): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient()
    const { error } = await supabase.from('contact_leads').insert({
      property_id: data.property_id,
      agent_id: data.agent_id,
      name: data.name,
      phone: data.phone,
      message: data.message,
      status: 'new',
    })

    if (error) throw error
    return { success: true }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return { success: false, error: message }
  }
}
