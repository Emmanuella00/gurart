import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { supabase } from '../../lib/supabase'
import Navbar from '../../components/layout/Navbar'

export default function Confirmation() {
  const router = useRouter()
  const { artwork: artworkId, order: orderId, simulated } = router.query
  const [artwork, setArtwork] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!artworkId) return
    async function load() {
      const { data } = await supabase
        .from('artworks')
        .select(`*, artists ( profiles ( full_name ) )`)
        .eq('id', artworkId)
        .single()
      setArtwork(data)
      setLoading(false)
    }
    load()
  }, [artworkId])

  if (loading) {
    return (
      <div className="min-h-screen bg-cream">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <p className="font-body text-xs tracking-widest uppercase text-mist animate-pulse">Loading...</p>
        </div>
      </div>
    )
  }

  const refNumber = orderId || `GUR-${Date.now().toString().slice(-6)}`

  return (
    <div className="min-h-screen bg-cream">
      <Navbar />

      <div className="max-w-2xl mx-auto px-8 py-20 text-center">
        {/* Success icon */}
        <div className="w-16 h-16 bg-sage mx-auto flex items-center justify-center mb-8">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#1C3A1C" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>

        <p className="font-body text-xs tracking-widest uppercase text-sage mb-3">Order placed</p>
        <h1 className="font-sans text-5xl text-forest mb-4 leading-tight">
          Thank you for<br />your purchase
        </h1>
        <p className="font-body text-sm text-mist leading-relaxed mb-10 max-w-md mx-auto">
          Your order has been received and the artist has been notified.
          You'll receive a confirmation shortly.
        </p>

        {/* Order card */}
        <div className="bg-white border border-moss/20 text-left mb-8">
          {artwork?.image_url && (
            <div className="h-56 overflow-hidden bg-bark/10">
              <img src={artwork.image_url} alt={artwork.title} className="w-full h-full object-cover" />
            </div>
          )}
          <div className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="font-sans text-2xl text-forest">{artwork?.title}</h2>
                <p className="font-body text-sm text-mist">
                  by {artwork?.artists?.profiles?.full_name}
                </p>
              </div>
              <p className="font-sans text-xl text-forest">
                RWF {artwork?.price?.toLocaleString()}
              </p>
            </div>

            <div className="border-t border-moss/20 pt-4 space-y-2">
              <div className="flex justify-between font-body text-sm">
                <span className="text-mist">Order reference</span>
                <span className="text-forest font-medium">{refNumber}</span>
              </div>
              <div className="flex justify-between font-body text-sm">
                <span className="text-mist">Status</span>
                <span className="flex items-center gap-1.5 text-amber-700">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block"></span>
                  Pending confirmation
                </span>
              </div>
              {simulated && (
                <div className="flex justify-between font-body text-sm">
                  <span className="text-mist">Payment</span>
                  <span className="text-forest">Simulated (demo mode)</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* What happens next */}
        <div className="bg-forest text-cream p-6 text-left mb-8">
          <h3 className="font-sans text-xl mb-4">What happens next</h3>
          <div className="space-y-3">
            {[
              { step: '01', text: 'The artist is notified and will confirm the order within 24 hours' },
              { step: '02', text: 'Once confirmed, payment instructions will be sent to your email' },
              { step: '03', text: 'Your artwork will be carefully packaged and shipped to you' },
            ].map(item => (
              <div key={item.step} className="flex gap-4">
                <span className="font-sans text-sage/50 text-sm flex-shrink-0">{item.step}</span>
                <p className="font-body text-sm text-mist leading-relaxed">{item.text}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-4 justify-center">
          <Link href="/browse" className="btn-outline">
            Continue browsing
          </Link>
          <Link href="/" className="btn-primary">
            Back to home
          </Link>
        </div>
      </div>
    </div>
  )
}
