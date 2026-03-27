import Link from 'next/link'
import { getAllProjects } from '@/lib/projects'
import HeroBackground from '@/components/HeroBackground'
import BrowserWindow from '@/components/BrowserWindow'

export default function Home() {
  const featured = getAllProjects().filter(p => p.featured).slice(0, 4)

  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section className="sticky top-0 z-0 h-screen w-full overflow-hidden bg-[#100408]">

        <HeroBackground />

        {/* Photo + bottom fade — treated as one unit */}
        <div className="absolute bottom-0 right-0 h-[92%] w-screen z-[10] select-none pointer-events-none flex justify-end">
          <img
            src="/images/hero.png"
            alt="Mitchell Anderson"
            className="h-full w-auto object-cover object-top"
            draggable={false}
          />
          {/* Gradient lives inside so it always travels with the image */}
          <div className="absolute bottom-0 inset-x-0 h-64 bg-gradient-to-t from-[#100408]/90 to-transparent pointer-events-none" />
        </div>

        {/* Mobile-only overlay: subtle dark wash so text stays legible over the photo */}
        <div
          className="md:hidden absolute inset-0 z-20 pointer-events-none"
          style={{ background: 'linear-gradient(160deg, rgba(16,4,8,0.72) 45%, rgba(16,4,8,0.25) 80%, transparent 100%)' }}
        />

        {/* Text — vertically centred, left column */}
        <div className="relative z-30 h-full flex flex-col justify-center px-10 md:px-16 lg:px-24">
          <div className="max-w-lg">
            <p className="font-sans font-semibold text-sm tracking-widest uppercase text-maroon-200 mb-5">
              Web Developer — Brisbane, QLD
            </p>
            <h1 className="font-heading font-bold text-6xl md:text-7xl xl:text-8xl text-white leading-[0.95] tracking-tight mb-6">
              Mitchell<br />Anderson.
            </h1>
            <p className="font-sans text-lg text-white/60 leading-relaxed mb-10 max-w-md">
              I build conversion-focused websites and digital experiences — end-to-end, from UX
              and wireframing through to front-end development and launch.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/work"
                className="inline-flex items-center gap-2 bg-primary hover:bg-maroon-700 text-white font-sans font-semibold px-7 py-3.5 rounded-xl transition-colors duration-200 shadow-sm"
              >
                View Work
                <span aria-hidden className="text-white/80">→</span>
              </Link>
              <Link
                href="/about"
                className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/15 border border-white/20 text-white font-sans font-semibold px-7 py-3.5 rounded-xl transition-all duration-200"
              >
                About Me
              </Link>
            </div>
          </div>
        </div>

        {/* Scroll nudge */}
        <div className="absolute bottom-8 left-6 lg:left-10 z-30 flex items-center gap-3 opacity-40">
          <div className="w-8 h-px bg-white" />
          <span className="font-sans text-xs text-white tracking-widest uppercase">Scroll</span>
        </div>

      </section>

      {/* ── Featured Work ─────────────────────────────────────────── */}
      {featured.length > 0 && (
        <section className="relative z-10 py-24 bg-card border-t border-maroon-100">
          <div className="max-w-6xl mx-auto px-6">
            <div className="flex items-end justify-between mb-10">
              <div>
                <p className="font-sans font-semibold text-sm tracking-widest uppercase text-primary mb-2">
                  Selected Work
                </p>
                <h2 className="font-heading font-bold text-4xl md:text-5xl text-foreground">
                  Featured Projects
                </h2>
              </div>
              <Link
                href="/work"
                className="font-sans font-medium text-accent hover:opacity-70 transition-opacity duration-200 hidden sm:block text-sm"
              >
                View all →
              </Link>
            </div>

            <BrowserWindow projects={featured} />

            <div className="mt-8 sm:hidden">
              <Link
                href="/work"
                className="font-sans font-medium text-accent hover:opacity-70 transition-opacity duration-200 text-sm"
              >
                View all work →
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ── Expertise ─────────────────────────────────────────────── */}
      <section className="relative z-10 py-24 bg-[#100408]">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.8fr] gap-16 items-start">

            {/* Left — heading block */}
            <div className="lg:sticky lg:top-32">
              <p className="font-sans font-semibold text-xs tracking-widest uppercase text-maroon-200 mb-4">
                Expertise
              </p>
              <h2 className="font-heading font-bold text-4xl md:text-5xl text-white leading-tight tracking-tight mb-5">
                Building digital<br />experiences.
              </h2>
              <p className="font-sans text-base text-white/50 leading-relaxed max-w-xs">
                End-to-end across design, development and strategy — from the first wireframe through to launch.
              </p>
            </div>

            {/* Right — 2×2 service grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-white/[0.06] rounded-2xl overflow-hidden">

              {/* Webflow */}
              <div className="bg-[#100408] p-8 hover:bg-white/[0.04] transition-colors duration-200">
                <svg className="w-6 h-6 text-maroon-200 mb-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 0 1-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0 1 15 18.257V17.25m6-12V15a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 15V5.25m18 0A2.25 2.25 0 0 0 18.75 3H5.25A2.25 2.25 0 0 0 3 5.25m18 0H3" />
                </svg>
                <h3 className="font-heading font-bold text-lg text-white mb-2">Webflow Development</h3>
                <p className="font-sans text-sm text-white/50 leading-relaxed">
                  End-to-end Webflow builds optimised for CMS flexibility, editor experience and client handoff.
                </p>
              </div>

              {/* Shopify */}
              <div className="bg-[#100408] p-8 hover:bg-white/[0.04] transition-colors duration-200">
                <svg className="w-6 h-6 text-maroon-200 mb-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
                </svg>
                <h3 className="font-heading font-bold text-lg text-white mb-2">Shopify &amp; E-commerce</h3>
                <p className="font-sans text-sm text-white/50 leading-relaxed">
                  Custom Shopify themes and e-commerce experiences designed to convert and built to scale.
                </p>
              </div>

              {/* Front-End */}
              <div className="bg-[#100408] p-8 hover:bg-white/[0.04] transition-colors duration-200">
                <svg className="w-6 h-6 text-maroon-200 mb-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75 22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3-4.5 16.5" />
                </svg>
                <h3 className="font-heading font-bold text-lg text-white mb-2">Front-End Engineering</h3>
                <p className="font-sans text-sm text-white/50 leading-relaxed">
                  Bridging creative vision and performant code with Next.js — accessible, fast and built to last.
                </p>
              </div>

              {/* UX */}
              <div className="bg-[#100408] p-8 hover:bg-white/[0.04] transition-colors duration-200">
                <svg className="w-6 h-6 text-maroon-200 mb-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 0 0-5.78 1.128 2.25 2.25 0 0 1-2.4 2.245 4.5 4.5 0 0 0 8.4-2.245c0-.399-.078-.78-.22-1.128Zm0 0a15.998 15.998 0 0 0 3.388-1.62m-5.043-.025a15.994 15.994 0 0 1 1.622-3.395m3.42 3.42a15.995 15.995 0 0 0 4.764-4.648l3.876-5.814a1.151 1.151 0 0 0-1.597-1.597L14.146 6.32a15.996 15.996 0 0 0-4.649 4.763m3.42 3.42a6.776 6.776 0 0 0-3.42-3.42" />
                </svg>
                <h3 className="font-heading font-bold text-lg text-white mb-2">UX &amp; Strategy</h3>
                <p className="font-sans text-sm text-white/50 leading-relaxed">
                  Discovery, wireframing and information architecture that turns business goals into intuitive interfaces.
                </p>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* ── CTA strip ─────────────────────────────────────────────── */}
      <section className="relative z-10 py-20 bg-background border-t border-maroon-100">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <h2 className="font-heading font-bold text-3xl text-foreground mb-1">
              Let&rsquo;s talk.
            </h2>
            <p className="font-sans text-muted-foreground">
              I&rsquo;m available for freelance work and collaborations.
            </p>
          </div>
          <a
            href="https://www.linkedin.com/in/mitchellanderson"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-accent hover:bg-blue-700 text-white font-sans font-semibold px-7 py-3.5 rounded-xl transition-colors duration-200 shadow-sm whitespace-nowrap"
          >
            Reach out on LinkedIn →
          </a>
        </div>
      </section>
    </>
  )
}
