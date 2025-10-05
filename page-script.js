// page-script.js
console.log("page-script.js loaded");

$.ajaxPrefilter((options, _, jqXHR) => {
  if (!options.url.includes("/searchResults/searchResults")) return;

  const originalSuccess = options.success;

  // Override the success handler
  options.success = (response, textStatus, xhr) => {
    if (!response.data) return;
    if (response.searchResultsConfigs) {
      const instructorConfig = response.searchResultsConfigs.find(
        (c) => c.config === "instructor"
      );
      instructorConfig.width = "15%";
    }

    originalSuccess.call(this, response, textStatus, xhr);

    const professorNames = response.data.flatMap((row) =>
      row.faculty.map((faculty) => faculty.displayName)
    );

    window.postMessage(
      {
        type: "UPDATE_TABLE",
        payload: { professorNames },
      },
      "*"
    );
  };
});
