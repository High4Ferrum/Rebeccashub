const menuButton = document.querySelector(".menu-button");
const menu = document.querySelector(".site-nav");

if (menuButton) {
  menuButton.addEventListener("click", () => {
    menu.classList.toggle("open");
    menuButton.textContent = menu.classList.contains("open") ? "Close" : "Menu";
  });
}

document.querySelectorAll(".year").forEach((year) => {
  year.textContent = new Date().getFullYear();
});

document.querySelectorAll(".filter").forEach((filter) => {
  filter.addEventListener("click", () => {
    const selectedTag = filter.dataset.tag;

    document.querySelectorAll(".filter").forEach((item) => {
      item.classList.remove("active");
    });

    filter.classList.add("active");

    document.querySelectorAll(".blog-card").forEach((post) => {
      const tags = post.dataset.tags.toLowerCase().split("|");
      const shouldShow = selectedTag === "all" || tags.includes(selectedTag.toLowerCase());
      post.classList.toggle("hidden", !shouldShow);
    });
  });
});

const form = document.querySelector(".contact-form");
if (form) {
  form.addEventListener("submit", (event) => {
    if (form.action.includes("YOUR_FORMSPREE_ID")) {
      event.preventDefault();
      alert("Before this form can send messages, add your Formspree form ID in contact.md.");
    }
  });
}
