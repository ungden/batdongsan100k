import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// SePay sends Authorization: Apikey <SEPAY_WEBHOOK_API_KEY>
// See https://docs.sepay.vn for the spec.
function verifySepayAuth(req: NextRequest): boolean {
  const expected = process.env.SEPAY_WEBHOOK_API_KEY;
  if (!expected) return false;
  const auth = req.headers.get('authorization') ?? '';
  const expectedHeader = `Apikey ${expected}`;
  if (auth.length !== expectedHeader.length) return false;
  let mismatch = 0;
  for (let i = 0; i < auth.length; i++) {
    mismatch |= auth.charCodeAt(i) ^ expectedHeader.charCodeAt(i);
  }
  return mismatch === 0;
}

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error('Supabase admin client not configured (missing SUPABASE_SERVICE_ROLE_KEY).');
  }
  return createClient(url, key, { auth: { persistSession: false } });
}

export async function POST(req: NextRequest) {
  if (!verifySepayAuth(req)) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const supabase = getAdminClient();
    const payload = await req.json();

    if (!payload.amountIn || payload.amountIn <= 0) {
      return NextResponse.json({ success: true, message: 'Not an incoming transaction' });
    }

    const amountPaid = Number(payload.amountIn);
    const content = payload.transactionContent || payload.content || '';

    const extractedCodeMatch = String(content).match(/TT[A-Z0-9]{6,}/i);
    const orderCode = payload.code || (extractedCodeMatch ? extractedCodeMatch[0].toUpperCase() : null);

    if (!orderCode) {
      return NextResponse.json({ success: false, message: 'Could not extract order code' });
    }

    const { data: order, error: orderError } = await supabase
      .from('payment_orders')
      .select('*')
      .eq('order_code', orderCode)
      .eq('status', 'pending')
      .single();

    if (orderError || !order) {
      return NextResponse.json({ success: false, message: 'Pending order not found or already paid' });
    }

    if (amountPaid < Number(order.amount)) {
      return NextResponse.json({ success: false, message: 'Paid amount is less than order amount' });
    }

    const { data: updatedOrder, error: updateOrderError } = await supabase
      .from('payment_orders')
      .update({
        status: 'paid',
        sepay_transaction_id: String(payload.id ?? ''),
        sepay_code: payload.code ?? null,
        paid_at: new Date().toISOString(),
      })
      .eq('id', order.id)
      .eq('status', 'pending')
      .select('id')
      .single();

    if (updateOrderError || !updatedOrder) {
      return NextResponse.json({ success: true, message: 'Order already processed' });
    }

    const { data: pkg } = await supabase.from('packages').select('*').eq('id', order.package_id).single();
    if (!pkg) throw new Error('Package not found for order');

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + pkg.duration_days);

    await supabase.from('listing_packages').insert({
      listing_id: order.listing_id,
      package_id: pkg.id,
      package_name: pkg.name,
      started_at: new Date().toISOString(),
      expires_at: expiresAt.toISOString(),
      is_active: true,
    });

    await supabase.from('properties').update({
      is_vip: pkg.priority > 0,
      is_priority: pkg.priority > 0,
    }).eq('id', order.listing_id);

    return NextResponse.json({ success: true, message: 'Order processed and listing upgraded' });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('SePay Webhook Error:', message);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
