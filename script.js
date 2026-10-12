const INTENTS = [
  { label: "驚く", emoji: "😳" },
  { label: "強調・褒める", emoji: "🔥" },
  { label: "困った・まずい", emoji: "😰" },
  { label: "あきれる・諦める", emoji: "😮‍💨" },
  { label: "断る・無理", emoji: "🙅" },
  { label: "謝る・照れる", emoji: "🙇" },
  { label: "頼む・急がせる", emoji: "🙏" },
  { label: "分からないと言う", emoji: "🤔" },
  // words that name a thing rather than a feeling, so they fit no bucket above
  { label: "その他", emoji: "🗂️" },
];

let ALL_TERMS = [];
let activeCategory = null;
let activeIntent = null;
let mode = "sg2ja";

async function init() {
  const res = await fetch("data/terms.json");
  ALL_TERMS = await res.json();

  const saved = localStorage.getItem("singlish-mode");
  if (saved === "ja2sg" || saved === "sg2ja") mode = saved;

  renderCategoryFilters();
  renderIntentFilters();
  render();
  renderPhrases();

  document.getElementById("search").addEventListener("input", render);
  document.querySelectorAll(".tab").forEach(tab => {
    tab.addEventListener("click", () => setMode(tab.dataset.mode));
  });
  setMode(mode);
}

/* ---------- mode ---------- */

function setMode(next) {
  mode = next;
  localStorage.setItem("singlish-mode", mode);
  document.querySelectorAll(".tab").forEach(tab => {
    const on = tab.dataset.mode === mode;
    tab.classList.toggle("active", on);
    tab.setAttribute("aria-pressed", String(on));
  });
  document.getElementById("pane-sg2ja").hidden = mode !== "sg2ja";
  document.getElementById("pane-ja2sg").hidden = mode !== "ja2sg";
}

/* ---------- Singlish → 日本語 ---------- */

function renderCategoryFilters() {
  const categories = [...new Set(ALL_TERMS.map(t => t.category))];
  const container = document.getElementById("category-filters");

  container.appendChild(makeFilterButton("すべて", null));
  categories.forEach(cat => container.appendChild(makeFilterButton(cat, cat)));
}

function makeFilterButton(label, value) {
  const btn = document.createElement("button");
  btn.className = "filter-btn" + (value === activeCategory ? " active" : "");
  btn.textContent = label;
  btn.addEventListener("click", () => {
    activeCategory = value;
    document.querySelectorAll("#category-filters .filter-btn").forEach(b => b.classList.remove("active"));
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
  const personalBadge = t.personal
    ? `<span class="note-personal">作者が実際に出会った表現</span>`
    : "";
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

/* ---------- 日本語 → Singlish ---------- */

function renderIntentFilters() {
  const container = document.getElementById("intent-filters");
  INTENTS.forEach(({ label, emoji }) => {
    const count = ALL_TERMS.filter(t => (t.intents || []).includes(label)).length;
    const btn = document.createElement("button");
    btn.className = "intent-btn";
    btn.innerHTML = `<span class="intent-emoji">${emoji}</span><span class="intent-label">${escapeHtml(label)}</span><span class="intent-count">${count}</span>`;
    btn.addEventListener("click", () => {
      activeIntent = activeIntent === label ? null : label;
      document.querySelectorAll(".intent-btn").forEach(b => b.classList.remove("active"));
      if (activeIntent) btn.classList.add("active");
      renderPhrases();
    });
    container.appendChild(btn);
  });
}

function renderPhrases() {
  const list = document.getElementById("phrase-list");
  const info = document.getElementById("intent-info");

  if (!activeIntent) {
    info.textContent = "";
    list.innerHTML = `<div class="empty-state">上から気持ちを選んでください。</div>`;
    return;
  }

  const hits = ALL_TERMS.filter(t => (t.intents || []).includes(activeIntent));
  const usable = hits.filter(t => t.usable);
  const ear = hits.filter(t => !t.usable);

  info.textContent = `「${activeIntent}」— ${hits.length} 件`;

  let html = "";
  if (usable.length) {
    html += `<h3 class="group-head"><span class="badge ok">✅ 自分でも言える</span></h3>`;
    html += usable.map(t => renderPhraseCard(t, true)).join("");
  }
  if (ear.length) {
    html += `<h3 class="group-head"><span class="badge ear">👂 聞き取れればいい</span></h3>`;
    html += ear.map(t => renderPhraseCard(t, false)).join("");
  }
  list.innerHTML = html;
}

function renderPhraseCard(t, usable) {
  return `
    <article class="term-card phrase-card${usable ? "" : " ear-card"}">
      <p class="phrase-say">${escapeHtml(t.example_en)}</p>
      <p class="phrase-gloss">${escapeHtml(t.example_ja)}</p>
      <div class="phrase-foot">
        <span class="phrase-term">${escapeHtml(t.term)}${t.reading ? `<span class="term-reading">${escapeHtml(t.reading)}</span>` : ""}</span>
        <span class="term-category">${escapeHtml(t.category)}</span>
      </div>
      <p class="phrase-meaning">${escapeHtml(t.meaning_ja)}</p>
    </article>
  `;
}

/* ---------- utils ---------- */

function escapeHtml(str) {
  if (!str) return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

init();

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => navigator.serviceWorker.register("sw.js"));
}
