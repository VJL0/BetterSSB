// This script has access to both the page and extension context
window.addEventListener("message", (event) => {
  // Security check (optional): Only accept from the same origin or known pages
  if (event.source !== window) return;
  if (event.data?.type !== "UPDATE_TABLE") return;

  // Forward to background
  chrome.runtime.sendMessage(
    {
      type: "FETCH_ALL_DETAILS",
      payload: event.data.payload,
    },
    (response) => {
      // Select all instructor links in the table
      const instructorLinks = document.querySelectorAll(
        '#table1 td[data-property="instructor"] a'
      );

      // Iterate and prepend rating information for each professor
      instructorLinks.forEach((linkElement, index) => {
        const details = response[index];
        linkElement.insertAdjacentHTML(
          "beforebegin",
          `<a href="${details.url}" target="_blank"><b>[Rating: ${details.rating}] </b></a>`
        );
      });
    }
  );
});
