import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { supabase } from '../../lib/supabase'
import Navbar from '../../components/layout/Navbar'

export default function Checkout() {
  const router = useRouter()
  const { id } = router.query
  const [artwork, setArtwork] = useState(null)
  const [user, setUser] = useState(null)
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    country: 'Rwanda',
    payment_method: 'mtn_momo',
    momo_number: '',
  })
  const [loading, setLoading] = useState(true)
  const [placing, setPlacing] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!id) return
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push(`/auth/login?redirect=/checkout/${id}`); return }
      setUser(user)

      // Pre-fill name and email from profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, email')
        .eq('id', user.id)
        .single()

      if (profile) {
        setForm(f => ({
          ...f,
          full_name: profile.full_name || '',
          email: profile.email || user.email || '',
        }))
      }

      const { data: artworkData } = await supabase
        .from('artworks')
        .select(`
          *,
          artists (
            profiles ( full_name )
          )
        `)
        .eq('id', id)
        .single()

      setArtwork(artworkData)
      setLoading(false)
    }
    load()
  }, [id])

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function handlePlaceOrder(e) {
    e.preventDefault()
    setError('')
    setPlacing(true)

    try {
      // Create order in Supabase
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          buyer_id: user.id,
          artwork_id: artwork.id,
          amount: artwork.price,
          status: 'pending',
          shipping_name: form.full_name,
          shipping_email: form.email,
          shipping_phone: form.phone,
          shipping_address: `${form.address}, ${form.city}, ${form.country}`,
          payment_method: form.payment_method,
        })
        .select()
        .single()

      if (orderError) throw orderError

      // Mark artwork as unavailable
      await supabase
        .from('artworks')
        .update({ is_available: false })
        .eq('id', artwork.id)

      router.push(`/checkout/confirmation?order=${order.id}&artwork=${artwork.id}`)
    } catch (err) {
      // If orders table doesn't exist yet, simulate success
      if (err.message?.includes('relation "public.orders" does not exist')) {
        router.push(`/checkout/confirmation?artwork=${artwork.id}&simulated=true`)
      } else {
        setError(err.message || 'Something went wrong. Please try again.')
      }
    }

    setPlacing(false)
  }

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

  return (
    <div className="min-h-screen bg-cream">
      <Navbar />

      <div className="max-w-4xl mx-auto px-8 py-12">
        <div className="mb-8">
          <Link href={`/artwork/${id}`} className="font-body text-xs text-mist hover:text-forest transition-colors">
            ← Back to artwork
          </Link>
          <h1 className="font-sans text-4xl text-forest mt-3">Complete your order</h1>
          <p className="font-body text-xs text-mist mt-1">
            This is a simulated checkout — no real payment will be taken.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-8">
          {/* Form — left 2 cols */}
          <form onSubmit={handlePlaceOrder} className="col-span-2 space-y-6">

            {/* Shipping details */}
            <div className="card space-y-4">
              <h2 className="font-sans text-xl text-forest">Delivery details</h2>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Full name *</label>
                  <input name="full_name" type="text" required value={form.full_name} onChange={handleChange} className="input-field" placeholder="Your full name" />
                </div>
                <div>
                  <label className="label">Email *</label>
                  <input name="email" type="email" required value={form.email} onChange={handleChange} className="input-field" placeholder="you@example.com" />
                </div>
              </div>

              <div>
                <label className="label">Phone number *</label>
                <input name="phone" type="tel" required value={form.phone} onChange={handleChange} className="input-field" placeholder="+250 7XX XXX XXX" />
              </div>

              <div>
                <label className="label">Delivery address *</label>
                <input name="address" type="text" required value={form.address} onChange={handleChange} className="input-field" placeholder="Street address" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">City *</label>
                  <input name="city" type="text" required value={form.city} onChange={handleChange} className="input-field" placeholder="Kigali" />
                </div>
                <div>
                  <label className="label">Country</label>
                  <input name="country" type="text" value={form.country} onChange={handleChange} className="input-field" />
                </div>
              </div>
            </div>

            {/* Payment method */}
            <div className="card space-y-4">
              <h2 className="font-sans text-xl text-forest">Payment method</h2>
              <p className="font-body text-xs text-mist">Simulated — choose your preferred method for demonstration</p>

              <div className="space-y-2">
                {[
                  { value: 'mtn_momo', label: 'MTN Mobile Money', desc: 'Pay via MTN MoMo' },
                  { value: 'airtel_money', label: 'Airtel Money', desc: 'Pay via Airtel Money' },
                  { value: 'bank_transfer', label: 'Bank Transfer', desc: 'Direct bank transfer' },
                  { value: 'card', label: 'Card Payment', desc: 'Visa / Mastercard' },
                ].map(opt => (
                  <label
                    key={opt.value}
                    className={`flex items-center gap-4 p-3 border cursor-pointer transition-colors ${
                      form.payment_method === opt.value
                        ? 'border-forest bg-forest/5'
                        : 'border-moss/20 hover:border-forest'
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment_method"
                      value={opt.value}
                      checked={form.payment_method === opt.value}
                      onChange={handleChange}
                      className="accent-forest"
                    />
                    <div>
                      <p className="font-body text-sm font-medium text-forest">{opt.label}</p>
                      <p className="font-body text-xs text-mist">{opt.desc}</p>
                    </div>
                  </label>
                ))}
              </div>

              {(form.payment_method === 'mtn_momo' || form.payment_method === 'airtel_money') && (
                <div>
                  <label className="label">Mobile money number *</label>
                  <input
                    name="momo_number"
                    type="tel"
                    value={form.momo_number}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="+250 7XX XXX XXX"
                  />
                </div>
              )}
            </div>

            {error && (
              <p className="font-body text-xs text-red-600 bg-red-50 px-4 py-3">{error}</p>
            )}

            <button type="submit" disabled={placing} className="btn-sage w-full text-center">
              {placing ? 'Placing order...' : `Place order · RWF ${artwork?.price?.toLocaleString()}`}
            </button>
          </form>

          {/* Order summary — right col */}
          <div className="col-span-1">
            <div className="card sticky top-8">
              <h2 className="font-sans text-xl text-forest mb-4">Order summary</h2>

              {artwork?.image_url && (
                <div className="aspect-square bg-bark/10 overflow-hidden mb-4">
                  <img src={artwork.image_url} alt={artwork.title} className="w-full h-full object-cover" />
                </div>
              )}

              <h3 className="font-sans text-lg text-forest leading-tight mb-1">{artwork?.title}</h3>
              <p className="font-body text-xs text-mist mb-4">
                by {artwork?.artists?.profiles?.full_name}
              </p>

              <div className="border-t border-moss/20 pt-4 space-y-2">
                <div className="flex justify-between font-body text-sm">
                  <span className="text-mist">Artwork</span>
                  <span className="text-forest">RWF {artwork?.price?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between font-body text-sm">
                  <span className="text-mist">Platform fee</span>
                  <span className="text-forest">RWF 0</span>
                </div>
                <div className="flex justify-between font-body text-sm font-medium border-t border-moss/20 pt-2 mt-2">
                  <span className="text-forest">Total</span>
                  <span className="text-forest text-base">RWF {artwork?.price?.toLocaleString()}</span>
                </div>
              </div>

              <div className="mt-4 bg-sage/10 border border-sage/30 px-3 py-2">
                <p className="font-body text-xs text-forest leading-relaxed">
                  100% of this sale goes directly to the artist.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
