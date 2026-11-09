# AGENTS.md — qco-dashboard (lean-qco)

**Lean QCO — QCO Intelligence Dashboard** for Vietnam Samho Co., Ltd.
Tracks Quick Changeover (QCO/SMED) data: changeover events (COT = actual time, COPT = engineering target), adherence rate, changeover cost, per workshop (ATOM, AUTOCUT, OUTSOLE, PRINTING, SEMI, STITCHING).

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
| `app.js` (~830 lines) | All logic: i18n dictionary (`vi`/`en`), theme, filters, KPI calc, Chart.js rendering, table sort/pagination, CSV import/export. |
| `data.js` (~1 MB) | Dataset inlined as `window.DEFAULT_QCO_DATA` — ~4,000 records. This is what actually renders. |
| `qco_data.json` | Same dataset as JSON; `fetch` fallback if `data.js` isn't loaded. **Keep in sync with `data.js` when changing data.** |
| `data/*.csv` | Raw source CSVs (ATOM, GBOS, HF, SEMI). Header: `Date,1st Model,2nd Model,COT,COPT,LC,PPH Loss impact,Labor cost,FOB loss,OH,Total,Plan_Unplan,Reasons,Process`. |
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
- **i18n:** every user-facing string must live in the `i18n` object (~app.js:20) with both `vi` and `en` keys; text swapped by DOM id via `updateLanguageUI()`. Vietnamese is the base language.
- CSV import (PapaParse, `header: true`) accepts both Vietnamese/English column names (`'Date'|'date'`, `'1st Model'|'model1'`, `'Plan_Unplan'`, `'Reasons'`); supports append-or-replace radio modes.

## COPT — fixed target per machine/process

`COPT` (engineering target, minutes) is **a single fixed value per `process` (machine)**, not a per-record value.
Source of truth: `COPT_TARGETS` in `app.js`: `ATOM 12.2`, `AUTOCUT 12.2`, `OUTSOLE 37.0`, `PRINTING 12.55`, `SEMI 12.2`, `STITCHING 13.4`, `HF 22.0`.
Values were derived as the **median COPT per process**. `OUTSOLE` was re-derived after replacing OUTSOLE web data with `data/CHANGEOVER TIME DATA_OUTSOLE.xlsx` (sheet `#11. QCO Data`, 1,282 events 2024-01-22 → 2026-11-07) and then tuned to **37.0** so OUTSOLE adherence (`COT ≤ COPT`) is ~71.6% (918/1282). `HF 22.0` was tuned so HF adherence (`COT ≤ COPT`) is ~75.2% (88/117, pulled from `data/DATA_HF.csv`, 117 events 2025-09-30 → 2026-10-30; median raw COPT was 53.0 but that gives 97.4% adherence). Other processes still use medians of the original 4,003-record dataset.

### OUTSOLE source mapping (Excel → `data/DATA_OUTSOLE.csv` → web)
`data/DATA_OUTSOLE.csv` mirrors `data/DATA_HF.csv` columns:
`Date,1st Model,2nd Model,COT,COPT,LC,PPH Loss impact,Labor cost,FOB loss,OH,Total,Plan_Unplan,Reasons,Process`
Mapping from `#11. QCO Data`: `COT` = Production Loss Duration (col Q, ~34 min avg), `COPT` = LC minutes (col R, median 52), `LC` = LC hours (col S), `PPH` = col X, `Labor cost` = col Y, `FOB loss` = col Z (0 where Excel blank, mostly 2026), `OH` = col AA, `Total` = col AB (or Labor+FOB+OH if blank), `Plan_Unplan` = col J, `Reasons` = col K, `Process` = `OUTSOLE`.
Web records use `lc` = LC days (col T) to match existing web scale. Rebuild via Python `openpyxl`, never by hand.

- `getCOPT(record)` in `app.js` is the only way the UI reads COPT (KPI, monthly trend, records table, CSV export). Never read `record.copt` directly.
- `applyFixedCOPT(record)` normalizes records on `loadData()` (both `data.js` and `qco_data.json` paths).
- CSV import overrides the CSV's `COPT` column with `getCOPT({process})`; the CSV value is kept only as a fallback for unknown processes (`COPT_FALLBACK = 12.6`, overall median).
- To change a target, edit `COPT_TARGETS` only. Do NOT edit per-row `copt` values in `data.js`/`qco_data.json` by hand.

## Gotchas

- Data lives in **three** places: `data.js`, `qco_data.json`, `data/*.csv`. If you change the dataset, update `data.js` (primary) and `qco_data.json` (fallback) together.
- `data.js` is ~1 MB of generated code — edit data programmatically (e.g. a script), not by hand.
- No git submodules/monorepo; single branch `main` (repo: `tranhaiquang/lean-qco`).
- Expect preview PNGs (`preview*.png`) as untracked artifacts; ignore them.
