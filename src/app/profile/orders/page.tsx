"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { Package, Truck, CheckCircle, Clock, ArrowLeft, ShoppingBag } from "lucide-react";
import styles from "./Orders.module.css";
import Link from "next/link";

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function fetchOrders() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/auth");
        return;
      }

      const { data, error } = await supabase.from('orders')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });

      if (data) setOrders(data);
      setLoading(false);
    }
    fetchOrders();
  }, [router]);

  const [isRatingModal, setRatingModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [rating, setRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewSubmitting, setReviewSubmitting] = useState(false);

  const getStatusStep = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered': return 4;
      case 'shipped': return 3;
      case 'processing': return 2;
      default: return 1;
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;
    
    setReviewSubmitting(true);
    const { error } = await supabase.from("reviews").insert([{
      user_id: selectedOrder.user_id,
      order_id: selectedOrder.id,
      rating,
      comment: reviewComment
    }]);

    if (!error) {
      alert("Thank you for your feedback! It helps our community grow.");
      setRatingModal(false);
      setReviewComment("");
    } else {
      alert("Review failed: " + error.message);
    }
    setReviewSubmitting(false);
  };

  if (loading) return <div className={styles.loading}>Accessing Secure Orders...</div>;

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <div className={styles.header}>
          <Link href="/profile" className={styles.backBtn}>
            <ArrowLeft size={20} />
            Back to Profile
          </Link>
          <h1 className="gradient-text">Track Your Deliveries</h1>
          <p>Real-time updates for your pet supplies and new companions.</p>
        </div>

        {orders.length === 0 ? (
          <div className={`${styles.emptyState} glass`}>
            <ShoppingBag size={80} />
            <h2>Your collection is empty</h2>
            <p>Ready to get your next companion or stock up on supplies?</p>
            <Link href="/shop" className={styles.shopBtn}>Visit the Shop</Link>
          </div>
        ) : (
          <div className={styles.orderList}>
            {orders.map((order) => {
              const currentStep = getStatusStep(order.status);
              return (
                <div key={order.id} className={`${styles.orderCard} glass`}>
                  <div className={styles.cardHeader}>
                    <div className={styles.idBadge}>
                      <label>Order ID</label>
                      <span>#{order.id.slice(0, 8).toUpperCase()}</span>
                    </div>
                    <div className={styles.arrivalInfo}>
                      <label>Estimated Arrival</label>
                      <span>{order.status === 'Delivered' ? 'Delivered' : 'Arriving in 2-3 Days'}</span>
                    </div>
                  </div>

                  <div className={styles.timeline}>
                    <div className={`${styles.step} ${currentStep >= 1 ? styles.active : ""}`}>
                      <div className={styles.dot}></div>
                      <span>Order Placed</span>
                    </div>
                    <div className={`${styles.step} ${currentStep >= 2 ? styles.active : ""}`}>
                      <div className={styles.dot}></div>
                      <span>Processing</span>
                    </div>
                    <div className={`${styles.step} ${currentStep >= 3 ? styles.active : ""}`}>
                      <div className={styles.dot}></div>
                      <span>Shipped</span>
                    </div>
                    <div className={`${styles.step} ${currentStep >= 4 ? styles.active : ""}`}>
                      <div className={styles.dot}></div>
                      <span>Delivered</span>
                    </div>
                    <div className={styles.progressLine} style={{ width: `${(currentStep - 1) * 33.33}%` }}></div>
                  </div>

                  <div className={styles.cardBody}>
                    <div className={styles.itemInfo}>
                      <div className={styles.itemIcon}>📦</div>
                      <div>
                        <h3>{order.item_name}</h3>
                        <p>{order.item_category}</p>
                      </div>
                    </div>
                    <div className={styles.priceSection}>
                      <span className={styles.totalLabel}>Total</span>
                      <span className={styles.totalValue}>₦{Number(order.price).toLocaleString()}</span>
                    </div>
                  </div>

                  <div className={styles.trackingSection}>
                    <div className={styles.trackingId}>
                      <Truck size={16} />
                      <span>Tracking: <strong>{order.tracking_number || "PENDING"}</strong></span>
                    </div>
                    <div className={styles.actionGroup}>
                      {order.status === 'Delivered' && (
                        <button 
                          className={styles.rateBtn}
                          onClick={() => {
                            setSelectedOrder(order);
                            setRatingModal(true);
                          }}
                        >
                          Rate Service <Sparkles size={16} />
                        </button>
                      )}
                      <button className={styles.supportBtn}>Support</button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {isRatingModal && (
        <div className={styles.modalOverlay}>
           <div className={`${styles.modal} glass`}>
              <div className={styles.modalHeader}>
                <h2>Rate Your Experience</h2>
                <button onClick={() => setRatingModal(false)}><X size={24} /></button>
              </div>
              
              <form className={styles.reviewForm} onSubmit={handleReviewSubmit}>
                <div className={styles.starRow}>
                  {[1,2,3,4,5].map(s => (
                    <button 
                      key={s} 
                      type="button" 
                      onClick={() => setRating(s)}
                      className={rating >= s ? styles.starActive : styles.starInactive}
                    >
                      ★
                    </button>
                  ))}
                </div>
                
                <p>How was our service for <strong>{selectedOrder?.item_name}</strong>?</p>
                
                <textarea 
                  required
                  placeholder="Tell us what you loved or how we can improve..."
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  rows={4}
                />
                
                <button 
                  type="submit" 
                  className={styles.submitReviewBtn}
                  disabled={reviewSubmitting}
                >
                  {reviewSubmitting ? "Submitting..." : "Send Feedback"}
                </button>
              </form>
           </div>
        </div>
      )}
    </main>
  );
}
