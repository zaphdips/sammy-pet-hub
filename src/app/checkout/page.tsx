"use client";

import { useCart } from "@/context/CartContext";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { ShieldCheck, ShoppingBag, ArrowLeft, CreditCard } from "lucide-react";
import styles from "./Checkout.module.css";
import Link from "next/link";
import { useToast } from "@/components/Toast";



export default function CheckoutPage() {
  const { cart, clearCart } = useCart();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { showToast } = useToast();

  const total = cart.reduce((sum, item) => sum + item.price, 0);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.push("/auth");
      } else {
        setUser(session.user);
      }
    });
  }, [router]);

  const handlePayment = async () => {
    if (!user || cart.length === 0) return;
    setLoading(true);

    try {
      const orderRef = "SPH-" + Math.random().toString(36).substr(2, 4).toUpperCase() + "-" + Math.random().toString(36).substr(2, 4).toUpperCase();
      
      // 1. Create a "Pending" order in Supabase
      const { error: orderError } = await supabase.from("orders").insert([{
        user_id: user.id,
        item_name: cart.map(i => i.name).join(", "),
        item_category: cart.length > 1 ? "Multiple Items" : cart[0].category,
        price: Number(total), // Strict numeric conversion
        status: "pending",
        tracking_number: orderRef
      }]);

      if (orderError) {
        console.error("[Checkout] DB Insert Error:", orderError);
        showToast("Couldn't create your order. Please try again.", "error");
        setLoading(false);
        return;
      }

      // 2. Mock Payment Flow (Asyncpay bypassed since live keys require KYC)
      setTimeout(async () => {
        // Update order status
        await supabase.from("orders").update({ status: "completed" }).eq("tracking_number", orderRef);
        
        showToast("Payment Processed Successfully!", "success");
        clearCart();
        router.push("/profile/orders?success=true");
      }, 2000);
      
    } catch (err: any) {
      console.error("[Checkout] Fatal Payment Error:", err);
      showToast(err.message || "Something went wrong. Please try again.", "error");
      setLoading(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className={styles.emptyContainer}>
        <ShoppingBag size={64} color="#cbd5e1" />
        <h2>Your cart is empty</h2>
        <Link href="/shop" className={styles.backBtn}>Back to Shop</Link>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.header}>
          <Link href="/shop" className={styles.backLink}><ArrowLeft size={18} /> Back to Hub</Link>
          <h1>Secure Checkout</h1>
        </div>

        <div className={styles.layout}>
          <div className={styles.formSection}>
            <div className={`${styles.card} glass`}>
              <h3><ShieldCheck size={20} /> Order Verification</h3>
              <p>Paying as: <strong>{user?.email}</strong></p>
              
              <div className={styles.paymentMethod}>
                 <CreditCard size={24} />
                 <div>
                   <strong>Asyncpay Secured</strong>
                   <span>Multi-Gateway Orchestration</span>
                 </div>
              </div>

              <button 
                className={styles.payBtn} 
                onClick={handlePayment}
                disabled={loading}
              >
                {loading ? "Processing Payment..." : `Pay ₦${total.toLocaleString()}`}
              </button>
            </div>
          </div>

          <div className={styles.summarySection}>
             <div className={`${styles.summaryCard} glass`}>
               <h3>Order Summary</h3>
               <div className={styles.itemList}>
                 {cart.map((item, idx) => (
                   <div key={idx} className={styles.item}>
                     <div className={styles.itemThumb}>📦</div>
                     <div className={styles.itemInfo}>
                        <strong>{item.name}</strong>
                        <span>{item.category}</span>
                     </div>
                     <div className={styles.itemPrice}>₦{item.price.toLocaleString()}</div>
                   </div>
                 ))}
               </div>
               
               <div className={styles.totalRow}>
                 <span>Subtotal</span>
                 <strong>₦{total.toLocaleString()}</strong>
               </div>
               <div className={styles.totalRow}>
                 <span>Delivery Fee</span>
                 <strong>FREE</strong>
               </div>
               <div className={`${styles.totalRow} ${styles.grandTotal}`}>
                 <span>Total</span>
                 <strong>₦{total.toLocaleString()}</strong>
               </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
