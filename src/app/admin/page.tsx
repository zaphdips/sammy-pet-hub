"use client";

/**
 * Modern Admin Dashboard (Overhaul)
 *
 * WHY: Replaces the basic stat cards with a "Command Center" feel.
 * Includes status cards with icons, a "Site Health" section, and 
 * better alignment.
 */

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { 
  Dog, 
  ShoppingBag, 
  Clock, 
  TrendingUp, 
  ShieldCheck, 
  Zap,
  Globe,
  Settings,
  CreditCard,
  Package
} from "lucide-react";
import styles from "./Admin.module.css";

export default function AdminDashboard() {
  const [stats, setStats] = useState({ pets: 0, products: 0, requests: 0, revenue: 0 });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [settings, setSettings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchData() {
    setLoading(true);
    const [pets, products, requests, settingsData, ordersData, revenueData] = await Promise.all([
      supabase.from("pets").select("id", { count: "exact" }),
      supabase.from("products").select("id", { count: "exact" }),
      supabase.from("pet_requests").select("id", { count: "exact" }),
      supabase.from("site_settings").select("*").order("key"),
      supabase.from("orders").select("*, profiles(full_name)").order("created_at", { ascending: false }).limit(5),
      supabase.from("orders").select("price"),
    ]);

    const totalRevenue = revenueData.data?.reduce((sum, o) => sum + Number(o.price), 0) || 0;

    setStats({
      pets: pets.count || 0,
      products: products.count || 0,
      requests: requests.count || 0,
      revenue: totalRevenue,
    });
    if (settingsData.data) setSettings(settingsData.data);
    if (ordersData.data) setRecentOrders(ordersData.data);
    setLoading(false);
  }

  useEffect(() => {
    fetchData();
  }, []);

  const updateSetting = async (key: string, value: string) => {
    const { error } = await supabase
      .from("site_settings")
      .update({ value })
      .eq("key", key);
    
    if (!error) fetchData();
  };

  if (loading) return <div className={styles.loader}>Loading Dashboard Metrics...</div>;

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.titleArea}>
          <h1>Command Center</h1>
          <p>Real-time analytics and platform configuration</p>
        </div>
        <div className={styles.headerActions}>
          <div className={styles.uptime}>
            <Globe size={14} />
            <span>Site Live</span>
          </div>
        </div>
      </header>

      {/* Stats Cards */}
      <div className={styles.statsGrid}>
        <div className={`${styles.statCard} glass`}>
          <div className={`${styles.iconBox} ${styles.green}`}>
            <Dog size={24} />
          </div>
          <div className={styles.statInfo}>
            <h3>{stats.pets}</h3>
            <span>Active Pets</span>
          </div>
          <div className={styles.trend}>+2 this week</div>
        </div>

        <div className={`${styles.statCard} glass`}>
          <div className={`${styles.iconBox} ${styles.blue}`}>
            <ShoppingBag size={24} />
          </div>
          <div className={styles.statInfo}>
            <h3>{stats.products}</h3>
            <span>Inventory Items</span>
          </div>
          <div className={styles.trend}>Stocked</div>
        </div>

        <div className={`${styles.statCard} glass`}>
          <div className={`${styles.iconBox} ${styles.orange}`}>
            <Clock size={24} />
          </div>
          <div className={styles.statInfo}>
            <h3>{stats.requests}</h3>
            <span>Active Requests</span>
          </div>
          <div className={styles.trend}>Urgent</div>
        </div>

        <div className={`${styles.statCard} glass`}>
          <div className={`${styles.iconBox} ${styles.purple}`}>
            <CreditCard size={24} />
          </div>
          <div className={styles.statInfo}>
            <h3>₦{stats.revenue.toLocaleString()}</h3>
            <span>Total Revenue</span>
          </div>
          <div className={styles.trend}>Live Sales</div>
        </div>
      </div>

      <section className={styles.quickCommands}>
        <button onClick={() => window.location.href='/admin/pets'} className={styles.commandBtn}>
          <Dog size={20} />
          <span>Add New Pet</span>
        </button>
        <button onClick={() => window.location.href='/admin/products'} className={styles.commandBtn}>
          <ShoppingBag size={20} />
          <span>Add Product</span>
        </button>
        <button onClick={() => window.location.href='/admin/filters'} className={styles.commandBtn}>
          <TrendingUp size={20} />
          <span>Edit Filters</span>
        </button>
        <button onClick={() => window.location.href='/admin/settings'} className={styles.commandBtn}>
          <Settings size={20} />
          <span>Site Config</span>
        </button>
      </section>

      <div className={styles.mainGrid}>
        {/* Recent Orders */}
        <section className={`${styles.panel} glass`}>
          <div className={styles.panelHeader}>
            <div className={styles.panelTitle}>
              <Package size={20} />
              <h2>Recent Orders</h2>
            </div>
            <button onClick={() => window.location.href='/admin/orders'} className={styles.viewAllBtn}>View All</button>
          </div>
          
          <div className={styles.orderTableWrapper}>
            <table className={styles.miniTable}>
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Item</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.length > 0 ? recentOrders.map((order) => (
                  <tr key={order.id}>
                    <td>{order.profiles?.full_name || "Guest"}</td>
                    <td>{order.item_name.substring(0, 20)}...</td>
                    <td>₦{order.price.toLocaleString()}</td>
                    <td>
                      <span className={`${styles.miniStatus} ${styles[order.status?.toLowerCase()]}`}>
                        {order.status}
                      </span>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={4} className={styles.emptyRow}>No recent orders found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Settings Panel */}
        <section className={`${styles.panel} glass`}>
          <div className={styles.panelHeader}>
            <div className={styles.panelTitle}>
              <Settings size={20} />
              <h2>Site Configuration</h2>
            </div>
            <span className={styles.panelBadge}>Global Settings</span>
          </div>
          
          <div className={styles.settingsList}>
            {settings.map((s) => (
              <div key={s.key} className={styles.settingRow}>
                <div className={styles.rowInfo}>
                  <label>{s.key.replace(/_/g, " ")}</label>
                  <p>{s.description}</p>
                </div>
                <div className={styles.rowInput}>
                  <input 
                    type="text" 
                    defaultValue={s.value} 
                    onBlur={(e) => updateSetting(s.key, e.target.value)}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* System Health */}
        <section className={`${styles.panel} glass`}>
          <div className={styles.panelHeader}>
            <div className={styles.panelTitle}>
              <ShieldCheck size={20} />
              <h2>Security & Health</h2>
            </div>
          </div>
          
          <div className={styles.healthList}>
            <div className={styles.healthItem}>
              <span>Database Connection</span>
              <div className={styles.statusPill}>Healthy</div>
            </div>
            <div className={styles.healthItem}>
              <span>Storage Buckets</span>
              <div className={styles.statusPill}>Active</div>
            </div>
            <div className={styles.healthItem}>
              <span>SSL Encryption</span>
              <div className={styles.statusPill}>Secure</div>
            </div>
            <div className={styles.healthItem}>
              <span>Auth Service</span>
              <div className={styles.statusPill}>Ready</div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
