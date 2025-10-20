import type { PlasmoMessaging } from "@plasmohq/messaging"
import { Storage } from "@plasmohq/storage"

import type { Section } from "~types/SearchResultsResponse"

type ProfessorInfo = { rating: number; url: string }
type NameToDetails = Record<string, ProfessorInfo>

type NodeDetails = {
  avgRating: number
  firstName: string
  id: string
  lastName: string
  legacyId: number
}

const storage = new Storage()

// ---------- helpers ----------
const norm = (s: string) => s.toLowerCase().trim()

// filter obvious non-names you’ll see in schedules
const isValidName = (n: string) => {
  if (!n) return false
  const s = norm(n)
  if (s.length < 3) return false // e.g., "A"
  if (s === "tba" || s === "staff" || s === "arranged") return false
  if (/^\W+$/.test(s)) return false // punctuation only
  return true
}

// tiny concurrency limiter (no deps)
async function mapLimit<T, R>(
  items: T[],
  limit: number,
  fn: (x: T) => Promise<R>
): Promise<R[]> {
  const out: R[] = []
  let idx = 0
  const workers = new Array(Math.min(limit, items.length))
    .fill(0)
    .map(async () => {
      while (idx < items.length) {
        const i = idx++
        out[i] = await fn(items[i])
      }
    })
  await Promise.all(workers)
  return out
}

// ---------- RMP fetcher (kept minimal & robust) ----------
const RMP_ENDPOINT = "https://www.ratemyprofessors.com/graphql"
const RMP_SCHOOL_ID = "U2Nob29sLTk5OQ==" // Temple
const RMP_QUERY = `
  query TeacherSearchResultsPageQuery($query: TeacherSearchQuery!) {
    search: newSearch {
      teachers(query: $query, first: 1, after: "") {
        edges {
          node { id legacyId firstName lastName avgRating }
        }
      }
    }
  }
`

async function fetchDetails(lcProfessorName: string): Promise<ProfessorInfo> {
  const variables = {
    query: { text: lcProfessorName, schoolID: RMP_SCHOOL_ID, fallback: false }
  }

  try {
    const r = await fetch(RMP_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: RMP_QUERY, variables })
    })
    const json = await r.json()
    const node = json?.data?.search?.teachers?.edges?.[0]?.node as
      | NodeDetails
      | undefined

    if (!node) {
      // graceful no-match fallback: search page
      return {
        rating: -1,
        url:
          `https://www.ratemyprofessors.com/search/professors/999?q=` +
          encodeURIComponent(lcProfessorName)
      }
    }

    return {
      rating: Number(node.avgRating ?? -1),
      url: `https://www.ratemyprofessors.com/professor/${node.legacyId}`
    }
  } catch {
    return {
      rating: -1,
      url:
        `https://www.ratemyprofessors.com/search/professors/999?q=` +
        encodeURIComponent(lcProfessorName)
    }
  }
}

// ---------- handler ----------
const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
  try {
    const sections = req.body.data as Section[]

    // 1) Build a deduped set of normalized, valid names (no intermediate arrays)
    const unique = new Set<string>()
    for (const s of sections) {
      for (const f of s.faculty) {
        const n = f.displayName
        if (isValidName(n)) unique.add(norm(n))
      }
    }

    // 2) Load cache
    const prev = (await storage.get<NameToDetails>("nameToDetails")) ?? {}

    // 3) Decide what needs fetching
    const toFetch: string[] = []
    for (const name of unique) {
      if (!(name in prev)) toFetch.push(name)
    }

    // 4) Fast path: nothing new
    if (toFetch.length === 0) {
      res.send(prev)
      return
    }

    // 5) Fetch with concurrency cap (e.g., 5 at a time), and never fail the batch
    const settled = await mapLimit(toFetch, 5, async (lc) => {
      try {
        console.log("Fetching RMP details for", lc)
        const d = await fetchDetails(lc)
        return [lc, d] as const
      } catch {
        // fallback per-name on unexpected error
        return [
          lc,
          {
            rating: -1,
            url: `https://www.ratemyprofessors.com/search/professors/999?q=${encodeURIComponent(lc)}`
          }
        ] as const
      }
    })

    // 6) Merge without extra conversions
    const merged: NameToDetails = { ...prev }
    for (const [k, v] of settled) merged[k] = v

    // 7) Only write if changed
    // (cheap check: size increased or any newly added key differs)
    const changed =
      Object.keys(merged).length !== Object.keys(prev).length ||
      toFetch.some((k) => merged[k] !== prev[k])

    if (changed) {
      await storage.set("nameToDetails", merged)
    }

    res.send(merged)
  } catch (e) {
    console.error("[fetch-professor-details] error:", e)
    const prev = (await storage.get<NameToDetails>("nameToDetails")) ?? {}
    res.send(prev) // degrade to cache
  }
}

export default handler
