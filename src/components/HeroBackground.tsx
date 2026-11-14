// The surface behind a dark hero: one flat colour from the dark ramp. It used
// to carry a mouse-following glow and film grain; both are gone. The component
// stays so the home hero, PageHero and the 404 page keep a single place to
// change the colour.

export default function HeroBackground() {
  return <div aria-hidden className="pointer-events-none absolute inset-0 z-0 bg-d-page" />
}
