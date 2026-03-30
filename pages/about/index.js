import Link from 'next/link'
import Navbar from '../../components/layout/Navbar'

export default function About() {
  return (
    <div className="min-h-screen bg-cream">
      <style>{`
        .hero-section {
          position: relative;
          min-height: 380px;
          display: flex;
          align-items: center;
          overflow: hidden;
          background: #F4F0E6;
        }
        .hero-bg-svg {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
        }
        .hero-content {
          position: relative;
          z-index: 2;
          max-width: 1152px;
          margin: 0 auto;
          padding: 100px 1.5rem 60px;
          width: 100%;
        }
        .hero-text { max-width: 520px; }
      `}</style>

      <div className="hero-section">
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10 }}>
          <Navbar transparent />
        </div>
        <svg className="hero-bg-svg" viewBox="0 0 1200 420" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
          <rect width="1200" height="420" fill="#F4F0E6"/>
          <path d="M 700 -20 C 760 60 800 30 860 110 C 920 190 890 280 950 330 C 1010 380 1100 350 1200 380 L 1200 -20 Z" fill="#1C3A1C" opacity="0.92"/>
          <path d="M 820 420 C 780 350 850 300 900 260 C 950 220 1010 250 1060 200 C 1110 150 1140 80 1200 60 L 1200 420 Z" fill="#263F26" opacity="0.85"/>
          <path d="M 620 -20 C 660 50 640 120 690 170 C 740 220 800 200 820 260 C 840 320 800 370 840 420 L 620 420 Z" fill="#2d5a2d" opacity="0.45"/>
          <ellipse cx="960" cy="140" rx="130" ry="100" fill="#1C3A1C" opacity="0.55" transform="rotate(-20 960 140)"/>
          <ellipse cx="1080" cy="300" rx="100" ry="130" fill="#3d6e3d" opacity="0.45" transform="rotate(15 1080 300)"/>
          <ellipse cx="860" cy="360" rx="120" ry="70" fill="#1C3A1C" opacity="0.4" transform="rotate(-10 860 360)"/>
          <ellipse cx="780" cy="80" rx="80" ry="55" fill="#2d5a2d" opacity="0.5" transform="rotate(25 780 80)"/>
          <ellipse cx="920" cy="180" rx="22" ry="34" fill="#E8851A" opacity="0.92"/>
          <ellipse cx="1050" cy="340" rx="18" ry="28" fill="#E8851A" opacity="0.88"/>
          <path d="M 680 60 C 720 110 710 170 750 210 C 790 250 830 230 840 280" fill="none" stroke="#F4F0E6" strokeWidth="1.5" opacity="0.25"/>
        </svg>
        <div className="hero-content">
          <div className="hero-text">
            <p className="font-body text-xs tracking-widest uppercase mb-3" style={{ color: '#4a6a4a' }}>Our story</p>
            <h1 className="font-sans leading-tight mb-5" style={{ fontSize: 'clamp(36px, 5vw, 52px)', color: '#1C3A1C' }}>
              Art is not a hobby.<br />It's a <span className="text-sage">livelihood.</span>
            </h1>
            <p className="font-body text-sm leading-relaxed" style={{ color: '#3d5c3d', maxWidth: '400px' }}>
              GURArt was born from a simple observation — Africa is home to extraordinary artists
              whose work deserves to be seen, valued, and purchased by the world.
            </p>
          </div>
        </div>
      </div>

      <section className="max-w-5xl mx-auto px-6 md:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 items-start">
          <div>
            <p className="font-body text-xs tracking-widest uppercase text-mist mb-3">The problem</p>
            <h2 className="font-sans text-2xl md:text-3xl text-forest mb-4">A gap that costs artists their income</h2>
            <p className="font-body text-sm text-moss leading-relaxed mb-4">
              Across Africa, and particularly in Rwanda, art is often perceived as a hobby rather than a sustainable source of income. Despite the presence of highly skilled local artists, many struggle to earn a living due to limited visibility, lack of trusted digital marketplaces, and gaps in pricing and marketing knowledge.
            </p>
            <p className="font-body text-sm text-moss leading-relaxed">
              At the same time, buyers — both local and international — find it difficult to identify authentic African artworks, verify quality, and trust online sources that represent real cultural value.
            </p>
          </div>
          <div>
            <p className="font-body text-xs tracking-widest uppercase text-mist mb-3">The solution</p>
            <h2 className="font-sans text-2xl md:text-3xl text-forest mb-4">A marketplace built on trust and story</h2>
            <p className="font-body text-sm text-moss leading-relaxed mb-4">
              GURArt is a curated, story-driven art marketplace that goes beyond simple selling. We offer artists a professional space to showcase their work, guided pricing and monetization support, and tools that build trust with buyers.
            </p>
            <p className="font-body text-sm text-moss leading-relaxed">
              The name GURArt combines "Gura" — which means "to buy" in Kinyarwanda — with "Art", reflecting the platform's mission to connect buyers with authentic African art.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-forest text-cream py-12 md:py-16 px-6 md:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <p className="font-body text-xs tracking-widest uppercase text-sage mb-5 md:mb-6">Our mission</p>
          <p className="font-sans text-xl md:text-3xl text-cream leading-relaxed">
            "To empower local artists  by transforming African art from a passion into a sustainable source of income through innovation, storytelling, and guided digital commerce."
          </p>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-6 md:px-8 py-12 md:py-16">
        <p className="font-body text-xs tracking-widest uppercase text-mist mb-2">What we stand for</p>
        <h2 className="font-sans text-2xl md:text-3xl text-forest mb-8 md:mb-10">Our values</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          {[
            { num: '01', title: 'Authenticity', desc: 'Every artist is verified by our team. Every artwork carries a cultural story.' },
            { num: '02', title: 'Empowerment', desc: 'We actively support artists in learning how to price, present, and grow their work.' },
            { num: '03', title: 'Trust', desc: 'Buyers deserve confidence. Artists deserve fair value. Every feature strengthens that.' },
            { num: '04', title: 'Culture first', desc: 'African art carries centuries of meaning. We ensure that meaning is preserved.' },
            { num: '05', title: 'Women-centred', desc: 'We specifically prioritise the visibility and economic independence of women artists.' },
            { num: '06', title: 'Long-term impact', desc: 'We measure success in livelihoods changed, culture preserved, and communities strengthened.' },
          ].map(v => (
            <div key={v.num} className="border border-moss/20 p-5 md:p-6">
              <div className="font-sans text-3xl text-sage/40 mb-3">{v.num}</div>
              <h3 className="font-sans text-lg text-forest mb-2">{v.title}</h3>
              <p className="font-body text-sm text-moss leading-relaxed">{v.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-bark py-10 md:py-12 px-6 md:px-8">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 text-center">
          {[
            { num: '240+', label: 'Verified artists' },
            { num: '1,800+', label: 'Artworks listed' },
            { num: '12', label: 'Countries reached' },
            { num: 'RWF 18M+', label: 'Paid to artists' },
          ].map(stat => (
            <div key={stat.label}>
              <div className="font-sans text-2xl md:text-3xl text-sage mb-1">{stat.num}</div>
              <div className="font-body text-xs text-mist tracking-widest uppercase">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-3xl mx-auto px-6 md:px-8 py-12 md:py-16">
        <p className="font-body text-xs tracking-widest uppercase text-mist mb-2">Behind GURArt</p>
        <h2 className="font-sans text-2xl md:text-3xl text-forest mb-6 md:mb-8">Built in Kigali, for Africa</h2>
        <div className="bg-white border border-moss/20 p-6 md:p-8">
          <div className="flex items-start gap-4 md:gap-6">
            <div className="w-14 h-14 md:w-16 md:h-16 bg-bark/10 border border-moss/20 flex items-center justify-center flex-shrink-0">
              <span className="font-sans text-xl md:text-2xl text-mist">E</span>
            </div>
            <div>
              <h3 className="font-sans text-lg md:text-xl text-forest mb-1">Emmanuella Ikirezi</h3>
              <p className="font-body text-xs text-mist tracking-widest uppercase mb-3">Founder · </p>
              <p className="font-body text-sm text-moss leading-relaxed">
                GURArt was founded with the belief that African creativity deserves a global stage — and that technology can be the bridge. Built at African Leadership University, Kigali, this platform is as much about economic justice as it is about beautiful art.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-sage py-12 md:py-16 px-6 md:px-8 text-center">
        <h2 className="font-sans text-3xl md:text-4xl text-forest mb-3">Join the movement</h2>
        <p className="font-body text-sm text-forest/70 mb-6 md:mb-8">Whether you create or collect — there's a place for you on GURArt</p>
        <div className="flex flex-col md:flex-row gap-3 justify-center">
          <Link href="/auth/register" className="btn-primary text-center">Apply as an artist</Link>
          <Link href="/browse" className="btn-outline border-forest text-forest text-center">Browse artworks</Link>
        </div>
      </section>

      <footer className="bg-forest py-6 md:py-8 px-6 md:px-8 flex flex-col md:flex-row gap-3 md:gap-0 justify-between items-center">
        <div className="font-sans text-xl text-cream tracking-widest">GUR<span className="text-sage">Art</span></div>
        <p className="font-body text-xs text-mist">© 2026 GURArt · Kigali, Rwanda</p>
      </footer>
    </div>
  )
}
