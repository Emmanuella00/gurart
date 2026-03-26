import { useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { supabase } from '../../lib/supabase'
import Navbar from '../../components/layout/Navbar'

export default function Register() {
  const router = useRouter()
  const [form, setForm] = useState({ full_name: '', email: '', password: '', role: 'buyer' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { data, error: signUpError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: { full_name: form.full_name }
      }
    })

    if (signUpError) {
      setError(signUpError.message)
      setLoading(false)
      return
    }

    // Update the role in profiles table
    if (data.user) {
      await supabase
        .from('profiles')
        .update({ role: form.role })
        .eq('id', data.user.id)

      if (form.role === 'artist') {
        router.push('/artist/onboarding')
      } else {
        router.push('/')
      }
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-cream">
      <Navbar />
      <div className="flex items-center justify-center py-20 px-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-10">
            <h1 className="font-sans text-4xl text-forest mb-2">Join GURArt</h1>
            <p className="font-body text-sm text-mist">
              Africa's trusted art marketplace
            </p>
          </div>

          <div className="card">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="label">Full name</label>
                <input
                  name="full_name"
                  type="text"
                  required
                  placeholder="Your full name"
                  value={form.full_name}
                  onChange={handleChange}
                  className="input-field"
                />
              </div>

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
                  placeholder="At least 6 characters"
                  minLength={6}
                  value={form.password}
                  onChange={handleChange}
                  className="input-field"
                />
              </div>

              <div>
                <label className="label">I am joining as a...</label>
                <div className="grid grid-cols-2 gap-3 mt-1">
                  {[
                    { value: 'artist', label: 'Artist', desc: 'Sell my artwork' },
                    { value: 'buyer', label: 'Buyer', desc: 'Collect art' },
                  ].map((opt) => (
                    <label
                      key={opt.value}
                      className={`border p-3 cursor-pointer transition-colors ${
                        form.role === opt.value
                          ? 'border-forest bg-forest text-cream'
                          : 'border-moss/30 hover:border-forest'
                      }`}
                    >
                      <input
                        type="radio"
                        name="role"
                        value={opt.value}
                        checked={form.role === opt.value}
                        onChange={handleChange}
                        className="sr-only"
                      />
                      <div className="font-body text-sm font-medium">{opt.label}</div>
                      <div className={`font-body text-xs mt-0.5 ${form.role === opt.value ? 'text-mist' : 'text-mist'}`}>
                        {opt.desc}
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {error && (
                <p className="font-body text-xs text-red-600 bg-red-50 px-3 py-2">{error}</p>
              )}

              <button type="submit" disabled={loading} className="btn-primary w-full text-center">
                {loading ? 'Creating account...' : 'Create account'}
              </button>
            </form>

            <p className="font-body text-xs text-center text-mist mt-6">
              Already have an account?{' '}
              <Link href="/auth/login" className="text-forest underline underline-offset-2">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
