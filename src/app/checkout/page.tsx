"use client";

import { useCart } from "@/context/CartContext";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { ShieldCheck, ShoppingBag, ArrowLeft, CreditCard, Mail, User as UserIcon, Phone, Lock, Trash2, Truck } from "lucide-react";
import styles from "./Checkout.module.css";
import Link from "next/link";
import { useToast } from "@/components/Toast";
import { useCurrency } from "@/context/CurrencyContext";
import ProductCard from "@/components/ProductCard";
import ScrollCarousel from "@/components/ScrollCarousel";

export default function CheckoutPage() {
  const { cart, removeFromCart, updateQuantity, clearCart } = useCart();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { showToast } = useToast();
  const { formatPrice } = useCurrency();

  const [suggestions, setSuggestions] = useState<any[]>([]);

  // Guest checkout & Inline Auth fields
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [createAccount, setCreateAccount] = useState(false);
  const [guestPassword, setGuestPassword] = useState("");

  // Derive totals from cart
  const subtotal = cart.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);
  const delivery = subtotal > 15000 ? 0 : 2500; // Free delivery over 15k
  const total = subtotal + delivery;
  const itemCount = cart.reduce((count, item) => count + (item.quantity || 1), 0);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    // Fetch cross-sells
    async function fetchSuggestions() {
      const { data } = await supabase
        .from("products")
        .select("*")
        .limit(4)
        .order("created_at", { ascending: false });
      if (data) setSuggestions(data);
    }
    fetchSuggestions();
  }, []);

  const handlePayment = async () => {
    if (cart.length === 0) return;

    if (!user) {
      if (!guestEmail.trim()) {
        showToast("Please enter your email address.", "warning");
        return;
      }
      if (!guestName.trim()) {
        showToast("Please enter your full name.", "warning");
        return;
      }
    }

    setLoading(true);

    try {
      let finalUserId = user?.id;

      // Best of Both Worlds: Inline Account Creation
      if (!user && createAccount) {
        if (!guestPassword || guestPassword.length < 6) {
          showToast("Password must be at least 6 characters.", "warning");
          setLoading(false);
          return;
        }

        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: guestEmail.trim(),
          password: guestPassword,
          options: {
            data: { full_name: guestName.trim() }
          }
        });

        if (authError) {
          showToast(authError.message, "error");
          setLoading(false);
          return;
        }
        
        finalUserId = authData?.user?.id;
      }

      const orderRef = "PC-" + Math.random().toString(36).substr(2, 4).toUpperCase() + "-" + Math.random().toString(36).substr(2, 4).toUpperCase();
      
      const orderData: any = {
        item_name: cart.map(i => `${i.quantity || 1}x ${i.name}`).join(", "),
        item_category: cart.length > 1 ? "Multiple Items" : cart[0].category,
        price: Number(total),
        status: "pending",
        tracking_number: orderRef
      };

      if (finalUserId) {
        orderData.user_id = finalUserId;
      } else {
        orderData.guest_email = guestEmail.trim();
        orderData.guest_name = guestName.trim();
        orderData.guest_phone = guestPhone.trim();
      }

      const { error: orderError } = await supabase.from("orders").insert([orderData]);

      if (orderError) {
        console.error("[Checkout] DB Insert Error:", orderError);
        showToast("Couldn't create your order. Please try again.", "error");
        setLoading(false);
        return;
      }

      // Mock Payment Flow
      setTimeout(async () => {
        await supabase.from("orders").update({ status: "completed" }).eq("tracking_number", orderRef);
        
        showToast("Payment Processed Successfully! 🎉", "success");
        if (createAccount) {
          showToast("Account created! You can track your order in your profile.", "success");
        }
        clearCart();

        if (finalUserId) {
          router.push("/profile/orders?success=true");
        } else {
          router.push(`/checkout/success?ref=${orderRef}&email=${encodeURIComponent(guestEmail)}`);
        }
      }, 2000);
      
    } catch (err: any) {
      console.error("[Checkout] Fatal Payment Error:", err);
      showToast(err.message || "Something went wrong. Please try again.", "error");
      setLoading(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className={styles.page}>
        <div className={styles.emptyContainer}>
          <div className={styles.emptyIconAnimated}>
            <img 
              src="https://images.unsplash.com/photo-1544568100-847a948585b9?auto=format&fit=crop&q=80&w=400" 
              alt="Sad Empty Basket Dog" 
              className={styles.emptyDogImg} 
            />
          </div>
          <h2>Your basket is empty</h2>
          <p>Looks like you haven't added anything yet.</p>
          <Link href="/shop" className={styles.backBtn}>Continue Shopping</Link>
        </div>

        {suggestions.length > 0 && (
          <section style={{ maxWidth: 1200, margin: '60px auto 0' }}>
            <h2 style={{ fontFamily: 'Outfit', color: 'var(--brand-primary)', marginBottom: 24 }}>You might also like...</h2>
            <ScrollCarousel>
              {suggestions.map((product) => (
                <ProductCard key={product.id} id={product.id} {...product} />
              ))}
            </ScrollCarousel>
          </section>
        )}
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.header}>
          <Link href="/shop" className={styles.backLink}><ArrowLeft size={18} /> Continue Shopping</Link>
          <h1>Your Basket <span className={styles.itemBadge}>{itemCount}</span></h1>
        </div>

        <div className={styles.uspBar}>
          <div className={styles.usp}><Truck size={20} /> Fast, tracked delivery</div>
          <div className={styles.usp}><ShieldCheck size={20} /> Secure SSL checkout</div>
        </div>

        <div className={styles.layout}>
          {/* Left Column: Editable Basket Items */}
          <div className={styles.itemsSection}>
            {cart.map((item, idx) => (
              <div key={idx} className={styles.itemCard}>
                <div className={styles.itemImage}>📦</div>
                <div className={styles.itemDetails}>
                  <h3>{item.name}</h3>
                  <span className={styles.itemCategory}>{item.category}</span>
                </div>
                
                <div className={styles.itemQuantityControl}>
                  <button onClick={() => updateQuantity(idx, (item.quantity || 1) - 1)}>-</button>
                  <span>{item.quantity || 1}</span>
                  <button onClick={() => updateQuantity(idx, (item.quantity || 1) + 1)}>+</button>
                </div>
                
                <div className={styles.itemActions}>
                  <div className={styles.itemPrice}>{formatPrice(item.price * (item.quantity || 1))}</div>
                  <button 
                    className={styles.removeBtn}
                    onClick={() => removeFromCart(idx)}
                    aria-label="Remove item"
                  >
                    <Trash2 size={16} /> Remove
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Right Column: Auth & Summary */}
          <div className={styles.checkoutSection}>
            
            <div className={styles.authCard}>
              <h3><UserIcon size={20} /> {user ? "Logged In As" : "Your Details"}</h3>
              
              {user ? (
                <p style={{ color: 'var(--text-main)', fontWeight: 600 }}>{user.email}</p>
              ) : (
                <div className={styles.guestForm}>
                  <div className={styles.formGroup}>
                    <label>Full Name *</label>
                    <input 
                      type="text" 
                      placeholder="e.g. John Doe"
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                    />
                  </div>
                  
                  <div className={styles.formGroup}>
                    <label>Email Address *</label>
                    <input 
                      type="email" 
                      placeholder="e.g. john@example.com"
                      value={guestEmail}
                      onChange={(e) => setGuestEmail(e.target.value)}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>Phone (Optional)</label>
                    <input 
                      type="tel" 
                      placeholder="e.g. +234..."
                      value={guestPhone}
                      onChange={(e) => setGuestPhone(e.target.value)}
                    />
                  </div>

                  {/* Best of Both Worlds Toggle */}
                  <label className={styles.checkboxGroup}>
                    <input 
                      type="checkbox" 
                      checked={createAccount}
                      onChange={(e) => setCreateAccount(e.target.checked)}
                    />
                    Save my details & create an account
                  </label>

                  {createAccount && (
                    <div className={styles.passwordReveal}>
                      <div className={styles.formGroup}>
                        <label><Lock size={16} /> Choose a Password</label>
                        <input 
                          type="password" 
                          placeholder="Min 6 characters"
                          value={guestPassword}
                          onChange={(e) => setGuestPassword(e.target.value)}
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className={styles.summaryCard}>
              <h3><CreditCard size={20} /> Order Summary</h3>
              
              <div className={styles.totalRow}>
                <span>Subtotal ({itemCount} {itemCount === 1 ? "item" : "items"})</span>
                <strong>{formatPrice(subtotal)}</strong>
              </div>
              <div className={styles.totalRow}>
                <span>Delivery Fee</span>
                <strong>{delivery === 0 ? "FREE" : formatPrice(delivery)}</strong>
              </div>
              
              <div className={styles.grandTotal}>
                <span>Total to Pay</span>
                <strong style={{ float: 'right' }}>{formatPrice(total)}</strong>
              </div>

              <button 
                className={styles.payBtn} 
                onClick={handlePayment}
                disabled={loading}
              >
                {loading ? "Processing..." : `Pay ${formatPrice(total)}`}
                {!loading && <ShieldCheck size={20} />}
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
