'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function UpdatePasswordPage() {
  const router = useRouter()
  const [isPending, setIsPending] = useState(false)
  const [errorMsg, setErrorMsg] = useState(null)
  const [sessionReady, setSessionReady] = useState(false)
  const [sessionError, setSessionError] = useState(null)

  useEffect(() => {
    const supabase = createClient()
    
    const hash = window.location.hash
    console.log("INITIAL HASH:", hash)

    if (hash && hash.includes('access_token')) {
      const params = new URLSearchParams(hash.substring(1))
      const access_token = params.get('access_token')
      const refresh_token = params.get('refresh_token')
      console.log("EXTRACTED TOKENS:", { hasAccess: !!access_token, hasRefresh: !!refresh_token })

      if (access_token && refresh_token) {
        console.log("Setting session manually...")
        supabase.auth.setSession({
          access_token,
          refresh_token
        }).then(({ data, error }) => {
          console.log("SET SESSION RESULT:", data, error)
          if (error) {
            setSessionError(error.message)
          } else {
            window.history.replaceState(null, '', window.location.pathname)
            setSessionReady(true)
          }
        })
        return
      }
    }

    // Fallback: check if session is already established
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      console.log("GET_SESSION RESULT:", session ? "Session exists" : "No session", error)
      if (error) {
        setSessionError(error.message)
      } else if (session) {
        setSessionReady(true)
      } else {
        setSessionError("No valid session or recovery token found.")
      }
    })

  }, [])

  const handleUpdate = async (e) => {
    e.preventDefault()
    setIsPending(true)
    setErrorMsg(null)
    
    const formData = new FormData(e.currentTarget)
    const password = formData.get('password')
    
    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password })
    
    if (error) {
      setErrorMsg(error.message)
      setIsPending(false)
    } else {
      router.push('/staff/dashboard')
    }
  }

  if (sessionError) {
    return (
      <div style={{ maxWidth: "400px", margin: "10vh auto", background: "white", padding: "2rem", borderRadius: "1rem", textAlign: "center", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)" }}>
        <h1 style={{ color: 'red', fontSize: '1.5rem', marginBottom: '1rem' }}>Link Expired</h1>
        <p>{sessionError}</p>
        <a href="/staff" style={{ display: 'inline-block', marginTop: '1rem', color: 'blue', textDecoration: 'underline' }}>Back to Login</a>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: "400px", margin: "10vh auto", background: "white", padding: "2rem", borderRadius: "1rem", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)" }}>
      <h1 style={{ fontSize: "1.5rem", marginBottom: "1.5rem", textAlign: "center" }}>Set New Password</h1>
      <form onSubmit={handleUpdate} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        <div>
          <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.875rem" }}>New Password</label>
          <input 
            name="password"
            type="password" 
            style={{ width: "100%", padding: "0.75rem", border: "1px solid #d1d5db", borderRadius: "0.5rem" }} 
            required 
            minLength={6}
            disabled={!sessionReady || isPending}
          />
        </div>
        {errorMsg && <p style={{ color: 'red', fontSize: '0.875rem' }}>{errorMsg}</p>}
        <button type="submit" className="btn btn-primary" style={{ marginTop: "1rem", width: "100%" }} disabled={isPending || !sessionReady}>
          {isPending ? "Updating..." : (!sessionReady ? "Verifying link..." : "Update Password")}
        </button>
      </form>
    </div>
  )
}
