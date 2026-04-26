"use client";

/**
 * Auth Page — Login, Sign Up, and Google OAuth
 *
 * WHY: Centralised auth entry point. Uses Supabase Auth which handles
 * session management, token refresh, and secure cookie storage.
 * Inputs are validated before submission to prevent abuse.
 */

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { validateEmail, validatePassword } from "@/lib/validation";
import { useRouter } from "next/navigation";
import styles from "./Auth.module.css";
import { useToast } from "@/components/Toast";

/**
 * Map raw Supabase auth error messages → friendly human-readable text.
 * Never expose internal error codes or technical messages to end users.
 */
function humanizeAuthError(message: string): string {
  const m = message.toLowerCase();
  if (m.includes("invalid login credentials") || m.includes("invalid email or password"))
    return "The email or password you entered is incorrect. Please try again.";
  if (m.includes("email not confirmed"))
    return "Please check your inbox and confirm your email before signing in.";
  if (m.includes("user already registered") || m.includes("already been registered"))
    return "An account with this email already exists. Try signing in instead.";
  if (m.includes("rate limit") || m.includes("too many requests"))
    return "Too many attempts. Please wait a moment and try again.";
  if (m.includes("weak password"))
    return "Your password is too weak. Use at least 8 characters with a number and uppercase letter.";
  if (m.includes("network") || m.includes("fetch"))
    return "Connection problem. Please check your internet and try again.";
  return "Something went wrong. Please try again or contact support.";
}

export default function AuthPage() {
  const { showToast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const router = useRouter();

  // Validate fields locally before hitting Supabase
  // Reduces unnecessary API calls and gives faster feedback
  function validateForm(): boolean {
    const newErrors: Record<string, string> = {};

    if (!validateEmail(email)) newErrors.email = "Please enter a valid email address.";

    if (isSignUp) {
      const passCheck = validatePassword(password);
      if (!passCheck.valid) Object.assign(newErrors, passCheck.errors);
      if (!fullName.trim()) newErrors.fullName = "Please enter your full name.";
    } else {
      if (!password) newErrors.password = "Password is required.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: fullName } },
        });
        if (error) throw error;
        showToast("Account created! Please check your email to confirm, then sign in. 🎉", "success");
        setIsSignUp(false);
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        router.push("/");
      }
    } catch (err: any) {
      // Map raw Supabase error to a friendly, non-technical message
      setErrors({ form: humanizeAuthError(err.message ?? "") });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        // After Google OAuth, redirect back to the home page
        redirectTo: `${window.location.origin}/`,
      },
    });
    if (error) setErrors({ form: error.message });
    setLoading(false);
  };

  return (
    <main className={styles.main}>
      <div className={`${styles.authCard} glass`}>
        <div className={styles.header}>
          <span className={styles.logo}>🐾</span>
          <h2>{isSignUp ? "Join Sammy Hub" : "Welcome Back"}</h2>
          <p>{isSignUp ? "Create your free account" : "Sign in to your account"}</p>
        </div>

        {/* Google Sign-In — shown first as it's the easiest option */}
        <button
          onClick={handleGoogleSignIn}
          className={styles.googleBtn}
          disabled={loading}
          type="button"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Continue with Google
        </button>

        <div className={styles.divider}><span>or</span></div>

        <form onSubmit={handleEmailAuth} className={styles.form} noValidate>
          {isSignUp && (
            <div className={styles.inputGroup}>
              <label htmlFor="fullName">Full Name</label>
              <input
                id="fullName"
                type="text"
                placeholder="John Doe"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                aria-invalid={!!errors.fullName}
              />
              {errors.fullName && <span className={styles.error}>{errors.fullName}</span>}
            </div>
          )}

          <div className={styles.inputGroup}>
            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              aria-invalid={!!errors.email}
            />
            {errors.email && <span className={styles.error}>{errors.email}</span>}
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              placeholder="Min 8 characters, 1 uppercase, 1 number"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              aria-invalid={!!errors.password}
            />
            {errors.password && <span className={styles.error}>{errors.password}</span>}
          </div>

          {errors.form && <div className={styles.formError}>{errors.form}</div>}

          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? "Processing..." : isSignUp ? "Create Account" : "Sign In"}
          </button>
        </form>

        <button className={styles.toggleBtn} onClick={() => { setIsSignUp(!isSignUp); setErrors({}); }}>
          {isSignUp ? "Already have an account? Sign In" : "New here? Create an account"}
        </button>
      </div>
    </main>
  );
}
