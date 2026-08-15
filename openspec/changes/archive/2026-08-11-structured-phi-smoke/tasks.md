## 1. Cleanup
- [x] 1.1 Delete old style folders, MANIFEST, batch-10, review.html
- [x] 1.2 Strip multi-style docs from README / drafts / MCP notes

## 2. OpenSpec
- [x] 2.1 Write main specs: structured-phi, icon-generation, icon-preview
- [x] 2.2 Write change proposal, design, tasks, delta specs
- [x] 2.3 Run `openspec validate`

## 3. Pipeline
- [x] 3.1 Rewrite `prompt-templates.json` for `oola-structured-phi`
- [x] 3.2 Rewrite `scripts/generate-drafts.mjs` for models × icons
- [x] 3.3 Add `drafts/batch-10.json` with dual models + 10 icons

## 4. Preview
- [x] 4.1 Catalog/models columns (Vector | Pro Vector)
- [x] 4.2 Load SVGs from `drafts/oola-structured-phi/{model}/`
- [x] 4.3 Update App copy for Structured Phi + model A/B

## 5. Regen & verify
- [x] 5.1 `npm run generate:drafts -- --force` (20 SVGs)
- [x] 5.2 Confirm files exist; smoke `npm run preview:dev`
