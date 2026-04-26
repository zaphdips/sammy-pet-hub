"use client";

/**
 * Admin Users Page — Manage user roles
 *
 * WHY: This is how you promote users to admin or revoke admin access.
 * Role changes are written directly to the `profiles` table.
 * Only admins can access this page (enforced by the AdminLayout guard).
 */

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import styles from "./Users.module.css";

export default function AdminUsers() {
  const [profiles, setProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchProfiles() {
    const { data } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
    if (data) setProfiles(data);
    setLoading(false);
  }

  useEffect(() => { fetchProfiles(); }, []);

  async function toggleRole(userId: string, currentRole: string) {
    const newRole = currentRole === "admin" ? "user" : "admin";
    const confirmed = window.confirm(
      `Change this user's role to "${newRole}"? This takes effect immediately.`
    );
    if (!confirmed) return;

    const { error } = await supabase
      .from("profiles")
      .update({ role: newRole })
      .eq("user_id", userId);

    if (error) {
      alert("Failed to update role. Check console for details.");
      console.error("[Admin Users] Role update failed:", error.message);
    } else {
      fetchProfiles(); // Re-fetch to reflect the change
    }
  }

  return (
    <div>
      <div className={styles.header}>
        <h1>User Management</h1>
        <p>Promote users to admin or revoke their access here.</p>
      </div>

      {loading ? (
        <p>Loading users...</p>
      ) : (
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Name / Email</th>
                <th>Role</th>
                <th>Joined</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {profiles.map((profile) => (
                <tr key={profile.id}>
                  <td><strong>{profile.full_name}</strong></td>
                  <td>
                    <span className={profile.role === "admin" ? styles.adminBadge : styles.userBadge}>
                      {profile.role}
                    </span>
                  </td>
                  <td>{new Date(profile.created_at).toLocaleDateString()}</td>
                  <td>
                    <button
                      onClick={() => toggleRole(profile.user_id, profile.role)}
                      className={profile.role === "admin" ? styles.revokeBtn : styles.promoteBtn}
                    >
                      {profile.role === "admin" ? "Revoke Admin" : "Make Admin"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
