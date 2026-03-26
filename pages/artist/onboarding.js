import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../../lib/supabase'
import { uploadToCloudinary } from '../../lib/cloudinary'
import Navbar from '../../components/layout/Navbar'

const SPECIALTIES = [
  'Painting', 'Sculpture', 'Photography', 'Portrait',
  'Pattern & Textile', 'Mixed Media', 'Digital Art', 'Other'
]

export default function ArtistOnboarding() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [form, setForm] = useState({
    full_name: '',
    bio: '',
    location: '',
    specialty: '',
  })
  const [avatarFile, setAvatarFile] = useState(null)
  const [avatarPreview, setAvatarPreview] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { router.push('/auth/login'); return }
      setUser(user)
      setForm(f => ({ ...f, full_name: user.user_metadata?.full_name || '' }))
    })
  }, [])

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  function handleAvatarChange(e) {
    const file = e.target.files[0]
    if (!file) return
    setAvatarFile(file)
    setAvatarPreview(URL.createObjectURL(file))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      let avatarUrl = null

      // Upload avatar to Cloudinary if provided
      if (avatarFile) {
        const formData = new FormData()
        formData.append('file', avatarFile)
        formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET)
        formData.append('folder', 'gurart/avatars')
        const res = await fetch(
          `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
          { method: 'POST', body: formData }
        )
        const data = await res.json()
        avatarUrl = data.secure_url
      }

      // Update profile
      await supabase
        .from('profiles')
        .update({ full_name: form.full_name, avatar_url: avatarUrl })
        .eq('id', user.id)

      // Create artist record
      const { error: artistError } = await supabase
        .from('artists')
        .insert({
          user_id: user.id,
          bio: form.bio,
          location: form.location,
          specialty: form.specialty,
        })

      if (artistError) throw artistError

      router.push('/artist/dashboard')
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.')
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-cream">
      <Navbar />
      <div className="max-w-2xl mx-auto py-16 px-4">
        {/* Header */}
        <div className="mb-10">
          <p className="font-body text-xs tracking-widest uppercase text-sage mb-2">Step 1 of 1</p>
          <h1 className="font-sans text-4xl text-forest mb-2">Set up your artist profile</h1>
          <p className="font-body text-sm text-mist">
            This is how buyers will discover you. Take your time — a great profile builds trust.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Avatar */}
          <div className="card">
            <h2 className="font-sans text-xl text-forest mb-4">Profile photo</h2>
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 bg-bark/10 border border-moss/20 flex items-center justify-center overflow-hidden flex-shrink-0">
                {avatarPreview ? (
                  <img src={avatarPreview} alt="preview" className="w-full h-full object-cover" />
                ) : (
                  <span className="font-sans text-2xl text-mist">
                    {form.full_name?.[0] || '?'}
                  </span>
                )}
              </div>
              <div>
                <label className="btn-outline cursor-pointer text-xs inline-block">
                  Choose photo
                  <input type="file" accept="image/*" onChange={handleAvatarChange} className="sr-only" />
                </label>
                <p className="font-body text-xs text-mist mt-2">JPG or PNG, max 5MB</p>
              </div>
            </div>
          </div>

          {/* Basic info */}
          <div className="card space-y-5">
            <h2 className="font-sans text-xl text-forest">About you</h2>

            <div>
              <label className="label">Full name *</label>
              <input
                name="full_name"
                type="text"
                required
                placeholder="Your full name"
                value={form.full_name}
                onChange={handleChange}
                className="input-field"
              />
            </div>

            <div>
              <label className="label">Location *</label>
              <input
                name="location"
                type="text"
                required
                placeholder="e.g. Kigali, Rwanda"
                value={form.location}
                onChange={handleChange}
                className="input-field"
              />
            </div>

            <div>
              <label className="label">Your specialty *</label>
              <select
                name="specialty"
                required
                value={form.specialty}
                onChange={handleChange}
                className="input-field"
              >
                <option value="">Select a specialty</option>
                {SPECIALTIES.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="label">Bio *</label>
              <textarea
                name="bio"
                required
                rows={4}
                placeholder="Tell buyers about yourself, your inspiration, and your artistic journey..."
                value={form.bio}
                onChange={handleChange}
                className="input-field resize-none"
              />
              <p className="font-body text-xs text-mist mt-1">
                {form.bio.length}/500 characters
              </p>
            </div>
          </div>

          {error && (
            <p className="font-body text-xs text-red-600 bg-red-50 px-4 py-3">{error}</p>
          )}

          <button type="submit" disabled={loading} className="btn-sage w-full text-center">
            {loading ? 'Saving your profile...' : 'Complete profile & go to dashboard →'}
          </button>
        </form>
      </div>
    </div>
  )
}
