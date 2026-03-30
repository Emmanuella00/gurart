import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '../../lib/supabase'
import Navbar from '../../components/layout/Navbar'

const CATEGORIES = ['all', 'painting', 'sculpture', 'photography', 'portrait', 'pattern', 'other']

export default function Browse() {
  const [artworks, setArtworks] = useState([])
  const [filtered, setFiltered] = useState([])
  const [category, setCategory] = useState('all')
  const [sort, setSort] = useState('newest')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('artworks')
        .select('*, artists(id, location, specialty, profiles(full_name, avatar_url))')
        .eq('is_approved', true)
        .eq('is_available', true)
        .order('created_at', { ascending: false })
      setArtworks(data || [])
      setFiltered(data || [])
      setLoading(false)
    }
    load()
  }, [])

  useEffect(() => {
    let result = [...artworks]
    if (category !== 'all') result = result.filter(a => a.category === category)
    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(a =>
        a.title.toLowerCase().includes(q) ||
        a.artists?.profiles?.full_name?.toLowerCase().includes(q) ||
        a.description?.toLowerCase().includes(q)
      )
    }
    if (sort === 'newest') result.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    if (sort === 'price_asc') result.sort((a, b) => a.price - b.price)
    if (sort === 'price_desc') result.sort((a, b) => b.price - a.price)
    setFiltered(result)
  }, [category, sort, search, artworks])

  return (
    <div className="min-h-screen bg-cream">
      <Navbar />
      <div className="bg-forest text-cream px-6 md:px-8 py-10 md:py-14">
        <div className="max-w-5xl mx-auto">
          <p className="font-body text-xs tracking-widest uppercase text-mist mb-2">Explore</p>
          <h1 className="font-sans text-4xl md:text-5xl mb-3 md:mb-4">The gallery</h1>
          <p className="font-body text-sm text-mist max-w-md">
            Authentic African artworks, each carrying a story.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 md:px-8 py-8 md:py-10">
        {/* Filters */}
        <div className="flex flex-col gap-4 mb-6 md:mb-8">
          <input
            type="text"
            placeholder="Search artworks or artists..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="input-field w-full md:max-w-xs"
          />
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map(c => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={`font-body text-xs tracking-widest uppercase px-3 py-1.5 border transition-colors ${category === c ? 'bg-forest text-cream border-forest' : 'border-moss/30 text-moss hover:border-forest hover:text-forest'}`}
              >
                {c}
              </button>
            ))}
          </div>
          <div className="flex items-center justify-between">
            <p className="font-body text-xs text-mist tracking-widest uppercase">
              {loading ? 'Loading...' : `${filtered.length} artwork${filtered.length !== 1 ? 's' : ''}`}
            </p>
            <select value={sort} onChange={e => setSort(e.target.value)} className="input-field w-auto text-xs">
              <option value="newest">Newest first</option>
              <option value="price_asc">Price: Low to high</option>
              <option value="price_desc">Price: High to low</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white border border-moss/20 animate-pulse">
                <div className="aspect-square bg-bark/10" />
                <div className="p-4 space-y-2">
                  <div className="h-3 bg-bark/10 rounded w-3/4" />
                  <div className="h-3 bg-bark/10 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 md:py-24">
            <p className="font-sans text-2xl md:text-3xl text-forest mb-2">No artworks found</p>
            <p className="font-body text-sm text-mist">Try a different category or search term</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
            {filtered.map(artwork => (
              <Link key={artwork.id} href={`/artwork/${artwork.id}`} className="group block">
                <div className="bg-white border border-moss/20 overflow-hidden transition-all duration-200 group-hover:border-forest">
                  <div className="aspect-square overflow-hidden bg-bark/10 relative">
                    {artwork.image_url ? (
                      <img src={artwork.image_url} alt={artwork.title} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="font-body text-xs text-mist">No image</span>
                      </div>
                    )}
                    {artwork.category && (
                      <div className="absolute top-2 left-2 bg-forest/80 text-cream text-xs font-body px-2 py-0.5 capitalize">
                        {artwork.category}
                      </div>
                    )}
                  </div>
                  <div className="p-3 md:p-4">
                    <p className="font-body text-xs text-mist mb-1 truncate">
                      {artwork.artists?.profiles?.full_name}
                    </p>
                    <h3 className="font-sans text-base md:text-lg text-forest leading-tight mb-2 group-hover:text-bark transition-colors line-clamp-1">
                      {artwork.title}
                    </h3>
                    <div className="flex items-center justify-between">
                      <p className="font-body text-xs md:text-sm font-medium text-forest">
                        RWF {artwork.price?.toLocaleString()}
                      </p>
                      <span className="font-body text-xs text-mist group-hover:text-forest transition-colors hidden md:block">
                        View →
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
