import type { PlasmoCSConfig } from "plasmo"

import { sendToBackground } from "@plasmohq/messaging"

import { getWindowMessageData } from "~utils/windowMessage"

export const config: PlasmoCSConfig = {
  matches: ["https://prd-xereg.temple.edu/StudentRegistrationSsb/ssb/*"]
}

console.log("UI script loaded in ISOLATED world")

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

window.addEventListener("message", async (event) => {
  const data = getWindowMessageData(event, "FETCH_PROFESSOR_DETAILS")
  console.log("Received professor details:", data)

  const response = await sendToBackground({
    name: "fetch-professor-details",
    body: data
  })

  // Select all instructor links in the table
  const instructorLinks = document.querySelectorAll(
    '#table1 td[data-property="instructor"] a'
  )

  console.log("Received professor details:", data, instructorLinks)

  // Iterate and prepend rating information for each professor
  instructorLinks.forEach((linkElement) => {
    if (!isValidName(linkElement.textContent)) return
    const { url, rating } = response[norm(linkElement.textContent)]
    const text = rating == -1 ? "Check Rating" : `Rating: ${rating}`
    linkElement.insertAdjacentHTML(
      "beforebegin",
      `<a href="${url}" target="_blank"><b>[${text}] </b></a>`
    )
  })
})
