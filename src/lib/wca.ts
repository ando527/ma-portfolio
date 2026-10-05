// Shared by the About page (server), CubingSection (browser) and
// scripts/update-wca-cache.mjs (build). Keep BASE and WCA_ID in sync with it.

export const WCA_BASE = 'https://raw.githubusercontent.com/robiningelbrecht/wca-rest-api/refs/heads/v1'
export const WCA_ID = '2022ANDE01'
export const WCA_PROFILE = `https://www.worldcubeassociation.org/persons/${WCA_ID}`

export interface RankEntry {
  eventId: string
  best: number
  rank: { world: number; continent: number; country: number }
}

/** What the page needs from a WCA profile. */
export interface CubingStats {
  numberOfCompetitions: number
  competitionIds: string[]
  single333?: RankEntry
  average333?: RankEntry
  medals: { gold: number; silver: number; bronze: number }
}

export interface Competition {
  id: string
  name: string
  city: string
  country: string
  coordinates: { latitude: number; longitude: number } | null
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function toStats(person: any): CubingStats {
  return {
    numberOfCompetitions: person.numberOfCompetitions ?? 0,
    competitionIds: person.competitionIds ?? [],
    single333: person.rank?.singles?.find((r: RankEntry) => r.eventId === '333'),
    average333: person.rank?.averages?.find((r: RankEntry) => r.eventId === '333'),
    medals: person.medals ?? { gold: 0, silver: 0, bronze: 0 },
  }
}
