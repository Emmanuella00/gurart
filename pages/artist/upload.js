import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { supabase } from '../../lib/supabase'
import { uploadToCloudinary } from '../../lib/cloudinary'
import Navbar from '../../components/layout/Navbar'

const CATEGORIES = ['painting', 'sculpture', 'photography', 'portrait', 'pattern', 'other']

export default function UploadArtwork() {
  const router = useRouter()
  const fileInputRef = useRef(null)
  const [artistId, setArtistId] = useState(null)
  const [form, setForm] = useState({
    title: '',
    description: '',
    story: '',
    price: '',
    category: '',
  })
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [dragOver, setDragOver] = useState(false)

  useEffect(() => {
    async function getArtist() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }

      const { data: artist } = await supabase
        .from('artists')
        .select('id')
        .eq('user_id', user.id)
        .single()

      if (!artist) { router.push('/artist/onboarding'); return }
      setArtistId(artist.id)
    }
    getArtist()
  }, [])

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  function handleFile(file) {
    if (!file || !file.type.startsWith('image/')) return
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  function handleFileInput(e) {
    handleFile(e.target.files[0])
  }

  function handleDrop(e) {
    e.preventDefault()
    setDragOver(false)
    handleFile(e.dataTransfer.files[0])
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!imageFile) { setError('Please upload an image of your artwork'); return }
    setError('')
    setLoading(true)

    try {
      // Upload image to Cloudinary
      const { url, publicId } = await uploadToCloudinary(imageFile)

      // Save artwork to Supabase
      const { error: insertError } = await supabase
        .from('artworks')
        .insert({
          artist_id: artistId,
          title: form.title,
          description: form.description,
          story: form.story,
          price: parseFloat(form.price),
          category: form.category,
          image_url: url,
          cloudinary_public_id: publicId,
        })

      if (insertError) throw insertError

      router.push('/artist/dashboard')
    } catch (err) {
      setError(err.message || 'Upload failed. Please try again.')
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-cream">
      <Navbar />

      <div className="max-w-3xl mx-auto py-16 px-4">
        <div className="flex items-center gap-3 mb-2">
          <Link href="/artist/dashboard" className="font-body text-xs text-mist hover:text-forest transition-colors">
            ← Dashboard
          </Link>
        </div>

        <div className="mb-10">
          <h1 className="font-sans text-4xl text-forest mb-2">Upload artwork</h1>
          <p className="font-body text-sm text-mist">
            Add a new piece to your portfolio. Every artwork goes through a quick review before going live.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Image upload */}
          <div className="card">
            <h2 className="font-sans text-xl text-forest mb-4">Artwork image *</h2>

            {imagePreview ? (
              <div className="relative">
                <img
                  src={imagePreview}
                  alt="preview"
                  className="w-full max-h-96 object-contain bg-bark/5 border border-moss/20"
                />
                <button
                  type="button"
                  onClick={() => { setImageFile(null); setImagePreview(null) }}
                  className="absolute top-3 right-3 bg-white border border-moss/30 px-3 py-1 font-body text-xs text-forest hover:bg-cream transition-colors"
                >
                  Change
                </button>
              </div>
            ) : (
              <div
                className={`border-2 border-dashed p-12 text-center cursor-pointer transition-colors ${
                  dragOver ? 'border-forest bg-forest/5' : 'border-moss/30 hover:border-forest'
                }`}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="font-sans text-4xl text-mist mb-3">↑</div>
                <p className="font-body text-sm text-forest mb-1">
                  Drag your image here, or <span className="underline">browse</span>
                </p>
                <p className="font-body text-xs text-mist">JPG, PNG or WEBP · Max 10MB · High resolution recommended</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileInput}
                  className="sr-only"
                />
              </div>
            )}
          </div>

          {/* Artwork details */}
          <div className="card space-y-5">
            <h2 className="font-sans text-xl text-forest">Artwork details</h2>

            <div>
              <label className="label">Title *</label>
              <input
                name="title"
                type="text"
                required
                placeholder="Give your artwork a meaningful name"
                value={form.title}
                onChange={handleChange}
                className="input-field"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Category *</label>
                <select
                  name="category"
                  required
                  value={form.category}
                  onChange={handleChange}
                  className="input-field"
                >
                  <option value="">Select category</option>
                  {CATEGORIES.map(c => (
                    <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label">Price (RWF) *</label>
                <input
                  name="price"
                  type="number"
                  required
                  min="0"
                  placeholder="e.g. 150000"
                  value={form.price}
                  onChange={handleChange}
                  className="input-field"
                />
              </div>
            </div>

            <div>
              <label className="label">Description</label>
              <textarea
                name="description"
                rows={3}
                placeholder="Describe the artwork — dimensions, medium, technique..."
                value={form.description}
                onChange={handleChange}
                className="input-field resize-none"
              />
            </div>
          </div>

          {/* Story — the GURArt differentiator */}
          <div className="card">
            <h2 className="font-sans text-xl text-forest mb-1">The story behind it</h2>
            <p className="font-body text-xs text-mist mb-4">
              This is what makes GURArt different. Share the cultural meaning, your inspiration, or what this piece means to you.
            </p>
            <textarea
              name="story"
              rows={5}
              placeholder="e.g. This pattern is inspired by the Imigongo art tradition of Eastern Rwanda, which dates back to the royal court of King Mutara I..."
              value={form.story}
              onChange={handleChange}
              className="input-field resize-none"
            />
          </div>

          {error && (
            <p className="font-body text-xs text-red-600 bg-red-50 px-4 py-3">{error}</p>
          )}

          <div className="flex gap-4">
            <Link href="/artist/dashboard" className="btn-outline text-center flex-1">
              Cancel
            </Link>
            <button type="submit" disabled={loading} className="btn-sage flex-1 text-center">
              {loading ? 'Uploading...' : 'Submit artwork for review →'}
            </button>
          </div>

          <p className="font-body text-xs text-center text-mist">
            Your artwork will be reviewed by our team within 48 hours before going live.
          </p>
        </form>
      </div>
    </div>
  )
}
