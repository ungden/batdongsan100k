'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function createPaymentOrderAction(listingId: string, packageId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Bạn cần đăng nhập để thực hiện giao dịch này.');
  }

  // 1. Verify listing belongs to user
  const { data: listing, error: listingError } = await supabase
    .from('listings')
    .select('id, user_id')
    .eq('id', listingId)
    .single()

  if (listingError || !listing || listing.user_id !== user.id) {
    throw new Error('Tin đăng không tồn tại hoặc không thuộc quyền sở hữu của bạn.');
  }

  // 2. Fetch package details
  const { data: pkg, error: pkgError } = await supabase
    .from('packages')
    .select('*')
    .eq('id', packageId)
    .single()

  if (pkgError || !pkg) {
    throw new Error('Gói dịch vụ không tồn tại.');
  }

  // If the package is free (price = 0), we can just upgrade immediately without payment
  if (pkg.price === 0) {
    // Immediate upgrade logic
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + pkg.duration_days)

    const { error: insertError } = await supabase
      .from('listing_packages')
      .insert({
        listing_id: listingId,
        package_id: packageId,
        package_name: pkg.name,
        started_at: new Date().toISOString(),
        expires_at: expiresAt.toISOString(),
        is_active: true
      })
    if (insertError) throw new Error('Đã có lỗi xảy ra khi tạo gói.');

    const { error: updateError } = await supabase
      .from('listings')
      .update({
        is_vip: pkg.priority > 0,
        priority_level: pkg.priority,
        vip_expires_at: expiresAt.toISOString(),
        sort_date: new Date().toISOString()
      })
      .eq('id', listingId)
    if (updateError) throw new Error('Đã có lỗi xảy ra khi cập nhật tin.');

    redirect('/dashboard');
    return;
  }

  // Create a pending payment order
  const orderCode = `TT${Date.now().toString().slice(-6)}${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
  
  let newOrderId = '';

  try {
    const { data: order, error: insertOrderError } = await supabase
      .from('payment_orders')
      .insert({
        user_id: user.id,
        listing_id: listingId,
        package_id: packageId,
        amount: pkg.price,
        status: 'pending',
        order_code: orderCode,
        plan: pkg.name
      })
      .select('id')
      .single()

    if (insertOrderError || !order) {
      console.error('Order Insert Error:', insertOrderError);
      throw new Error('Không thể tạo đơn hàng, vui lòng thử lại.');
    }

    newOrderId = order.id;
  } catch (err) {
    console.error('Payment Create Error:', err)
    throw new Error('Đã có lỗi xảy ra trong quá trình tạo thanh toán.')
  }

  // Redirect to checkout page
  redirect(`/dashboard/checkout/${newOrderId}`);
}
