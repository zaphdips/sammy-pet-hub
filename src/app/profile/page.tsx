"use client";

/**
 * Premium Profile Page
 *
 * WHY: Replaces the basic list with a "User Command Center".
 * Shows account stats, active requests, and security settings with a 
 * professional dashboard layout.
 */

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { User, Mail, Calendar, Shield, Package, LogOut, Heart } from "lucide-react";
import styles from "./Profile.module.css";

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function getProfile() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/auth");
      } else {
        setUser(session.user);
      }
      setLoading(false);
    }
    getProfile();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  if (loading) return <div className={styles.loading}>Accessing Secure Profile...</div>;
  if (!user) return null;

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <div className={styles.sidebar}>
          <div className={`${styles.profileCard} glass`}>
            <div className={styles.avatar}>
              {user.user_metadata?.full_name?.[0] ?? user.email?.[0].toUpperCase()}
            </div>
            <h2>{user.user_metadata?.full_name ?? "Pet Enthusiast"}</h2>
            <p className={styles.emailBadge}>{user.email}</p>
            
            <nav className={styles.nav}>
              <button className={`${styles.navItem} ${styles.active}`}>
                <User size={18} />
                <span>Account Info</span>
              </button>
              <button className={styles.navItem}>
                <Heart size={18} />
                <span>My Purchases</span>
              </button>
              <button onClick={() => router.push("/profile/orders")} className={styles.navItem}>
                <Package size={18} />
                <span>Order History</span>
              </button>
              <button onClick={handleLogout} className={styles.logoutBtn}>
                <LogOut size={18} />
                <span>Log Out</span>
              </button>
            </nav>
          </div>
        </div>

        <div className={styles.content}>
          <section className={`${styles.panel} glass`}>
            <div className={styles.panelHeader}>
              <Shield size={20} color="var(--primary-green)" />
              <h3>Security & Account</h3>
            </div>
            
            <div className={styles.infoGrid}>
              <div className={styles.infoItem}>
                <label>Email Address</label>
                <div className={styles.valBox}>
                  <Mail size={16} />
                  <span>{user.email}</span>
                </div>
              </div>
              <div className={styles.infoItem}>
                <label>Member Since</label>
                <div className={styles.valBox}>
                  <Calendar size={16} />
                  <span>{new Date(user.created_at).toLocaleDateString("en-US", { month: 'long', year: 'numeric' })}</span>
                </div>
              </div>
              <div className={styles.infoItem}>
                <label>Identity Verified</label>
                <div className={styles.statusPill}>Level 1 Verified</div>
              </div>
            </div>
          </section>

          <section className={`${styles.panel} glass`}>
            <div className={styles.panelHeader}>
              <Heart size={20} color="#ef4444" />
              <h3>Active Adoption Requests</h3>
            </div>
            <div className={styles.emptyState}>
              <p>You haven't requested any pets yet. Your future companion is waiting!</p>
              <button onClick={() => router.push("/adoption")}>Browse Pets</button>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
