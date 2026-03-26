import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { supabase } from '../../lib/supabase'

export default function Navbar({ transparent = false }) {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) fetchProfile(session.user.id)
      else setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setUser(session?.user ?? null)
        if (session?.user) fetchProfile(session.user.id)
        else { setProfile(null); setLoading(false) }
      }
    )
    return () => subscription.unsubscribe()
  }, [])

  async function fetchProfile(userId) {
    const { data } = await supabase
      .from('profiles')
      .select('full_name, role, avatar_url')
      .eq('id', userId)
      .single()
    setProfile(data)
    setLoading(false)
  }

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/')
  }

  const role = profile?.role

  return (
    //<nav className="bg-forest text-cream px-8 py-4 flex items-center justify-between">
    <nav className={`${transparent ? 'bg-transparent absolute top-0 left-0 right-0 z-10' : 'bg-forest'} text-cream px-8 py-4 flex items-center justify-between`}>
      <Link href="/" className="font-sans text-2xl tracking-[0.2em]">
        GUR<span className="text-sage">Art</span>
      </Link>

      <div className="flex items-center gap-8 font-body text-xs tracking-widest uppercase text-mist">
        {/* Always visible */}
        <Link href="/browse" className="hover:text-cream transition-colors">Browse</Link>
        <Link href="/artists" className="hover:text-cream transition-colors">Artists</Link>
        <Link href="/about" className="hover:text-cream transition-colors">About</Link>

        {loading ? null : !user ? (
          /* Guest — not logged in */
          <>
            <Link href="/auth/login" className="hover:text-cream transition-colors">Login</Link>
            <Link href="/auth/register" className="bg-sage text-forest px-4 py-2 hover:opacity-90 transition-opacity">
              Join
            </Link>
          </>
        ) : role === 'admin' ? (
          /* Admin */
          <>
            <Link href="/admin" className="hover:text-cream transition-colors">Admin panel</Link>
            <button onClick={handleSignOut} className="bg-sage text-forest px-4 py-2 hover:opacity-90 transition-opacity">
              Sign out
            </button>
          </>
        ) : role === 'artist' ? (
          /* Artist */
          <>
            <Link href="/artist/dashboard" className="hover:text-cream transition-colors">Dashboard</Link>
            <Link href="/artist/upload" className="hover:text-cream transition-colors">Upload</Link>
            <button onClick={handleSignOut} className="bg-sage text-forest px-4 py-2 hover:opacity-90 transition-opacity">
              Sign out
            </button>
          </>
        ) : (
          /* Buyer */
          <>
            <button onClick={handleSignOut} className="bg-sage text-forest px-4 py-2 hover:opacity-90 transition-opacity">
              Sign out
            </button>
          </>
        )}
      </div>
    </nav>
  )
}
