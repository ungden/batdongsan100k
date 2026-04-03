'use server'

import { submitContactLead } from '@/lib/queries/leads'

export async function submitContactAction(formData: FormData) {
  const propertyId = formData.get('property_id') as string
  const agentId = formData.get('agent_id') as string
  const name = formData.get('name') as string
  const phone = formData.get('phone') as string
  const message = formData.get('message') as string

  if (!name || !phone) {
    return { success: false, error: 'Vui lòng nhập họ tên và số điện thoại' }
  }

  return submitContactLead({
    property_id: propertyId,
    agent_id: agentId,
    name,
    phone,
    message: message || '',
  })
}
