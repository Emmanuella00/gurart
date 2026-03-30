import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../hooks/useAuth'
import Navbar from '../../components/layout/Navbar'

export default function ArtworkDetail() {
  const router = useRouter()
  const { id } = router.query
  const { user } = useAuth()
  const [artwork, setArtwork] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    async function load() {
      const { data } = await supabase
        .from('artworks')
        .select('*, artists(id, bio, location, specialty, is_verified, profiles(full_name, avatar_url))')
        .eq('id', id)
        .single()
      setArtwork(data)
      setLoading(false)
    }
    load()
  }, [id])

  function handleBuy() {
    if (!user) { router.push(`/auth/login?redirect=/artwork/${id}`); return }
    router.push(`/checkout/${id}`)
  }

  if (loading) return (
    <div className="min-h-screen bg-cream"><Navbar />
      <div className="flex items-center justify-center h-96">
        <p className="font-body text-xs tracking-widest uppercase text-mist animate-pulse">Loading...</p>
      </div>
    </div>
  )

  if (!artwork) return (
    <div className="min-h-screen bg-cream"><Navbar />
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <p className="font-sans text-3xl text-forest">Artwork not found</p>
        <Link href="/browse" className="btn-outline">Back to gallery</Link>
      </div>
    </div>
  )

  const artist = artwork.artists
  const artistName = artist?.profiles?.full_name

  return (
    <div className="min-h-screen bg-cream">
      <Navbar />
      <div className="max-w-5xl mx-auto px-6 md:px-8 pt-6">
        <div className="flex items-center gap-2 font-body text-xs text-mist">
          <Link href="/browse" className="hover:text-forest transition-colors">Gallery</Link>
          <span>·</span>
          <span className="capitalize">{artwork.category}</span>
          <span>·</span>
          <span className="text-forest truncate max-w-[120px] md:max-w-none">{artwork.title}</span>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 md:px-8 py-8 md:py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 items-start">

          {/* Image */}
          <div>
            <div className="aspect-square bg-bark/10 border border-moss/20 overflow-hidden">
              {artwork.image_url ? (
                <img src={artwork.image_url} alt={artwork.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="font-body text-xs text-mist">No image</span>
                </div>
              )}
            </div>

            {/* Artist card */}
            <div className="mt-4 md:mt-6 bg-white border border-moss/20 p-4 md:p-5">
              <p className="font-body text-xs tracking-widest uppercase text-mist mb-3">About the artist</p>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-bark/10 border border-moss/20 flex items-center justify-center overflow-hidden flex-shrink-0">
                  {artist?.profiles?.avatar_url ? (
                    <img src={artist.profiles.avatar_url} alt={artistName} className="w-full h-full object-cover" />
                  ) : (
                    <span className="font-sans text-sm text-mist">{artistName?.[0]}</span>
                  )}
                </div>
                <div>
                  <p className="font-sans text-base text-forest">{artistName}</p>
                  <div className="flex items-center gap-2">
                    {artist?.location && <p className="font-body text-xs text-mist">{artist.location}</p>}
                    {artist?.is_verified && <span className="font-body text-xs bg-sage/20 text-forest px-1.5 py-0.5">Verified</span>}
                  </div>
                </div>
              </div>
              {artist?.bio && <p className="font-body text-sm text-moss leading-relaxed">{artist.bio}</p>}
            </div>
          </div>

          {/* Details */}
          <div className="md:sticky md:top-8">
            <p className="font-body text-xs tracking-widest uppercase text-mist mb-2 capitalize">{artwork.category}</p>
            <h1 className="font-sans text-3xl md:text-4xl text-forest mb-1 leading-tight">{artwork.title}</h1>
            <p className="font-body text-sm text-mist mb-5 md:mb-6">by {artistName}</p>

            <div className="flex items-center justify-between bg-white border border-moss/20 px-4 md:px-5 py-3 md:py-4 mb-5 md:mb-6">
              <div>
                <p className="font-body text-xs text-mist tracking-widest uppercase mb-1">Price</p>
                <p className="font-sans text-2xl md:text-3xl text-forest">RWF {artwork.price?.toLocaleString()}</p>
              </div>
              <div className={`flex items-center gap-1.5 font-body text-xs ${artwork.is_available ? 'text-green-700' : 'text-red-600'}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${artwork.is_available ? 'bg-green-500' : 'bg-red-400'}`}></span>
                {artwork.is_available ? 'Available' : 'Sold'}
              </div>
            </div>

            {artwork.is_available ? (
              <button onClick={handleBuy} className="btn-sage w-full text-center mb-3">
                Purchase this artwork →
              </button>
            ) : (
              <div className="btn-outline w-full text-center opacity-50 cursor-not-allowed mb-3">
                This artwork has been sold
              </div>
            )}

            <p className="font-body text-xs text-center text-mist mb-6 md:mb-8">
              {user ? 'Secure mock checkout' : 'Sign in to purchase'}
            </p>

            {artwork.description && (
              <div className="mb-5 md:mb-6">
                <p className="font-body text-xs tracking-widest uppercase text-mist mb-2">About this piece</p>
                <p className="font-body text-sm text-moss leading-relaxed">{artwork.description}</p>
              </div>
            )}

            {artwork.story && (
              <div className="bg-forest text-cream p-5 md:p-6">
                <p className="font-body text-xs tracking-widest uppercase text-sage mb-3">The story behind it</p>
                <p className="font-body text-sm text-mist leading-relaxed italic">"{artwork.story}"</p>
              </div>
            )}

            <div className="mt-5 md:mt-6">
              <Link href="/browse" className="font-body text-xs text-mist hover:text-forest transition-colors">← Back to gallery</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
