document.addEventListener("DOMContentLoaded", () => {
  const year = document.querySelector(".year");
  if (year) year.textContent = new Date().getFullYear();

  const menuButton = document.querySelector(".menu-button");
  const nav = document.querySelector(".site-nav");
  if (menuButton && nav) menuButton.addEventListener("click", () => nav.classList.toggle("open"));

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