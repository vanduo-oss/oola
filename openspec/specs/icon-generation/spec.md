# icon-generation Specification

## Purpose
Rules for producing OOLA Structured Phi draft SVGs. Preferred path is hand-authored (or agent-authored) outlines that pass machine QA. OpenRouter/Recraft MAY be used later only if outputs pass the same QA lock.

## Requirements

### Requirement: hand-authored-source-of-truth

The active draft set under `drafts/oola-structured-phi/recraft-v4.1-pro-vector/` MUST be Structured Phi `viewBox="0 0 24 24"` outlines with `stroke-width="1.5"`, round caps/joins, and `fill="none"`. Hand/agent SVGs remain source of truth until a model batch passes machine QA and visual gate.

#### Scenario: drafts are valid outlines
- **GIVEN** any accepted draft SVG
- **WHEN** inspected
- **THEN** it MUST use `viewBox="0 0 24 24"` and MUST NOT contain a full-canvas opaque backdrop path

### Requirement: primary-variant

Active generation MUST target outline variant `oola-structured-phi` only. `oola-filled` MUST NOT be generated until specified in a later change.

#### Scenario: single style profile
- **GIVEN** draft folders
- **WHEN** new icons are added
- **THEN** they MUST live under `drafts/oola-structured-phi/`

### Requirement: output-path

Draft files MUST be written to
`drafts/oola-structured-phi/recraft-v4.1-pro-vector/{name}.svg`
(folder name is legacy; content is hand/agent Structured Phi).

#### Scenario: search path
- **GIVEN** icon `search`
- **WHEN** listed
- **THEN** the file MUST exist at
  `drafts/oola-structured-phi/recraft-v4.1-pro-vector/search.svg`

### Requirement: style-keepers

Icons `mail`, `house`, and `search` MUST be treated as style keepers. Regeneration MUST skip keepers unless `--force-keepers` is passed.

#### Scenario: keepers frozen by default
- **GIVEN** keepers listed in the active batch JSON
- **WHEN** a batch compose/generate runs without `--force-keepers`
- **THEN** keeper files MUST NOT be overwritten

### Requirement: machine-qa-gate

Every new or replaced draft MUST pass `npm run qa:icons` before acceptance. Batch scale-ups (250, 1000) MUST run QA after each wave.

#### Scenario: qa fails closed
- **GIVEN** an SVG missing `stroke-linecap="round"`
- **WHEN** `npm run qa:icons` runs
- **THEN** the process MUST exit non-zero

### Requirement: openrouter-optional

OpenRouter/Recraft generation is optional and MUST NOT be required for scale-up. If used, outputs MUST pass the same machine QA and MUST NOT introduce full-canvas fills or organic distortion.

#### Scenario: missing key fails closed for API path
- **GIVEN** no `OPENROUTER_API_KEY`
- **WHEN** a non-dry-run OpenRouter generation starts
- **THEN** the process MUST exit non-zero without calling the API
