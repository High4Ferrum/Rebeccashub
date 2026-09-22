(() => {
  "use strict";
  const input = document.getElementById("site-search-input");
  const results = document.getElementById("search-results");
  if (!input || !results) return;

  const status = document.getElementById("search-status");
  const empty = document.getElementById("search-empty");
  const normalize = (value) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  const entries = Array.from(results.children).map((element, order) => ({
    element,
    order,
    title: normalize(element.dataset.searchTitle || ""),
    text: normalize(element.dataset.searchText || ""),
    tags: normalize(element.dataset.searchTags || "")
  }));

  function search() {
    const query = input.value.trim();
    const terms = normalize(query).split(/\s+/).filter(Boolean);
    let count = 0;
    const ranked = entries.map((entry) => {
      const searchable = entry.title + " " + entry.tags + " " + entry.text;
      const matches = terms.every((term) => searchable.includes(term));
      entry.element.hidden = !matches;
      if (matches) count++;
      const score = terms.reduce((total, term) => total +
        (entry.title.includes(term) ? 10 : 0) +
        (entry.tags.includes(term) ? 4 : 0), 0);
      return { ...entry, score };
    });
    ranked.sort((a, b) => b.score - a.score || a.order - b.order);
    ranked.forEach((entry) => results.appendChild(entry.element));
    status.textContent = query
      ? count + (count === 1 ? " result" : " results") + " for “" + query + "”"
      : "Browse all " + count + " posts and pages, or enter a search above.";
    empty.hidden = count !== 0;
  }

  function restoreQuery() {
    input.value = (new URLSearchParams(window.location.search).get("q") || "").slice(0, 200);
    search();
  }

  input.form.addEventListener("submit", (event) => {
    event.preventDefault();
    const url = new URL(window.location.href);
    if (input.value.trim()) url.searchParams.set("q", input.value.trim());
    else url.searchParams.delete("q");
    window.history.pushState({}, "", url);
    search();
  });
  input.addEventListener("input", search);
  window.addEventListener("popstate", restoreQuery);
  restoreQuery();
})();
