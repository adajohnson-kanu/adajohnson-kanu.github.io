---
layout: page
title: Research
permalink: /publications/
description:
nav: true
nav_order: 3
_styles: >
  /* Research page — content lives in _data/research.yml, rendered by assets/js/research.js.
     Card design adapted from guygrossman.com/articles. Accents follow --global-theme-color. */
  .pubs-section h2 { font-size: 1.4rem; font-weight: 700; margin: 2.5rem 0 1.2rem; padding-bottom: 0.3rem; border-bottom: 2px solid var(--global-theme-color); }
  .pubs-section:first-child h2 { margin-top: 0; }

  .pubs-card {
    border-left: 3px solid color-mix(in srgb, var(--global-theme-color) 40%, transparent);
    border-radius: 0 10px 10px 0;
    padding: 0.7rem 0.9rem;
    margin-bottom: 0.9rem;
    background: rgba(127,127,127,0.06);
    transition: border-left-color 0.2s, background 0.2s;
  }
  .pubs-card:hover { border-left-color: var(--global-theme-color); background: rgba(127,127,127,0.10); }
  .pubs-card h4 { margin: 0 0 0.25rem; font-size: 1.02rem; font-weight: 600; line-height: 1.35; }
  .pubs-card h4 a { color: var(--global-text-color); }
  .pubs-card h4 a:hover { color: var(--global-theme-color); text-decoration: none; }
  .pubs-meta { color: var(--global-text-color-light); font-size: 0.88rem; margin-bottom: 0.3rem; }
  .pubs-meta strong { font-weight: 600; }
  .pubs-status { color: var(--global-theme-color); font-weight: 700; }

  .pubs-badges { display: flex; flex-wrap: wrap; gap: 0.25rem; margin: 0.15rem 0 0.4rem; }
  .pubs-badge { font-size: 0.72rem; padding: 0.1rem 0.45rem; border-radius: 999px; color: var(--global-text-color); }
  .pubs-award { background: rgba(217,164,6,0.12); border: 1px solid rgba(217,164,6,0.35); font-weight: 600; }
  .pubs-award .fa-trophy { color: rgb(217,164,6); margin-right: 0.2rem; }

  .pubs-card details { margin: 0.2rem 0 0; }
  .pubs-card details summary { font-size: 0.82rem; font-weight: 600; cursor: pointer; color: var(--global-theme-color); }
  .pubs-abstract { margin-top: 0.4rem; font-size: 0.88rem; line-height: 1.55; color: var(--global-text-color); opacity: 0.9; }

  .pubs-actions { display: flex; flex-wrap: wrap; gap: 0.35rem; align-items: center; margin-top: 0.45rem; }
  .pubs-action { display: inline-flex; align-items: center; gap: 0.3rem; border: 1px solid var(--global-divider-color); background: transparent; border-radius: 999px; padding: 0.2rem 0.65rem; font-size: 0.8rem; font-weight: normal; text-decoration: none; color: var(--global-text-color); cursor: pointer; }
  .pubs-action:hover { background: rgba(127,127,127,0.10); text-decoration: none; color: var(--global-text-color); }
  .pubs-action--primary { border-color: color-mix(in srgb, var(--global-theme-color) 45%, transparent); font-weight: 600; }
  .pubs-note { font-size: 0.8rem; color: var(--global-text-color-light); }

  .pubs-bibpanel { display: none; margin-top: 0.7rem; border: 1px solid var(--global-divider-color); background: rgba(127,127,127,0.05); border-radius: 12px; padding: 0.7rem; }
  .pubs-bibpanel.is-open { display: block; }
  .pubs-bibhead { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.4rem; }
  .pubs-bibtitle { font-size: 0.85rem; font-weight: 600; }
  .pubs-copybtn { border: 1px solid var(--global-divider-color); background: rgba(127,127,127,0.06); border-radius: 999px; padding: 0.2rem 0.55rem; font-size: 0.8rem; color: var(--global-text-color); cursor: pointer; }
  .pubs-bibpre { margin: 0; white-space: pre-wrap; font-size: 0.78rem; line-height: 1.4; }
---

<div id="pubs-app">
  <noscript>This page needs JavaScript to display the list of papers. A full list is in my <a href="{{ '/cv/' | relative_url }}">CV</a>.</noscript>
</div>

<script>window.RESEARCH_DATA = {{ site.data.research | jsonify }};</script>
<script src="{{ '/assets/js/research.js' | relative_url }}"></script>
