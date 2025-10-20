// src/contents/intercept.ts
import type { PlasmoCSConfig } from "plasmo"

import type { SearchResultsResponse } from "~types/SearchResultsResponse"
import { postWindowMessage } from "~utils/windowMessage"

export const config: PlasmoCSConfig = {
  matches: ["https://prd-xereg.temple.edu/StudentRegistrationSsb/ssb/*"],
  world: "MAIN"
}

console.log("Intercept script loaded in MAIN world")

$.ajaxPrefilter((options) => {
  // Safer match (covers forward/back variants too)
  if (!options.url.includes("/searchResults/searchResults")) return

  // 1) Rewrite the RAW response before jQuery parses it
  const prevFilter = options.dataFilter
  options.dataFilter = function (raw: string, type: string) {
    try {
      if (String(type).toLowerCase() === "json") {
        const j = JSON.parse(raw) as SearchResultsResponse

        // Start modifying json response
        const inst = j.searchResultsConfigs.find(
          (c) => c.config === "instructor"
        )
        if (inst) inst.width = "20%"

        j.ztcEncodedImage = ""

        // const PICKS = ["courseTitle", "meetingTime", "status", "instructor"]
        // const byKey = new Map(
        //   j.searchResultsConfigs.map((c: any) => [c.config, { ...c }])
        // )
        // j.searchResultsConfigs = PICKS.map((k) => byKey.get(k)).filter(Boolean)

        // End modifying json response
        const out = JSON.stringify(j)
        return prevFilter ? prevFilter.call(this, out, type) : out
      }
    } catch {
      // fall through to previous filter/raw
    }
    return prevFilter ? prevFilter.call(this, raw, type) : raw
  }

  // 2) Share the modified data to background
  const origSuccess = options.success
  options.success = function (
    response: SearchResultsResponse,
    textStatus: string,
    xhr: any
  ) {
    if (typeof origSuccess === "function") {
      origSuccess.call(this, response, textStatus, xhr)
    } else if (Array.isArray(origSuccess)) {
      origSuccess.forEach((fn) => fn.call(this, response, textStatus, xhr))
    }

    postWindowMessage("FETCH_PROFESSOR_DETAILS", response)
  }
})
