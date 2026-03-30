import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../../lib/supabase'
import Navbar from '../../components/layout/Navbar'

export default function AdminPanel() {
  const router = useRouter()
  const [artworks, setArtworks] = useState([])
  const [selected, setSelected] = useState(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [filter, setFilter] = useState('pending')
  const [toast, setToast] = useState(null)
  const [showDetail, setShowDetail] = useState(false)

  useEffect(() => { checkAdmin() }, [])

  async function checkAdmin() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/auth/login'); return }
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    if (profile?.role !== 'admin') { router.push('/'); return }
    loadArtworks()
  }

  async function loadArtworks() {
    setLoading(true)
    let query = supabase.from('artworks').select('*, artists(id, location, specialty, is_verified, profiles(full_name, avatar_url, email))').order('created_at', { ascending: false })
    if (filter === 'pending') query = query.eq('is_approved', false)
    if (filter === 'approved') query = query.eq('is_approved', true)
    const { data } = await query
    setArtworks(data || [])
    setLoading(false)
  }

  useEffect(() => { loadArtworks() }, [filter])

  function showToast(msg, type = 'success') {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  async function handleApprove(artwork) {
    setActionLoading(true)
    const { error } = await supabase.from('artworks').update({ is_approved: true }).eq('id', artwork.id)
    if (!error) { showToast(`"${artwork.title}" approved`); loadArtworks(); setSelected(null); setShowDetail(false) }
    else showToast('Failed to approve', 'error')
    setActionLoading(false)
  }

  async function handleReject(artwork) {
    setActionLoading(true)
    const { error } = await supabase.from('artworks').delete().eq('id', artwork.id)
    if (!error) { showToast(`"${artwork.title}" rejected`); loadArtworks(); setSelected(null); setShowDetail(false) }
    else showToast('Failed to reject', 'error')
    setActionLoading(false)
  }

  async function handleVerifyArtist(artistId) {
    setActionLoading(true)
    await supabase.from('artists').update({ is_verified: true }).eq('id', artistId)
    showToast('Artist verified')
    loadArtworks()
    setActionLoading(false)
  }

  function selectArtwork(artwork) {
    setSelected(artwork)
    setShowDetail(true)
  }

  return (
    <div className="min-h-screen bg-cream">
      <Navbar />
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 font-body text-sm ${toast.type === 'error' ? 'bg-red-600 text-white' : 'bg-forest text-sage'}`}>
          {toast.msg}
        </div>
      )}

      <div className="flex flex-col md:flex-row" style={{ minHeight: 'calc(100vh - 60px)' }}>

        {/* Sidebar — full width on mobile when detail not shown */}
        <div className={`${showDetail ? 'hidden md:flex' : 'flex'} md:w-80 flex-shrink-0 border-r border-moss/20 bg-white flex-col`}>
          <div className="p-4 border-b border-moss/20">
            <h2 className="font-sans text-xl text-forest mb-3">Admin panel</h2>
            <div className="flex gap-1">
              {['pending', 'approved', 'all'].map(f => (
                <button key={f} onClick={() => { setFilter(f); setSelected(null) }}
                  className={`font-body text-xs tracking-widest uppercase px-3 py-1.5 transition-colors flex-1 ${filter === f ? 'bg-forest text-cream' : 'text-mist hover:text-forest border border-moss/20'}`}>
                  {f}
                </button>
              ))}
            </div>
          </div>
          <div className="overflow-y-auto flex-1">
            {loading ? (
              <div className="p-4 space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="h-16 bg-bark/10 animate-pulse" />)}</div>
            ) : artworks.length === 0 ? (
              <div className="p-6 text-center"><p className="font-body text-sm text-mist">No {filter} artworks</p></div>
            ) : artworks.map(artwork => (
              <button key={artwork.id} onClick={() => selectArtwork(artwork)}
                className={`w-full text-left p-3 border-b border-moss/10 flex gap-3 items-center hover:bg-cream transition-colors ${selected?.id === artwork.id ? 'bg-cream border-l-2 border-l-forest' : ''}`}>
                <div className="w-12 h-12 flex-shrink-0 bg-bark/10 overflow-hidden">
                  {artwork.image_url ? <img src={artwork.image_url} alt={artwork.title} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><span className="font-body text-xs text-mist">?</span></div>}
                </div>
                <div className="min-w-0">
                  <p className="font-body text-sm text-forest truncate">{artwork.title}</p>
                  <p className="font-body text-xs text-mist truncate">{artwork.artists?.profiles?.full_name}</p>
                  <div className={`inline-block mt-1 text-xs font-body px-1.5 py-0.5 ${artwork.is_approved ? 'bg-sage/20 text-forest' : 'bg-amber-100 text-amber-700'}`}>
                    {artwork.is_approved ? 'Live' : 'Pending'}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Detail panel */}
        <div className={`${showDetail ? 'block' : 'hidden md:block'} flex-1 overflow-y-auto`}>
          {!selected ? (
            <div className="flex items-center justify-center h-full py-20">
              <p className="font-body text-sm text-mist">Select an artwork to review</p>
            </div>
          ) : (
            <div className="p-6 md:p-8 max-w-2xl">
              {/* Mobile back button */}
              <button onClick={() => setShowDetail(false)} className="md:hidden font-body text-xs text-mist hover:text-forest mb-4 flex items-center gap-1">
                ← Back to list
              </button>

              <div className="flex items-start justify-between mb-5 md:mb-6">
                <div>
                  <p className="font-body text-xs text-mist tracking-widest uppercase mb-1 capitalize">{selected.category}</p>
                  <h1 className="font-sans text-2xl md:text-3xl text-forest">{selected.title}</h1>
                </div>
                <span className={`font-body text-xs px-2 py-1 flex-shrink-0 ml-2 ${selected.is_approved ? 'bg-sage/20 text-forest' : 'bg-amber-100 text-amber-700'}`}>
                  {selected.is_approved ? 'Approved' : 'Pending'}
                </span>
              </div>

              <div className="aspect-video bg-bark/10 border border-moss/20 overflow-hidden mb-5 md:mb-6">
                {selected.image_url
                  ? <img src={selected.image_url} alt={selected.title} className="w-full h-full object-contain" />
                  : <div className="w-full h-full flex items-center justify-center"><span className="font-body text-sm text-mist">No image</span></div>}
              </div>

              <div className="bg-white border border-moss/20 p-4 mb-4 md:mb-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-bark/10 flex items-center justify-center overflow-hidden">
                      {selected.artists?.profiles?.avatar_url
                        ? <img src={selected.artists.profiles.avatar_url} className="w-full h-full object-cover" />
                        : <span className="font-sans text-sm text-mist">{selected.artists?.profiles?.full_name?.[0]}</span>}
                    </div>
                    <div>
                      <p className="font-body text-sm font-medium text-forest">{selected.artists?.profiles?.full_name}</p>
                      <p className="font-body text-xs text-mist">{selected.artists?.location}</p>
                    </div>
                  </div>
                  {!selected.artists?.is_verified
                    ? <button onClick={() => handleVerifyArtist(selected.artists?.id)} disabled={actionLoading} className="font-body text-xs border border-forest text-forest px-3 py-1.5 hover:bg-forest hover:text-cream transition-colors">Verify</button>
                    : <span className="font-body text-xs bg-sage/20 text-forest px-2 py-1">Verified</span>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4 md:mb-5">
                {[
                  { label: 'Price', value: `RWF ${selected.price?.toLocaleString()}` },
                  { label: 'Category', value: selected.category },
                  { label: 'Submitted', value: new Date(selected.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) },
                  { label: 'Available', value: selected.is_available ? 'Yes' : 'Sold' },
                ].map(item => (
                  <div key={item.label} className="bg-white border border-moss/20 px-4 py-3">
                    <p className="font-body text-xs text-mist tracking-widest uppercase mb-1">{item.label}</p>
                    <p className="font-body text-sm text-forest capitalize">{item.value}</p>
                  </div>
                ))}
              </div>

              {selected.description && (
                <div className="mb-4 md:mb-5">
                  <p className="font-body text-xs text-mist tracking-widest uppercase mb-2">Description</p>
                  <p className="font-body text-sm text-moss leading-relaxed">{selected.description}</p>
                </div>
              )}

              {selected.story && (
                <div className="bg-forest text-cream p-4 md:p-5 mb-5 md:mb-6">
                  <p className="font-body text-xs tracking-widest uppercase text-sage mb-2">Cultural story</p>
                  <p className="font-body text-sm text-mist leading-relaxed italic">"{selected.story}"</p>
                </div>
              )}

              {!selected.is_approved ? (
                <div className="flex flex-col md:flex-row gap-3">
                  <button onClick={() => handleReject(selected)} disabled={actionLoading} className="btn-outline flex-1 text-center border-red-300 text-red-600 hover:bg-red-600 hover:text-white hover:border-red-600">Reject & remove</button>
                  <button onClick={() => handleApprove(selected)} disabled={actionLoading} className="btn-sage flex-1 text-center">{actionLoading ? 'Processing...' : 'Approve & publish →'}</button>
                </div>
              ) : (
                <div className="flex flex-col md:flex-row gap-3">
                  <div className="bg-sage/10 border border-sage/30 px-4 py-3 flex-1 text-center"><p className="font-body text-sm text-forest">This artwork is live</p></div>
                  <button onClick={() => handleReject(selected)} disabled={actionLoading} className="btn-outline border-red-300 text-red-600 hover:bg-red-600 hover:text-white hover:border-red-600">Remove</button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
