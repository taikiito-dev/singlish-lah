let ALL_TERMS = [];
let activeCategory = null;

async function init() {
  const res = await fetch("data/terms.json");
  ALL_TERMS = await res.json();

  renderCategoryFilters();
  render();

  document.getElementById("search").addEventListener("input", render);
}

function renderCategoryFilters() {
  const categories = [...new Set(ALL_TERMS.map(t => t.category))];
  const container = document.getElementById("category-filters");

  const allBtn = makeFilterButton("すべて", null);
  container.appendChild(allBtn);

  categories.forEach(cat => {
    container.appendChild(makeFilterButton(cat, cat));
  });
}

function makeFilterButton(label, value) {
  const btn = document.createElement("button");
  btn.className = "filter-btn" + (value === activeCategory ? " active" : "");
  btn.textContent = label;
  btn.addEventListener("click", () => {
    activeCategory = value;
    document.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    render();
  });
  return btn;
}

function render() {
  const query = document.getElementById("search").value.trim().toLowerCase();
  const list = document.getElementById("term-list");
  const info = document.getElementById("results-info");

  const filtered = ALL_TERMS.filter(t => {
    const matchesCategory = !activeCategory || t.category === activeCategory;
    if (!matchesCategory) return false;
    if (!query) return true;
    const haystack = [t.term, t.reading, t.meaning_ja, t.category, t.example_en, t.example_ja]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    return haystack.includes(query);
  });

  info.textContent = `${filtered.length} 件`;

  if (filtered.length === 0) {
    list.innerHTML = `<div class="empty-state">該当する表現が見つかりませんでした。</div>`;
    return;
  }

  list.innerHTML = filtered.map(renderCard).join("");
}

function renderCard(t) {
  const personalBadge = t.personal ? `<span class="badge">📍 personal</span>` : "";
  return `
    <article class="term-card">
      <div class="term-card-head">
        <h2 class="term-name">${escapeHtml(t.term)}${t.reading ? `<span class="term-reading">${escapeHtml(t.reading)}</span>` : ""}</h2>
        <span class="term-category">${escapeHtml(t.category)}</span>
      </div>
      <p class="term-meaning">${escapeHtml(t.meaning_ja)} ${personalBadge}</p>
      <div class="term-example">
        <div class="en">"${escapeHtml(t.example_en)}"</div>
        <div class="ja">${escapeHtml(t.example_ja)}</div>
      </div>
    </article>
  `;
}

function escapeHtml(str) {
  if (!str) return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

init();
