// Research page: renders window.RESEARCH_DATA (from _data/research.yml) into #pubs-app.
// Card design adapted from guygrossman.com/articles, without the filter sidebar.
(() => {
  const DATA = window.RESEARCH_DATA || {};
  const SECTIONS = [
    { key: "published", label: "Peer-Reviewed Publications" },
    { key: "working", label: "Working Papers" },
    { key: "progress", label: "Works in Progress" },
    { key: "other", label: "Other Writing" },
  ].filter((s) => Array.isArray(DATA[s.key]) && DATA[s.key].length);

  const stripTags = (s) => (s || "").replace(/<[^>]*>/g, "");
  const escapeHtml = (s) =>
    (s || "").toString().replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
  const boldSelf = (authors) => (authors || "").replace(/Ada Johnson-Kanu/g, "<strong>Ada Johnson-Kanu</strong>");
  const scholarUrlForTitle = (title) => `https://scholar.google.com/scholar?q=${encodeURIComponent(stripTags(title))}`;

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
    if (typeof p.year === "number") bits.push(String(p.year));
    if (p.note) bits.push(escapeHtml(p.note));
    return bits.join(" • ");
  };

  function actionLink(label, url, primary = false) {
    return `<a class="pubs-action${primary ? " pubs-action--primary" : ""}" href="${url}" target="_blank" rel="noopener noreferrer">${escapeHtml(label)}</a>`;
  }

  function renderCard(p, section) {
    const links = p.links || {};
    const titleHtml = links.article
      ? `<a href="${links.article}" target="_blank" rel="noopener noreferrer">${p.title}</a>`
      : p.title;

    const meta = [boldSelf(p.authors), formatVenue(p)].filter(Boolean).join(" • ");
    const status = p.status ? ` • <span class="pubs-status">${escapeHtml(p.status)}</span>` : "";
    const award = p.award ? `<div class="pubs-badges"><span class="pubs-badge pubs-award"><i class="fas fa-trophy" aria-hidden="true"></i> ${escapeHtml(p.award)}</span></div>` : "";

    const abs = p.abstract
      ? `<details><summary>Abstract</summary><div class="pubs-abstract">${p.abstract}</div></details>`
      : "";

    const btns = [];
    if (links.draft) btns.push(actionLink("Draft", links.draft, true));
    if (links.appendix) btns.push(actionLink("Appendix", links.appendix));
    if (links.replication) btns.push(actionLink("Replication", links.replication));
    if (section === "published") btns.push(actionLink("Google Scholar", links.scholar || scholarUrlForTitle(p.title)));
    if (links.bibtex) btns.push(`<button class="pubs-action" type="button" data-bibbtn="${p.id}">BibTeX</button>`);
    if (p.draft_note) btns.push(`<span class="pubs-note">${escapeHtml(p.draft_note)}</span>`);

    return `
      <article class="pubs-card" id="pub-${p.id}">
        <h4>${titleHtml}</h4>
        <div class="pubs-meta">${meta}${status}</div>
        ${award}
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

  function render() {
    const mount = document.getElementById("pubs-app");
    if (!mount) return;
    mount.innerHTML = SECTIONS.map((s) => `
      <section class="pubs-section">
        <h2>${s.label}</h2>
        ${DATA[s.key].map((p) => renderCard(p, s.key)).join("")}
      </section>`).join("");
    bindHandlers();
  }

  function findEntry(id) {
    for (const s of SECTIONS) {
      const hit = DATA[s.key].find((x) => String(x.id) === String(id));
      if (hit) return hit;
    }
    return null;
  }

  function bindHandlers() {
    document.querySelectorAll("[data-bibbtn]").forEach((b) => {
      b.addEventListener("click", () => {
        const panel = document.querySelector(`[data-bib="${CSS.escape(b.getAttribute("data-bibbtn"))}"]`);
        if (panel) panel.classList.toggle("is-open");
      });
    });

    document.querySelectorAll("[data-bibcopy]").forEach((b) => {
      b.addEventListener("click", async () => {
        const p = findEntry(b.getAttribute("data-bibcopy"));
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
