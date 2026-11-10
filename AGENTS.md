# AGENTS.md — qco-dashboard (lean-qco)

**Lean QCO — QCO Intelligence Dashboard** for Vietnam Samho Co., Ltd.
Tracks Quick Changeover (QCO/SMED) data: changeover events (COT = actual changeover time; COPT = engineering target, **only for STITCHING**), adherence rate, changeover cost, per workshop (ATOM, AUTOCUT, GBOS, OUTSOLE, PRINTING, SEMI, STITCHING, HF).

## Project philosophy

Minimalist / YAGNI: **zero build tooling, zero framework, zero npm**.
There is no `package.json`, no bundler, no TypeScript, no linter config. Do not add build steps or frameworks.

## Stack

- Vanilla JavaScript (ES6), HTML, CSS only
- Libraries loaded via CDN in `index.html`:
  - Tailwind CSS (Play CDN, inline config: `darkMode: 'class'`, Inter + JetBrains Mono)
  - Chart.js (trend bar+dashed COPT line, planned/unplanned donut, top focus models)
  - PapaParse 5.4.1 (CSV import/export)

## Files (flat structure)

| File | Role |
|---|---|
| `index.html` | Entire UI: header, filter bar, KPI strip, chart grid, paginated records table, CSV upload modal, footer. Loads `data.js` then `app.js` at the bottom. |
| `app.js` | All logic: i18n dictionary (`vi`/`en`), theme, filters, KPI calc, Chart.js rendering, table sort/pagination, CSV import/export. |
| `data.js` (~2.6 MB) | Dataset inlined as `window.DEFAULT_QCO_DATA` — ~10k records. This is what actually renders. |
| `qco_data.json` | Same dataset as JSON; `fetch` fallback if `data.js` isn't loaded. **Keep in sync with `data.js` when changing data.** |
| `data/*.csv` / `data/*.xlsx` | Raw sources (daily tracking forms per workshop). Header: `Date,1st Model,2nd Model,COT,COPT,LC,PPH Loss impact,Labor cost,FOB loss,OH,Total,Plan_Unplan,Reasons,Process`. |
| `serve.bat` | Runs `python -m http.server 8080` and opens the browser. |

## Run

- Double-click `index.html` (works without server since `data.js` is inline), **or**
- Run `serve.bat` → `http://localhost:8080/index.html` (server needed for the JSON fallback path).

No build/test/lint scripts exist. Verify changes manually in the browser (charts, table, both languages, dark/light).

## Code conventions

- Single-file imperative style: top-level `function` declarations in `app.js`, camelCase names (`applyFilters`, `renderCharts`).
- State via module-level `let` globals in `app.js`: `allRecords`, `filteredRecords`, `activeProcess`, `pieMode`, `currentLang`, `currentPage`, `pageSize` (25), `currentSort {column, order}`, chart instances `chartTrend`/`chartType`/`chartFocusModels`.
- Event handling via inline HTML attributes (`onclick="sortTable('date')"`).
- Flow: `onReady()` → `renderTabs()` → `applyFilters()` → KPIs/charts/table re-render (full-refresh style).
- Styling: Tailwind utility classes only (zinc palette); class-based dark mode persisted in `localStorage` key `qco_theme`; `font-mono tabular-nums` for numbers; `no-print` class for print styles.
- **i18n:** every user-facing string must live in the `i18n` object with both `vi` and `en` keys; text swapped by DOM id via `updateLanguageUI()`. Vietnamese is the base language.
- CSV import (PapaParse, `header: true`) accepts both Vietnamese/English column names (`'Date'|'date'`, `'1st Model'|'model1'`, `'Plan_Unplan'`, `'Reasons'`); supports append-or-replace radio modes.

## Tabs — no "All Processes"

Tabs are rendered from the distinct `process` values found in data (excluding `AUTOCUT`), alphabetical. There is **no "All Processes" tab**; `activeProcess` defaults to the first alphabetical tab (ATOM). If a tab has no records at all it simply doesn't render. Reset button restores the default state (first tab alphabetically).

Current tabs: `ATOM`, `GBOS`, `HF`, `OUTSOLE`, `PRINTING`, `SEMI`, `STITCHING`.
Year filter options: `2025`, `2026` (default view = all = 2025+2026). No `2024` records remain.

## Fixed COT Target (current rule)

The fixed engineering target applies to **COT** (changeover time), shown as a dashed line and compared in KPIs/table/export. There is **no COPT anywhere** in the app, HTML, or data.

Source of truth: `COT_TARGETS` in `app.js`: `ATOM 15.0`, `GBOS 14.0`, `SEMI 8.5`, `STITCHING 13.4`, `OUTSOLE 37.0`, `PRINTING 12.55`, `HF 22.0`, `AUTOCUT 12.2`.
- STITCHING keeps dedicated COPT wording in the UI (KPI, legend, table header, adherence) while all other tabs show Fixed COT Target. The value is the same 13.4; only labels switch when `activeProcess === 'STITCHING'`.
- `getCOTTarget(record)` is the only way the UI reads the target (KPI, monthly trend, table, CSV export).
- Change targets only in `COT_TARGETS`; do not put per-row target values into data.
- ATOM/GBOS/SEMI COT values in data are split at the November boundary (Jan–Oct = Before 18/20/17; Nov–Dec = After 15/14/8.5) per SMED V1 2026-09 standards. The fixed target is set to the **After** (15/14/8.5) values.

## Data coverage (synthetic gap-fill, demo only)

Web tabs cover 2025+2026. `OUTSOLE` (766 in 2025, 563 in 2026) has real data both years. `GBOS` has 782 real 2026 rows (Jan–Nov 2026, `data/DATA_GBOS.csv`; COT = OH/400) plus 782 synthetic mirrors + 77 Dec-2025 fill. The following are **synthetic mirrors** (same data, shifted ±1 year) — **not real source data**: `ATOM 2025`, `SEMI 2025`, `HF 2025` (plus 1 real 2025 record), `PRINTING 2026`, `STITCHING 2026`, `GBOS 2025` + `GBOS Dec-2025` fill.
Every visible tab has all 12 months for 2025 and 2026 (synthetic fill, count = median monthly count). `AUTOCUT` (hidden tab) still lacks 2025-11/12 and 2026-06..12.
Raw CSV sources (`data/*.csv`) still contain only the original years. Replace synthetic rows with real Excel/CSV imports when available.
All records dated after **2026-11-16** were removed (449 records). Dec-2026 is intentionally empty.

## Gotchas

- Data lives in **three** places: `data.js`, `qco_data.json`, `data/*`. Update `data.js` (primary) and `qco_data.json` (fallback) together.
- `data.js` is ~2.6 MB of generated code — edit data programmatically (e.g. a Python script), not by hand.
- No git submodules/monorepo; single branch `main` (repo: `tranhaiquang/lean-qco`).
- Excel files `data/CHANGE*.xlsx` from the SMED V1 work are generated; regenerate with a script, don't hand-edit big sheets.
- Expect preview PNGs (`preview*.png`) and `*_backup_*` files as untracked artifacts; leave them alone unless asked.
