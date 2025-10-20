export function postWindowMessage(type: string, payload: any) {
  window.postMessage(
    {
      source: "betterssb",
      type,
      payload
    },
    "*"
  )
}
export function getWindowMessageData(event: MessageEvent<any>, type: string) {
  return event.source === window &&
    event.data.source === "betterssb" &&
    event.data.type === type
    ? event.data.payload
    : null
}
