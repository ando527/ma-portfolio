// Refreshes the speedcubing data the About page starts from.
//
// Runs before every build (npm "prebuild"). It fetches the WCA profile and any
// competitions not already cached, from the same GitHub mirror of the WCA
// data the page uses in the browser, and writes:
//   src/data/wca/person.json        profile stats, as of the build
//   src/data/wca/competitions.json  every competition attended, with location
// The page renders straight from these files, then checks the live profile
// and fetches only competitions newer than the cache.
//
// If GitHub can't be reached the existing files are kept and the build goes
// on: the page just starts from slightly older numbers.

import { readFile, writeFile, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import { join } from 'path'
import { fileURLToPath } from 'url'

const ROOT = fileURLToPath(new URL('..', import.meta.url))
const DIR = join(ROOT, 'src', 'data', 'wca')
const PERSON_FILE = join(DIR, 'person.json')
const COMPS_FILE = join(DIR, 'competitions.json')

// Keep in sync with src/lib/wca.ts
const BASE = 'https://raw.githubusercontent.com/robiningelbrecht/wca-rest-api/refs/heads/v1'
const WCA_ID = '2022ANDE01'
const BATCH = 8
const TIMEOUT_MS = 10_000

async function getJson(url) {
  const res = await fetch(url, { signal: AbortSignal.timeout(TIMEOUT_MS) })
  if (!res.ok) throw new Error(`${res.status} ${res.statusText} for ${url}`)
  return res.json()
}

const readJson = async (file, fallback) =>
  existsSync(file) ? JSON.parse(await readFile(file, 'utf8')) : fallback

/** Only the fields the page uses. */
function slimPerson(p) {
  const pick = list => (list || []).map(r => ({ eventId: r.eventId, best: r.best, rank: r.rank }))
  return {
    numberOfCompetitions: p.numberOfCompetitions,
    competitionIds: p.competitionIds,
    rank: { singles: pick(p.rank?.singles), averages: pick(p.rank?.averages) },
    medals: p.medals,
  }
}

// Competitions without a venue location (e.g. online events) are cached with
// coordinates: null so they aren't fetched again; the map skips them.
function slimCompetition(id, d) {
  const c = d.venue?.coordinates
  const located = Boolean(c?.latitude && c?.longitude)
  return {
    id: d.id ?? id,
    name: d.name ?? id,
    city: d.city ?? '',
    country: d.country ?? '',
    coordinates: located ? { latitude: c.latitude, longitude: c.longitude } : null,
  }
}

async function main() {
  await mkdir(DIR, { recursive: true })

  let person
  try {
    person = slimPerson(await getJson(`${BASE}/persons/${WCA_ID}.json`))
    await writeFile(PERSON_FILE, JSON.stringify(person, null, 2) + '\n')
  } catch (err) {
    console.warn(`[wca] Couldn't fetch the profile (${err.message}). Keeping the cached data.`)
    return
  }

  const cached = await readJson(COMPS_FILE, [])
  const have = new Set(cached.map(c => c.id))
  const missing = person.competitionIds.filter(id => !have.has(id))

  const added = []
  for (let i = 0; i < missing.length; i += BATCH) {
    const results = await Promise.allSettled(
      missing.slice(i, i + BATCH).map(async id => slimCompetition(id, await getJson(`${BASE}/competitions/${id}.json`))),
    )
    results.forEach((r, j) => {
      if (r.status === 'fulfilled' && r.value) added.push(r.value)
      else if (r.status === 'rejected') console.warn(`[wca] Skipped ${missing[i + j]}: ${r.reason.message}`)
    })
  }

  // Keep the profile's order so the file's diffs stay small.
  const all = new Map([...cached, ...added].map(c => [c.id, c]))
  const ordered = person.competitionIds.filter(id => all.has(id)).map(id => all.get(id))
  await writeFile(COMPS_FILE, JSON.stringify(ordered, null, 2) + '\n')
  console.log(`[wca] ${person.numberOfCompetitions} competitions; ${added.length} newly cached, ${ordered.filter(c => c.coordinates).length} with locations.`)
}

main().catch(err => {
  console.warn(`[wca] ${err.message}. Keeping the cached data.`)
})
