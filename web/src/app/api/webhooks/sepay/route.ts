import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Setup admin client to bypass RLS for webhooks
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();

    // SePay Payload reference:
    // { gateway, transactionDate, accountNumber, amountIn, amountOut, accumulated, code, transactionContent, referenceNumber, body }
    
    // We only care about incoming money
    if (payload.amountIn <= 0) {
      return NextResponse.json({ success: true, message: 'Not an incoming transaction' });
    }

    const amountPaid = payload.amountIn;
    const content = payload.transactionContent || '';

    // Search for order code in the transaction content
    // We expect the order code to be something like "TT123456789"
    // Since SePay tries to extract the code into payload.code, we can use that, or fallback to parsing the content
    
    const extractedCodeMatch = content.match(/TT\d{9}/i);
    const orderCode = payload.code || (extractedCodeMatch ? extractedCodeMatch[0].toUpperCase() : null);

    if (!orderCode) {
      return NextResponse.json({ success: false, message: 'Could not extract order code from content' });
    }

    // 1. Find the pending order
    const { data: order, error: orderError } = await supabase
      .from('payment_orders')
      .select('*')
      .ilike('order_code', `%${orderCode}%`)
      .eq('status', 'pending')
      .single();

    if (orderError || !order) {
      return NextResponse.json({ success: false, message: 'Pending order not found or already paid' });
    }

    // 2. Verify amount
    if (amountPaid < order.amount) {
      return NextResponse.json({ success: false, message: 'Paid amount is less than order amount' });
    }

    // 3. Mark order as paid
    const { error: updateOrderError } = await supabase
      .from('payment_orders')
      .update({
        status: 'paid',
        sepay_transaction_id: payload.id,
        sepay_code: payload.code,
        paid_at: new Date().toISOString()
      })
      .eq('id', order.id);

    if (updateOrderError) {
      throw updateOrderError;
    }

    // 4. Upgrade the listing!
    // 4.1 Get package info
    const { data: pkg } = await supabase.from('packages').select('*').eq('id', order.package_id).single();
    if (!pkg) throw new Error('Package not found for order');

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + pkg.duration_days);

    // 4.2 Insert listing_packages
    await supabase.from('property_packages').insert({
      listing_id: order.listing_id,
      package_id: pkg.id,
      package_name: pkg.name,
      started_at: new Date().toISOString(),
      expires_at: expiresAt.toISOString(),
      is_active: true
    });

    // 4.3 Update listings table
    await supabase.from('properties').update({
      is_vip: pkg.priority > 0,
      priority_level: pkg.priority,
      vip_expires_at: expiresAt.toISOString(),
      sort_date: new Date().toISOString() // push to top
    }).eq('id', order.listing_id);

    return NextResponse.json({ success: true, message: 'Order processed and listing upgraded' });

  } catch (error: any) {
    console.error('SePay Webhook Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
