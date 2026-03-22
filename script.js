const GRADIENTS = {
  accent: "linear-gradient(135deg, #59c3c3, #9d8df1)",
  warm:   "linear-gradient(135deg, #f4a261, #e76f51)",
  green:  "linear-gradient(135deg, #2a9d8f, #59c3c3)",
  purple: "linear-gradient(135deg, #9d8df1, #f4a261)",
  red:    "linear-gradient(135deg, #e76f51, #f4a261)",
};

function formatDate(dateString) {
  if (!dateString) return "";
  const d = new Date(dateString + "T00:00:00");
  return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

function pillClass(color) {
  const map = { accent: "accent", warm: "warm", green: "green", purple: "purple", red: "red" };
  return map[color] || "accent";
}

function renderCards(explainers) {
  const grid = document.getElementById("grid");
  grid.innerHTML = explainers
    .sort((a, b) => (b.date || "").localeCompare(a.date || ""))
    .map((e) => {
      const searchText = [e.title, e.description, ...(e.tags || [])].join(" ").toLowerCase();
      const gradient = GRADIENTS[e.color] || GRADIENTS.accent;
      const pillCls = pillClass(e.color);
      const tags = (e.tags || [])
        .map((t) => `<span class="pill pill-${pillCls}">${t}</span>`)
        .join("");
      return `
      <a href="${e.link}" class="card" data-search="${searchText}">
        <div class="card-accent" style="background: ${gradient}"></div>
        <div class="card-body">
          <div class="card-title">${e.title}</div>
          <div class="card-desc">${e.description}</div>
          <div class="card-footer">
            <span class="card-date">${formatDate(e.date)}</span>
            <div class="card-tags">${tags}</div>
          </div>
        </div>
      </a>`;
    })
    .join("");
  updateCount();
}

function updateCount() {
  const visible = document.querySelectorAll(".card:not([style*='display: none'])").length;
  const total = document.querySelectorAll(".card").length;
  const el = document.getElementById("count");
  const noResults = document.getElementById("no-results");
  if (visible === total) {
    el.textContent = `${total} explainer${total !== 1 ? "s" : ""}`;
  } else {
    el.textContent = `${visible} of ${total} explainer${total !== 1 ? "s" : ""}`;
  }
  noResults.style.display = visible === 0 ? "block" : "none";
}

function filterCards(query) {
  const terms = query.toLowerCase().trim().split(/\s+/).filter(Boolean);
  document.querySelectorAll(".card").forEach((card) => {
    const text = card.dataset.search;
    const match = terms.length === 0 || terms.every((t) => text.includes(t));
    card.style.display = match ? "" : "none";
  });
  updateCount();
}

async function loadExplainers() {
  const resp = await fetch("config.json");
  const config = await resp.json();
  renderCards(config.explainers);

  document.getElementById("search").addEventListener("input", (e) => {
    filterCards(e.target.value);
  });
}

document.addEventListener("DOMContentLoaded", loadExplainers);
