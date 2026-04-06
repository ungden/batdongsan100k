import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createClient(url, key);
}

export async function POST(req: NextRequest) {
  try {
    const supabase = getAdminClient();
    const payload = await req.json();

    // Only care about incoming money
    if (!payload.amountIn || payload.amountIn <= 0) {
      return NextResponse.json({ success: true, message: 'Not an incoming transaction' });
    }

    const amountPaid = payload.amountIn;
    const content = payload.transactionContent || '';

    // Extract order code (format: TT + 9 digits)
    const extractedCodeMatch = content.match(/TT\d{9,}/i);
    const orderCode = payload.code || (extractedCodeMatch ? extractedCodeMatch[0].toUpperCase() : null);

    if (!orderCode) {
      return NextResponse.json({ success: false, message: 'Could not extract order code' });
    }

    // 1. Find the pending order - exact match, not substring
    const { data: order, error: orderError } = await supabase
      .from('payment_orders')
      .select('*')
      .eq('order_code', orderCode)
      .eq('status', 'pending')
      .single();

    if (orderError || !order) {
      return NextResponse.json({ success: false, message: 'Pending order not found or already paid' });
    }

    // 2. Verify amount
    if (amountPaid < order.amount) {
      return NextResponse.json({ success: false, message: 'Paid amount is less than order amount' });
    }

    // 3. Mark order as paid (idempotency: only update if still pending)
    const { data: updatedOrder, error: updateOrderError } = await supabase
      .from('payment_orders')
      .update({
        status: 'paid',
        sepay_transaction_id: payload.id,
        sepay_code: payload.code,
        paid_at: new Date().toISOString()
      })
      .eq('id', order.id)
      .eq('status', 'pending') // Idempotency guard: only update if still pending
      .select('id')
      .single();

    if (updateOrderError || !updatedOrder) {
      // Order already processed (race condition or duplicate webhook)
      return NextResponse.json({ success: true, message: 'Order already processed' });
    }

    // 4. Upgrade the listing
    const { data: pkg } = await supabase.from('packages').select('*').eq('id', order.package_id).single();
    if (!pkg) throw new Error('Package not found for order');

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + pkg.duration_days);

    // 4.1 Insert listing_packages
    await supabase.from('listing_packages').insert({
      listing_id: order.listing_id,
      package_id: pkg.id,
      package_name: pkg.name,
      started_at: new Date().toISOString(),
      expires_at: expiresAt.toISOString(),
      is_active: true
    });

    // 4.2 Update properties table
    await supabase.from('properties').update({
      is_vip: pkg.priority > 0,
      is_priority: pkg.priority > 0,
    }).eq('id', order.listing_id);

    return NextResponse.json({ success: true, message: 'Order processed and listing upgraded' });

  } catch (error: any) {
    console.error('SePay Webhook Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
