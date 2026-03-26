import { useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { supabase } from '../../lib/supabase'
import Navbar from '../../components/layout/Navbar'

export default function Login() {
  const router = useRouter()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email: form.email,
      password: form.password,
    })

    if (signInError) {
      setError(signInError.message)
      setLoading(false)
      return
    }

    // Check role and redirect
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, artists(id)')
      .eq('id', data.user.id)
      .single()

    if (profile?.role === 'artist') {
      // If artist hasn't completed onboarding yet
      if (!profile.artists || profile.artists.length === 0) {
        router.push('/artist/onboarding')
      } else {
        router.push('/artist/dashboard')
      }
    } else {
      router.push('/')
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-cream">
      <Navbar />
      <div className="flex items-center justify-center py-20 px-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-10">
            <h1 className="font-sans text-4xl text-forest mb-2">Welcome back</h1>
            <p className="font-body text-sm text-mist">
              Sign in to your GURArt account
            </p>
          </div>

          <div className="card">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="label">Email</label>
                <input
                  name="email"
                  type="email"
                  required
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={handleChange}
                  className="input-field"
                />
              </div>

              <div>
                <label className="label">Password</label>
                <input
                  name="password"
                  type="password"
                  required
                  placeholder="Your password"
                  value={form.password}
                  onChange={handleChange}
                  className="input-field"
                />
              </div>

              {error && (
                <p className="font-body text-xs text-red-600 bg-red-50 px-3 py-2">{error}</p>
              )}

              <button type="submit" disabled={loading} className="btn-primary w-full text-center">
                {loading ? 'Signing in...' : 'Sign in'}
              </button>
            </form>

            <p className="font-body text-xs text-center text-mist mt-6">
              Don't have an account?{' '}
              <Link href="/auth/register" className="text-forest underline underline-offset-2">
                Create one
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
