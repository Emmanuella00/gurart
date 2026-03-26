import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '../../lib/supabase'
import Navbar from '../../components/layout/Navbar'

export default function Artists() {
  const [artists, setArtists] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filtered, setFiltered] = useState([])

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('artists')
        .select(`
          *,
          profiles ( full_name, avatar_url ),
          artworks ( id, image_url, title, is_approved, is_available )
        `)
        .eq('is_verified', true)
        .order('created_at', { ascending: false })

      setArtists(data || [])
      setFiltered(data || [])
      setLoading(false)
    }
    load()
  }, [])

  useEffect(() => {
    if (!search.trim()) { setFiltered(artists); return }
    const q = search.toLowerCase()
    setFiltered(artists.filter(a =>
      a.profiles?.full_name?.toLowerCase().includes(q) ||
      a.specialty?.toLowerCase().includes(q) ||
      a.location?.toLowerCase().includes(q) ||
      a.bio?.toLowerCase().includes(q)
    ))
  }, [search, artists])

  return (
    <div className="min-h-screen bg-cream">
      <Navbar />

      {/* Header */}
      <div className="bg-forest text-cream px-8 py-14">
        <div className="max-w-5xl mx-auto">
          <p className="font-body text-xs tracking-widest uppercase text-mist mb-2">Our community</p>
          <h1 className="font-sans text-5xl mb-4">Meet the artists</h1>
          <p className="font-body text-sm text-mist max-w-md">
            Every artist on GURArt is verified by our team. Each carries a story worth knowing.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-8 py-10">
        {/* Search */}
        <div className="flex items-center justify-between mb-8">
          <input
            type="text"
            placeholder="Search by name, specialty or location..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="input-field max-w-sm"
          />
          <p className="font-body text-xs text-mist tracking-widest uppercase">
            {loading ? '' : `${filtered.length} verified artist${filtered.length !== 1 ? 's' : ''}`}
          </p>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white border border-moss/20 p-6 animate-pulse">
                <div className="w-16 h-16 bg-bark/10 rounded-full mx-auto mb-4" />
                <div className="h-3 bg-bark/10 rounded w-2/3 mx-auto mb-2" />
                <div className="h-3 bg-bark/10 rounded w-1/2 mx-auto" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24">
            <p className="font-sans text-3xl text-forest mb-2">No artists found</p>
            <p className="font-body text-sm text-mist">Try a different search term</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-6">
            {filtered.map(artist => {
              const approvedArtworks = artist.artworks?.filter(a => a.is_approved) || []
              const previewImages = approvedArtworks.slice(0, 3)

              return (
                <div key={artist.id} className="bg-white border border-moss/20 overflow-hidden group hover:border-forest transition-colors duration-200">
                  {/* Artwork preview strip */}
                  <div className="grid grid-cols-3 h-24">
                    {[0, 1, 2].map(i => (
                      <div key={i} className="bg-bark/10 overflow-hidden">
                        {previewImages[i]?.image_url ? (
                          <img
                            src={previewImages[i].image_url}
                            alt=""
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <div className="w-4 h-4 border border-moss/20" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Artist info */}
                  <div className="p-5">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-bark/10 border border-moss/20 flex items-center justify-center overflow-hidden flex-shrink-0">
                        {artist.profiles?.avatar_url ? (
                          <img src={artist.profiles.avatar_url} alt={artist.profiles.full_name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="font-sans text-sm text-mist">
                            {artist.profiles?.full_name?.[0]}
                          </span>
                        )}
                      </div>
                      <div>
                        <h3 className="font-sans text-lg text-forest leading-tight">
                          {artist.profiles?.full_name}
                        </h3>
                        <div className="flex items-center gap-2">
                          {artist.location && (
                            <p className="font-body text-xs text-mist">{artist.location}</p>
                          )}
                          <span className="font-body text-xs bg-sage/20 text-forest px-1.5 py-0.5">
                            Verified
                          </span>
                        </div>
                      </div>
                    </div>

                    {artist.specialty && (
                      <p className="font-body text-xs text-mist tracking-widest uppercase mb-2">
                        {artist.specialty}
                      </p>
                    )}

                    {artist.bio && (
                      <p className="font-body text-sm text-moss leading-relaxed line-clamp-3 mb-4">
                        {artist.bio}
                      </p>
                    )}

                    <div className="flex items-center justify-between">
                      <p className="font-body text-xs text-mist">
                        {approvedArtworks.length} artwork{approvedArtworks.length !== 1 ? 's' : ''}
                      </p>
                      <Link
                        href={`/browse?artist=${artist.id}`}
                        className="font-body text-xs text-forest underline underline-offset-2 hover:text-bark transition-colors"
                      >
                        View artworks →
                      </Link>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Empty state for no verified artists yet */}
        {!loading && artists.length === 0 && (
          <div className="text-center py-24">
            <p className="font-sans text-3xl text-forest mb-2">No verified artists yet</p>
            <p className="font-body text-sm text-mist mb-6">Be the first to join the GURArt community</p>
            <Link href="/auth/register" className="btn-primary">Apply as an artist</Link>
          </div>
        )}
      </div>
    </div>
  )
}
