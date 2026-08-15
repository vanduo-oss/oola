# Icon Master List

**Total unique concepts:** 2869  
**Core (3–4 sets):** 464 — recommended v1 scope  
**Extended (2 sets):** 410  
**Long tail (1 set):** 1995  

## Category breakdown

| Category | Count | Core (3+ sets) |
|---|---|---|
| ui-actions | 799 | 146 |
| misc | 326 | 2 |
| arrows | 263 | 15 |
| devices | 208 | 58 |
| people | 164 | 29 |
| media | 158 | 61 |
| maps-travel | 146 | 30 |
| communication | 128 | 41 |
| files-folders | 126 | 23 |
| buildings | 97 | 22 |
| text-formatting | 94 | 33 |
| brands | 81 | 1 |
| connectivity | 54 | 1 |
| weather | 47 | 0 |
| security | 46 | 2 |
| finance | 41 | 0 |
| nature | 40 | 0 |
| science | 17 | 0 |
| time | 16 | 0 |
| health | 12 | 0 |
| social | 6 | 0 |

## Usage

- **`icon-prompt-queue.csv`** — generation queue, sorted by `sets_count` descending. Cut at `sets_count >= 3` for v1.
- **`icon-master-list.json`** — full metadata with per-set original names.
- **OpenSpec** — `openspec/specs/` encodes Structured Phi + generation + preview rules.

## Structured Phi drafts (hand-authored)

Smoke set of 10 UI icons as true `24×24` Structured Phi outlines (hand SVG — no API spend for this batch).

```bash
npm run preview:dev
```

Files: `drafts/oola-structured-phi/recraft-v4.1-pro-vector/{icon}.svg`  
Historical Recraft refs: `drafts/references/`

See [`drafts/README.md`](drafts/README.md), [`docs/openrouter-mcp.md`](docs/openrouter-mcp.md), and `openspec/`.

## Naming normalization notes

- All names normalized to `kebab-case`.
- Semantic aliases applied (e.g. `notifications` → `bell`, `envelope` → `mail`, `magnifying-glass` → `search`).
- Parametric families collapsed where pure variants; kept when distinct glyphs (e.g. battery empty/full/charging).
