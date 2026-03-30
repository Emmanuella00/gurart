import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { supabase } from '../../lib/supabase'
import Navbar from '../../components/layout/Navbar'

export default function ArtistDashboard() {
  const router = useRouter()
  const [profile, setProfile] = useState(null)
  const [artist, setArtist] = useState(null)
  const [artworks, setArtworks] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadDashboard() }, [])

  async function loadDashboard() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/auth/login'); return }
    const { data: profileData } = await supabase.from('profiles').select('*').eq('id', user.id).single()
    const { data: artistData } = await supabase.from('artists').select('*').eq('user_id', user.id).single()
    if (!artistData) { router.push('/artist/onboarding'); return }
    const { data: artworkData } = await supabase.from('artworks').select('*').eq('artist_id', artistData.id).order('created_at', { ascending: false })
    setProfile(profileData)
    setArtist(artistData)
    setArtworks(artworkData || [])
    setLoading(false)
  }

  if (loading) return (
    <div className="min-h-screen bg-cream flex items-center justify-center">
      <p className="font-body text-mist text-sm tracking-widest uppercase">Loading...</p>
    </div>
  )

  const approved = artworks.filter(a => a.is_approved).length
  const pending = artworks.filter(a => !a.is_approved).length
  const available = artworks.filter(a => a.is_available && a.is_approved).length

  return (
    <div className="min-h-screen bg-cream">
      <Navbar />
      <div className="max-w-5xl mx-auto py-8 md:py-12 px-6 md:px-4">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-8 md:mb-10">
          <div>
            <p className="font-body text-xs tracking-widest uppercase text-mist mb-1">Artist dashboard</p>
            <h1 className="font-sans text-3xl md:text-4xl text-forest">Welcome, {profile?.full_name?.split(' ')[0]}</h1>
            {!artist.is_verified && (
              <div className="mt-3 inline-flex items-center gap-2 bg-amber-50 border border-amber-200 px-3 py-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block"></span>
                <span className="font-body text-xs text-amber-700">Profile pending verification</span>
              </div>
            )}
          </div>
          <Link href="/artist/upload" className="btn-sage text-center">+ Upload artwork</Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-8 md:mb-10">
          {[
            { label: 'Total artworks', value: artworks.length },
            { label: 'Approved', value: approved },
            { label: 'Pending review', value: pending },
            { label: 'Available', value: available },
          ].map((stat) => (
            <div key={stat.label} className="bg-white border border-moss/20 p-4 md:p-5">
              <div className="font-sans text-2xl md:text-3xl text-forest mb-1">{stat.value}</div>
              <div className="font-body text-xs text-mist tracking-wider uppercase">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Artworks */}
        <div>
          <h2 className="font-sans text-xl md:text-2xl text-forest mb-5 md:mb-6">Your artworks</h2>
          {artworks.length === 0 ? (
            <div className="bg-white border border-moss/20 p-8 md:p-12 text-center">
              <p className="font-sans text-xl md:text-2xl text-forest mb-2">No artworks yet</p>
              <p className="font-body text-sm text-mist mb-6">Upload your first piece and share your art with the world</p>
              <Link href="/artist/upload" className="btn-primary">Upload your first artwork</Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-5">
              {artworks.map((artwork) => (
                <div key={artwork.id} className="bg-white border border-moss/20 overflow-hidden">
                  <div className="aspect-square bg-bark/10 relative overflow-hidden">
                    {artwork.image_url ? (
                      <img src={artwork.image_url} alt={artwork.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="font-body text-xs text-mist">No image</span>
                      </div>
                    )}
                    <div className={`absolute top-2 right-2 px-2 py-1 text-xs font-body ${artwork.is_approved ? 'bg-sage text-forest' : 'bg-amber-100 text-amber-700'}`}>
                      {artwork.is_approved ? 'Approved' : 'Pending'}
                    </div>
                  </div>
                  <div className="p-3 md:p-4">
                    <h3 className="font-sans text-base md:text-lg text-forest leading-tight mb-1 line-clamp-1">{artwork.title}</h3>
                    <p className="font-body text-xs text-mist capitalize mb-1">{artwork.category}</p>
                    <p className="font-body text-sm font-medium text-forest">RWF {artwork.price?.toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
