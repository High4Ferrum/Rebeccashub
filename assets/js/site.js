@import url("https://fonts.googleapis.com/css2?family=DM+Mono&family=DM+Sans:wght@400;500;600;700&display=swap");

:root {
  --ink: #17211d;
  --paper: #f7f4ed;
  --lime: #c9f55c;
  --coral: #fa7047;
  --blue: #b8dad7;
  --sand: #e8dfcf;
  --muted: #66706a;
  --line: #d8d3c8;
}

* { box-sizing: border-box; }

html { scroll-behavior: smooth; }

body {
  margin: 0;
  background: var(--paper);
  color: var(--ink);
  font: 16px/1.55 "DM Sans", Arial, sans-serif;
}

a { color: inherit; text-decoration: none; }

.site-header,
.site-footer {
  max-width: 1300px;
  margin: auto;
  padding: 24px 32px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.site-header { border-bottom: 1px solid var(--line); }

.logo {
  font: 700 24px/1 "DM Mono", monospace;
  letter-spacing: -2px;
}

.logo span { color: var(--coral); }

.site-nav {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 10px 18px;
  font-size: 14px;
}

.site-nav a:hover,
.site-nav .active { color: var(--coral); }

.menu-button {
  display: none;
  border: 0;
  background: none;
  color: var(--ink);
  font: inherit;
  cursor: pointer;
}

.wrap,
.hero,
.post-page {
  max-width: 1240px;
  margin: auto;
  padding-left: 32px;
  padding-right: 32px;
}

.hero {
  min-height: 78vh;
  padding-top: 12vh;
  padding-bottom: 90px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.eyebrow {
  margin: 0;
  color: var(--muted);
  font: 12px "DM Mono", monospace;
  letter-spacing: .06em;
  text-transform: uppercase;
}

h1, h2, h3 {
  letter-spacing: -.055em;
  line-height: .98;
}

h1 {
  max-width: 1060px;
  margin: 25px 0 30px;
  font-size: clamp(54px, 9vw, 128px);
}

h2 {
  margin: 0 0 22px;
  font-size: clamp(38px, 5vw, 68px);
}

h3 { font-size: 25px; }

.intro {
  max-width: 650px;
  color: var(--muted);
  font-size: clamp(19px, 2vw, 24px);
}

.button {
  width: fit-content;
  margin-top: 25px;
  padding: 14px 20px;
  border-radius: 999px;
  background: var(--ink);
  color: white;
  font-weight: 700;
}

.home-grid,
.card-grid,
.gallery-grid,
.listings {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 18px;
}

.home-grid { padding: 20px 0 100px; }

.home-card,
.card,
.listing,
.gallery-placeholder {
  min-height: 245px;
  padding: 25px;
  background: var(--blue);
}

.home-card:nth-child(2n),
.card:nth-child(2n),
.gallery-placeholder:nth-child(2n) {
  background: var(--sand);
}

.home-card:nth-child(3n),
.card:nth-child(3n),
.gallery-placeholder:nth-child(3n) {
  background: var(--lime);
}

.home-card {
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
}

.home-card h3 {
  margin: 13px 0 0;
  font: 38px/1 Georgia, serif;
}

.page-header {
  padding-top: 100px;
  padding-bottom: 64px;
  border-bottom: 1px solid var(--line);
}

.section { padding: 90px 0; }

.two-column {
  display: grid;
  grid-template-columns: 28% 1fr;
  gap: 40px;
}

.large-copy {
  max-width: 720px;
  color: var(--muted);
  font-size: 20px;
}

.experience-list { border-top: 1px solid var(--line); }

.experience {
  display: grid;
  grid-template-columns: 170px 1fr;
  gap: 20px;
  padding: 25px 0;
  border-bottom: 1px solid var(--line);
}

.experience h3 { margin: 0 0 7px; }
.experience p { margin: 0; color: var(--muted); }

.filter-layout {
  display: grid;
  grid-template-columns: 200px 1fr;
  gap: 42px;
}

.filters {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
}

.filter {
  border: 0;
  padding: 7px 0;
  background: transparent;
  color: var(--muted);
  font: 14px "DM Mono", monospace;
  cursor: pointer;
  text-transform: uppercase;
}

.filter.active,
.filter:hover { color: var(--coral); }

.blog-card {
  display: block;
  min-height: 255px;
  padding: 25px;
  background: var(--blue);
  transition: transform .2s ease;
}

.blog-card:hover { transform: translateY(-5px); }

.blog-card.hidden { display: none; }

.blog-card:nth-child(2n) { background: var(--sand); }
.blog-card:nth-child(3n) { background: #ddd0ed; }

.blog-card h3 {
  margin: 30px 0 10px;
  font: 33px/1 Georgia, serif;
}

.blog-card p { color: var(--muted); }

.empty-state {
  grid-column: 1 / -1;
  padding: 38px;
  border: 1px dashed var(--line);
  color: var(--muted);
}

.search-box {
  display: flex;
  gap: 10px;
  max-width: 700px;
  margin-top: 30px;
}

.search-box input,
.contact-form input,
.contact-form textarea {
  width: 100%;
  padding: 15px;
  border: 1px solid var(--line);
  border-radius: 0;
  background: white;
  color: var(--ink);
  font: inherit;
}

.search-box button,
.contact-form button {
  border: 0;
  padding: 15px 22px;
  background: var(--ink);
  color: white;
  font: 700 14px "DM Sans", sans-serif;
  cursor: pointer;
}

.agent-callout {
  margin: 55px 0;
  padding: 44px;
  background: var(--lime);
}

.agent-callout h2 { max-width: 750px; }

.listing {
  min-height: 290px;
  background: white;
  border: 1px solid var(--line);
}

.listing-image {
  height: 135px;
  margin: -25px -25px 20px;
  background: var(--blue);
}

.gallery-grid {
  grid-template-columns: repeat(4, 1fr);
}

.gallery-placeholder {
  min-height: 260px;
  display: flex;
  align-items: end;
  color: var(--muted);
  font: 13px "DM Mono", monospace;
}

.favorite-type,
.post-meta {
  color: var(--muted);
  font: 12px "DM Mono", monospace;
  letter-spacing: .04em;
  text-transform: uppercase;
}

.contact-section {
  padding: 100px 0;
  background: var(--lime);
}

.contact-form {
  max-width: 680px;
  display: grid;
  gap: 16px;
}

.contact-form textarea {
  min-height: 160px;
  resize: vertical;
}

.form-note,
.post-content { color: var(--muted); }

.post-page {
  max-width: 900px;
  padding-top: 100px;
  padding-bottom: 100px;
}

.post-page h1 { font-size: clamp(48px, 7vw, 92px); }

.post-hero-image {
  width: 100%;
  max-height: 540px;
  margin: 30px 0;
  object-fit: cover;
}

.post-content {
  max-width: 720px;
  font-size: 19px;
}

.site-footer {
  border-top: 1px solid var(--line);
  color: var(--muted);
  font-size: 14px;
}

@media (max-width: 850px) {
  .site-header, .site-footer, .wrap, .hero, .post-page {
    padding-left: 20px;
    padding-right: 20px;
  }

  .menu-button { display: block; }

  .site-nav {
    display: none;
    position: absolute;
    top: 70px;
    left: 20px;
    right: 20px;
    z-index: 5;
    padding: 20px;
    background: var(--ink);
    color: white;
    flex-direction: column;
    align-items: start;
  }

  .site-nav.open { display: flex; }

  .home-grid,
  .card-grid,
  .gallery-grid,
  .listings { grid-template-columns: 1fr; }

  .two-column,
  .filter-layout { display: block; }

  .two-column > .eyebrow { margin-bottom: 35px; }

  .filters {
    overflow-x: auto;
    margin-bottom: 30px;
    flex-direction: row;
    white-space: nowrap;
  }

  .filter { padding-right: 13px; }

  .experience { grid-template-columns: 1fr; gap: 7px; }

  .search-box { flex-direction: column; }

  .site-footer { display: block; }
}
