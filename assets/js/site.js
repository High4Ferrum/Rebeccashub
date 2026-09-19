document.addEventListener("DOMContentLoaded", () => {
  const year = document.querySelector(".year");
  if (year) year.textContent = new Date().getFullYear();

  const menuButton = document.querySelector(".menu-button");
  const nav = document.querySelector(".site-nav");
  if (menuButton && nav) {
    const setMenuOpen = open => {
      nav.classList.toggle("open", open);
      menuButton.setAttribute("aria-expanded", String(open));
      menuButton.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    };
    menuButton.addEventListener("click", () => setMenuOpen(!nav.classList.contains("open")));
    nav.addEventListener("click", event => {
      if (event.target.closest("a")) setMenuOpen(false);
    });
    document.addEventListener("keydown", event => {
      if (event.key === "Escape" && nav.classList.contains("open")) {
        setMenuOpen(false);
        menuButton.focus();
      }
    });
    window.matchMedia("(max-width: 620px)").addEventListener("change", () => setMenuOpen(false));
  }

  const filters = document.querySelectorAll(".filter");
  const cards = document.querySelectorAll(".blog-card");
  filters.forEach(filter => filter.addEventListener("click", () => {
    filters.forEach(f => f.classList.remove("active"));
    filter.classList.add("active");
    const category = filter.dataset.filter;
    cards.forEach(card => card.classList.toggle("hidden", category !== "all" && card.dataset.category !== category));
  }));

  const search = document.querySelector(".search-box input");
  if (search) search.addEventListener("input", () => {
    const term = search.value.toLowerCase().trim();
    cards.forEach(card => card.classList.toggle("hidden", term && !card.textContent.toLowerCase().includes(term)));
  });
});