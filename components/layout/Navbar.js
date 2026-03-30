import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { supabase } from '../../lib/supabase'

export default function Navbar({ transparent = false }) {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [menuOpen, setMenuOpen] = useState(false)

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
    setMenuOpen(false)
    router.push('/')
  }

  const role = profile?.role

  const navLinks = (
    <>
      <Link href="/browse" onClick={() => setMenuOpen(false)} className="hover:text-cream transition-colors">Browse</Link>
      <Link href="/artists" onClick={() => setMenuOpen(false)} className="hover:text-cream transition-colors">Artists</Link>
      <Link href="/about" onClick={() => setMenuOpen(false)} className="hover:text-cream transition-colors">About</Link>
      {!loading && (
        <>
          {!user ? (
            <>
              <Link href="/auth/login" onClick={() => setMenuOpen(false)} className="hover:text-cream transition-colors">Login</Link>
              <Link href="/auth/register" onClick={() => setMenuOpen(false)} className="bg-sage text-forest px-4 py-2 hover:opacity-90 transition-opacity inline-block">
                Join
              </Link>
            </>
          ) : role === 'admin' ? (
            <>
              <Link href="/admin" onClick={() => setMenuOpen(false)} className="hover:text-cream transition-colors">Admin panel</Link>
              <button onClick={handleSignOut} className="bg-sage text-forest px-4 py-2 hover:opacity-90 transition-opacity text-left">Sign out</button>
            </>
          ) : role === 'artist' ? (
            <>
              <Link href="/artist/dashboard" onClick={() => setMenuOpen(false)} className="hover:text-cream transition-colors">Dashboard</Link>
              <Link href="/artist/upload" onClick={() => setMenuOpen(false)} className="hover:text-cream transition-colors">Upload</Link>
              <button onClick={handleSignOut} className="bg-sage text-forest px-4 py-2 hover:opacity-90 transition-opacity text-left">Sign out</button>
            </>
          ) : (
            <button onClick={handleSignOut} className="bg-sage text-forest px-4 py-2 hover:opacity-90 transition-opacity text-left">Sign out</button>
          )}
        </>
      )}
    </>
  )

  return (
    <nav className={`${transparent ? 'bg-transparent absolute top-0 left-0 right-0 z-10' : 'bg-forest'} text-cream`}>
      <div className="px-6 md:px-8 py-4 flex items-center justify-between">
        <Link href="/" className="font-sans text-xl md:text-2xl tracking-[0.2em]">
          GUR<span className="text-sage">Art</span>
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-8 font-body text-xs tracking-widest uppercase text-mist">
          {navLinks}
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden flex flex-col gap-1.5 p-2"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <span className={`block w-6 h-0.5 bg-cream transition-transform duration-200 ${menuOpen ? 'rotate-45 translate-y-2' : ''}`} />
          <span className={`block w-6 h-0.5 bg-cream transition-opacity duration-200 ${menuOpen ? 'opacity-0' : ''}`} />
          <span className={`block w-6 h-0.5 bg-cream transition-transform duration-200 ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
        </button>
      </div>

      {/* Mobile menu dropdown */}
      {menuOpen && (
        <div className="md:hidden bg-bark px-6 py-4 flex flex-col gap-4 font-body text-xs tracking-widest uppercase text-mist border-t border-moss/20">
          {navLinks}
        </div>
      )}
    </nav>
  )
}
