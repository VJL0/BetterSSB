// content.tsx
import cssText from "data-text:~output.css"
import type { PlasmoCSConfig } from "plasmo"
import { useReducer } from "react"

export const config: PlasmoCSConfig = {
  matches: ["<all_urls>"]
}
export const getStyle = () => {
  const style = document.createElement("style")
  style.textContent = cssText
  return style
}
console.log("idfnksdjisdnfs conent")
const PlasmoOverlay = () => {
  const [count, inc] = useReducer((c) => c + 1, 0)
  return <div className="bg-red-500 flex w-full text-center">hello</div>
}

export default PlasmoOverlay
