import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { supabase } from '../../lib/supabase'
import Navbar from '../../components/layout/Navbar'

export default function CheckoutConfirm() {
  const router = useRouter()
  const { artwork_id, order_id } = router.query
  const [artwork, setArtwork] = useState(null)
  const [user, setUser] = useState(null)
  const [step, setStep] = useState('review') // review | processing | confirmed
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({
    name: '', email: '', phone: '', address: '',
    payment: 'momo', momo_number: '',
  })

  useEffect(() => {
    if (!artwork_id) return
    async function load() {
      const [{ data: artworkData }, { data: { user: currentUser } }] = await Promise.all([
        supabase.from('artworks').select('*, artists(id, profiles(full_name))').eq('id', artwork_id).single(),
        supabase.auth.getUser()
      ])
      if (!currentUser) { router.push('/auth/login'); return }
      const { data: profile } = await supabase.from('profiles').select('full_name, email').eq('id', currentUser.id).single()
      setArtwork(artworkData)
      setUser(currentUser)
      setForm(f => ({ ...f, name: profile?.full_name || '', email: profile?.email || currentUser.email || '' }))
      setLoading(false)
    }
    load()
  }, [artwork_id])

  function handleChange(e) { setForm({ ...form, [e.target.name]: e.target.value }) }

  async function handleConfirm(e) {
    e.preventDefault()
    setStep('processing')
    await new Promise(res => setTimeout(res, 2000))
    if (order_id) await supabase.from('orders').update({ status: 'completed' }).eq('id', order_id)
    await supabase.from('artworks').update({ is_available: false }).eq('id', artwork_id)
    setStep('confirmed')
  }

  if (loading) return (
    <div className="min-h-screen bg-cream"><Navbar />
      <div className="flex items-center justify-center h-64">
        <p className="font-body text-mist text-sm tracking-widest uppercase animate-pulse">Loading...</p>
      </div>
    </div>
  )

  if (step === 'confirmed') return (
    <div className="min-h-screen bg-cream"><Navbar />
      <div className="max-w-xl mx-auto px-4 py-20 text-center">
        <div className="w-20 h-20 bg-sage mx-auto flex items-center justify-center mb-8">
          <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
            <path d="M8 18l7 7 13-13" stroke="#1C3A1C" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <p className="font-body text-xs tracking-widest uppercase text-sage mb-3">Order placed</p>
        <h1 className="font-sans text-4xl text-forest mb-4">Thank you, {form.name.split(' ')[0]}!</h1>
        <p className="font-body text-sm text-mist leading-relaxed mb-8">
          Your purchase of <span className="text-forest font-medium">"{artwork?.title}"</span> has been confirmed.
          The artist will reach out to arrange delivery.
        </p>
        <div className="bg-white border border-moss/20 p-6 text-left mb-8">
          <p className="font-body text-xs tracking-widest uppercase text-mist mb-4">Order summary</p>
          <div className="flex gap-4 mb-4 pb-4 border-b border-moss/20">
            {artwork?.image_url && <img src={artwork.image_url} alt="" className="w-16 h-16 object-cover flex-shrink-0" />}
            <div>
              <p className="font-sans text-lg text-forest">{artwork?.title}</p>
              <p className="font-body text-xs text-mist">{artwork?.artists?.profiles?.full_name}</p>
            </div>
          </div>
          <div className="space-y-2 font-body text-sm">
            <div className="flex justify-between"><span className="text-mist">Artwork</span><span>RWF {artwork?.price?.toLocaleString()}</span></div>
            <div className="flex justify-between"><span className="text-mist">Platform fee</span><span>RWF 0</span></div>
            <div className="flex justify-between font-medium pt-2 border-t border-moss/20">
              <span className="text-forest">Total paid</span><span className="text-forest">RWF {artwork?.price?.toLocaleString()}</span>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-moss/20 space-y-1 font-body text-xs text-mist">
            <p>Delivery to: <span className="text-forest">{form.address}</span></p>
            <p>Payment via: <span className="text-forest">{form.payment === 'momo' ? 'MTN MoMo' : 'Airtel Money'}</span></p>
            <p>Confirmation sent to: <span className="text-forest">{form.email}</span></p>
          </div>
        </div>
        <div className="flex gap-4">
          <Link href="/browse" className="btn-outline flex-1 text-center">Continue browsing</Link>
          <Link href="/" className="btn-primary flex-1 text-center">Back to home</Link>
        </div>
      </div>
    </div>
  )

  if (step === 'processing') return (
    <div className="min-h-screen bg-cream flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-2 border-forest border-t-sage rounded-full animate-spin mx-auto mb-6" />
        <p className="font-sans text-2xl text-forest mb-2">Processing your order</p>
        <p className="font-body text-sm text-mist">Please wait, do not close this page...</p>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-cream"><Navbar />
      <div className="max-w-5xl mx-auto px-8 py-12">
        <div className="mb-8">
          <p className="font-body text-xs tracking-widest uppercase text-mist mb-2">Checkout</p>
          <h1 className="font-sans text-4xl text-forest">Complete your purchase</h1>
        </div>
        <form onSubmit={handleConfirm}>
          <div className="grid grid-cols-3 gap-8">
            <div className="col-span-2 space-y-6">
              <div className="card space-y-4">
                <h2 className="font-sans text-xl text-forest">Delivery information</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="label">Full name *</label><input name="name" type="text" required value={form.name} onChange={handleChange} className="input-field" /></div>
                  <div><label className="label">Email *</label><input name="email" type="email" required value={form.email} onChange={handleChange} className="input-field" /></div>
                </div>
                <div><label className="label">Phone *</label><input name="phone" type="tel" required placeholder="+250 7XX XXX XXX" value={form.phone} onChange={handleChange} className="input-field" /></div>
                <div><label className="label">Delivery address *</label><textarea name="address" required rows={2} placeholder="Street, District, Kigali" value={form.address} onChange={handleChange} className="input-field resize-none" /></div>
              </div>
              <div className="card space-y-4">
                <h2 className="font-sans text-xl text-forest">Payment method</h2>
                <p className="font-body text-xs text-mist -mt-2">This is a demo — no real payment will be processed.</p>
                <div className="grid grid-cols-2 gap-3">
                  {[{value:'momo',label:'MTN MoMo'},{value:'airtel',label:'Airtel Money'}].map(opt => (
                    <label key={opt.value} className={`border p-4 cursor-pointer transition-colors ${form.payment===opt.value?'border-forest bg-forest text-cream':'border-moss/30 hover:border-forest'}`}>
                      <input type="radio" name="payment" value={opt.value} checked={form.payment===opt.value} onChange={handleChange} className="sr-only" />
                      <p className="font-body text-sm font-medium">{opt.label}</p>
                      <p className={`font-body text-xs mt-0.5 ${form.payment===opt.value?'text-mist':'text-mist'}`}>Mobile Money</p>
                    </label>
                  ))}
                </div>
                <div><label className="label">Mobile money number *</label><input name="momo_number" type="tel" required placeholder="+250 7XX XXX XXX" value={form.momo_number} onChange={handleChange} className="input-field" /></div>
              </div>
            </div>
            <div className="col-span-1">
              <div className="card sticky top-8">
                <h2 className="font-sans text-xl text-forest mb-4">Order summary</h2>
                {artwork?.image_url && <img src={artwork.image_url} alt="" className="w-full aspect-square object-cover mb-4" />}
                <p className="font-sans text-lg text-forest leading-tight">{artwork?.title}</p>
                <p className="font-body text-xs text-mist mb-4">{artwork?.artists?.profiles?.full_name}</p>
                <div className="border-t border-moss/20 pt-4 space-y-2 font-body text-sm">
                  <div className="flex justify-between"><span className="text-mist">Artwork</span><span>RWF {artwork?.price?.toLocaleString()}</span></div>
                  <div className="flex justify-between"><span className="text-mist">Platform fee</span><span>RWF 0</span></div>
                  <div className="flex justify-between font-medium text-base pt-2 border-t border-moss/20">
                    <span className="text-forest">Total</span><span className="text-forest">RWF {artwork?.price?.toLocaleString()}</span>
                  </div>
                </div>
                <button type="submit" className="btn-sage w-full text-center mt-6">Confirm & place order →</button>
                <p className="font-body text-xs text-center text-mist mt-3">By ordering you agree to our terms of service</p>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
