"use client";

/**
 * Admin Dispatch & Order Center
 *
 * WHY: This is where the owner manages tracking and notifications.
 * Update order statuses and set estimated arrival times.
 */

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Package, Truck, CheckCircle, Clock, Search, ExternalLink, Zap } from "lucide-react";
import styles from "./AdminOrders.module.css";

export default function AdminOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => { fetchOrders(); }, []);

  async function fetchOrders() {
    const { data } = await supabase.from("orders").select("*, profiles(full_name, email)").order("created_at", { ascending: false });
    if (data) setOrders(data);
    setLoading(false);
  }

  const updateOrder = async (id: string, updates: any) => {
    const { error } = await supabase.from("orders").update(updates).eq("id", id);
    if (!error) {
      setEditingId(null);
      fetchOrders();
    }
  };

  const generateTracking = (id: string) => {
    const newId = "SPH-" + Math.random().toString(36).substr(2, 4).toUpperCase() + "-" + Math.random().toString(36).substr(2, 4).toUpperCase();
    updateOrder(id, { tracking_number: newId });
  };

  if (loading) return <div className={styles.loader}>Accessing Dispatch Records...</div>;

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.titleArea}>
          <h1>Order Dispatch Center</h1>
          <p>Update tracking info and manage customer notifications.</p>
        </div>
      </header>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Total</th>
              <th>Status</th>
              <th>Est. Arrival</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id}>
                <td><span className={styles.idTag}>#{order.id.slice(0, 8)}</span></td>
                <td>
                  <div className={styles.customerInfo}>
                    <strong>{order.profiles?.full_name || "Guest"}</strong>
                    <span>{order.profiles?.email}</span>
                    {order.transaction_ref && (
                      <span className={styles.txRef}>TX: {order.transaction_ref}</span>
                    )}
                  </div>
                </td>
                <td><strong>₦{order.price?.toLocaleString()}</strong></td>
                <td>
                  <div className={styles.statusContainer}>
                    <span className={`${styles.statusBadge} ${styles[order.status?.toLowerCase()]}`}>
                      {order.status}
                    </span>
                    <div className={styles.quickActions}>
                      {order.status?.toLowerCase() === "processing" && (
                        <button onClick={() => updateOrder(order.id, { status: "shipped" })} className={styles.shipBtn}>
                          <Truck size={14} /> Mark Shipped
                        </button>
                      )}
                      {order.status?.toLowerCase() === "shipped" && (
                        <button onClick={() => updateOrder(order.id, { status: "delivered" })} className={styles.deliverBtn}>
                          <CheckCircle size={14} /> Mark Delivered
                        </button>
                      )}
                    </div>
                  </div>
                </td>
                <td>
                  <div className={styles.trackingArea}>
                    {order.tracking_number ? (
                       <span className={styles.trackingNum}>{order.tracking_number}</span>
                    ) : (
                       <button onClick={() => generateTracking(order.id)} className={styles.genBtn}>
                         <Zap size={12} /> Auto-Generate
                       </button>
                    )}
                  </div>
                </td>
                <td>
                   <button className={styles.viewBtn}>Details</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
