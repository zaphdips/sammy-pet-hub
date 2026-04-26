import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

/**
 * Asyncpay Webhook Handler
 *
 * WHY: This is the source of truth for payments.
 * We listen for 'payment.completed.successfully' to mark orders as Paid.
 *
 * SECURITY NOTES:
 * - We verify the secret header BEFORE parsing the body (DoS protection).
 * - We use the service-role (admin) client so RLS does not block updates.
 * - We look up orders by `tracking_number` (our ref), NOT by order_id from
 *   the payload — never trust IDs from untrusted external bodies (IDOR risk).
 */

export async function POST(req: NextRequest) {
  try {
    const signature = req.headers.get("AsyncPay-Secret");

    // 1. Verify Signature FIRST — before parsing body
    if (!signature || signature !== process.env.ASYNCPAY_WEBHOOK_SECRET) {
      console.warn("[Webhook] Invalid or missing signature");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { event, data } = body;
    console.log(`[Webhook] Received Asyncpay Event: ${event}`);

    // Use the admin client — bypasses RLS for trusted server-side writes
    const supabaseAdmin = getSupabaseAdmin();

    // 2. Handle Payment Completion
    if (event === "payment.completed.successfully") {
      const { reference } = data;

      // SECURITY: Look up orders by OUR reference (tracking_number), not by
      // an ID from the untrusted payload — prevents IDOR attacks.
      if (!reference) {
        console.error("[Webhook] Missing reference in payload");
        return NextResponse.json({ error: "Bad Request" }, { status: 400 });
      }

      const { error } = await supabaseAdmin
        .from("orders")
        .update({
          status: "processing",
          paid_at: new Date().toISOString(),
          transaction_ref: reference,
        })
        .eq("tracking_number", reference);

      if (error) {
        console.error("[Webhook] DB Update Error:", error.message);
        return NextResponse.json({ error: "DB Error" }, { status: 500 });
      }

      console.log(`[Webhook] Order with ref ${reference} marked as PAID.`);
    }

    // 3. Handle Expiry/Failure
    if (event === "payment.expired" || event === "payment.failed") {
      const reference = data?.reference;
      if (reference) {
        await supabaseAdmin
          .from("orders")
          .update({ status: "cancelled" })
          .eq("tracking_number", reference);
      }
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error("[Webhook] Error:", err.message);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
