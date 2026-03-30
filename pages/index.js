import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import Navbar from '../components/layout/Navbar'

export default function Home() {
  const { user } = useAuth()
  const [heroArtworks, setHeroArtworks] = useState([])

  useEffect(() => {
    async function loadHeroArtworks() {
      const { data } = await supabase
        .from('artworks')
        .select('id, title, image_url, category')
        .eq('is_approved', true)
        .eq('is_available', true)
        .not('image_url', 'is', null)
        .order('created_at', { ascending: false })
        .limit(4)
      if (data && data.length > 0) setHeroArtworks(data)
    }
    loadHeroArtworks()
  }, [])

  const fallbacks = [
    { bg: '#8B4A1C', label: 'Imigongo' },
    { bg: '#2d5a2d', label: 'Weaving' },
    { bg: '#c8a04a', label: 'Sculpture' },
    { bg: '#3d1c3d', label: 'Pattern' },
  ]

  const tiles = [0, 1, 2, 3].map(i => ({
    image: heroArtworks[i]?.image_url || null,
    label: heroArtworks[i]?.category || fallbacks[i].label,
    bg: fallbacks[i].bg,
  }))

  const tileClasses = ['tile-cw', 'tile-ccw', 'tile-cw2', 'tile-ccw2']

  return (
    <div className="min-h-screen bg-cream">
      <style>{`
        @keyframes orbitCW {
          from { transform: rotate(0deg) translateX(110px) rotate(0deg); }
          to   { transform: rotate(360deg) translateX(110px) rotate(-360deg); }
        }
        @keyframes orbitCCW {
          from { transform: rotate(0deg) translateX(110px) rotate(0deg); }
          to   { transform: rotate(-360deg) translateX(110px) rotate(360deg); }
        }
        @keyframes spinSlow {
          from { transform: translate(-50%, -50%) rotate(0deg); }
          to   { transform: translate(-50%, -50%) rotate(360deg); }
        }
        @keyframes spinReverse {
          from { transform: translate(-50%, -50%) rotate(0deg); }
          to   { transform: translate(-50%, -50%) rotate(-360deg); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.6; }
          50%       { opacity: 1; }
        }
        .tile-cw   { animation: orbitCW  8s linear infinite; }
        .tile-ccw  { animation: orbitCCW 8s linear infinite; }
        .tile-cw2  { animation: orbitCW  8s linear infinite 2s; }
        .tile-ccw2 { animation: orbitCCW 8s linear infinite 4s; }
        .orbit-ring-1 {
          position: absolute; top: 50%; left: 50%;
          width: 200px; height: 200px;
          margin-top: -100px; margin-left: -100px;
          border-radius: 50%;
          border: 1px solid rgba(168,201,122,0.15);
          animation: spinSlow 10s linear infinite;
        }
        .orbit-ring-2 {
          position: absolute; top: 50%; left: 50%;
          width: 290px; height: 290px;
          margin-top: -145px; margin-left: -145px;
          border-radius: 50%;
          border: 1px solid rgba(168,201,122,0.08);
          animation: spinReverse 16s linear infinite;
        }
        .badge-pulse       { animation: pulse 3s ease-in-out infinite; }
        .badge-pulse-delay { animation: pulse 3s ease-in-out infinite 1.5s; }
      `}</style>

      <Navbar />

      {/* Hero */}
      <section className="bg-forest text-cream">
        <div className="max-w-6xl mx-auto px-6 md:px-8 py-12 md:py-20 grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
          <div>
            <span className="inline-block bg-sage text-forest text-xs font-body tracking-widest uppercase px-3 py-1 mb-4 md:mb-6">
              African Art Marketplace
            </span>
            <h1 className="font-sans text-4xl md:text-6xl leading-tight mb-4 md:mb-6">
              Art that carries<br />a <span className="text-sage">story</span>
            </h1>
            <p className="font-body text-sm text-mist leading-relaxed max-w-md mb-6 md:mb-8">
              Discover and collect authentic African artwork directly from verified Rwandan and
              African artists. Every piece carries a culture. Every sale sustains a livelihood.
            </p>
            <div className="flex flex-wrap gap-3 md:gap-4">
              <Link href="/browse" className="btn-sage">Explore artworks</Link>
              {!user && (
                <Link href="/auth/register" className="btn-outline border-moss text-mist hover:border-cream hover:text-cream">
                  Join as artist
                </Link>
              )}
            </div>
          </div>

          {/* Animated tiles — hidden on small phones, shown on md+ */}
          <div className="hidden md:flex items-center justify-center">
            <div style={{ position: 'relative', width: '300px', height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div className="orbit-ring-1" />
              <div className="orbit-ring-2" />
              <div style={{ position: 'absolute', width: '12px', height: '12px', borderRadius: '50%', background: 'rgba(168,201,122,0.4)' }} />
              {tiles.map((tile, i) => (
                <div key={i} className={tileClasses[i]} style={{ position: 'absolute' }}>
                  <div style={{ width: '72px', height: '72px', background: tile.bg, overflow: 'hidden', border: tile.image ? '1px solid rgba(168,201,122,0.2)' : 'none' }}>
                    {tile.image ? (
                      <img src={tile.image} alt={tile.label} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <div style={{ width: '28px', height: '28px', borderRadius: '50%', border: '1.5px solid rgba(244,240,230,0.25)' }} />
                      </div>
                    )}
                  </div>
                  <p style={{ fontSize: '9px', color: '#6a8a6a', letterSpacing: '1px', textTransform: 'uppercase', textAlign: 'center', marginTop: '4px', fontFamily: 'DM Sans, sans-serif' }}>
                    {tile.label}
                  </p>
                </div>
              ))}
              <div className="badge-pulse" style={{ position: 'absolute', top: '20px', right: '-10px', background: 'rgba(28,58,28,0.9)', border: '1px solid rgba(168,201,122,0.25)', padding: '5px 10px', fontSize: '10px', color: '#A8C97A', letterSpacing: '1px', textTransform: 'uppercase', whiteSpace: 'nowrap', fontFamily: 'DM Sans, sans-serif' }}>
                240+ artists
              </div>
              <div className="badge-pulse-delay" style={{ position: 'absolute', bottom: '20px', left: '-10px', background: 'rgba(28,58,28,0.9)', border: '1px solid rgba(168,201,122,0.25)', padding: '5px 10px', fontSize: '10px', color: '#A8C97A', letterSpacing: '1px', textTransform: 'uppercase', whiteSpace: 'nowrap', fontFamily: 'DM Sans, sans-serif' }}>
                RWF 18M+ earned
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="bg-bark">
        <div className="max-w-4xl mx-auto px-6 md:px-8 py-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { num: '240+', label: 'Verified artists' },
            { num: '1,800+', label: 'Artworks listed' },
            { num: '12', label: 'Countries reached' },
            { num: 'RWF 18M+', label: 'Paid to artists' },
          ].map(stat => (
            <div key={stat.label} className="text-center">
              <div className="font-sans text-xl md:text-2xl text-sage">{stat.num}</div>
              <div className="font-body text-xs text-mist tracking-widest uppercase mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-forest text-cream py-14 md:py-20 px-6 md:px-8">
        <div className="max-w-5xl mx-auto">
          <p className="font-body text-xs tracking-widest uppercase text-mist mb-2">How it works</p>
          <h2 className="font-sans text-3xl md:text-4xl mb-8 md:mb-12">Simple. Trusted. Yours.</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            {[
              { num: '01', title: 'Artists apply & get verified', desc: 'Submit your profile and portfolio. Our curators verify authenticity and approve listings.' },
              { num: '02', title: 'List with story & price', desc: 'Guided pricing support helps artists set fair market value. Every listing includes the cultural story.' },
              { num: '03', title: 'Buyers discover & collect', desc: 'Browse a curated gallery, purchase securely, and receive artwork with full provenance.' },
            ].map(step => (
              <div key={step.num} className="border border-moss/40 p-5 md:p-6">
                <div className="font-sans text-3xl md:text-4xl text-sage/40 mb-3 md:mb-4">{step.num}</div>
                <h3 className="font-sans text-base md:text-lg text-cream mb-2 md:mb-3">{step.title}</h3>
                <p className="font-body text-sm text-mist leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-sage py-12 md:py-16 px-6 md:px-8 text-center">
        <h2 className="font-sans text-3xl md:text-4xl text-forest mb-3">Ready to share your art?</h2>
        <p className="font-body text-sm text-forest/70 mb-6 md:mb-8">Join 240+ verified African artists already earning on GURArt</p>
        <Link href="/auth/register" className="btn-primary">Apply as an artist</Link>
      </section>

      {/* Footer */}
      <footer className="bg-forest py-6 md:py-8 px-6 md:px-8 flex flex-col md:flex-row gap-3 md:gap-0 justify-between items-center">
        <div className="font-sans text-xl text-cream tracking-widest">GUR<span className="text-sage">Art</span></div>
        <p className="font-body text-xs text-mist">© 2026 GURArt · Kigali, Rwanda</p>
      </footer>
    </div>
  )
}
