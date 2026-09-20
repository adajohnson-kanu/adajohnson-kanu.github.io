// Research page: renders window.RESEARCH_DATA (from _data/research.yml) into #pubs-app.
// Layout modeled on guygrossman.com/articles: sticky filter sidebar + card list.
(() => {
  const DATA = window.RESEARCH_DATA || {};
  const TABS = [
    { key: "published", label: "Published" },
    { key: "working", label: "Working papers" },
    { key: "progress", label: "In progress" },
    { key: "other", label: "Other writing" },
  ].filter((t) => Array.isArray(DATA[t.key]) && DATA[t.key].length);

  const normalize = (s) => (s || "").toString().toLowerCase();
  const uniq = (arr) => Array.from(new Set(arr));
  const stripTags = (s) => (s || "").replace(/<[^>]*>/g, "");
  const escapeHtml = (s) =>
    (s || "").toString().replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
  const boldSelf = (authors) => (authors || "").replace(/Ada Johnson-Kanu/g, "<strong>Ada Johnson-Kanu</strong>");
  const scholarUrlForTitle = (title) => `https://scholar.google.com/scholar?q=${encodeURIComponent(stripTags(title))}`;

  const state = { tab: TABS.length ? TABS[0].key : "published", q: "", year: null, cats: new Set() };

  const getActiveData = () => DATA[state.tab] || [];
  const hasYears = (data) => data.some((d) => typeof d.year === "number");
  const getAllYears = (data) => uniq(data.map((d) => d.year).filter((y) => typeof y === "number")).sort((a, b) => b - a);
  const getAllCategories = (data) => {
    const out = [];
    data.forEach((d) => (d.categories || []).forEach((c) => out.push(c)));
    return uniq(out).sort((a, b) => a.localeCompare(b));
  };

  const matchesText = (p) => {
    const q = normalize(state.q).trim();
    if (!q) return true;
    const hay = normalize(stripTags([p.title, p.authors, p.journal, p.abstract].join(" ")));
    return hay.includes(q);
  };
  const matchesYear = (p) => state.year == null || p.year === state.year;
  const matchesCats = (p) => state.cats.size === 0 || (p.categories || []).some((c) => state.cats.has(c));
  const matches = (p) => matchesText(p) && matchesYear(p) && matchesCats(p);

  const groupByYear = (items) => {
    const map = new Map();
    items.forEach((p) => {
      const y = typeof p.year === "number" ? p.year : "";
      if (!map.has(y)) map.set(y, []);
      map.get(y).push(p);
    });
    return Array.from(map.entries()).sort((a, b) => {
      if (a[0] === "") return 1;
      if (b[0] === "") return -1;
      return b[0] - a[0];
    });
  };

  const formatVenue = (p) => {
    const bits = [];
    if (p.journal) bits.push(`<strong>${p.journal}</strong>`);
    const vol = (p.volume || "").toString().trim();
    const iss = (p.issue || "").toString().trim();
    const pag = (p.pages || "").toString().trim();
    let vip = vol;
    if (iss) vip += `(${iss})`;
    if (pag) vip += (vip ? `: ${pag}` : pag);
    if (vip) bits.push(vip);
    if (p.note) bits.push(escapeHtml(p.note));
    return bits.join(" • ");
  };

  function render() {
    const mount = document.getElementById("pubs-app");
    if (!mount) return;

    const data = getActiveData();
    const years = getAllYears(data);
    const cats = getAllCategories(data);
    const filtered = data.filter(matches);
    const showYears = hasYears(data);

    mount.innerHTML = `
      <div class="pubs-ui">
        <aside class="pubs-sidebar">
          <div class="pubs-panel">
            <div class="pubs-tabs" role="tablist" aria-label="Research sections">
              ${TABS.map((t) => `<button class="pubs-tab ${state.tab === t.key ? "is-active" : ""}" data-tab="${t.key}" type="button" role="tab" aria-selected="${state.tab === t.key}">${t.label}</button>`).join("")}
            </div>

            <h3>Search</h3>
            <input class="pubs-field" id="pubs-search" type="search" placeholder="Title, author, keyword" value="${escapeHtml(state.q)}" aria-label="Search research"/>

            ${showYears ? `
            <h3>Years</h3>
            <div class="pubs-yeargrid" id="pubs-years">${renderYearGrid(years, data)}</div>` : ""}

            <h3>Topics</h3>
            <div class="pubs-chipwrap" id="pubs-cats">${renderCategoryChips(cats, data)}</div>

            <button class="pubs-action pubs-clear" id="pubs-clear" type="button">Clear filters</button>
          </div>
        </aside>

        <main class="pubs-main">
          ${filtered.length ? renderCards(groupByYear(filtered), showYears) : `<div class="pubs-empty">No results. Try clearing filters.</div>`}
        </main>
      </div>`;

    bindHandlers();
  }

  function renderYearGrid(years, data) {
    const counts = new Map();
    data.forEach((p) => counts.set(p.year, (counts.get(p.year) || 0) + 1));
    const all = `<button class="pubs-yearbtn ${state.year == null ? "is-active" : ""}" data-year="" type="button">All (${data.length})</button>`;
    return all + years.map((y) => `<button class="pubs-yearbtn ${state.year === y ? "is-active" : ""}" data-year="${y}" type="button">${y} (${counts.get(y) || 0})</button>`).join("");
  }

  function renderCategoryChips(cats, data) {
    if (!cats.length) return "";
    const base = data.filter((p) => matchesText(p) && matchesYear(p));
    const counts = new Map();
    base.forEach((p) => (p.categories || []).forEach((c) => counts.set(c, (counts.get(c) || 0) + 1)));
    return cats.map((c) => `<button class="pubs-chip ${state.cats.has(c) ? "is-active" : ""}" type="button" data-cat="${escapeHtml(c)}">${escapeHtml(c)} (${counts.get(c) || 0})</button>`).join("");
  }

  function renderCards(grouped, showYears) {
    return grouped.map(([year, items]) => `
      ${showYears && year !== "" ? `<div class="pubs-yearhdr">${year}</div>` : ""}
      ${items.map(renderCard).join("")}`).join("");
  }

  function actionLink(label, url, primary = false) {
    return `<a class="pubs-action${primary ? " pubs-action--primary" : ""}" href="${url}" target="_blank" rel="noopener noreferrer">${escapeHtml(label)}</a>`;
  }

  function renderCard(p) {
    const links = p.links || {};
    const titleHtml = links.article
      ? `<a href="${links.article}" target="_blank" rel="noopener noreferrer">${p.title}</a>`
      : p.title;

    const meta = [boldSelf(p.authors), formatVenue(p)].filter(Boolean).join(" • ");
    const status = p.status ? ` • <span class="pubs-status">${escapeHtml(p.status)}</span>` : "";

    const badges = (p.categories || []).map((c) => `<span class="pubs-badge">${escapeHtml(c)}</span>`).join("")
      + (p.award ? `<span class="pubs-badge pubs-award"><i class="fas fa-trophy" aria-hidden="true"></i> ${escapeHtml(p.award)}</span>` : "");

    const abs = p.abstract
      ? `<details><summary>Abstract</summary><div class="pubs-abstract">${p.abstract}</div></details>`
      : "";

    const btns = [];
    if (links.draft) btns.push(actionLink("Draft", links.draft, true));
    if (links.preprint) btns.push(actionLink("Preprint", links.preprint, !links.draft));
    if (links.appendix) btns.push(actionLink("Appendix", links.appendix));
    if (links.replication) btns.push(actionLink("Replication", links.replication));
    if (state.tab === "published") btns.push(actionLink("Google Scholar", links.scholar || scholarUrlForTitle(p.title)));
    if (links.bibtex) btns.push(`<button class="pubs-action" type="button" data-bibbtn="${p.id}">BibTeX</button>`);
    if (p.draft_note) btns.push(`<span class="pubs-note">${escapeHtml(p.draft_note)}</span>`);

    return `
      <article class="pubs-card" id="pub-${p.id}">
        <h4>${titleHtml}</h4>
        <div class="pubs-meta">${meta}${status}</div>
        ${badges ? `<div class="pubs-badges">${badges}</div>` : ""}
        ${abs}
        ${btns.length ? `<div class="pubs-actions">${btns.join("")}</div>` : ""}
        ${links.bibtex ? `
          <div class="pubs-bibpanel" data-bib="${p.id}">
            <div class="pubs-bibhead">
              <div class="pubs-bibtitle">BibTeX</div>
              <button class="pubs-copybtn" type="button" data-bibcopy="${p.id}" aria-label="Copy BibTeX">Copy</button>
            </div>
            <pre class="pubs-bibpre">${escapeHtml(links.bibtex.trim())}</pre>
          </div>` : ""}
      </article>`;
  }

  function bindHandlers() {
    document.querySelectorAll(".pubs-tab").forEach((b) => {
      b.addEventListener("click", () => {
        const tab = b.getAttribute("data-tab");
        if (!tab || tab === state.tab) return;
        state.tab = tab;
        state.q = "";
        state.year = null;
        state.cats = new Set();
        render();
      });
    });

    const search = document.getElementById("pubs-search");
    if (search) {
      search.addEventListener("input", () => {
        const pos = typeof search.selectionStart === "number" ? search.selectionStart : (search.value || "").length;
        state.q = search.value || "";
        render();
        const next = document.getElementById("pubs-search");
        if (next) {
          next.focus();
          try { next.setSelectionRange(pos, pos); } catch (e) {}
        }
      });
    }

    document.querySelectorAll("#pubs-years button").forEach((b) => {
      b.addEventListener("click", () => {
        const y = b.getAttribute("data-year");
        state.year = y ? Number(y) : null;
        render();
      });
    });

    document.querySelectorAll("#pubs-cats .pubs-chip").forEach((b) => {
      b.addEventListener("click", () => {
        const c = b.getAttribute("data-cat");
        if (!c) return;
        if (state.cats.has(c)) state.cats.delete(c);
        else state.cats.add(c);
        render();
      });
    });

    const clear = document.getElementById("pubs-clear");
    if (clear) {
      clear.addEventListener("click", () => {
        state.q = "";
        state.year = null;
        state.cats = new Set();
        render();
      });
    }

    document.querySelectorAll("[data-bibbtn]").forEach((b) => {
      b.addEventListener("click", () => {
        const panel = document.querySelector(`[data-bib="${CSS.escape(b.getAttribute("data-bibbtn"))}"]`);
        if (panel) panel.classList.toggle("is-open");
      });
    });

    document.querySelectorAll("[data-bibcopy]").forEach((b) => {
      b.addEventListener("click", async () => {
        const p = getActiveData().find((x) => String(x.id) === String(b.getAttribute("data-bibcopy")));
        const bib = (p && p.links && p.links.bibtex) || "";
        if (!bib) return;
        try {
          await navigator.clipboard.writeText(bib.trim());
        } catch (e) {
          const ta = document.createElement("textarea");
          ta.value = bib.trim();
          ta.setAttribute("readonly", "");
          ta.style.position = "fixed";
          ta.style.top = "-1000px";
          document.body.appendChild(ta);
          ta.select();
          try { document.execCommand("copy"); } catch (err) {}
          document.body.removeChild(ta);
        }
        b.textContent = "Copied";
        setTimeout(() => { b.textContent = "Copy"; }, 1500);
      });
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", render);
  else render();
})();
