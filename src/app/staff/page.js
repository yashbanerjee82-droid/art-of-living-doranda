'use client';

import { useActionState } from 'react';
import { login, resetPassword } from '@/app/actions/auth';
import { useState } from 'react';

export default function StaffLoginPage() {
  const [loginState, loginAction, isPending] = useActionState(async (prevState, formData) => {
    const res = await login(formData);
    return res;
  }, null);

  const [resetState, resetAction, isResetting] = useActionState(async (prevState, formData) => {
    const res = await resetPassword(formData);
    return res;
  }, null);

  const [showReset, setShowReset] = useState(false);

  if (showReset) {
    return (
      <div style={{ maxWidth: "400px", margin: "10vh auto", background: "white", padding: "2rem", borderRadius: "1rem", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)" }}>
        <h1 style={{ fontSize: "1.5rem", marginBottom: "1.5rem", textAlign: "center" }}>Reset Password</h1>
        <form action={resetAction} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div>
            <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.875rem" }}>Email</label>
            <input 
              name="email"
              type="email" 
              style={{ width: "100%", padding: "0.75rem", border: "1px solid #d1d5db", borderRadius: "0.5rem" }} 
              required 
            />
          </div>
          {resetState?.error && <p style={{ color: 'red', fontSize: '0.875rem' }}>{resetState.error}</p>}
          {resetState?.success && <p style={{ color: 'green', fontSize: '0.875rem' }}>Check your email for reset instructions.</p>}
          <button type="submit" className="btn btn-primary" style={{ marginTop: "1rem", width: "100%" }} disabled={isResetting}>
            {isResetting ? "Sending..." : "Send Reset Link"}
          </button>
        </form>
        <div style={{ marginTop: "1rem", textAlign: "center" }}>
          <button onClick={() => setShowReset(false)} style={{ background: "none", border: "none", color: "#6b7280", cursor: "pointer", textDecoration: "underline" }}>Back to Login</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "400px", margin: "10vh auto", background: "white", padding: "2rem", borderRadius: "1rem", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)" }}>
      <h1 style={{ fontSize: "1.5rem", marginBottom: "1.5rem", textAlign: "center" }}>Staff Portal Login</h1>
      <form action={loginAction} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        <div>
          <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.875rem" }}>Email</label>
          <input 
            name="email"
            type="email" 
            style={{ width: "100%", padding: "0.75rem", border: "1px solid #d1d5db", borderRadius: "0.5rem" }} 
            required 
          />
        </div>
        <div>
          <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.875rem" }}>Password</label>
          <input 
            name="password"
            type="password" 
            style={{ width: "100%", padding: "0.75rem", border: "1px solid #d1d5db", borderRadius: "0.5rem" }} 
            required 
          />
        </div>
        {loginState?.error && <p style={{ color: 'red', fontSize: '0.875rem' }}>{loginState.error}</p>}
        <button type="submit" className="btn btn-primary" style={{ marginTop: "1rem", width: "100%" }} disabled={isPending}>
          {isPending ? "Logging in..." : "Login"}
        </button>
      </form>
      <div style={{ marginTop: "1rem", textAlign: "center" }}>
        <button onClick={() => setShowReset(true)} style={{ background: "none", border: "none", color: "#6b7280", cursor: "pointer", textDecoration: "underline", fontSize: '0.875rem' }}>Forgot Password?</button>
      </div>
    </div>
  );
}
