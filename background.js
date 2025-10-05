// background.js

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "FETCH_ALL_DETAILS") {
    const { professorNames } = message.payload;

    const professorDetailPromises = professorNames.map((name) =>
      fetchDetails(name)
    );

    Promise.all(professorDetailPromises).then((professorDetailsList) =>
      sendResponse(professorDetailsList)
    );

    return true; // Keep the message channel open for sendResponse
  }
});

function fetchDetails(professorName) {
  const endpoint = "https://www.ratemyprofessors.com/graphql";
  const schoolId = "U2Nob29sLTk5OQ==";
  const query = `
    query TeacherSearchResultsPageQuery($query: TeacherSearchQuery!) {
      search: newSearch {
        teachers(query: $query, first: 1, after: "") {
          didFallback
          edges {
            node {
              id
              legacyId
              firstName
              lastName
              avgRating
            }
          }
        }
      }
    }
  `;
  const variables = {
    query: {
      text: professorName,
      schoolID: schoolId,
      fallback: false,
    },
  };

  return fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query,
      variables,
    }),
  })
    .then((response) => response.json())
    .then((data) => {
      const details = data.data.search.teachers.edges[0].node;
      const rating = details.avgRating;
      const url = `https://www.ratemyprofessors.com/professor/${details.legacyId}`;
      return { rating, url };
    })
    .catch((error) => {
      console.error("GraphQL Error:", error);
      const rating = "-1";
      const url = `https://www.ratemyprofessors.com/search/professors/${schoolId}?q=${encodeURIComponent(
        professorName
      )}`;
      return { rating, url };
    });
}
